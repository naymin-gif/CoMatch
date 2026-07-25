"use client";

import { useMemo } from "react";
import type { ComponentProps } from "react";
import { MdChatBubble } from "react-icons/md";

import ChatPreviewCard from "./ChatPreviewCard";
import ChatSearchbar from "./ChatSearchbar";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export interface ChatSidebarConversation {
  conversationId: string;
  chatPreviewCardProps: ComponentProps<typeof ChatPreviewCard>;
}

export interface ChatSidebarProps {
  conversations: ChatSidebarConversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
}

interface SearchableConversation {
  id: string;
  conversationId: string;
  otherParticipant: {
    id: string;
    name: string;
    profile_pic_url: string | null;
  };
  lastMessage: string;
  lastMessageTime: string;
}

export default function ChatSidebar({
  conversations,
  selectedConversationId,
  onSelectConversation,
}: ChatSidebarProps) {
  const searchableConversations = useMemo<SearchableConversation[]>(
    () =>
      conversations.map(({ conversationId, chatPreviewCardProps }) => ({
        id: conversationId,
        conversationId,
        otherParticipant: {
          id: conversationId,
          name: chatPreviewCardProps.name,
          profile_pic_url: chatPreviewCardProps.profile_pic_url ?? null,
        },
        lastMessage: chatPreviewCardProps.message,
        lastMessageTime: chatPreviewCardProps.time,
      })),
    [conversations]
  );

  return (
    <Sidebar
      collapsible="none"
      className="h-full border-gray-100 top-16 h-[calc(100vh-4rem)] border-r w-[300px] px-2"
      aria-label="Chat conversations"
    >
      <SidebarHeader className="border-b border-gray-100 p-4">
        {/* Heading  */}
        <div className="text-heading text-comatch-primary font-heading flex flex-row gap-3 items-center my-3">
          <MdChatBubble />
          <span>Chats</span>
        </div>
        <ChatSearchbar
          conversations={searchableConversations}
          onSelectConversation={(conversation) =>
            onSelectConversation(conversation.conversationId)
          }
        />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="p-2">
          <SidebarGroupContent>
            {conversations.length > 0 ? (
              <SidebarMenu>
                {conversations.map(
                  ({ conversationId, chatPreviewCardProps }) => (
                    <SidebarMenuItem key={conversationId}>
                      <SidebarMenuButton
                        type="button"
                        size="lg"
                        isActive={
                          selectedConversationId === conversationId
                        }
                        aria-label={`Open conversation with ${chatPreviewCardProps.name}`}
                        onClick={() =>
                          onSelectConversation(conversationId)
                        }
                        className="h-auto w-full p-0 [&>*]:w-full"
                      >
                        <ChatPreviewCard {...chatPreviewCardProps} />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                )}
              </SidebarMenu>
            ) : (
              <p className="px-3 py-10 text-center text-xs text-gray-400">
                No conversations yet.
              </p>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}