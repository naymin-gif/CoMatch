"use client";

import { useMemo } from "react";
import type { ComponentProps } from "react";

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
  SidebarProvider,
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
    <SidebarProvider className="h-full min-h-0 w-auto shrink-0">
      <Sidebar
        collapsible="none"
        className="h-full border-r border-gray-100 bg-white"
        aria-label="Chat conversations"
      >
        <SidebarHeader className="border-b border-gray-100 p-4">
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
    </SidebarProvider>
  );
}