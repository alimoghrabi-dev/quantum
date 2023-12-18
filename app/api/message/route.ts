import { db } from "@/database";
import { openai } from "@/lib/openai";
import { pinecone } from "@/lib/pinecone";
import { SendMessagValidator } from "@/lib/validators/sendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { NextRequest } from "next/server";
import { OpenAIStream, StreamingTextResponse } from "ai";

export async function POST(request: NextRequest) {
  // endpoint for asking question to a pdf file.

  const body = await request.json();

  const { getUser } = getKindeServerSession();

  const user = await getUser();

  if (!user?.id) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const { fileId, message } = SendMessagValidator.parse(body);

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId: user.id,
    },
  });

  if (!file) {
    return new Response("Not found", {
      status: 404,
    });
  }

  await db.message.create({
    data: {
      prompt: message,
      isUserMessageProperty: true,
      userId: user.id,
      fileId: file.id,
    },
  });

  // vectorize the msg

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const pineconeIndex = pinecone.Index("quantum");

  const vectoreStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: file.id,
  });

  const results = await vectoreStore.similaritySearch(message, 5);

  const prevMsgs = await db.message.findMany({
    where: {
      fileId: file.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
  });

  const formattedPrevMessages = prevMsgs.map((msg) => ({
    role: msg.isUserMessageProperty
      ? ("user" as const)
      : ("assistant" as const),
    content: msg.prompt,
  }));

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0,
    stream: true,
    messages: [
      {
        role: "system",
        content:
          "Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.",
      },
      {
        role: "user",
        content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
        
  \n----------------\n
  
  PREVIOUS CONVERSATION:
  ${formattedPrevMessages.map((message) => {
    if (message.role === "user") return `User: ${message.content}\n`;
    return `Assistant: ${message.content}\n`;
  })}
  
  \n----------------\n
  
  CONTEXT:
  ${results.map((r) => r.pageContent).join("\n\n")}
  
  USER INPUT: ${message}`,
      },
    ],
  });

  const stream = OpenAIStream(response, {
    async onCompletion(completion) {
      await db.message.create({
        data: {
          prompt: completion,
          isUserMessageProperty: false,
          userId: user.id,
          fileId: file.id,
        },
      });
    },
  });

  return new StreamingTextResponse(stream);
}
