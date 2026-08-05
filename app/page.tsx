"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Comment } from "@/components/post/PostPage";
import type { PostCardProps } from "@/components/post/PostCard";
import timeAgo from "@/lib/TimeAgo";
import { createClient } from "@/utils/clients";
import { SidebarProvider } from "@/components/ui/sidebar";
import HomeLeftPanel from "@/components/home/HomeLeftPanel";
import HomePosts from "@/components/home/HomePosts";
import ExploreSpaces from "@/components/space/ExploreSpaces";
import type { SpacePreviewCardProps } from "@/components/space/SpacePreviewCard";
import type { CreateSpaceData } from "@/components/space/CreateSpaceModal";

const SPACE_IMAGES_BUCKET = "space-images";

export default function HomePage() {
  const [posts, setPosts] = useState<PostCardProps[]>([]);
  const [ownedSpaces, setOwnedSpaces] = useState<SpacePreviewCardProps[]>([]);
  const [joinedSpaces, setJoinedSpaces] = useState<SpacePreviewCardProps[]>([]);
  const [otherSpaces, setOtherSpaces] = useState<SpacePreviewCardProps[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUserName, setCurrentUserName] = useState("Unknown User");
  const [currentUserProfilePic, setCurrentUserProfilePic] = useState<
    string | undefined
  >(undefined);
  const [showExploreSpaces, setShowExploreSpaces] = useState(false);
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

        const userId = user?.id ?? "";
        setCurrentUserId(userId);

        const [
          { data: spaces, error: spacesError },
          membershipResult,
          currentProfileResult,
        ] = await Promise.all([
          supabase
            .from("spaces")
            .select("id, name, description, owner_id, external_links, image"),
          userId
            ? supabase
                .from("space_members")
                .select("space_id")
                .eq("profile_id", userId)
            : Promise.resolve({ data: [], error: null }),
          userId
            ? supabase
                .from("profiles")
                .select("name, profile_pic_url")
                .eq("id", userId)
                .maybeSingle()
            : Promise.resolve({ data: null, error: null }),
        ]);

        if (spacesError) {
          throw spacesError;
        }

        if (membershipResult.error) {
          throw membershipResult.error;
        }

        if (currentProfileResult.error) {
          throw currentProfileResult.error;
        }

        setCurrentUserName(currentProfileResult.data?.name ?? "Unknown User");
        setCurrentUserProfilePic(
          currentProfileResult.data?.profile_pic_url ?? undefined,
        );

        const ownerIds = Array.from(
          new Set(
            (spaces ?? []).flatMap((space) =>
              space.owner_id ? [space.owner_id] : [],
            ),
          ),
        );

        let ownerProfiles: Array<{
          id: string;
          name: string | null;
          profile_pic_url: string | null;
        }> = [];

        if (ownerIds.length > 0) {
          const { data, error } = await supabase
            .from("profiles")
            .select("id, name, profile_pic_url")
            .in("id", ownerIds);

          if (error) {
            throw error;
          }

          ownerProfiles = data ?? [];
        }

        const ownerProfilesById = new Map(
          ownerProfiles.map((profile) => [profile.id, profile]),
        );

        const joinedSpaceIds = new Set(
          membershipResult.data?.map((membership) => membership.space_id) ?? [],
        );

        const nextOwnedSpaces: SpacePreviewCardProps[] = [];
        const nextJoinedSpaces: SpacePreviewCardProps[] = [];
        const nextOtherSpaces: SpacePreviewCardProps[] = [];

        for (const space of spaces ?? []) {
          const ownerProfile = space.owner_id
            ? ownerProfilesById.get(space.owner_id)
            : undefined;

          const previewSpace: SpacePreviewCardProps = {
            spaceId: space.id,
            spaceImage: space.image ?? undefined,
            spaceName: space.name,
            spaceDesc: space.description ?? undefined,
            spaceLinks: space.external_links ?? undefined,
            spaceOwnerName: ownerProfile?.name ?? "Unknown User",
            spaceOwnerPic: ownerProfile?.profile_pic_url ?? undefined,
            spaceOwnerId: space.owner_id,
            currentUserId: userId,
          };

          if (space.owner_id === userId) {
            nextOwnedSpaces.push(previewSpace);
          } else if (joinedSpaceIds.has(space.id)) {
            nextJoinedSpaces.push(previewSpace);
          } else {
            nextOtherSpaces.push(previewSpace);
          }
        }

        setOwnedSpaces(nextOwnedSpaces);
        setJoinedSpaces(nextJoinedSpaces);
        setOtherSpaces(nextOtherSpaces);
      } catch (error) {
        console.error(
          "Failed to fetch spaces:",
          JSON.stringify(error, null, 2),
        );
      }
    }

    void fetchAndGroupSpaces();
  }, [supabase]);

  const handleSpaceJoin = useCallback(
    async (spaceId: string) => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error("User not authenticated");
        }

        const { error } = await supabase.from("space_members").insert({
          space_id: spaceId,
          profile_id: user.id,
        });

        if (error) {
          throw error;
        }

        setPosts((currentPosts) =>
          currentPosts.map((post) =>
            post.spaceId === spaceId
              ? {
                  ...post,
                  isMember: true,
                }
              : post,
          ),
        );
      } catch (error) {
        console.error(
          "Failed to join space:",
          JSON.stringify(error, null, 2),
        );
      }
    },
    [supabase],
  );

  // Fetch all posts
  useEffect(() => {
    async function fetchAllPosts() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        const currentUserId = user?.id ?? "";

        const [postsResult, membershipResult] = await Promise.all([
          supabase
            .from("posts")
            .select(
              `
              id,
              space_id,
              owner_id,
              title,
              description,
              commitment_level,
              image_url,
              created_at,
              spaces (name, owner_id),
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
            `,
            )
            .order("created_at", { ascending: false }),

          currentUserId
            ? supabase
                .from("space_members")
                .select("space_id")
                .eq("profile_id", currentUserId)
            : Promise.resolve({ data: [], error: null }),
        ]);

        if (postsResult.error) {
          throw postsResult.error;
        }

        if (membershipResult.error) {
          throw membershipResult.error;
        }

        const memberSpaceIds = new Set(
          membershipResult.data?.map(
            (membership) => membership.space_id,
          ) ?? [],
        );

        const formattedPosts: PostCardProps[] = (
          postsResult.data ?? []
        ).map((post: any) => ({
          postid: post.id,
          spaceId: post.space_id,

          spaceName: post.spaces?.name ?? "Unknown Space",

          isMember:
            memberSpaceIds.has(post.space_id) ||
            post.spaces?.owner_id === currentUserId,

          onSpaceJoin: () => {
            void handleSpaceJoin(post.space_id);
          },

          ownerId: post.owner_id,
          ownerName: post.profiles?.name || "Unknown User",
          ownerAvatarUrl: post.profiles?.profile_pic_url,
          isOwner: Boolean(
            currentUserId && post.owner_id === currentUserId,
          ),
          initialHasApplied: Boolean(
            currentUserId &&
              post.applications?.some(
                (app: any) => app.applicant_id === currentUserId,
              ),
          ),
          postDate: timeAgo(post.created_at),
          initialLikeCount: post.post_likes?.length ?? 0,
          initialIsLiked:
            post.post_likes?.some(
              (like: any) => like.profile_id === currentUserId,
            ) ?? false,
          postTitle: post.title,
          postDescription: post.description,
          postImageUrl: post.image_url,
          commitmentLevel: post.commitment_level,
          rolesAndPositions: (() => {
            const seen = new Map<string, number>();
            (post.roles || []).forEach((r: any) => {
              const name = r.role?.trim();
              if (name && !seen.has(name)) {
                seen.set(name, r.quantity || 1);
              }
            });
            return Array.from(seen.entries()).map(([role, position]) => ({ role, position }));
          })(),
          initialComments:
            post.post_comments?.map((comment: any) => ({
              id: comment.id,
              content: comment.content,
              created_at: comment.created_at,
              profiles: {
                name: comment.profiles?.name || "Unknown User",
                profile_pic_url:
                  comment.profiles?.profile_pic_url,
              },
            })) ?? [],
        }));

        setPosts(formattedPosts);
      } catch (error) {
        console.error(
          "Failed to fetch posts:",
          JSON.stringify(error, null, 2),
        );
      } finally {
        setIsLoading(false);
      }
    }

    void fetchAllPosts();
  }, [supabase, handleSpaceJoin]);

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
          : post,
      ),
    );
  };

  const handleApply = async (
    postId: string,
    roles: string[],
    message: string,
  ) => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    const applicationInserts = roles.map((role) => ({
      post_id: postId,
      applicant_id: user.id,
      selected_roles: [role],
      intro_message: message,
    }));

    const { error } = await supabase.from("applications").insert(applicationInserts);

    if (error) {
      throw error;
    }
  };

  const handleDeletePost = async (postId: string) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      toast.error("You must be logged in.");
      return;
    }

    try {
      const { data: existingRoles } = await supabase.from('roles').select('id').eq('post_id', postId);
      if (existingRoles && existingRoles.length > 0) {
        await supabase.from('roles').delete().in('id', existingRoles.map(r => r.id));
      }
      await supabase.from('roles').delete().eq('post_id', postId);
      await supabase.from('applications').update({ post_id: null }).eq('post_id', postId);
      await supabase.from('post_comments').delete().eq('post_id', postId);
      await supabase.from('post_likes').delete().eq('post_id', postId);

      const { error } = await supabase
        .from('posts')
        .delete()
        .match({ id: postId, owner_id: user.id });

      if (error) {
        console.error("Error deleting post:", error);
        toast.error("Failed to delete post.");
        throw error;
      }

      setPosts(prev => prev.filter(p => p.postid !== postId));
      toast.success("Post deleted successfully.");
    } catch (err: any) {
      console.error("Delete post error:", err);
      toast.error("Failed to delete post: " + (err.message || "Unknown error"));
    }
  };

  const handleEditPost = async (postId: string, updatedData: any) => {
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

    const { data: existingRoles } = await supabase.from('roles').select('id').eq('post_id', postId);
    if (existingRoles && existingRoles.length > 0) {
      await supabase.from('roles').delete().in('id', existingRoles.map(r => r.id));
    }
    await supabase.from('roles').delete().eq('post_id', postId);

    const validRoles = updatedData.roles
      .map((role: string, index: number) => ({ role: role.trim(), quantity: updatedData.quantities[index] }))
      .filter((r: { role: string }) => r.role !== "");

    if (validRoles.length > 0) {
      const rolesToInsert = validRoles.map((r: { role: string; quantity?: number }) => ({
        post_id: postId,
        role: r.role,
        quantity: r.quantity ?? 1
      }));
      await supabase.from('roles').insert(rolesToInsert);
    }

    setPosts(prev => prev.map(p => {
      if (p.postid === postId) {
        return {
          ...p,
          postTitle: updatedData.title,
          postDescription: updatedData.description,
          commitmentLevel: updatedData.commitmentLevel,
          postImageUrl: imageUrl,
          rolesAndPositions: validRoles.map((r: { role: string; quantity?: number }) => ({ role: r.role, position: r.quantity ?? 1 })),
        };
      }
      return p;
    }));

    toast.success("Post updated successfully.");
  };

  const onCreate = async (spaceData: CreateSpaceData): Promise<string> => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    let createdSpaceId: string | undefined;
    let uploadedImagePath: string | undefined;

    try {
      const { data: createdSpace, error: spaceError } = await supabase
        .from("spaces")
        .insert({
          name: spaceData.name,
          description: spaceData.description || null,
          external_links: spaceData.externalLinks,
          owner_id: user.id,
          image: null,
        })
        .select("id")
        .single();

      if (spaceError) {
        throw spaceError;
      }

      createdSpaceId = createdSpace.id;

      if (spaceData.image) {
        const imageResponse = await fetch(spaceData.image);

        if (!imageResponse.ok) {
          throw new Error("Unable to read the selected image");
        }

        const imageBlob = await imageResponse.blob();
        const imageExtension =
          imageBlob.type.split("/")[1]?.split("+")[0] || "jpg";
        uploadedImagePath = `${createdSpace.id}/${crypto.randomUUID()}.${imageExtension}`;

        const { error: uploadError } = await supabase.storage
          .from(SPACE_IMAGES_BUCKET)
          .upload(uploadedImagePath, imageBlob, {
            contentType: imageBlob.type,
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: { publicUrl },
        } = supabase.storage
          .from(SPACE_IMAGES_BUCKET)
          .getPublicUrl(uploadedImagePath);

        const { error: imageUpdateError } = await supabase
          .from("spaces")
          .update({ image: publicUrl })
          .eq("id", createdSpace.id);

        if (imageUpdateError) {
          throw imageUpdateError;
        }
      }

      const { error: membershipError } = await supabase
        .from("space_members")
        .insert({
          space_id: createdSpace.id,
          profile_id: user.id,
        });

      if (membershipError) {
        throw membershipError;
      }

      return createdSpace.id;
    } catch (error) {
      if (uploadedImagePath) {
        const { error: imageCleanupError } = await supabase.storage
          .from(SPACE_IMAGES_BUCKET)
          .remove([uploadedImagePath]);

        if (imageCleanupError) {
          console.error(
            "Failed to clean up uploaded space image:",
            imageCleanupError,
          );
        }
      }

      if (createdSpaceId) {
        const { error: spaceCleanupError } = await supabase
          .from("spaces")
          .delete()
          .eq("id", createdSpaceId);

        if (spaceCleanupError) {
          console.error(
            "Failed to clean up partially created space:",
            spaceCleanupError,
          );
        }
      }

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
          currentUserName={currentUserName}
          currentUserProfilePic={currentUserProfilePic}
          onExploreSpaces={() => setShowExploreSpaces(true)}
          onCreate={onCreate}
        />
        {showExploreSpaces ? (
          <ExploreSpaces
            currentUserId={currentUserId}
            ownedSpaces={ownedSpaces}
            joinedSpaces={joinedSpaces}
            otherSpaces={otherSpaces}
          />
        ) : (
          <HomePosts
            posts={posts}
            isLoading={isLoading}
            onLike={handleLike}
            onNewComment={handleNewComment}
            onApply={handleApply}
            onDelete={handleDeletePost}
            onEdit={handleEditPost}
          />
        )}
      </div>
    </SidebarProvider>
  );
}