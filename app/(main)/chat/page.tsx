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
