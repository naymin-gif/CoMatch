'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { LuTriangleAlert } from 'react-icons/lu';

// Local Components
import HomeLeftPanel, {
  type HomeSidebarSpace,
} from '@/components/home/HomeLeftPanel';
import SpaceHeader from '@/components/space/SpaceHeader';
import AboutSpace from '@/components/space/AboutSpace';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { SidebarProvider } from '@/components/ui/sidebar';
import SpaceMembers from '@/components/space/SpaceMembers';
import PostPage from '@/components/post/PostPage';
import SpaceSettings from '@/components/space/SpaceSettings';
import SpaceEdit from '@/components/space/SpaceEdit';
import Loading from '@/app/loading';
import { Button } from '@/components/ui/button'; 
import { FaPenToSquare } from "react-icons/fa6";
import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog';
import CreatePostModal from '@/components/post/CreatePostModal';
import { type NewPostData } from '@/components/post/PostPage';
import { type CreateSpaceData } from '@/components/space/CreateSpaceModal';
import { useParams } from 'next/navigation';

// Static Assets
import { createClient } from '@/utils/clients';

// Interfaces


interface Profile {
  id: string;
  name: string;
  profile_pic_url?: string;
  bio?: string;
}

interface Space {
  id: string;
  name: string;
  description: string;
  external_links: string[] | null;
  image: string | null;
  owner_id: string;
  created_at: string;
  last_edited_at: string;
}

