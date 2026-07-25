"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import ChatSidebar from "@/components/chat/ChatSidebar";
import type { ChatSidebarConversation } from "@/components/chat/ChatSidebar";
import ConversationPage from "@/components/chat/ConversationPage";
import type {
  ConversationParticipant,
  Message,
} from "@/components/chat/ConversationPage";
import timeAgo from "@/lib/TimeAgo";
import { createClient } from "@/utils/clients";

interface ConversationRow {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
}

interface ProfileRow {
  id: string;
  name: string | null;
  profile_pic_url: string | null;
}

interface ConversationItem {
  id: string;
  createdAt: string;
  participant: ConversationParticipant;
  lastMessage: Message | null;
  hasUnread: boolean;
}

function getTimestamp(value: string) {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function sortMessages(messages: Message[]) {
  return [...messages].sort(
    (firstMessage, secondMessage) =>
      getTimestamp(firstMessage.created_at) -
      getTimestamp(secondMessage.created_at),
  );
}

function upsertMessage(messages: Message[], nextMessage: Message) {
  const existingMessageIndex = messages.findIndex(
    (message) => message.id === nextMessage.id,
  );

  if (existingMessageIndex === -1) {
    return sortMessages([...messages, nextMessage]);
  }

  const nextMessages = [...messages];
  nextMessages[existingMessageIndex] = nextMessage;
  return sortMessages(nextMessages);
}

function getConversationActivityTime(conversation: ConversationItem) {
  return getTimestamp(
    conversation.lastMessage?.created_at ?? conversation.createdAt,
  );
}

function sortConversations(conversations: ConversationItem[]) {
  return [...conversations].sort(
    (firstConversation, secondConversation) =>
      getConversationActivityTime(secondConversation) -
      getConversationActivityTime(firstConversation),
  );
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | undefined
  >(undefined);
  const [currentUserId, setCurrentUserId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const supabase = useMemo(() => createClient(), []);
  const selectedConversationIdRef = useRef<string | undefined>(undefined);
  const conversationIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  useEffect(() => {
    conversationIdsRef.current = new Set(
      conversations.map((conversation) => conversation.id),
    );
  }, [conversations]);

  useEffect(() => {
    let cancelled = false;

    async function fetchConversations() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        if (!user) {
          throw new Error("User not authenticated");
        }

        if (!cancelled) {
          setCurrentUserId(user.id);
        }

        const { data, error: conversationsError } = await supabase
          .from("conversations")
          .select("id, user1_id, user2_id, created_at")
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

        if (conversationsError) {
          throw conversationsError;
        }

        const conversationRows = (data ?? []) as ConversationRow[];

        if (conversationRows.length === 0) {
          if (!cancelled) {
            conversationIdsRef.current = new Set();
            setConversations([]);
          }
          return;
        }

        const participantIds = Array.from(
          new Set(
            conversationRows.map((conversation) =>
              conversation.user1_id === user.id
                ? conversation.user2_id
                : conversation.user1_id,
            ),
          ),
        );
        const conversationIds = conversationRows.map(
          (conversation) => conversation.id,
        );

        const [profilesResult, messagesResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, name, profile_pic_url")
            .in("id", participantIds),
          supabase
            .from("messages")
            .select(
              "id, conversation_id, sender_id, content, created_at, is_read",
            )
            .in("conversation_id", conversationIds)
            .order("created_at", { ascending: false }),
        ]);

        if (profilesResult.error) {
          throw profilesResult.error;
        }

        if (messagesResult.error) {
          throw messagesResult.error;
        }

        const profilesById = new Map(
          ((profilesResult.data ?? []) as ProfileRow[]).map((profile) => [
            profile.id,
            profile,
          ]),
        );
        const latestMessageByConversationId = new Map<string, Message>();
        const conversationsWithUnreadMessages = new Set<string>();

        for (const message of (messagesResult.data ?? []) as Message[]) {
          if (!latestMessageByConversationId.has(message.conversation_id)) {
            latestMessageByConversationId.set(message.conversation_id, message);
          }

          if (message.sender_id !== user.id && !message.is_read) {
            conversationsWithUnreadMessages.add(message.conversation_id);
          }
        }

        const nextConversations = sortConversations(
          conversationRows.map((conversation) => {
            const participantId =
              conversation.user1_id === user.id
                ? conversation.user2_id
                : conversation.user1_id;
            const profile = profilesById.get(participantId);

            return {
              id: conversation.id,
              createdAt: conversation.created_at,
              participant: {
                id: participantId,
                name: profile?.name ?? "Unknown User",
                profile_pic_url: profile?.profile_pic_url ?? null,
              },
              lastMessage:
                latestMessageByConversationId.get(conversation.id) ?? null,
              hasUnread: conversationsWithUnreadMessages.has(conversation.id),
            };
          }),
        );

        if (!cancelled) {
          conversationIdsRef.current = new Set(conversationIds);
          setConversations(nextConversations);
        }
      } catch (error) {
        console.error(
          "Failed to fetch conversations:",
          JSON.stringify(error, null, 2),
        );
      }
    }

    void fetchConversations();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  useEffect(() => {
    if (!selectedConversationId || !currentUserId) {
      setMessages([]);
      setIsLoadingMessages(false);
      return;
    }

    let cancelled = false;
    const conversationId = selectedConversationId;

    async function fetchMessages() {
      setMessages([]);
      setIsLoadingMessages(true);

      try {
        const { data, error } = await supabase
          .from("messages")
          .select(
            "id, conversation_id, sender_id, content, created_at, is_read",
          )
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true });

        if (error) {
          throw error;
        }

        if (!cancelled) {
          const fetchedMessages = (data ?? []) as Message[];

          setMessages((currentMessages) => {
            const realtimeMessages = currentMessages.filter(
              (message) => message.conversation_id === conversationId,
            );
            const mergedMessages = new Map(
              fetchedMessages.map((message) => [message.id, message]),
            );

            for (const message of realtimeMessages) {
              mergedMessages.set(message.id, message);
            }

            return sortMessages(Array.from(mergedMessages.values()));
          });
        }

        const { error: readError } = await supabase
          .from("messages")
          .update({ is_read: true })
          .eq("conversation_id", conversationId)
          .neq("sender_id", currentUserId)
          .eq("is_read", false);

        if (readError) {
          throw readError;
        }

        if (!cancelled) {
          setMessages((currentMessages) =>
            currentMessages.map((message) =>
              message.conversation_id === conversationId &&
              message.sender_id !== currentUserId
                ? { ...message, is_read: true }
                : message,
            ),
          );
          setConversations((currentConversations) =>
            currentConversations.map((conversation) =>
              conversation.id === conversationId
                ? { ...conversation, hasUnread: false }
                : conversation,
            ),
          );
        }
      } catch (error) {
        console.error(
          "Failed to fetch messages:",
          JSON.stringify(error, null, 2),
        );
      } finally {
        if (!cancelled) {
          setIsLoadingMessages(false);
        }
      }
    }

    void fetchMessages();

    return () => {
      cancelled = true;
    };
  }, [currentUserId, selectedConversationId, supabase]);

  const applyRealtimeMessage = useCallback(
    (message: Message) => {
      if (!conversationIdsRef.current.has(message.conversation_id)) {
        return;
      }

      const isSelectedConversation =
        selectedConversationIdRef.current === message.conversation_id;

      if (isSelectedConversation) {
        setMessages((currentMessages) =>
          upsertMessage(currentMessages, message),
        );
      }

      setConversations((currentConversations) =>
        sortConversations(
          currentConversations.map((conversation) => {
            if (conversation.id !== message.conversation_id) {
              return conversation;
            }

            const isNewerThanPreview =
              !conversation.lastMessage ||
              getTimestamp(message.created_at) >=
                getTimestamp(conversation.lastMessage.created_at);
            const hasUnread =
              message.sender_id !== currentUserId &&
              !message.is_read &&
              !isSelectedConversation
                ? true
                : isSelectedConversation && message.is_read
                  ? false
                  : conversation.hasUnread;

            return {
              ...conversation,
              lastMessage: isNewerThanPreview
                ? message
                : conversation.lastMessage,
              hasUnread,
            };
          }),
        ),
      );
    },
    [currentUserId],
  );

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const channel = supabase
      .channel(`chat-messages-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const message = payload.new as Message;

          applyRealtimeMessage(message);

          if (
            selectedConversationIdRef.current === message.conversation_id &&
            message.sender_id !== currentUserId &&
            !message.is_read
          ) {
            void supabase
              .from("messages")
              .update({ is_read: true })
              .eq("id", message.id)
              .then(({ error }) => {
                if (error) {
                  console.error(
                    "Failed to mark message as read:",
                    JSON.stringify(error, null, 2),
                  );
                }
              });
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          applyRealtimeMessage(payload.new as Message);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [applyRealtimeMessage, currentUserId, supabase]);

  const sidebarConversations = useMemo<ChatSidebarConversation[]>(
    () =>
      conversations.map((conversation) => ({
        conversationId: conversation.id,
        chatPreviewCardProps: {
          name: conversation.participant.name,
          profile_pic_url:
            conversation.participant.profile_pic_url ?? undefined,
          message: conversation.lastMessage?.content ?? "No messages yet",
          time: conversation.lastMessage
            ? timeAgo(conversation.lastMessage.created_at)
            : "",
          hasUnread: conversation.hasUnread,
        },
      })),
    [conversations],
  );

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === selectedConversationId,
      ),
    [conversations, selectedConversationId],
  );

  const handleSendMessage = useCallback(
    async (content: string): Promise<Message> => {
      if (!currentUserId || !selectedConversationId) {
        throw new Error("No conversation selected");
      }

      setIsSendingMessage(true);

      try {
        const { data, error } = await supabase
          .from("messages")
          .insert({
            conversation_id: selectedConversationId,
            sender_id: currentUserId,
            content,
            is_read: false,
          })
          .select(
            "id, conversation_id, sender_id, content, created_at, is_read",
          )
          .single();

        if (error) {
          throw error;
        }

        const savedMessage = data as Message;
        applyRealtimeMessage(savedMessage);
        return savedMessage;
      } finally {
        setIsSendingMessage(false);
      }
    },
    [applyRealtimeMessage, currentUserId, selectedConversationId, supabase],
  );

  return (
    <main className="flex h-dvh min-h-[500px] w-full overflow-hidden bg-slate-50">
      <ChatSidebar
        conversations={sidebarConversations}
        selectedConversationId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
      />

      <div className="min-w-0 flex-1 p-4 sm:p-6">
        {selectedConversation ? (
          <ConversationPage
            conversationId={selectedConversation.id}
            currentUserId={currentUserId}
            participant={selectedConversation.participant}
            messages={messages}
            isLoading={isLoadingMessages}
            isSending={isSendingMessage}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-center text-sm font-medium text-gray-400">
            Open a chat to start a conversation
          </div>
        )}
      </div>
    </main>
  );
}
