"use client";

import { useEffect, useMemo, useState } from "react";
import type { Comment } from "@/components/post/PostPage";
import type { PostCardProps } from "@/components/post/PostCard";
import timeAgo from "@/lib/TimeAgo";
import { createClient } from "@/utils/clients";
import { SidebarProvider } from "@/components/ui/sidebar";
import HomeLeftPanel, {
  type HomeSidebarSpace,
} from "@/components/home/HomeLeftPanel";
import HomePosts from "@/components/home/HomePosts";

export default function HomePage() {
  const [posts, setPosts] = useState<PostCardProps[]>([]);
  const [ownedSpaces, setOwnedSpaces] = useState<HomeSidebarSpace[]>([]);
  const [joinedSpaces, setJoinedSpaces] = useState<HomeSidebarSpace[]>([]);
  const [otherSpaces, setOtherSpaces] = useState<HomeSidebarSpace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function fetchAndGroupSpaces() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        const currentUserId = user?.id;
        const [{ data: spaces, error: spacesError }, membershipResult] =
          await Promise.all([
            supabase
              .from("spaces")
              .select("id, name, image, owner_id"),
            currentUserId
              ? supabase
                  .from("space_members")
                  .select("space_id")
                  .eq("profile_id", currentUserId)
              : Promise.resolve({ data: [], error: null }),
          ]);

        if (spacesError) {
          throw spacesError;
        }

        if (membershipResult.error) {
          throw membershipResult.error;
        }

        const joinedSpaceIds = new Set(
          membershipResult.data?.map((membership) => membership.space_id) ?? []
        );
        const nextOwnedSpaces: HomeSidebarSpace[] = [];
        const nextJoinedSpaces: HomeSidebarSpace[] = [];
        const nextOtherSpaces: HomeSidebarSpace[] = [];

        for (const space of spaces ?? []) {
          const sidebarSpace: HomeSidebarSpace = {
            id: space.id,
            name: space.name,
            image: space.image,
          };

          if (space.owner_id === currentUserId) {
            nextOwnedSpaces.push(sidebarSpace);
          } else if (joinedSpaceIds.has(space.id)) {
            nextJoinedSpaces.push(sidebarSpace);
          } else {
            nextOtherSpaces.push(sidebarSpace);
          }
        }

        setOwnedSpaces(nextOwnedSpaces);
        setJoinedSpaces(nextJoinedSpaces);
        setOtherSpaces(nextOtherSpaces);
      } catch (error) {
        console.error(
          "Failed to fetch spaces:",
          JSON.stringify(error, null, 2)
        );
      }
    }

    void fetchAndGroupSpaces();
  }, [supabase]);

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

        if (error) {
          throw error;
        }

        const formattedPosts: PostCardProps[] = data.map((post: any) => ({
          postid: post.id,
          ownerName: post.profiles?.name || "Unknown User",
          ownerAvatarUrl: post.profiles?.profile_pic_url,
          postDate: timeAgo(post.created_at),
          initialLikeCount: post.post_likes?.length ?? 0,
          initialIsLiked:
            post.post_likes?.some(
              (like: any) => like.profile_id === currentUserId
            ) ?? false,
          postTitle: post.title,
          postDescription: post.description,
          postImageUrl: post.image_url,
          commitmentLevel: post.commitment_level,
          rolesAndPositions:
            post.roles?.map((role: any) => ({
              role: role.role,
              position: role.quantity,
            })) ?? [],
          initialComments:
            post.post_comments?.map((comment: any) => ({
              id: comment.id,
              content: comment.content,
              created_at: comment.created_at,
              profiles: {
                name: comment.profiles?.name || "Unknown User",
                profile_pic_url: comment.profiles?.profile_pic_url,
              },
            })) ?? [],
        }));

        setPosts(formattedPosts);
      } catch (error) {
        console.error(
          "Failed to fetch posts:",
          JSON.stringify(error, null, 2)
        );
      } finally {
        setIsLoading(false);
      }
    }

    void fetchAllPosts();
  }, [supabase]);

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

      if (error) {
        throw error;
      }
    } else {
      const { error } = await supabase.from("post_likes").insert({
        post_id: postId,
        profile_id: user.id,
      });

      if (error) {
        throw error;
      }
    }
  };

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

    if (error) {
      throw error;
    }

    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.postid === postId
          ? {
              ...post,
              initialComments: [...post.initialComments, newComment],
            }
          : post
      )
    );
  };

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

    if (error) {
      throw error;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <HomeLeftPanel
          ownedSpaces={ownedSpaces}
          joinedSpaces={joinedSpaces}
          otherSpaces={otherSpaces}
        />
        <HomePosts
          posts={posts}
          isLoading={isLoading}
          onLike={handleLike}
          onNewComment={handleNewComment}
          onApply={handleApply}
        />
      </div>
    </SidebarProvider>
  );
}