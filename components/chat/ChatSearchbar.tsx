"use client";

import { useMemo, useState } from "react";
import SearchBar from "@/components/ui/searchbar";

export interface ChatSearchParticipant {
  id: string;
  name: string;
  email?: string;
  profile_pic_url?: string | null;
}

export interface ChatSearchConversation {
  id: string;
  otherParticipant: ChatSearchParticipant;
  lastMessage?: string;
  lastMessageTime?: string;
  /**
   * Optional message history to search in addition to the last message.
   * The first matching message is displayed as the result preview.
   */
  searchableMessages?: string[];
}

interface ChatSearchbarProps<T extends ChatSearchConversation> {
  conversations: T[];
  onSelectConversation: (conversation: T) => void;
  placeholder?: string;
  className?: string;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function HighlightedText({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  if (!query) return <>{text}</>;

  const parts = text.split(
    new RegExp(`(${escapeRegExp(query)})`, "gi"),
  );

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={`${part}-${index}`}
            className="rounded bg-yellow-100 px-0.5 text-inherit"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

export default function ChatSearchbar<T extends ChatSearchConversation>({
  conversations,
  onSelectConversation,
  placeholder = "Search chats...",
  className = "",
}: ChatSearchbarProps<T>) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase();

  const matchingConversations = useMemo(() => {
    if (!normalizedQuery) return [];

    return conversations.flatMap((conversation) => {
      const { otherParticipant, lastMessage, searchableMessages = [] } =
        conversation;
      const accountMatches = [otherParticipant.name, otherParticipant.email].some(
        (value) => value?.toLocaleLowerCase().includes(normalizedQuery),
      );
      const lastMessageMatches = lastMessage
        ?.toLocaleLowerCase()
        .includes(normalizedQuery);
      const matchingHistoryMessage = searchableMessages.find((message) =>
        message.toLocaleLowerCase().includes(normalizedQuery),
      );

      if (!accountMatches && !lastMessageMatches && !matchingHistoryMessage) {
        return [];
      }

      return [
        {
          conversation,
          preview:
            matchingHistoryMessage ??
            lastMessage ??
            otherParticipant.email ??
            "No messages yet",
        },
      ];
    });
  }, [conversations, normalizedQuery]);

  const handleSelect = (conversation: T) => {
    onSelectConversation(conversation);
    setQuery("");
  };

  return (
    <div className={`relative w-full ${className}`}>
      <SearchBar
        placeholder={placeholder}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setQuery("");
        }}
      />

      {normalizedQuery && (
        <div
          id="chat-search-results"
          className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-30 max-h-80 overflow-y-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-lg"
        >
          {matchingConversations.length > 0 ? (
            <ul aria-label="Matching chats" className="space-y-1">
              {matchingConversations.map(({ conversation, preview }) => {
                const participant = conversation.otherParticipant;
                const initials = participant.name
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase())
                  .join("");

                return (
                  <li key={conversation.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(conversation)}
                      className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-comatch-primary"
                    >
                      {participant.profile_pic_url ? (
                        <img
                          src={participant.profile_pic_url}
                          alt=""
                          className="h-10 w-10 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600"
                        >
                          {initials || "?"}
                        </span>
                      )}

                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-3">
                          <span className="truncate text-sm font-semibold text-gray-900">
                            <HighlightedText
                              text={participant.name}
                              query={normalizedQuery}
                            />
                          </span>
                          {conversation.lastMessageTime && (
                            <span className="shrink-0 text-[10px] text-gray-400">
                              {conversation.lastMessageTime}
                            </span>
                          )}
                        </span>

                        <span className="block truncate text-xs text-gray-500">
                          {preview ? (
                            <HighlightedText
                              text={preview}
                              query={normalizedQuery}
                            />
                          ) : (
                            "No messages yet"
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-3 py-6 text-center text-sm text-gray-500">
              No chats match “{query.trim()}”.
            </p>
          )}
        </div>
      )}
    </div>
  );
}