export default function SpacePage() {
  const params = useParams<{ id: string }>();
  const spaceId = params.id;
  const supabase = useMemo(() => createClient(), []);

  // States for edit space
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [spaceName, setSpaceName] = useState<string>('');
  const [spaceDesc, setSpaceDesc] = useState<string>('');
  const [spaceImage, setSpaceImage] = useState<string>('');
  const [externalLinks, setExternalLinks] = useState<string[]>([]);
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [members, setMembers] = useState<Profile[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [space, setSpace] = useState<Space>();
  const [ownerProfile, setOwnerProfile] = useState<Profile>();
  const [postIds, setPostIds] = useState<string[]>([]);
  const [ownedSpaces, setOwnedSpaces] = useState<HomeSidebarSpace[]>([]);
  const [joinedSpaces, setJoinedSpaces] = useState<HomeSidebarSpace[]>([]);
  const [otherSpaces, setOtherSpaces] = useState<HomeSidebarSpace[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // Cancel create post
  const onCancelCreatePost = () => {
    setIsModalOpen(false);
  };

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
      } catch (error) {
          console.error("Failed to create post:", JSON.stringify(error, null, 2));
      }
  }

  // handle create space
  const handleCreateSpace = async (
    spaceData: CreateSpaceData
  ): Promise<string> => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw new Error(`Authentication query failed: ${authError.message}`);
      }

      if (!user) {
        throw new Error("You must be logged in.");
      }

      if (authError || !user) {
        throw new Error('You must be logged in to create a space.');
      }

      const trimmedName = spaceData.name.trim();

      if (!trimmedName) {
        throw new Error('Space name is required.');
      }

      const newSpaceId = crypto.randomUUID();
      let imageUrl: string | null = null;

      if (spaceData.image) {
        const imageResponse = await fetch(spaceData.image);
        const imageBlob = await imageResponse.blob();

        const rawExtension = imageBlob.type.split('/')[1] || 'png';
        const extension = rawExtension === 'jpeg' ? 'jpg' : rawExtension;
        const imagePath = `public/${newSpaceId}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from('space-images')
          .upload(imagePath, imageBlob, {
            contentType: imageBlob.type,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('space-images')
          .getPublicUrl(imagePath);

        imageUrl = publicUrlData.publicUrl;
      }

      const now = new Date().toISOString();

      const { data: createdSpace, error: createError } = await supabase
        .from('spaces')
        .insert({
          id: newSpaceId,
          name: trimmedName,
          description: spaceData.description.trim(),
          external_links: spaceData.externalLinks
            .map((link) => link.trim())
            .filter(Boolean),
          owner_id: user.id,
          image: imageUrl,
          created_at: now,
          last_edited_at: now,
        })
        .select('id, name, image')
        .single();

      if (createError) throw createError;

      setOwnedSpaces((previousSpaces) => [
        ...previousSpaces,
        {
          spaceId: createdSpace.id,
          spaceName: createdSpace.name,
          spaceImage: createdSpace.image,
        },
      ]);

      toast('Space created successfully!');

      return createdSpace.id;
    } catch (error) {
      console.error('Failed to create space:', error);

      toast(
        <div className="flex items-center gap-2">
          <LuTriangleAlert className="text-comatch-danger" />
          <span>
            {error instanceof Error
              ? error.message
              : 'Failed to create space.'}
          </span>
        </div>
      );

      throw error;
    }
  };

  // Load Space Data
  useEffect(() => {
    const loadSpaceData = async () => {
      try {
        setIsLoading(true);
        setErrorMsg('');

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw new Error(`Authentication query failed: ${authError.message}`);
        }

        if (!user) {
          throw new Error('You must be logged in.');
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, profile_pic_url, bio')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          throw new Error(`Current profile query failed: ${profileError.message}`);
        }

        if (!profileData) {
          throw new Error('Current user profile not found.');
        }

        setCurrentUser(profileData);

        const [{ data: sidebarSpaces, error: spacesError }, membershipResult] =
          await Promise.all([
            supabase.from('spaces').select('id, name, image, owner_id'),
            supabase
              .from('space_members')
              .select('space_id')
              .eq('profile_id', user.id),
          ]);

        if (spacesError) {
          throw new Error(`Sidebar spaces query failed: ${spacesError.message}`);
        }

        if (membershipResult.error) {
          throw new Error(
            `Space memberships query failed: ${membershipResult.error.message}`
          );
        }

        const joinedSpaceIds = new Set(
          membershipResult.data?.map((membership) => membership.space_id) ?? []
        );
        const nextOwnedSpaces: HomeSidebarSpace[] = [];
        const nextJoinedSpaces: HomeSidebarSpace[] = [];
        const nextOtherSpaces: HomeSidebarSpace[] = [];

        for (const sidebarSpace of sidebarSpaces ?? []) {
          const spaceItem: HomeSidebarSpace = {
            spaceId: sidebarSpace.id,
            spaceName: sidebarSpace.name,
            spaceImage: sidebarSpace.image,
          };

          if (sidebarSpace.owner_id === user.id) {
            nextOwnedSpaces.push(spaceItem);
          } else if (joinedSpaceIds.has(sidebarSpace.id)) {
            nextJoinedSpaces.push(spaceItem);
          } else {
            nextOtherSpaces.push(spaceItem);
          }
        }

        setOwnedSpaces(nextOwnedSpaces);
        setJoinedSpaces(nextJoinedSpaces);
        setOtherSpaces(nextOtherSpaces);

        const { data: spaceData, error: spaceError } = await supabase
          .from('spaces')
          .select('*')
          .eq('id', spaceId)
          .maybeSingle();

        if (spaceError) {
          throw new Error(`Current space query failed: ${spaceError.message}`);
        }

        if (!spaceData) {
          throw new Error('Space not found.');
        }

        setSpace(spaceData);
        setSpaceName(spaceData.name);
        setSpaceDesc(spaceData.description);
        setExternalLinks(
          spaceData.external_links ? [...spaceData.external_links] : []
        );
        setSpaceImage(spaceData.image || '');

        const { data: ownerData, error: ownerError } = await supabase
          .from('profiles')
          .select('id, name, profile_pic_url, bio')
          .eq('id', spaceData.owner_id)
          .maybeSingle();

        if (ownerError) {
          throw new Error(`Space owner query failed: ${ownerError.message}`);
        }

        if (!ownerData) {
          throw new Error('Space owner not found.');
        }

        setOwnerProfile(ownerData);

        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('id')
          .eq('space_id', spaceId)
          .order('created_at', { ascending: false });

        if (postsError) {
          throw new Error(`Space posts query failed: ${postsError.message}`);
        }

        setPostIds(postsData?.map((post) => post.id) ?? []);

        const { data: membersData, error: membersError } = await supabase
          .from('space_members')
          .select('profile_id')
          .eq('space_id', spaceId);

        if (membersError) {
          throw new Error(`Space members query failed: ${membersError.message}`);
        }

        const profileIds = membersData?.map((member) => member.profile_id) ?? [];
        setHasJoined(
          spaceData.owner_id === user.id || profileIds.includes(user.id)
        );

        if (profileIds.length === 0) {
          setMembers([ownerData]);
        } else {
          const { data: profileList, error: memberProfilesError } = await supabase
            .from('profiles')
            .select('id, name, profile_pic_url, bio')
            .in('id', profileIds);

          if (memberProfilesError) {
            throw new Error(
              `Member profiles query failed: ${memberProfilesError.message}`
            );
          }

          setMembers(profileList ?? []);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unknown error loading space data.';

        console.error('loadSpaceData failed:', message, err);
        setErrorMsg(message);
      } finally {
        setIsLoading(false);
      }
    };
    loadSpaceData();
  }, [spaceId, supabase]);

  // Save Function - Edit space
  const handleSave = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const imageFile = formData.get('image') as File;
      const isImageRemoved = formData.get('isImageRemoved') === 'true';

      const newName = formData.get('name') as string;
      const newDesc = formData.get('description') as string;

      const updatedLinks = formData.getAll('external_links') as string[];
      const filteredLinks = updatedLinks.filter((link) => link.trim() !== '');

      let finalImageUrl = spaceImage;

      if (isImageRemoved) {
        finalImageUrl = '';
      } else if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${spaceId}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('space-images')
          .upload(`public/${fileName}`, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('space-images')
          .getPublicUrl(`public/${fileName}`);

        finalImageUrl = publicUrlData.publicUrl;
      }

      // 2. Update the 'spaces' table in Supabase
      const { error: updateError } = await supabase
        .from('spaces')
        .update({
          name: newName,
          description: newDesc,
          external_links: filteredLinks,
          image: finalImageUrl,
          last_edited_at: new Date().toISOString(),
        })
        .eq('id', spaceId);

      if (updateError) throw updateError;

      setSpaceName(newName);
      setSpaceDesc(newDesc);
      setExternalLinks(filteredLinks);
      setSpaceImage(finalImageUrl);

      setIsEditing(false);

      toast('Space updated successfully!');
    } catch (error) {
      console.error('Failed to update space:', error);
      toast(
        <div className="flex items-center gap-2">
          <LuTriangleAlert className="text-comatch-danger" />
          <span>Failed to save changes!</span>
        </div>
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel Function - edit space
  const onCancel = () => {
    if (space) {
      setSpaceName(space.name);
      setSpaceDesc(space.description);
      setExternalLinks(space.external_links ? [...space.external_links] : []);
      setSpaceImage(space.image || '');
    }
    setIsEditing(false);
  };

  // Join Space Function
  const handleJoinToggle = async () => {
    if (!currentUser) {
      toast('You must be logged in to join a space.');
      return;
    }

    try {
      if (hasJoined) {
        const { error } = await supabase
          .from('space_members')
          .delete()
          .eq('space_id', spaceId)
          .eq('profile_id', currentUser.id);

        if (error) throw error;

        setMembers(members.filter((member) => member.id !== currentUser.id));
        setHasJoined(false);
        toast('You have left the space.');
      } else {
        const { error } = await supabase.from('space_members').insert({
          space_id: spaceId,
          profile_id: currentUser.id,
        });

        if (error) throw error;

        setMembers([...members, currentUser]);
        setHasJoined(true);
        toast('You have successfully joined the space!');
      }
    } catch (error) {
      console.error('Failed to toggle join status:', error);
      toast(
        <div className="flex items-center gap-2">
          <LuTriangleAlert className="text-comatch-danger" />
          <span>Failed to update membership status!</span>
        </div>
      );
    }
  };

  let spacePageContent: ReactNode;

  if (isLoading) {
    spacePageContent = <Loading />;
  } else if (errorMsg || !space || !ownerProfile) {
    spacePageContent = (
      <div className="flex flex-col items-center justify-center h-screen text-red-500 gap-2">
        <LuTriangleAlert size={32} />
        <p>{errorMsg || 'Space or Owner not found.'}</p>
      </div>
    );
  } else {
    // Space Link Getter
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (typeof window !== 'undefined' ? window.location.origin : '');
    const spaceLink = `${baseUrl}/spaces/${spaceId}`;

    spacePageContent = (
      <Tabs defaultValue="posts" className="flex flex-col items-center mb-5">
        <SpaceHeader
          name={spaceName}
          image={spaceImage}
          memberCount={members.length}
          spaceLink={spaceLink}
          hasJoined={hasJoined}
          currentUserIsOwner={currentUser?.id === ownerProfile.id}
          onJoinToggle={handleJoinToggle}
        />

        {/* About Space Tab */}
        <TabsContent value="about">
          <AboutSpace
            name={spaceName}
            created_at={space.created_at}
            memberCount={members.length}
            owner={ownerProfile.name}
            postCount={postIds.length}
            external_links={externalLinks}
            spaceDescription={spaceDesc}
          />
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          <SpaceMembers
            members={members}
            memberCount={members.length}
            owner_id={ownerProfile.id}
            spaceName={spaceName}
            space_id={spaceId}
          />
        </TabsContent>

        {/* Posts Tab */}
        <TabsContent value="posts">
          <PostPage
            currentUserName={currentUser?.name || 'Anonymous User'}
            postIds={postIds}
            spaceId={spaceId}
            currentUserAvatar={currentUser?.profile_pic_url}
            showOwnPostsOnly={false}
          />
        </TabsContent>

        {/* My Posts Tab */}
        <TabsContent value="myposts">
          <PostPage
            currentUserName={currentUser?.name || 'Anonymous User'}
            postIds={postIds}
            spaceId={spaceId}
            currentUserAvatar={currentUser?.profile_pic_url}
            showOwnPostsOnly={true}
          />
        </TabsContent>

        {/* Settings Tab: Only visible for owner */}
        {currentUser?.id === ownerProfile.id && (
          <TabsContent value="settings">
            {isEditing ? (
              <SpaceEdit
                spaceName={spaceName}
                spaceDescription={spaceDesc}
                spaceImage={spaceImage}
                external_links={externalLinks}
                onSubmit={handleSave}
                isSubmitting={isSubmitting}
                onCancel={onCancel}
              />
            ) : (
              <SpaceSettings
                spaceName={spaceName}
                spaceDescription={spaceDesc}
                spaceImage={spaceImage}
                onEdit={() => setIsEditing(true)}
                external_links={externalLinks}
              />
            )}
          </TabsContent>
        )}
      </Tabs>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <HomeLeftPanel
          ownedSpaces={ownedSpaces}
          joinedSpaces={joinedSpaces}
          otherSpaces={otherSpaces}
          currentUserId={currentUser?.id ?? ''}
          currentUserName={currentUser?.name ?? 'Anonymous User'}
          currentUserProfilePic={currentUser?.profile_pic_url}
          onCreate={handleCreateSpace}
        />
        <main className="min-w-0 flex-1">
          {spacePageContent}
          <Button 
            className="fixed bottom-15 right-20 z-50 shadow-lg rounded-2xl p-5 text-blue-500" 
            variant="outline"
            onClick={() => setIsModalOpen(true)}
          >
            <FaPenToSquare /> New Post
          </Button>

          <AlertDialog
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
          >
            <AlertDialogContent className='p-0'>
              <CreatePostModal
                onCancel={onCancelCreatePost}
                onPost={async (data: NewPostData) => {
                  await handlePost(data);
                  setIsModalOpen(false);
                }}
                initialImage={selectedImage}
              />
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </SidebarProvider>
  );
}