"use client";

import { useState } from "react";
import CommentCard from "./CommentCard";
import { RiSendPlaneFill } from "react-icons/ri";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"; 
import { Comment } from "./PostPage";

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
        const text = commentText.trim();
        if (!text) return; 

        setIsSubmitting(true);

        try {
            const newComment: Comment = {
                id: crypto.randomUUID(), 
                content: text,
                created_at: new Date().toISOString(),
                profiles: {
                    name: name, 
                    profile_pic_url: profile_pic_url,
                }
            };

            await onAddComment(newComment); 
            
            setCommentText("");             

        } catch (error) {
            console.error("Failed to post comment:", error);
        } finally {
            setIsSubmitting(false); 
        }
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