'use client';

import { useState, useEffect, use } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import PictureCard from '@/components/profile/PictureCard';
import BadgeCard from '@/components/profile/BadgeCard';
import { MdErrorOutline } from 'react-icons/md';
import { createClient } from '@/utils/clients';
import { useRouter } from 'next/navigation';
import PostCard from '@/components/post/PostCard';

export interface ProfileData {
  id?: string;
  name: string;
  bio: string;
  pronouns: string;
  organization: string;
  city: string;
  country: string;
  github: string;
  linkedin: string;
  email: string;
  skills: string[];
  roles: string[];
  profile_pic_url: string;
  bg_pic_url: string;
  show_email: boolean;
}

interface ProfilePost {
  id: string;
  space_id: string;
  owner_id: string;
  title: string;
  description: string | null;
  commitment_level: string | null;
  image_url: string | null;
  created_at: string;
  roles: {
    role: string;
    quantity: number;
  }[];
  post_likes: {
    profile_id: string;
  }[];
}

export default function PublicProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const profileId = resolvedParams.id;
  const supabase = createClient();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      setIsLoading(true);
      setError(null);
      setIsOwner(false);

      const [profileResult, postsResult, authResult] = await Promise.all([
        supabase
          .from('profiles')
          .select(`
            id,
            name,
            bio,
            pronouns,
            organization,
            city,
            country,
            github,
            linkedin,
            email,
            skills,
            roles,
            profile_pic_url,
            bg_pic_url,
            show_email
          `)
          .eq('id', profileId)
          .maybeSingle(),

        supabase
          .from('posts')
          .select(`
            id,
            space_id,
            owner_id,
            title,
            description,
            commitment_level,
            image_url,
            created_at,
            roles (
              role,
              quantity
            ),
            post_likes (
              profile_id
            )
          `)
          .eq('owner_id', profileId)
          .order('created_at', { ascending: false }),

        supabase.auth.getUser(),
      ]);

      console.log('PROFILE POSTS DEBUG', {
        profileId,
        authenticatedUserId: authResult.data.user?.id ?? null,
        authError: authResult.error?.message ?? null,
        profile: profileResult.data,
        profileError: profileResult.error?.message ?? null,
        posts: postsResult.data,
        postsError: postsResult.error?.message ?? null,
      });
      
      if (profileResult.error) {
        console.error(
          'Profile fetch error:',
          profileResult.error.message
        );
        setError('Failed to load profile data.');
        setIsLoading(false);
        return;
      }

      if (!profileResult.data) {
        setError('User not found.');
        setIsLoading(false);
        return;
      }

      if (postsResult.error) {
        console.error(
          'Posts fetch error:',
          postsResult.error.message
        );
        setError('Failed to load profile posts.');
        setIsLoading(false);
        return;
      }

      setProfileData(profileResult.data as ProfileData);
      setPosts((postsResult.data ?? []) as ProfilePost[]);

      const signedInUser = authResult.data.user;

      if (signedInUser) {
        setCurrentUserId(signedInUser.id);
        setIsOwner(signedInUser.id === profileId);
      } else {
        setCurrentUserId(null);
      }

      setIsLoading(false);
    };

    fetchProfileAndPosts();
  }, [profileId]);

  // Error Handling
  if (error) {
    return (
      <div className="flex justify-center mt-10 w-full">
        <Alert variant="destructive" className="max-w-xl">
          <MdErrorOutline className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Loading State
  if (isLoading || !profileData) {
    return (
      <div className="flex justify-center mt-10 w-full text-muted-foreground font-heading">
        Loading profile...
      </div>
    );
  }

  // Render the Profile Layout
  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 w-full mt-4 px-4 lg:px-0">
      <div className="lg:col-start-2 lg:col-span-3 flex flex-col gap-6 justify-center">
        <PictureCard
          {...profileData}
          email={profileData.show_email ? profileData.email : ''}
          onEdit={() => {}}
          isOwner={isOwner}
          onChat={() => router.push(`/chat?user=${profileId}`)}
        />

        <section className="flex flex-col gap-5">
          <h2 className="font-heading text-xl font-semibold">
            Posts
          </h2>

          {posts.length === 0 ? (
            <div className="rounded-lg border p-8 text-center text-muted-foreground">
              This user has not created any posts yet.
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                postid={post.id}
                ownerId={post.owner_id}
                ownerName={profileData.name}
                ownerAvatarUrl={profileData.profile_pic_url}
                isOwner={currentUserId === post.owner_id}
                postDate={new Date(post.created_at).toLocaleDateString(
                  'en-US',
                  {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }
                )}
                initialLikeCount={post.post_likes?.length ?? 0}
                initialIsLiked={
                  currentUserId
                    ? post.post_likes?.some(
                        (like) => like.profile_id === currentUserId
                      )
                    : false
                }
                postTitle={post.title}
                postDescription={post.description ?? undefined}
                postImageUrl={post.image_url ?? undefined}
                commitmentLevel={
                  post.commitment_level ?? undefined
                }
                rolesAndPositions={(post.roles ?? []).map((role) => ({
                  role: role.role,
                  position: role.quantity,
                }))}
                initialComments={[]}
                spaceId={post.space_id}
              />
            ))
          )}
        </section>
      </div>

      <div className="lg:col-start-5 lg:col-span-1">
        <BadgeCard
          title="Technical Skills"
          items={profileData.skills || []}
        />

        <BadgeCard
          title="Preferred Roles"
          items={profileData.roles || []}
          className="mt-5"
        />
      </div>
    </div>
  );
}
