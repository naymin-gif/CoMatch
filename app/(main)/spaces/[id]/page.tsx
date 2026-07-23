"use client"; 

import { useEffect, useState, use } from "react";
import { toast } from "sonner";
import { LuTriangleAlert } from "react-icons/lu";

// Local Components
import SpaceHeader from "@/components/space/SpaceHeader";
import AboutSpace from "@/components/space/AboutSpace";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import SpaceMembers from "@/components/space/SpaceMembers";
import PostPage from "@/components/post/PostPage";
import SpaceSettings from "@/components/space/SpaceSettings";
import SpaceEdit from "@/components/space/SpaceEdit";
import Loading from "@/app/loading";

// Static Assets
import { createClient } from "@/utils/clients";

// Interfaces
interface SpacePageProps {
    params: Promise<{
        id: string; 
    }>
}

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

export default function SpacePage({ params }: SpacePageProps) {
    const resolvedParams = use(params);
    const spaceId = resolvedParams.id;
    const supabase = createClient();

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

    // Load Space Data
    useEffect(() => {
        const loadSpaceData = async () => {
            try {
                setIsLoading(true);
                setErrorMsg('');

                // Current user
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                // Profile deatils of current user
                if (user) {
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('id, name, profile_pic_url, bio')
                        .eq('id', user.id)
                        .single();

                    if (profileData) {
                        setCurrentUser(profileData);
                    }
                }

                console.log("1. Current Space ID from URL:", spaceId);
                console.log("2. Is User Logged In?:", user !== null);
                console.log("3. User Details:", user);

                // Space Details
                const { data: spaceData, error: spaceError } = await supabase
                    .from('spaces')
                    .select('*')
                    .eq('id', spaceId)
                    .maybeSingle();

                if (spaceError) throw spaceError;
                if (!spaceData) {
                    setErrorMsg('Space not found.');
                    setIsLoading(false);
                    return;
                }

                setSpace(spaceData);
                setSpaceName(spaceData.name);
                setSpaceDesc(spaceData.description); 
                setExternalLinks(spaceData.external_links ? [...spaceData.external_links] : []);
                setSpaceImage(spaceData.image || "");

                // Owner Profile
                const { data: ownerData } = await supabase
                    .from('profiles')
                    .select('id, name, email, profile_pic_url, roles')
                    .eq('id', spaceData.owner_id)
                    .maybeSingle();

                if (ownerData) setOwnerProfile(ownerData);

                // Posts
                const { data: postsData } = await supabase
                    .from('posts')
                    .select(`id`)
                    .eq('space_id', spaceId)
                    .order('created_at', { ascending: false });
                    

                if (postsData && postsData.length > 0) {
                    setPostIds(postsData.map((p) => p.id));
                }

                // Space Members
                const { data: membersData, error: membersError } = await supabase
                    .from('space_members')
                    .select('profile_id')
                    .eq('space_id', spaceId);

                if (membersError) throw membersError;

                const memberList: Profile[] = [];

                if (membersData && membersData.length > 0) {
                    const profileIds = membersData.map(m => m.profile_id);
                    if (user) {
                        setHasJoined(profileIds.includes(user.id));
                    }

                    const { data: profileList } = await supabase
                        .from('profiles')
                        .select('id, name, profile_pic_url, bio')
                        .in('id', profileIds);

                    if (profileList) {
                        memberList.push(...profileList);
                    }
                } else {
                    if (ownerData) {
                        memberList.push(ownerData);
                    }
                    if (user && spaceData.owner_id === user.id) {
                        setHasJoined(true);
                    }
                }
                setMembers(memberList); 
            } catch (err: any) {
                console.error(err);
                setErrorMsg(err.message || 'Error loading space data.');
            } finally {
                setIsLoading(false);
            }
        }
        loadSpaceData();
  }, [spaceId, supabase]);
    

    // Save Function
    const handleSave = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault(); 
        setIsSubmitting(true); 

        try {
            const formData = new FormData(e.currentTarget);
            const imageFile = formData.get("image") as File;
            const isImageRemoved = formData.get("isImageRemoved") === "true";
            
            const newName = formData.get("name") as string;
            const newDesc = formData.get("description") as string;
            
            const updatedLinks = formData.getAll("external_links") as string[];
            const filteredLinks = updatedLinks.filter(link => link.trim() !== "");
            
            let finalImageUrl = spaceImage; 
            
            if (isImageRemoved) {
                finalImageUrl = ""; 
            } else if (imageFile && imageFile.size > 0) {
                // IMPORTANT: Replace 'space-images' with your actual Supabase storage bucket name
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
                    last_edited_at: new Date().toISOString() // Update timestamp per schema
                })
                .eq('id', spaceId);

            if (updateError) throw updateError;

            // 3. Update local UI state only on success
            setSpaceName(newName);
            setSpaceDesc(newDesc);
            setExternalLinks(filteredLinks);
            setSpaceImage(finalImageUrl);
            
            setIsEditing(false);
            
            // Optional: Show success toast
            toast("Space updated successfully!");
            
        } catch (error) {
            console.error("Failed to update space:", error);
            toast(
                <div className="flex items-center gap-2">
                    <LuTriangleAlert className="text-comatch-danger"/>
                    <span>Failed to save changes!</span>
                </div>
            );
        } finally {
            setIsSubmitting(false); 
        }
    };

    // Cancel Function
    const onCancel = () => {
        if (space) {
            setSpaceName(space.name);
            setSpaceDesc(space.description);
            setExternalLinks(space.external_links ? [...space.external_links] : []);
            setSpaceImage(space.image || "");
        }
        setIsEditing(false); 
    };

    // Join Space Function
    const handleJoinToggle = async () => {
        if (!currentUser) {
            toast("You must be logged in to join a space.");
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

                setMembers(members.filter(member => member.id !== currentUser.id));
                setHasJoined(false);
                toast("You have left the space.");
                
            } else {
                const { error } = await supabase
                    .from('space_members')
                    .insert({
                        space_id: spaceId,
                        profile_id: currentUser.id
                    });

                if (error) throw error;

                setMembers([...members, currentUser]);
                setHasJoined(true);
                toast("You have successfully joined the space!");
            }
        } catch (error) {
            console.error("Failed to toggle join status:", error);
            toast(
                <div className="flex items-center gap-2">
                    <LuTriangleAlert className="text-comatch-danger"/>
                    <span>Failed to update membership status!</span>
                </div>
            );
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    if (errorMsg || !space || !ownerProfile) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-red-500 gap-2">
                <LuTriangleAlert size={32} />
                <p>{errorMsg || "Space or Owner not found."}</p>
            </div>
        );
    }

    // Space Link Getter
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "");
    const spaceLink = `${baseUrl}/spaces/${spaceId}`;

    return (
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
            <TabsContent value="members">
                <SpaceMembers 
                    members={members} 
                    memberCount={members.length}
                    owner_id={ownerProfile.id}
                    spaceName={spaceName}
                    space_id={spaceId}
                />
            </TabsContent>
            <TabsContent value="posts">
                <PostPage 
                    currentUserName={currentUser?.name || "Anonymous User"}
                    postIds={postIds} 
                    spaceId={spaceId} 
                    currentUserAvatar={currentUser?.profile_pic_url}
                />
            </TabsContent>
            {currentUser?.id === ownerProfile.id &&
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
            }
        </Tabs>
    ); 
}