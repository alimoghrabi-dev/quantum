import { trpc } from "@/app/_trpc/client";
import { INFINIT_QUERY_LIMIT } from "@/config/infinite.query";
import { Loader2, MessageSquare } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import Message from "../Message";
import { useContext, useEffect, useRef } from "react";
import { ChatContext } from "./ChatContext";
import { useIntersection } from "@mantine/hooks";

const MessagesComponent = ({ fileId }: { fileId: string }) => {
  const { isLoading: isAiThinking } = useContext(ChatContext);

  const { data, isLoading, fetchNextPage } =
    trpc.getFileMessages.useInfiniteQuery(
      {
        fileId,
        limit: INFINIT_QUERY_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
        keepPreviousData: true,
      }
    );

  const msgs = data?.pages.flatMap((page) => page.messages) || [];

  const loadingMsg = {
    id: "loading-msg",
    createdAt: new Date().toISOString(),
    prompt: (
      <span className="flex h-full items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin" />
      </span>
    ),
    isUserMessageProperty: false,
  };

  const combinedMsgs = [...(isAiThinking ? [loadingMsg] : []), ...msgs];

  const lastMsgRef = useRef<HTMLDivElement>(null);

  const { ref, entry } = useIntersection({
    root: lastMsgRef.current,
    threshold: 1,
  });

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  return (
    <div className="flex max-h-[calc(100vh-3.5rem-7rem)] border border-zinc-200 flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-primary scrollbar-thumb-rounded scrollbar-track-primary-lighter scrollbar-w-2 scrolling-touch">
      {combinedMsgs && combinedMsgs.length > 0 ? (
        combinedMsgs.map((msg, index) => {
          const isNextMsgSamePer =
            combinedMsgs[index + 1]?.isUserMessageProperty ===
            combinedMsgs[index]?.isUserMessageProperty;

          if (index === combinedMsgs.length - 1) {
            return (
              <Message
                ref={ref}
                key={index}
                isNextMsgSamePer={isNextMsgSamePer}
                message={msg}
              />
            );
          } else {
            return (
              <Message
                key={index}
                isNextMsgSamePer={isNextMsgSamePer}
                message={msg}
              />
            );
          }
        })
      ) : isLoading ? (
        <div className="w-full flex flex-col gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <MessageSquare className="h-8 w-8 text-primary" />
          <h3 className="font-semibold text-xl">{"You're all set."}</h3>
          <p className="text-zinc-500 text-sm">Ask Your First Question</p>
        </div>
      )}
    </div>
  );
};

export default MessagesComponent;
