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
    <ScrollArea className="min-h-0 flex-1 bg-slate-50/30 px-4 py-5 sm:px-6">
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