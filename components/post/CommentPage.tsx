"use client";

import { useState } from "react";
import CommentCard from "./CommentCard";
import { RiSendPlaneFill } from "react-icons/ri";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"; 

export interface Comment {
    id: string; 
    content: string; 
    created_at: string; 
    profiles: {
        name: string;
        profile_pic_url?: string;
    }
}

interface CommentPageProps {
    name: string;
    profile_pic_url?: string; 
    comments: Comment[];
    postid: string;
    onAddComment: (comment: Comment) => void;
}

export default function CommentPage({
    name,
    profile_pic_url,
    comments,
    postid,
    onAddComment,
}: CommentPageProps) {
    const [commentText, setCommentText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        // Prevent empty submissions
        if (!commentText.trim()) return; 

        setIsSubmitting(true);

        // Simulate a 1-second delay so you can test your loading state
        setTimeout(() => {
            
            // 1. Create a fake comment object simulating what the backend WOULD return
            const mockNewComment: Comment = {
                id: crypto.randomUUID(), // Generates a random fake ID
                content: commentText,
                created_at: new Date().toISOString(),
                profiles: {
                    name: "Current User", // You will eventually use the logged-in user's name
                    profile_pic_url: profile_pic_url,
                }
            };

            // 2. Update the UI with the new fake comment
            onAddComment(mockNewComment); 
            
            // 3. Clear the textarea
            setCommentText(""); 
            
            // 4. Stop the loading state
            setIsSubmitting(false); 

        }, 1000); 
    };

    return (
        <div className="w-full flex flex-col gap-4">
            {/* Existing Comments */}
            <div className="flex flex-col gap-4">
                {comments.map((comment) => (
                    <CommentCard 
                        key={comment.id}
                        profileName={comment.profiles.name}
                        comment={comment.content}
                        profile_pic_url={comment.profiles.profile_pic_url}
                        created_at={comment.created_at}
                    />
                ))}
            </div>

            {/* Write New Comments */}
            <div className="flex flex-row w-full items-center gap-3 border-t pt-3"> 
                <Avatar name={name} className="flex-none">
                    <AvatarImage 
                        src={profile_pic_url}
                        alt="Profile Picture"
                    />
                    <AvatarFallback />
                </Avatar>                
                
                <Textarea 
                    placeholder="Write a comment" 
                    className="flex-1 min-h-[40px]" 
                    value={commentText} 
                    onChange={(e) => setCommentText(e.target.value)} 
                    disabled={isSubmitting} 
                />
                <button
                    onClick={handleSubmit} 
                    disabled={isSubmitting || !commentText.trim()}  
                >
                    <RiSendPlaneFill className="flex-none text-2xl cursor-pointer text-blue-600 hover:text-black" />
                </button>
            </div>
        </div>
    );
}