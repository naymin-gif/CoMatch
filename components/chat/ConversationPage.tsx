"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { IoIosSend } from "react-icons/io";
import ConversationPageHeader from "@/components/chat/ConversationPageHeader";

import {
  Message as MessageRoot,
  MessageContent,
  MessageFooter,
  MessageGroup,
} from "@/components/ui/message";
import { Textarea } from "@/components/ui/textarea";

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface ConversationParticipant {
  id: string;
  name: string;
  profile_pic_url: string | null;
}

export interface ConversationPageProps {
  conversationId: string;
  currentUserId: string;
  participant: ConversationParticipant;
  messages: Message[];
  isLoading?: boolean;
  isSending?: boolean;
  onSendMessage: (content: string) => Promise<Message>;
}

type LocalMessage = Message & {
  isOptimistic?: boolean;
};

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

function createOptimisticId() {
  if (
    typeof globalThis.crypto !== "undefined" &&
    "randomUUID" in globalThis.crypto
  ) {
    return `optimistic-${globalThis.crypto.randomUUID()}`;
  }

  return `optimistic-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function ConversationPage({
  conversationId,
  currentUserId,
  participant,
  messages,
  isLoading = false,
  isSending = false,
  onSendMessage,
}: ConversationPageProps) {
  const [localMessages, setLocalMessages] =
    useState<LocalMessage[]>(messages);
  const [messageInput, setMessageInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const activeConversationIdRef = useRef(conversationId);
  const activeSubmissionRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const conversationChanged =
      activeConversationIdRef.current !== conversationId;

    activeConversationIdRef.current = conversationId;

    if (conversationChanged) {
      setLocalMessages(messages);
      setMessageInput("");
      setIsSubmitting(false);
      setSendError(null);
      activeSubmissionRef.current = null;
      return;
    }

    setLocalMessages((currentMessages) => {
      const mergedMessages = new Map(
        currentMessages.map((message) => [message.id, message])
      );

      for (const message of messages) {
        mergedMessages.set(message.id, message);
      }

      return Array.from(mergedMessages.values()).sort(
        (firstMessage, secondMessage) =>
          new Date(firstMessage.created_at).getTime() -
          new Date(secondMessage.created_at).getTime()
      );
    });
  }, [conversationId, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const sendMessage = async () => {
    const content = messageInput.trim();

    if (!content || isSubmitting || isSending) {
      return;
    }

    const targetConversationId = conversationId;
    const optimisticId = createOptimisticId();
    const optimisticMessage: LocalMessage = {
      id: optimisticId,
      conversation_id: targetConversationId,
      sender_id: currentUserId,
      content,
      created_at: new Date().toISOString(),
      is_read: false,
      isOptimistic: true,
    };

    setMessageInput("");
    setSendError(null);
    setIsSubmitting(true);
    activeSubmissionRef.current = optimisticId;
    setLocalMessages((currentMessages) => [
      ...currentMessages,
      optimisticMessage,
    ]);

    try {
      const savedMessage = await onSendMessage(content);

      if (activeConversationIdRef.current !== targetConversationId) {
        return;
      }

      setLocalMessages((currentMessages) =>
        currentMessages
          .filter(
            (message) =>
              message.id !== savedMessage.id || message.id === optimisticId
          )
          .map((message) =>
            message.id === optimisticId ? savedMessage : message
          )
      );
    } catch {
      if (activeConversationIdRef.current !== targetConversationId) {
        return;
      }

      setLocalMessages((currentMessages) =>
        currentMessages.filter((message) => message.id !== optimisticId)
      );
      setMessageInput(content);
      setSendError("Message failed to send. Please try again.");
    } finally {
      if (activeSubmissionRef.current === optimisticId) {
        activeSubmissionRef.current = null;
        setIsSubmitting(false);
      }
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage();
  };

  const handleTextareaKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const sending = isSending || isSubmitting;
  const participantInitial = participant.name.trim().charAt(0).toUpperCase();

  return (
    <section
        aria-label={`Conversation with ${participant.name}`}
        className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white"
    >
      {/* Header  */}
      <ConversationPageHeader 
          profile_pic_url={participant.profile_pic_url || undefined} 
          name={participant.name} 
          profileid={participant.id} 
      />

      <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/30 px-4 py-5 sm:px-6">
        {isLoading ? (
          <div
            role="status"
            className="flex h-full items-center justify-center text-xs font-semibold text-gray-400"
          >
            Loading messages...
          </div>
        ) : localMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-xs italic text-gray-400">
            Say hello to start the conversation!
          </div>
        ) : (
          <MessageGroup className="gap-4">
            {localMessages.map((message) => {
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
      </div>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-gray-100 bg-white p-3"
      >
        <div className="flex items-end gap-2">
          <Textarea
            aria-label="Message"
            aria-describedby={sendError ? "message-send-error" : undefined}
            placeholder="Type a message..."
            value={messageInput}
            onChange={(event) => {
              setMessageInput(event.target.value);

              if (sendError) {
                setSendError(null);
              }
            }}
            onKeyDown={handleTextareaKeyDown}
            disabled={sending}
            rows={1}
            className="max-h-32 min-h-12 resize-none rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium focus-visible:bg-white"
          />

          <button
            type="submit"
            aria-label="Send message"
            disabled={sending || !messageInput.trim()}
            className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-comatch-primary text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-comatch-primary/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IoIosSend className="size-6" aria-hidden="true" />
          </button>
        </div>

        {sendError ? (
          <p
            id="message-send-error"
            role="alert"
            className="mt-2 px-1 text-xs font-medium text-red-600"
          >
            {sendError}
          </p>
        ) : null}
      </form>
    </section>
  );
}