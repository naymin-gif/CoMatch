"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import ConversationPageHeader from "@/components/chat/ConversationPageHeader";
import MessageList from "./MessageList";
import ConversationPageFooter from "./ConversationPageFooter";

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

export type LocalMessage = Message & {
  isOptimistic?: boolean;
};

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

      {/* Body */}
      <MessageList 
        messages={localMessages}
        currentUserId={currentUserId}
        isLoading={isLoading}
        messagesEndRef={messagesEndRef}
      />

      {/* Footer */}
      <ConversationPageFooter 
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        onSubmit={handleSubmit}
        sendError={sendError}
        setSendError={setSendError}
        sending={sending}
      />
    </section>
  );
}