"use client";

import { useState, useEffect } from "react";
import PostCard, { PostCardProps } from "./PostCard";
import { TbFileSad } from "react-icons/tb";
import PostPageHeader from "./PostPageHeader";
import { supabase } from "@/utils/supabse";

interface PostPageProps {
    currentUserName: string;
    postIds: string[]
}

export interface Comment {
    id: string;
    content: string;
    created_at: string;
    profiles: {
        name: string;
        profile_pic_url?: string;
    }
}

export interface RoleAndPosition {
    role: string;
    position: number;
}

export default function PostPage({
    currentUserName,
    postIds
}: PostPageProps) {
    const [fetchedPosts, setFetchedPosts] = useState<PostCardProps[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchPostData() {
            if (postIds.length === 0) {
                setIsLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('posts')
                    .select(`
                        id,
                        title,
                        description,
                        commitment_level,
                        image_url,
                        created_at,
                        profiles (name, profile_pic_url),
                        roles (role, quantity),
                        post_likes (profile_id)
                    `)
                    .in('id', postIds);

                if (error) throw error;

                const formattedPosts: PostCardProps[] = data.map((post: any) => ({
                    postid: post.id,
                    ownerName: post.profiles?.name || "Unknown User",
                    ownerAvatarUrl: post.profiles?.profile_pic_url,
                    postDate: new Date(post.created_at).toLocaleDateString(),
                    
                    initialLikeCount: post.post_likes ? post.post_likes.length : 0,
                    
                    postTitle: post.title,
                    postDescription: post.description,
                    postImageUrl: post.image_url,
                    commitmentLevel: post.commitment_level,
                    
                    rolesAndPositions: post.roles ? post.roles.map((r: any) => ({
                        role: r.role,
                        position: r.quantity 
                    })) : [],
                    
                    initialComments: [] 
                }));

                setFetchedPosts(formattedPosts);
            } catch (err) {
                console.error("Failed to fetch posts:", err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchPostData();
    }, [postIds]);

    if (postIds.length === 0) {
        return (
            <div className="flex flex-row gap-3 items-center mt-3">
                <TbFileSad />
                <span> Posts will appear here when members post teammate calls. </span>
            </div>
        );
    } 
    
    if (isLoading) {
        return <div className="mt-3">Loading posts...</div>; 
    }

    return (
        <div className="flex flex-col gap-4">
            <PostPageHeader name={currentUserName} />
            <div className="flex flex-col gap-4">
                {fetchedPosts.map((post) => (
                    <PostCard
                        key={post.postid}
                        postid={post.postid}
                        ownerName={post.ownerName}
                        ownerAvatarUrl={post.ownerAvatarUrl}
                        postDate={post.postDate}
                        initialLikeCount={post.initialLikeCount}
                        postTitle={post.postTitle}
                        postDescription={post.postDescription}
                        postImageUrl={post.postImageUrl}
                        commitmentLevel={post.commitmentLevel}
                        rolesAndPositions={post.rolesAndPositions}
                        initialComments={post.initialComments}
                    />
                ))}
            </div>
        </div>
    );
}