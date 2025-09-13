"use server";

import geminiClient from "@/utils/gemini-api";
import { BaseMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { ServerlessSpecFromJSON } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/db_control";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";

export default async function InvokeLangChain({
  prompt,
  chatHistory,
}: {
  prompt: string;
  chatHistory?: BaseMessage[];
}) {
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY ?? "aw" });

  const spec = ServerlessSpecFromJSON({
    cloud: "aws",
    region: "us-east-1",
  });

  const index_name = "aira-manual-index";

  const { indexes } = await pc.listIndexes();

  // if(indexes && !indexes.find(i=>i.name===index_name))

  const index = pc.Index(index_name);

  const embedModel = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API,
    model: "models/embedding-001",
  });

  const vectorStore = new PineconeStore(embedModel, { pineconeIndex: index });

  const retriever = vectorStore.asRetriever();

  const combineDocs = await createStuffDocumentsChain({
    llm: geminiClient,
    prompt: ChatPromptTemplate.fromTemplate(
      `Answer the user's questions based on the below context:\n\n{context}\n\nQuestion: {input}`
    ),
  });

  const retChain = await createRetrievalChain({
    combineDocsChain: combineDocs,
    retriever,
  });

  const res = await retChain.invoke({
    input: prompt,
    chat_history: chatHistory,
  });

  console.log(res.answer);

  return res.answer;
}
