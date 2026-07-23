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

export interface NewPostData {
    title: string;
    description: string;
    imageFile: File | null;
    commitmentLevel: string;
    roles: string[];
    quantities: number[];
}

export default function PostPage({
    currentUserName,
    postIds
}: PostPageProps) {
    const [fetchedPosts, setFetchedPosts] = useState<PostCardProps[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch Post data
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

    // Functions

    // Handle like 
    const handleLike = async (postId: string, previousLiked: boolean) => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            throw new Error("User not authenticated");
        }

        if (previousLiked) {
            const { error } = await supabase
                .from('post_likes')
                .delete()
                .match({ post_id: postId, profile_id: user.id });
            
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('post_likes')
                .insert({ post_id: postId, profile_id: user.id });
            
            if (error) throw error;
        }
    }

    // Handle New Comment
    const handleNewComment = async (postId: string, newComment: Comment) => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            throw new Error("User not authenticated");
        }

        const { error } = await supabase
            .from('post_comments')
            .insert({
                id: newComment.id, 
                post_id: postId,
                profile_id: user.id,
                content: newComment.content
            });
        
        if (error) throw error;

        setFetchedPosts(prevPosts => 
            prevPosts.map(post => {
                if (post.postid === postId) {
                    return {
                        ...post,
                        initialComments: [...post.initialComments, newComment]
                    };
                }
                return post;
            })
        );
    }

    // Handle Application submission
    const handleApply = async (postId: string, roles: string[], message: string) => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            throw new Error("User not authenticated");
        }

        const { error } = await supabase
            .from('applications')
            .insert({
                post_id: postId,
                applicant_id: user.id,
                selected_roles: roles, 
                intro_message: message      
            });
        
        if (error) throw error;
    }

    // Handle Post Creation
    const handlePost = async (postData: NewPostData) => {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            
            if (authError || !user) {
                throw new Error("User not authenticated");
            }

            let imageUrl: string | undefined = undefined;

            if (postData.imageFile) {
                const fileExt = postData.imageFile.name.split('.').pop();
                const fileName = `${crypto.randomUUID()}.${fileExt}`;
                const filePath = `${user.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('post_images') 
                    .upload(filePath, postData.imageFile);

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('post_images')
                    .getPublicUrl(filePath);
                
                imageUrl = publicUrlData.publicUrl;
            }

            const { data: postResult, error: postError } = await supabase
                .from('posts')
                .insert({
                    profile_id: user.id,
                    title: postData.title,
                    description: postData.description,
                    commitment_level: postData.commitmentLevel,
                    image_url: imageUrl,
                })
                .select()
                .single();

            if (postError) throw postError;

            const validRoles = postData.roles
                .map((role, index) => ({ role: role.trim(), quantity: postData.quantities[index] }))
                .filter(r => r.role !== ""); 

            if (validRoles.length > 0) {
                const rolesToInsert = validRoles.map(r => ({
                    post_id: postResult.id,
                    role: r.role,
                    quantity: r.quantity
                }));

                const { error: rolesError } = await supabase
                    .from('roles')
                    .insert(rolesToInsert);
                
                if (rolesError) throw rolesError;
            }

            const newPostCardData: PostCardProps = {
                postid: postResult.id,
                ownerName: currentUserName, 
                ownerAvatarUrl: undefined, 
                postDate: new Date().toLocaleDateString(),
                initialLikeCount: 0,
                postTitle: postData.title,
                postDescription: postData.description,
                postImageUrl: imageUrl ?? undefined,
                commitmentLevel: postData.commitmentLevel,
                rolesAndPositions: validRoles.map(r => ({
                    role: r.role,
                    position: r.quantity
                })),
                initialComments: [],
                onLike: handleLike,
                onNewComment: handleNewComment,
                onApply: handleApply
            };

            setFetchedPosts(prevPosts => [newPostCardData, ...prevPosts]);

        } catch (error) {
            console.error("Failed to create post:", error);
        }
    }

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
            <PostPageHeader name={currentUserName} onPost={handlePost} />
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
                        onLike={handleLike}
                        onNewComment={handleNewComment}
                        onApply={handleApply}
                    />
                ))}
            </div>
        </div>
    );
}