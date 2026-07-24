"use client";

import { useState, useEffect } from "react";
import PostCard, { PostCardProps } from "@/components/post/PostCard";
import { Comment } from "@/components/post/PostPage";
import { createClient } from "@/utils/clients";
import timeAgo from "@/lib/TimeAgo";

export default function HomePostPage() {
  const [fetchedPosts, setFetchedPosts] = useState<PostCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Fetch all posts from newest to oldest
  useEffect(() => {
    async function fetchAllPosts() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const currentUserId = user?.id;

        const { data, error } = await supabase
          .from("posts")
          .select(`
            id,
            title,
            description,
            commitment_level,
            image_url,
            created_at,
            profiles!posts_owner_id_fkey (name, profile_pic_url), 
            roles (role, quantity),
            post_likes (profile_id),
            post_comments (
                id,
                content,
                created_at,
                profiles (name, profile_pic_url)
            )
          `)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const formattedPosts: PostCardProps[] = data.map((post: any) => ({
          postid: post.id,
          ownerName: post.profiles?.name || "Unknown User",
          ownerAvatarUrl: post.profiles?.profile_pic_url,
          postDate: timeAgo(post.created_at),

          initialLikeCount: post.post_likes ? post.post_likes.length : 0,
          initialIsLiked: post.post_likes
            ? post.post_likes.some((like: any) => like.profile_id === currentUserId)
            : false,
          postTitle: post.title,
          postDescription: post.description,
          postImageUrl: post.image_url,
          commitmentLevel: post.commitment_level,

          rolesAndPositions: post.roles
            ? post.roles.map((r: any) => ({
                role: r.role,
                position: r.quantity,
              }))
            : [],

          initialComments: post.post_comments
            ? post.post_comments.map((comment: any) => ({
                id: comment.id,
                content: comment.content,
                created_at: comment.created_at,
                profiles: {
                  name: comment.profiles?.name || "Unknown User",
                  profile_pic_url: comment.profiles?.profile_pic_url,
                },
              }))
            : [],
        }));

        setFetchedPosts(formattedPosts);
      } catch (err) {
        console.error("Failed to fetch posts:", JSON.stringify(err, null, 2));
      } finally {
        setIsLoading(false);
      }
    }

    fetchAllPosts();
  }, []);

  // Handle like toggle
  const handleLike = async (postId: string, previousLiked: boolean) => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    if (previousLiked) {
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .match({ post_id: postId, profile_id: user.id });

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("post_likes")
        .insert({ post_id: postId, profile_id: user.id });

      if (error) throw error;
    }
  };

  // Handle adding new comment
  const handleNewComment = async (postId: string, newComment: Comment) => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase.from("post_comments").insert({
      id: newComment.id,
      post_id: postId,
      profile_id: user.id,
      content: newComment.content,
    });

    if (error) throw error;

    setFetchedPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.postid === postId) {
          return {
            ...post,
            initialComments: [...post.initialComments, newComment],
          };
        }
        return post;
      })
    );
  };

  // Handle role application submission
  const handleApply = async (
    postId: string,
    roles: string[],
    message: string
  ) => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase.from("applications").insert({
      post_id: postId,
      applicant_id: user.id,
      selected_roles: roles,
      intro_message: message,
    });

    if (error) throw error;
  };

  if (isLoading) {
    return <div className="mt-6 text-center text-muted-foreground">Loading posts...</div>;
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4">
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
          initialIsLiked={post.initialIsLiked}
          onLike={handleLike}
          onNewComment={handleNewComment}
          onApply={handleApply}
        />
      ))}
    </div>
  );
}