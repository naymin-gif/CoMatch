"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card"; 
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import TimeAgo from "@/lib/TimeAgo";


interface CommentCardProps {
    profile_pic_url?: string;
    comment: string;
    profileName: string;
    created_at: string; 
}

export default function CommentCard({
    profile_pic_url,
    comment,
    profileName,
    created_at, 
} : CommentCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showSeeMore, setShowSeeMore] = useState(false);
    const textRef = useRef<HTMLParagraphElement>(null);
    const formattedDate = TimeAgo(created_at);

    useEffect(() => {
        if (textRef.current) {
            // Check if the text is overflowing its 3-line container
            setShowSeeMore(textRef.current.scrollHeight > textRef.current.clientHeight);
        }
    }, [comment]);

    return (
        <div className="w-3/4 flex flex-row gap-3">
            <Avatar name={profileName} size="sm">
                <AvatarImage
                    src={profile_pic_url}
                    alt={`${profileName} Picture`}
                />
                <AvatarFallback />
            </Avatar>
            <Card className="flex-1 bg-comatch-background">
                <CardHeader className="flex flex-row items-center">
                    <span className="font-heading">{profileName}</span>  
                    <span className="text-xs text-gray-500">• {formattedDate}</span>
                </CardHeader>
                <CardContent>
                    <p 
                        ref={textRef} 
                        className={!isExpanded ? "line-clamp-3" : ""}
                    >
                        {comment}
                    </p>
                    
                    {showSeeMore && (
                        <button 
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-sm text-gray-500 hover:text-gray-700 hover:underline mt-2 font-medium"
                        >
                            {isExpanded ? "See less" : "See more"}
                        </button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}