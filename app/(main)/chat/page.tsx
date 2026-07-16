"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/clients';
import Avatar from '@/components/ui/Avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageSquare, Search, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Profile {
  id: string;
  name: string;
  email: string;
  profile_pic_url: string | null;
}

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  otherParticipant: Profile;
  lastMessage?: string;
  lastMessageTime?: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recipientIdFromQuery = searchParams.get('user');
  const supabase = createClient();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // Mobile responsiveness helper
  const [showSidebarMobile, setShowSidebarMobile] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. Fetch user session and load initial conversation list
  useEffect(() => {
    const initChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUser(user);

      try {
        // Fetch all conversations where user is user1 or user2
        const { data: convsData, error: convsError } = await supabase
          .from('conversations')
          .select('*')
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (convsError) throw convsError;

        if (convsData && convsData.length > 0) {
          // Resolve other participant profiles and last messages
          const resolvedConvs = await Promise.all(
            convsData.map(async (conv) => {
              const otherId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
              
              // Get profile details
              const { data: profile } = await supabase
                .from('profiles')
                .select('id, name, email, profile_pic_url')
                .eq('id', otherId)
                .maybeSingle();

              // Get last message preview
              const { data: lastMsgData } = await supabase
                .from('messages')
                .select('content, created_at')
                .eq('conversation_id', conv.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

              return {
                ...conv,
                otherParticipant: profile || {
                  id: otherId,
                  name: 'Unknown Member',
                  email: '',
                  profile_pic_url: null,
                },
                lastMessage: lastMsgData?.content || 'No messages yet',
                lastMessageTime: lastMsgData?.created_at
                  ? new Date(lastMsgData.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : undefined,
              };
            })
          );

          setConversations(resolvedConvs);

          // If a recipient ID is passed in query parameters, handle check-or-create logic
          if (recipientIdFromQuery && recipientIdFromQuery !== user.id) {
            await handleQueryRecipient(recipientIdFromQuery, user.id, resolvedConvs);
          }
        } else {
          // No conversations exist yet. Check if a new one should be initialized via query param
          if (recipientIdFromQuery && recipientIdFromQuery !== user.id) {
            await handleQueryRecipient(recipientIdFromQuery, user.id, []);
          }
        }
      } catch (err: any) {
        console.error('Error loading conversations:', err);
        toast.error('Failed to load chats: ' + err.message);
      } finally {
        setIsLoadingConversations(false);
      }
    };

    initChat();
  }, [recipientIdFromQuery]);

  // 2. Fetch messages and bind realtime listener when active conversation changes
  useEffect(() => {
    if (!activeConversation || !currentUser) return;

    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', activeConversation.id)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);

        // MARK AS READ: Mark all messages sent by the other user as read
        const { data: updateData, error: updateError, status: updateStatus } = await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('conversation_id', activeConversation.id)
          .neq('sender_id', currentUser.id)
          .eq('is_read', false)
          .select();

        console.log("MARK AS READ QUERY RESULT (LOAD):", { 
          data: updateData, 
          error: updateError, 
          status: updateStatus 
        });

      } catch (err: any) {
        console.error('Error loading messages:', err);
        toast.error('Failed to load message history.');
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();

    // Subscribe to incoming messages for this conversation room
    const channel = supabase
      .channel(`chat_room:${activeConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConversation.id}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          
          // Append message if it is not already in the list
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          // MARK AS READ: If we receive a message from the other person while chat is open, mark it as read immediately
          if (newMsg.sender_id !== currentUser.id) {
            const { data: realtimeData, error: realtimeError, status: realtimeStatus } = await supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', newMsg.id)
              .select();

            console.log("MARK AS READ QUERY RESULT (REALTIME):", { 
              data: realtimeData, 
              error: realtimeError, 
              status: realtimeStatus 
            });
          }

          // Update last message in active conversation list preview
          setConversations((prevConvs) =>
            prevConvs.map((c) =>
              c.id === activeConversation.id
                ? {
                    ...c,
                    lastMessage: newMsg.content,
                    lastMessageTime: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  }
                : c
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversation, currentUser]);

  // Check or create a conversation with the query parameter user
  const handleQueryRecipient = async (recipId: string, currentUserId: string, currentList: Conversation[]) => {
    // 1. Check if conversation already exists in our loaded list
    const existing = currentList.find(
      (c) =>
        (c.user1_id === currentUserId && c.user2_id === recipId) ||
        (c.user1_id === recipId && c.user2_id === currentUserId)
    );

    if (existing) {
      setActiveConversation(existing);
      setShowSidebarMobile(false);
      return;
    }

    // 2. Fetch the profile details of the recipient
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, email, profile_pic_url')
      .eq('id', recipId)
      .maybeSingle();

    if (profileError || !profile) {
      toast.error('Target user profile not found.');
      return;
    }

    // 3. Create the new conversation in the database
    try {
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
          user1_id: currentUserId,
          user2_id: recipId,
        })
        .select()
        .single();

      if (createError) {
        // If unique constraint violation (code '23505' or similar PG error), fetch the existing one instead
        if (createError.code === '23505' || createError.message.includes('duplicate key')) {
          const { data: existingDbData } = await supabase
            .from('conversations')
            .select('*')
            .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`);

          const existingDb = existingDbData?.find(
            (c) =>
              (c.user1_id === currentUserId && c.user2_id === recipId) ||
              (c.user1_id === recipId && c.user2_id === currentUserId)
          );

          if (existingDb) {
            const formattedConv: Conversation = {
              ...existingDb,
              otherParticipant: profile,
              lastMessage: 'No messages yet',
            };
            
            // Add to list if not present
            setConversations((prev) => {
              if (prev.some((c) => c.id === formattedConv.id)) return prev;
              return [formattedConv, ...prev];
            });
            setActiveConversation(formattedConv);
            setShowSidebarMobile(false);
            return;
          }
        }
        throw createError;
      }

      const formattedNewConv: Conversation = {
        ...newConv,
        otherParticipant: profile,
        lastMessage: 'No messages yet',
      };

      setConversations((prev) => [formattedNewConv, ...prev]);
      setActiveConversation(formattedNewConv);
      setShowSidebarMobile(false);
    } catch (err: any) {
      console.error('Error creating conversation:', err);
      toast.error('Failed to start new chat.');
    }
  };

  // Submit a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversation || !currentUser) return;

    const textToSend = messageInput.trim();
    setMessageInput('');
    setIsSending(true);

    try {
      const { data: newMsg, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeConversation.id,
          sender_id: currentUser.id,
          content: textToSend,
        })
        .select()
        .single();

      if (error) throw error;

      // Append locally (optimistic UI)
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });

      // Update conversations preview list
      setConversations((prevConvs) =>
        prevConvs.map((c) =>
          c.id === activeConversation.id
            ? {
                ...c,
                lastMessage: textToSend,
                lastMessageTime: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }
            : c
        )
      );
    } catch (err: any) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message: ' + err.message);
      setMessageInput(textToSend); // Restore text in case of failure
    } finally {
      setIsSending(false);
    }
  };

  // Filter conversations list based on query search
  const filteredConversations = conversations.filter((c) =>
    c.otherParticipant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="max-w-screen-xl mx-auto px-4 md:px-6 py-6 h-[calc(100vh-100px)] min-h-[500px]">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex h-full overflow-hidden">
        
        {/* SIDEBAR: CONVERSATIONS LIST */}
        <div
          className={`w-full md:w-[320px] lg:w-[380px] border-r border-gray-100 flex flex-col flex-shrink-0 transition-all duration-300 ${
            showSidebarMobile ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Header & Search */}
          <div className="p-4 border-b border-gray-100 space-y-3">
            <h2 className="text-lg font-heading font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare size={20} className="text-comatch-primary" />
              Chats
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-gray-50 border-gray-200 focus:bg-white text-xs font-semibold"
              />
            </div>
          </div>

          {/* List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50 p-2 space-y-1">
            {isLoadingConversations ? (
              <div className="text-center py-8 text-xs text-gray-400 font-semibold">
                Loading chats...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12 text-xs text-gray-400 italic">
                {searchQuery ? 'No chats found matching query.' : 'No active chats. Start one from a profile!'}
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = activeConversation?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setActiveConversation(conv);
                      setShowSidebarMobile(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition text-left ${
                      isActive
                        ? 'bg-blue-50/50 border border-blue-100/40 shadow-2xs'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <Avatar
                      src={conv.otherParticipant.profile_pic_url || undefined}
                      name={conv.otherParticipant.name}
                      variant="small"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-xs text-gray-950 truncate block">
                          {conv.otherParticipant.name}
                        </span>
                        {conv.lastMessageTime && (
                          <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                            {conv.lastMessageTime}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 truncate font-medium">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* MAIN PANEL: ACTIVE CHAT FEED */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 relative ${
            !showSidebarMobile ? 'flex' : 'hidden md:flex'
          }`}
        >
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shadow-2xs">
                <div className="flex items-center gap-3">
                  {/* Back button on mobile */}
                  <Button
                    variant="ghost"
                    onClick={() => setShowSidebarMobile(true)}
                    className="md:hidden !p-2 -ml-2"
                  >
                    <ArrowLeft size={18} className="text-gray-600" />
                  </Button>
                  
                  <Avatar
                    src={activeConversation.otherParticipant.profile_pic_url || undefined}
                    name={activeConversation.otherParticipant.name}
                    variant="small"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 leading-tight">
                      {activeConversation.otherParticipant.name}
                    </h3>
                    <span className="text-[10px] text-gray-400 font-semibold">
                      Direct Message
                    </span>
                  </div>
                </div>

                <Link
                  href={`/profile/${activeConversation.otherParticipant.id}`}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-comatch-primary hover:underline"
                >
                  View Profile
                  <ExternalLink size={12} />
                </Link>
              </div>

              {/* Message List Container */}
              <div className="flex-1 bg-slate-50/30 overflow-y-auto p-4 space-y-3.5">
                {isLoadingMessages ? (
                  <div className="text-center py-8 text-xs text-gray-400 font-semibold">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-xs text-gray-400 italic">
                    Say hello to start the conversation!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === currentUser?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-2xl shadow-3xs text-xs whitespace-pre-wrap leading-relaxed ${
                            isMe
                              ? 'bg-comatch-primary text-white rounded-br-none animate-in slide-in-from-right-3 duration-200'
                              : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none animate-in slide-in-from-left-3 duration-200'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <span
                            className={`text-[9px] block text-right mt-1.5 font-medium ${
                              isMe ? 'text-blue-100' : 'text-gray-400'
                            }`}
                          >
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Compose Box */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-gray-100 flex items-center gap-2 bg-white"
              >
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  disabled={isSending}
                  className="flex-1 bg-gray-50 border-gray-200 focus:bg-white text-xs font-semibold h-10 px-4"
                />
                <Button
                  type="submit"
                  disabled={isSending || !messageInput.trim()}
                  className="h-10 w-10 flex items-center justify-center p-0 rounded-xl"
                >
                  <Send size={16} />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50/20">
              <MessageSquare size={48} className="text-gray-200 mb-4" />
              <h3 className="text-sm font-bold text-gray-800 mb-1">
                Your Inbox
              </h3>
              <p className="text-xs text-gray-400 max-w-xs text-center font-medium leading-relaxed">
                Select an active chat from the sidebar, or view a member profile to start a new conversation.
              </p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="max-w-screen-xl mx-auto px-4 py-12 text-center text-xs text-gray-400 font-semibold">
        Loading chat workspace...
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
