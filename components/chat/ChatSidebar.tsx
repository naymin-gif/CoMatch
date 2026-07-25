import {
    Sidebar,
    SidebarHeader,
    SidebarContent, 
    SidebarGroup,
    SidebarMenu,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import SearchBar from "@/components/ui/searchbar";
import { Conversation } from "@/app/(main)/chat/page";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  onSelectConversation: (conversation: Conversation) => void;
  className?: string;
}
