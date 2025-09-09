"use client";
import geminiClient from "@/utils/gemini-api";
import {
  ChatContainer,
  MainContainer,
  Message,
  MessageInput,
  MessageList,
  MessageModel,
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.css";
import { useState } from "react";
import { data } from "../page";
import InvokeLangChain from "../actions/langchain-rag";

export const generateContent = async (prompt: string, prev: any[]) => {
  const result = await geminiClient.invoke([
    ...prev,
    { role: "user", content: prompt },
  ]);
  return result.content;
};

export default function MessageUI({ data }: { data: data }) {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<MessageModel[]>([]);

  const responseGenerate = async (inputText: string) => {
    setMessages((e) => [
      ...e,
      {
        sender: "me",
        direction: "outgoing",
        position: "first",
        message: `${inputText}`,
      },
      {
        message: "thinking...",
        sender: "AI",
        direction: "incoming",
        position: "first",
      },
    ]);
    setIsLoading(true);

    const prevMessages: any[] = messages.map((i) => ({
      name: i.sender === "AI" ? "assistant" : "user",
      content: i.message ?? "aw",
    }));

    const result = await InvokeLangChain({
      prompt: `you are managing an iot electricity generator with the current condition of:\ngenerated vooltage: ${data.generated_v}v,\nvalve position:${data.valve_pos} (in degrees, 180 is closed, water isnt flowing, and no voltage should be 0)\ncurrent water level: ${data.water_level}% (this is the water that will spin the generator shaft, its flow is controlled by the valve, if it's empty you have to wait until it filled up again)\nonly respond when the prompt is correlated to the water generator or is corelated to something in the context, only respond with "i'm sorry, i cant help with that" if it doesn't have any correlation. respond to the prompt below with only 1 paragraph consisting of maximum 5 sentence, only respond in plain text do not use any type of markdown:\n${inputText}`,
      chatHistory: prevMessages,
    });

    if (result) {
      setIsLoading(false);
      setMessages((e) => [...e.slice(undefined, -1)]);
      setMessages((e) => [
        ...e,
        {
          message: result as string | undefined,
          sender: "AI",
          direction: "incoming",
          position: "first",
        },
      ]);
    } else {
      setIsLoading(false);
    }
  };

  return (
    <MainContainer>
      <ChatContainer>
        <MessageList>
          {messages.map((i, k) => (
            <Message key={`message${k}`} model={i} />
          ))}
        </MessageList>
        <MessageInput
          placeholder="Type message here"
          onSend={(e, msg) => responseGenerate(msg)}
          disabled={isLoading}
        />
      </ChatContainer>
    </MainContainer>
  );
}
