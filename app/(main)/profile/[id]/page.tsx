'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import PictureCard from '@/components/profile/PictureCard';
import BadgeCard from '@/components/profile/BadgeCard';
import { MdErrorOutline } from 'react-icons/md';
import { createClient } from '@/utils/clients';
import { useRouter } from 'next/navigation';
import PostCard from '@/components/post/PostCard';
import EditProfile from '../EditProfile';
import { toast } from 'sonner';

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
  spaces: {
    name: string;
    owner_id: string;
  } | null;
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
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [memberSpaceIds, setMemberSpaceIds] = useState<Set<string>>(
    new Set()
  );

  const handleSpaceJoin = async (spaceId: string) => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('You must be signed in to join a space.');
      return;
    }

    const { error: joinError } = await supabase
      .from('space_members')
      .insert({
        space_id: spaceId,
        profile_id: user.id,
      });

    if (joinError) {
      console.error('Failed to join space:', joinError.message);
      return;
    }

    setMemberSpaceIds((currentIds) => {
      const updatedIds = new Set(currentIds);
      updatedIds.add(spaceId);
      return updatedIds;
    });
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (err: any) {
      toast.error('Log out failed', {
        description: err.message || 'There was a problem logging you out.',
      });
    }
  };

  const fetchProfileAndPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsOwner(false);

    const authResult = await supabase.auth.getUser();
    const signedInUser = authResult.data.user;
    const signedInUserId = signedInUser?.id ?? null;

    const [profileResult, postsResult, membershipsResult] =
      await Promise.all([
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
            spaces (
              name,
              owner_id
            ),
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

        signedInUserId
          ? supabase
              .from('space_members')
              .select('space_id')
              .eq('profile_id', signedInUserId)
          : Promise.resolve({
              data: [] as { space_id: string }[],
              error: null,
            }),
      ]);

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

    if (membershipsResult.error) {
      console.error(
        'Membership fetch error:',
        membershipsResult.error.message
      );
      setError('Failed to load space memberships.');
      setIsLoading(false);
      return;
    }

    setProfileData(profileResult.data as ProfileData);
    setPosts(
      (postsResult.data ?? []).map((post) => {
        const rawSpaces = post.spaces as unknown;

        const space =
          Array.isArray(rawSpaces)
            ? rawSpaces[0] ?? null
            : rawSpaces ?? null;

        return {
          ...post,
          spaces: space,
        } as ProfilePost;
      })
    );

    setMemberSpaceIds(
      new Set(
        (membershipsResult.data ?? []).map(
          (membership) => membership.space_id
        )
      )
    );

    setCurrentUserId(signedInUserId);
    setIsOwner(signedInUserId === profileId);
    setIsLoading(false);
  }, [profileId, supabase]);

  useEffect(() => {
    void fetchProfileAndPosts();
  }, [fetchProfileAndPosts]);

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

  // Edit Mode View
  if (isEditing && profileData) {
    return (
      <div className="w-full mt-4 px-4 lg:px-0">
        <EditProfile
          name={profileData.name}
          bio={profileData.bio}
          pronouns={profileData.pronouns}
          organization={profileData.organization}
          city={profileData.city}
          country={profileData.country}
          github={profileData.github}
          linkedin={profileData.linkedin}
          initialSkills={profileData.skills}
          initialRoles={profileData.roles}
          profile_pic_url={profileData.profile_pic_url}
          bg_pic_url={profileData.bg_pic_url}
          email={profileData.email}
          show_email={profileData.show_email}
          onCancel={() => setIsEditing(false)}
          onSuccess={() => {
            setIsEditing(false);
            void fetchProfileAndPosts();
          }}
        />
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
          onEdit={() => setIsEditing(true)}
          onLogout={handleLogout}
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
                spaceName={post.spaces?.name ?? 'Unknown Space'}
                isMember={
                  memberSpaceIds.has(post.space_id) ||
                  post.spaces?.owner_id === currentUserId
                }
                onSpaceJoin={() => {
                  void handleSpaceJoin(post.space_id);
                }}
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
