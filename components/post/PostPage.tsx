"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import PostCard, { PostCardProps } from "./PostCard";
import { type EditPostData } from "./EditPostModal";
import { TbFileSad } from "react-icons/tb";
import PostPageHeader from "./PostPageHeader";
import { createClient } from "@/utils/clients";
import timeAgo from "@/lib/TimeAgo";
import { useSearchParams } from "next/navigation";

interface PostPageProps {
    currentUserName: string;
    postIds: string[]
    spaceId: string;
    currentUserAvatar?: string;
    showOwnPostsOnly: boolean;
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
    showOwnPostsOnly,
    postIds,
    spaceId,
    currentUserAvatar,
}: PostPageProps) {
    const searchParams = useSearchParams();
    const sharedPostId = searchParams.get("post");
    const supabase = createClient();

    const [fetchedPosts, setFetchedPosts] = useState<PostCardProps[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [highlightedPostId, setHighlightedPostId] = useState<string | null>(null);

    // Fetch Post data
    useEffect(() => {
        async function fetchPostData() {
            if (postIds.length === 0) {
                setIsLoading(false);
                return;
            }

            try {
                // Inside fetchPostData
                const { data: { user } } = await supabase.auth.getUser();
                const currentUserId = user?.id;
                const { data, error } = await supabase
                    .from('posts')
                    .select(`
                        id,
                        owner_id,
                        title,
                        description,
                        commitment_level,
                        image_url,
                        created_at,
                        profiles!posts_owner_id_fkey (name, profile_pic_url), 
                        roles (role, quantity),
                        post_likes (profile_id),
                        applications (applicant_id),
                        post_comments (
                            id,
                            content,
                            created_at,
                            profiles (name, profile_pic_url)
                        )
                    `)
                    .in('id', postIds)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                const formattedPosts: PostCardProps[] = data
                        .filter(
                            (post: any) =>
                                !showOwnPostsOnly || post.owner_id === currentUserId
                        )
                    .map((post: any) => ({
                        postid: post.id,
                        spaceId,
                        ownerId: post.owner_id,
                        ownerName: post.profiles?.name || "Unknown User",
                        ownerAvatarUrl: post.profiles?.profile_pic_url,
                        isOwner: Boolean(currentUserId && post.owner_id === currentUserId),
                        initialHasApplied: Boolean(
                            currentUserId && 
                            post.applications?.some((app: any) => app.applicant_id === currentUserId)
                        ),
                        postDate: timeAgo(post.created_at),

                        initialLikeCount: post.post_likes ? post.post_likes.length : 0,
                        initialIsLiked: post.post_likes 
                            ? post.post_likes.some((like: any) => like.profile_id === currentUserId) 
                            : false,
                        postTitle: post.title,
                        postDescription: post.description,
                        postImageUrl: post.image_url,
                        commitmentLevel: post.commitment_level,

                        rolesAndPositions: post.roles ? post.roles.map((r: any) => ({
                            role: r.role,
                            position: r.quantity
                        })) : [],

                        initialComments: post.post_comments ? post.post_comments.map((comment: any) => ({
                            id: comment.id,
                            content: comment.content,
                            created_at: comment.created_at,
                            profiles: {
                                name: comment.profiles?.name || "Unknown User",
                                profile_pic_url: comment.profiles?.profile_pic_url
                            }
                        })) : []
                    }));

                setFetchedPosts(formattedPosts);
            } catch (err) {
                console.error("Failed to fetch posts:", JSON.stringify(err, null, 2));
            } finally {
                setIsLoading(false);
            }
        }

        fetchPostData();
    }, [postIds]);

    // scroll effect 
    useEffect(() => {
        if (isLoading || !sharedPostId) return;

        const targetPost = document.getElementById(`post-${sharedPostId}`);

        if (!targetPost) return;

        setHighlightedPostId(sharedPostId);

        requestAnimationFrame(() => {
            targetPost.scrollIntoView({
            behavior: "smooth",
            block: "center",
            });
        });

        const timer = window.setTimeout(() => {
            setHighlightedPostId(null);
        }, 1000);

        return () => window.clearTimeout(timer);
    }, [isLoading, sharedPostId, fetchedPosts]);

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
            toast.error("You must be logged in to apply.");
            throw new Error("User not authenticated");
        }

        // Direct DB verification: Check if current user is the owner of the post
        const { data: postCheck } = await supabase
            .from('posts')
            .select('owner_id')
            .eq('id', postId)
            .maybeSingle();

        if (postCheck && postCheck.owner_id === user.id) {
            toast.error("You cannot apply to your own recruitment post.");
            throw new Error("You cannot apply to your own recruitment post.");
        }

        const applicationInserts = roles.map((role) => ({
            post_id: postId,
            applicant_id: user.id,
            selected_roles: [role],
            intro_message: message
        }));

        const { error } = await supabase
            .from('applications')
            .insert(applicationInserts);

        if (error) throw error;
        toast.success("Application submitted successfully!");
    }

    // Handle Delete Post
    const handleDeletePost = async (postId: string) => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            toast.error("You must be logged in.");
            return;
        }

        try {
            // Delete dependent records first to prevent foreign key errors
            const { data: existingRoles } = await supabase.from('roles').select('id').eq('post_id', postId);
            if (existingRoles && existingRoles.length > 0) {
                await supabase.from('roles').delete().in('id', existingRoles.map(r => r.id));
            }
            await supabase.from('roles').delete().eq('post_id', postId);
            await supabase.from('post_comments').delete().eq('post_id', postId);
            await supabase.from('post_likes').delete().eq('post_id', postId);
            await supabase.from('applications').delete().eq('post_id', postId);

            const { error } = await supabase
                .from('posts')
                .delete()
                .match({ id: postId, owner_id: user.id });

            if (error) {
                console.error("Error deleting post:", error);
                toast.error("Failed to delete post.");
                throw error;
            }

            setFetchedPosts(prev => prev.filter(p => p.postid !== postId));
            toast.success("Post deleted successfully.");
        } catch (err: any) {
            console.error("Delete post error:", err);
            toast.error("Failed to delete post: " + (err.message || "Unknown error"));
        }
    }

    // Handle Edit Post
    const handleEditPost = async (postId: string, updatedData: EditPostData) => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            toast.error("You must be logged in.");
            return;
        }

        let imageUrl = updatedData.existingImageUrl;

        if (updatedData.imageFile) {
            const fileExt = updatedData.imageFile.name.split('.').pop();
            const fileName = `${crypto.randomUUID()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('post_images')
                .upload(filePath, updatedData.imageFile);

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage
                .from('post_images')
                .getPublicUrl(filePath);

            imageUrl = publicUrlData.publicUrl;
        }

        const { error: updateError } = await supabase
            .from('posts')
            .update({
                title: updatedData.title.trim(),
                description: updatedData.description.trim(),
                commitment_level: updatedData.commitmentLevel,
                image_url: imageUrl || null,
            })
            .match({ id: postId, owner_id: user.id });

        if (updateError) throw updateError;

        // Clean up old roles by explicit ID and by post_id
        const { data: existingRoles } = await supabase.from('roles').select('id').eq('post_id', postId);
        if (existingRoles && existingRoles.length > 0) {
            await supabase.from('roles').delete().in('id', existingRoles.map(r => r.id));
        }
        await supabase.from('roles').delete().eq('post_id', postId);

        const validRoles = updatedData.roles
            .map((role, index) => ({ role: role.trim(), quantity: updatedData.quantities[index] }))
            .filter(r => r.role !== "");

        if (validRoles.length > 0) {
            const rolesToInsert = validRoles.map(r => ({
                post_id: postId,
                role: r.role,
                quantity: r.quantity ?? 1
            }));
            const { error: insertRolesErr } = await supabase.from('roles').insert(rolesToInsert);
            if (insertRolesErr) {
                console.error("Error inserting updated roles:", insertRolesErr);
            }
        }

        setFetchedPosts(prev => prev.map(p => {
            if (p.postid === postId) {
                return {
                    ...p,
                    postTitle: updatedData.title,
                    postDescription: updatedData.description,
                    commitmentLevel: updatedData.commitmentLevel,
                    postImageUrl: imageUrl,
                    rolesAndPositions: validRoles.map(r => ({ role: r.role, position: r.quantity ?? 1 })),
                };
            }
            return p;
        }));

        toast.success("Post updated successfully.");
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
                    owner_id: user.id,
                    space_id: spaceId,
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
                spaceId,
                ownerId: user.id,
                ownerName: currentUserName,
                ownerAvatarUrl: undefined,
                postDate: timeAgo(postResult.created_at || new Date().toISOString()),
                initialLikeCount: 0,
                initialIsLiked: false,
                postTitle: postData.title,
                postDescription: postData.description,
                postImageUrl: imageUrl ?? undefined,
                commitmentLevel: postData.commitmentLevel,
                rolesAndPositions: validRoles.map(r => ({
                    role: r.role,
                    position: r.quantity ?? 1
                })),
                initialComments: [],
                onLike: handleLike,
                onNewComment: handleNewComment,
                onApply: handleApply,
                onDelete: handleDeletePost,
                onEdit: handleEditPost,
            };

            setFetchedPosts(prevPosts => [newPostCardData, ...prevPosts]);

        } catch (error) {
            console.error("Failed to create post:", JSON.stringify(error, null, 2));
        }
    }

    if (fetchedPosts.length === 0) {
        return (
            <div className="flex flex-col gap-4">
                <PostPageHeader
                    name={currentUserName}
                    onPost={handlePost}
                    profile_pic_url={currentUserAvatar}
                />
                <div className="flex flex-row gap-3 items-center justify-center mt-3">
                    <TbFileSad />
                    {showOwnPostsOnly ? (
                        <span> Your posts will appear here you post teammate calls. </span>
                    ) : (
                        <span> Posts will appear here when members post teammate calls. </span>
                    )}
                </div>
            </div>
        );
    }

    if (isLoading) {
        return <div className="mt-3">Loading posts...</div>;
    }

    return (
        <div className="flex flex-col gap-4">
            <PostPageHeader
                name={currentUserName}
                onPost={handlePost}
                profile_pic_url={currentUserAvatar}
            />
            <div className="flex flex-col gap-4">
                {fetchedPosts.map((post) => (
                    <PostCard
                        spaceId={spaceId}
                        key={post.postid}
                        postid={post.postid}
                        ownerId={post.ownerId}
                        ownerName={post.ownerName}
                        ownerAvatarUrl={post.ownerAvatarUrl}
                        isOwner={post.isOwner}
                        initialHasApplied={post.initialHasApplied}
                        currentUserName={currentUserName}
                        currentUserAvatar={currentUserAvatar}
                        postDate={post.postDate}
                        initialLikeCount={post.initialLikeCount}
                        postTitle={post.postTitle}
                        postDescription={post.postDescription}
                        postImageUrl={post.postImageUrl}
                        commitmentLevel={post.commitmentLevel}
                        rolesAndPositions={post.rolesAndPositions}
                        initialComments={post.initialComments}
                        initialIsLiked={post.initialIsLiked}
                        onLike={handleLike}
                        onNewComment={handleNewComment}
                        onApply={handleApply}
                        onDelete={handleDeletePost}
                        onEdit={handleEditPost}
                        isHighlighted={highlightedPostId === post.postid}
                    />
                ))}
            </div>
        </div>
    );
}