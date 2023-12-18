import { db } from "@/database";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { pinecone } from "@/lib/pinecone";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { plans } from "@/stripe";

const f = createUploadthing();

const middleware = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    throw new Error("User not found");
  }

  const subscriptionPlan = await getUserSubscriptionPlan();

  return { subscriptionPlan, userId: user.id };
};

const onUploadComplete = async ({
  metadata,
  file,
}: {
  metadata: Awaited<ReturnType<typeof middleware>>;
  file: {
    key: string;
    name: string;
    url: string;
  };
}) => {
  const isFileExists = await db.file.findFirst({
    where: {
      key: file.key,
    },
  });

  if (isFileExists) return;

  const { userId } = metadata;

  const createdFile = await db.file.create({
    data: {
      key: file.key,
      name: file.name,
      userId,
      url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
      uploadStatus: "PROCESSING",
    },
  });

  try {
    const response = await fetch(
      `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`
    );

    const blob = await response.blob();

    const loader = new PDFLoader(blob);

    const pageLevelDocs = await loader.load();

    const PagesAmount = pageLevelDocs.length;

    const { subscriptionPlan } = metadata;
    const { isSubscribed } = subscriptionPlan;

    const isProExceeded =
      PagesAmount > plans.find((plan) => plan.name === "Pro")!.pagesPerPDF;
    const isFreeExceeded =
      PagesAmount > plans.find((plan) => plan.name === "Free")!.pagesPerPDF;

    if ((isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded)) {
      await db.file.update({
        data: {
          uploadStatus: "FAILED",
        },
        where: {
          id: createdFile.id,
        },
      });
    }

    // vectorize and index

    const pineconeIndex = pinecone.Index("quantum");

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
      pineconeIndex,
      namespace: createdFile.id,
    });

    await db.file.update({
      data: {
        uploadStatus: "SUCCESS",
      },
      where: {
        id: createdFile.id,
      },
    });
  } catch (error) {
    await db.file.update({
      data: {
        uploadStatus: "FAILED",
      },
      where: {
        id: createdFile.id,
      },
    });
  }
};

export const ourFileRouter = {
  freePlanUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
  proPlanUploader: f({ pdf: { maxFileSize: "32MB" } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
