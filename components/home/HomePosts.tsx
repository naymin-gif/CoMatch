"use client";

import PostCard from "@/components/post/PostCard";
import type { PostCardProps } from "@/components/post/PostCard";
import type { Comment } from "@/components/post/PostPage";

type HomePostsProps = {
  posts: PostCardProps[];
  isLoading: boolean;
  onLike: (postId: string, previousLiked: boolean) => Promise<void>;
  onNewComment: (postId: string, newComment: Comment) => Promise<void>;
  onApply: (
    postId: string,
    roles: string[],
    message: string
  ) => Promise<void>;
};

export default function HomePosts({
  posts,
  isLoading,
  onLike,
  onNewComment,
  onApply,
}: HomePostsProps) {
  if (isLoading) {
    return (
      <div className="mt-6 text-center text-muted-foreground">
        Loading posts...
      </div>
    );
  }

  return (
    <main className="flex flex-1 justify-center p-6">
      <div className="flex w-full max-w-2xl flex-col items-center gap-6">
        {posts.map((post) => (
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
            onLike={onLike}
            onNewComment={onNewComment}
            onApply={onApply}
          />
        ))}
      </div>
    </main>
  );
}