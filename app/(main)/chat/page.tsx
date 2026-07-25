import ChatPreviewCard from "@/components/chat/ChatPreviewCard";
import ChatSearchbar from "@/components/chat/ChatSearchbar";

interface Profile {
  id: string;
  name: string;
  profile_pic_url: string | null;
}

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  otherParticipant: Profile;
  lastMessage?: string;
  lastMessageTime?: string;
}

// MOCK DATA
const name: string = "Win"
const msg: string = "I love you"
const time: string = "Tue"
const hasUnread: boolean = true;

export default function ChatPage() {
    return (
        <div className="p-20">
            <ChatPreviewCard 
                name={name}
                message={msg}
                time={time}
                hasUnread={hasUnread}
            />
        </div>
    ); 
}