"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Logo from "@/public/pics/logo.png"; 
import defaultPf from "@/public/pics/profilepicture.jpg"; 
import { Badge } from "@/components/ui/badge";
import SearchBar from "@/components/ui/searchbar";
import { FiBell, FiSearch, FiMessageSquare, FiX } from 'react-icons/fi';
import { usePathname } from "next/navigation";
import { createClient } from '@/utils/clients';

export default function NavBar() {
    const [showSearch, setShowSearch] = useState(false);
    const [profilePic, setProfilePic] = useState<string | null>(null);

    const pageTitles : Record<string, string> = {
        "/profile": "My Profile",
        "/dashboard" : "Dashboard",
        "/chat" : "Chats"
    };
    const pathname = usePathname();
    const currentTitle = pageTitles[pathname] || "My Spaces";

    useEffect(() => {
        const fetchProfilePic = async () => {
            const supabase = createClient();
            
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            
            if (user) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('profile_pic_url')
                    .eq('id', user.id)
                    .maybeSingle();

                if (data && data.profile_pic_url) {
                    setProfilePic(data.profile_pic_url);
                }
            }
        };

        fetchProfilePic();
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
                        className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ease-in-out ${
                            showSearch ? "max-w-md opacity-100" : "max-w-0 opacity-0 pointer-events-none"
                        }`}
                    >
                        <div className="w-[280px] sm:w-[320px]">
                            <SearchBar />
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
                    <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-foreground">
                        <FiMessageSquare className="w-[18px] h-[18px]" />
                    </button>

                    {/* Notification Bell Icon */}
                    <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors relative text-foreground">
                        <FiBell className="w-[17px] h-[17px]" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" aria-hidden="true"></span>
                    </button>

                    {/* User Avatar Circle */}
                    <a href="/profile">
                        <button 
                            className="w-9 h-9 cursor-pointer rounded-full overflow-hidden border border-input bg-muted flex items-center justify-center relative"
                            type="button"
                        >
                            {/* 3. Render real image, with fallback, and unoptimized flag */}
                            <Image
                                src={profilePic || defaultPf} 
                                alt="Profile" 
                                fill 
                                sizes="36px"
                                className="object-cover" 
                                unoptimized={!!profilePic} 
                            />
                        </button>
                    </a>
                    
                </div>
            </div>
        </header>
    );
}