"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Logo from "@/public/pics/logo.png"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/badge";
import SearchBar from "@/components/ui/searchbar";
import { FiBell, FiSearch, FiMessageSquare, FiX } from 'react-icons/fi';
import { usePathname } from "next/navigation";
import { createClient } from '@/utils/clients';
import GlobalSearch from "./GlobalSearch";

export default function NavBar() {
    const [showSearch, setShowSearch] = useState(false);
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>("User"); 
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [hasNotifications, setHasNotifications] = useState<boolean>(false);
    const pageTitles : Record<string, string> = {
        "/profile": "My Profile",
        "/dashboard" : "Dashboard",
        "/chat" : "Chats"
    };
    const pathname = usePathname();
    const currentTitle = pageTitles[pathname] || "Spaces";

    useEffect(() => {
        const supabase = createClient();
        const fetchProfileData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('profile_pic_url, name')
                    .eq('id', user.id)
                    .maybeSingle();

                if (data) {
                    setProfilePic(data.profile_pic_url || null);
                    if (data.name) setUserName(data.name);
                }
            }
        };

        fetchProfileData();

        // Real-time unread messages listener
        let messagesChannel: any;

        const fetchUnreadCount = async (userId: string) => {
            const { count, error } = await supabase
                .from('messages')
                .select('id, conversations!inner(user1_id, user2_id)', { count: 'exact', head: true })
                .eq('is_read', false)
                .neq('sender_id', userId)
                .or(`user1_id.eq.${userId},user2_id.eq.${userId}`, { foreignTable: 'conversations' });

            if (!error && count !== null) {
                setUnreadCount(count);
            }
        };

        const setupRealtimeInbox = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await fetchUnreadCount(user.id);

                messagesChannel = supabase
                    .channel('global_inbox')
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: 'messages' },
                        () => {
                            fetchUnreadCount(user.id);
                        }
                    )
                    .subscribe();
            }
        };

        setupRealtimeInbox();

        // Real-time pending applications notification listener
        let appsChannel: any;

        const fetchNotificationStatus = async (userId: string) => {
            // 1. Check inbound applications (where we are the post owner, status is Pending, and not seen)
            const { count: inboundCount, error: inboundError } = await supabase
                .from('applications')
                .select('id, posts!inner(owner_id)', { count: 'exact', head: true })
                .eq('status', 'Pending')
                .eq('owner_seen', false)
                .eq('posts.owner_id', userId);

            // 2. Check outbound applications (where we are the applicant, status is Approved/Rejected, and not seen)
            const { count: outboundCount, error: outboundError } = await supabase
                .from('applications')
                .select('id', { count: 'exact', head: true })
                .eq('applicant_id', userId)
                .in('status', ['Approved', 'Rejected'])
                .eq('applicant_seen', false);

            if (!inboundError && !outboundError) {
                const totalNotifications = (inboundCount || 0) + (outboundCount || 0);
                setHasNotifications(totalNotifications > 0);
            }
        };

        const setupRealtimeNotifications = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await fetchNotificationStatus(user.id);

                appsChannel = supabase
                    .channel('global_applications_notifications')
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: 'applications' },
                        () => {
                            fetchNotificationStatus(user.id);
                        }
                    )
                    .subscribe();
            }
        };

        setupRealtimeNotifications();

        const handleProfileUpdate = () => {
            fetchProfileData();
        };
        window.addEventListener('profileUpdated', handleProfileUpdate);

        return () => {
            window.removeEventListener('profileUpdated', handleProfileUpdate);
            if (messagesChannel) supabase.removeChannel(messagesChannel);
            if (appsChannel) supabase.removeChannel(appsChannel);
        };
    }, []);

    return (
        <header className="sticky bg-comatch-background top-0 z-30 border-b border-border backend-blur anim-slide-down">
            <div className="max-w-screen-xl mx-auto flex items-center justify-between px-6 py-3.5 gap-4">
                
                {/* LEFT SECTION: LOGO */}
                <a href="/">
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Image
                            src={Logo}
                            alt="CoMatch Logo"
                            width={32} 
                            height={32}
                        />
                        <span className="font-heading font-bold text-[16px] text-foreground tracking-tight">
                            CoMatch
                        </span>
                    </div>
                </a>

                {/* MIDDLE SECTION */}
                <div className="flex-1 flex justify-center select-none">
                    <Badge 
                        variant="secondary" 
                        className="font-heading px-8 py-4 rounded-full border-0 tracking-normal normal-case shadow-none transition-colors">
                        {currentTitle}
                    </Badge>
                </div>
                
                {/* RIGHT SECTION */}
                <div className="flex items-center gap-3 flex-shrink-0 justify-end transition-all duration-300 ease-in-out">
                    
                    {/* Animated Search Area Wrapper (Expands to the left) */}
                    <div 
                        className={`flex items-center gap-2 transition-all duration-300 ease-in-out ${
                            showSearch ? "max-w-md opacity-100 overflow-visible" : "max-w-0 opacity-0 pointer-events-none overflow-hidden"
                        }`}
                    >
                        <div className="w-[280px] sm:w-[320px]">
                            <GlobalSearch isOpen={showSearch} />
                        </div>

                        {/* Close Search icon */}
                        <button 
                            onClick={() => setShowSearch(false)}
                            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                            aria-label="Close search"
                        >
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Search Trigger Button */}
                    {!showSearch && (
                        <button 
                            onClick={() => setShowSearch(true)}
                            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-foreground dynamic-fade-in"
                            aria-label="Open search"
                        >
                            <FiSearch className="w-[18px] h-[18px]" />
                        </button>
                    )}

                    {/* Chat Icon Button */}
                    <a href="/chat">
                        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors relative text-foreground">
                            <FiMessageSquare className="w-[18px] h-[18px]" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-extrabold px-1 animate-pulse shadow-sm">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </a>

                    {/* Notification Bell Icon */}
                    <a href="/dashboard">
                        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors relative text-foreground">
                            <FiBell className="w-[17px] h-[17px]" />
                            {hasNotifications && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full animate-pulse" aria-hidden="true"></span>
                            )}
                        </button>
                    </a>

                    {/* User Avatar Circle */}
                    <a href="/profile">
                        <button 
                            className="w-9 h-9 cursor-pointer rounded-full overflow-hidden border border-input bg-muted flex items-center justify-center relative"
                            type="button"
                        >
                            
                            <Avatar name={userName}>
                                <AvatarImage
                                    src={profilePic || undefined}
                                    alt={`${userName} Profile Picture`}
                                />
                                <AvatarFallback />
                            </Avatar>
                        </button>
                    </a>
                    
                </div>
            </div>
        </header>
    );
}