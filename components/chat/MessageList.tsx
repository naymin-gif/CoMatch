"use client";

import type { RefObject } from "react";
import {
  Message as MessageRoot,
  MessageContent,
  MessageFooter,
  MessageGroup,
} from "@/components/ui/message";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export type LocalMessage = Message & {
  isOptimistic?: boolean;
};

export interface MessageListProps {
  messages: LocalMessage[];
  currentUserId: string;
  isLoading?: boolean;
  messagesEndRef?: RefObject<HTMLDivElement | null>;
}

function formatMessageTime(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessageList({
  messages,
  currentUserId,
  isLoading = false,
  messagesEndRef,
}: MessageListProps) {
  return (
    <ScrollArea 
      className="min-h-0 flex-1 px-4 py-5 sm:px-6"
      style={{
        backgroundColor: "#acdbff",
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23030106' fill-opacity='0.06' fill-rule='evenodd'/%3E%3C/svg%3E")`
      }}
    >
      {isLoading ? (
        <div
          role="status"
          className="flex h-full items-center justify-center text-xs font-semibold text-gray-400"
        >
          Loading messages...
        </div>
      ) : messages.length === 0 ? (
        <div className="flex h-full items-center justify-center text-center text-xs italic text-gray-400">
          Say hello to start the conversation!
        </div>
      ) : (
        <MessageGroup className="gap-4">
          {messages.map((message) => {
            const isCurrentUser = message.sender_id === currentUserId;

            return (
              <MessageRoot
                key={message.id}
                align={isCurrentUser ? "end" : "start"}
              >
                <MessageContent className="w-auto max-w-[85%] gap-0 sm:max-w-[70%]">
                  <div
                    className={
                      isCurrentUser
                        ? "rounded-2xl rounded-br-none bg-comatch-primary px-4 py-3 text-white shadow-xs"
                        : "rounded-2xl rounded-bl-none border border-gray-100 bg-white px-4 py-3 text-gray-800 shadow-xs"
                    }
                  >
                    <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed">
                      {message.content}
                    </p>
                    <MessageFooter
                      className={
                        isCurrentUser
                          ? "mt-1.5 justify-end px-0 text-[10px] font-medium text-blue-100"
                          : "mt-1.5 justify-end px-0 text-[10px] font-medium text-gray-400"
                      }
                    >
                      {formatMessageTime(message.created_at)}
                      {message.isOptimistic ? (
                        <span className="sr-only"> Sending</span>
                      ) : null}
                    </MessageFooter>
                  </div>
                </MessageContent>
              </MessageRoot>
            );
          })}
        </MessageGroup>
      )}

      <div ref={messagesEndRef} />
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}