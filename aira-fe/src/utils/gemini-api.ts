import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const geminiClient = new ChatGoogleGenerativeAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API,
  model: "gemini-2.5-flash",
});

export default geminiClient;
