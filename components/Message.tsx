import { cn } from "@/lib/utils";
import { ExtendedMessage } from "@/types";
import { Icons } from "./Icons";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { forwardRef } from "react";

interface MessageProps {
  message: ExtendedMessage;
  isNextMsgSamePer: boolean;
}

const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({ message, isNextMsgSamePer }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-end", {
          "justify-end": message.isUserMessageProperty,
        })}>
        <div
          className={cn(
            "relative flex h-6 w-6 aspect-square items-center justify-center",
            {
              "order-2 bg-primary rounded-sm": message.isUserMessageProperty,
              "order-1 bg-zinc-800 rounded-sm": !message.isUserMessageProperty,
              invisible: isNextMsgSamePer,
            }
          )}>
          {message.isUserMessageProperty ? (
            <Icons.user className="fill-zinc-200 text-zinc-200 h-3/4 w-3/4" />
          ) : (
            <Icons.logo className="fill-zinc-300 h-3/4 w-3/4" />
          )}
        </div>
        <div
          className={cn("flex flex-col space-y-2 text-base max-w-md mx-2", {
            "order-1 items-end": message.isUserMessageProperty,
            "order-2 items-start": !message.isUserMessageProperty,
          })}>
          <div
            className={cn("px-4 py-2 rounded-lg inline-block", {
              "bg-primary text-white": message.isUserMessageProperty,
              "bg-gray-300 text-gray-900": !message.isUserMessageProperty,
              "rounded-br-none":
                !isNextMsgSamePer && message.isUserMessageProperty,
              "rounded-bl-none":
                !isNextMsgSamePer && !message.isUserMessageProperty,
            })}>
            {typeof message.prompt === "string" ? (
              <ReactMarkdown
                className={cn("prose", {
                  "text-zinc-50": message.isUserMessageProperty,
                })}>
                {message.prompt}
              </ReactMarkdown>
            ) : (
              message.prompt
            )}

            {message.id !== "loading-msg" ? (
              <div
                className={cn("text-xs select-none mt-2 w-full text-right", {
                  "text-zinc-500": !message.isUserMessageProperty,
                  "text-gray-200/80": message.isUserMessageProperty,
                })}>
                {format(new Date(message.createdAt), "HH:mm")}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
);

Message.displayName = "Message";

export default Message;
