"use client"; 

import { useState } from "react";

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

// Static Assets
import bg from "@/public/pics/background.jpg";
import pf from "@/public/pics/profilepicture.jpg";

// Interfaces
interface SpacePageProps {
    params: {
        id: string; 
    }
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
  external_link: string | null;
  icon_url: string | null;
  owner_id: string;
  created_at: string;
  last_edited_at: string;
}

// TODO: BACKEND - Replace mock data below with real database fetch
const MOCK_MEMBER_1: Profile = { id: "1", profile_pic_url: pf.src, name: "win", bio: "I am Win"}; 
const MOCK_MEMBER_2: Profile = { id: "2", profile_pic_url: pf.src, name: "nay", bio: "I am nay"}; 
const MOCK_MEMBER_3: Profile = { id: "3", profile_pic_url: pf.src, name: "henry", bio: "I am henry"}; 
const MOCK_MEMBERS: Profile[] = [MOCK_MEMBER_1, MOCK_MEMBER_2, MOCK_MEMBER_3]; 
const MOCK_POST_IDS: string[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

const MOCK_SPACE_NAME: string = "Win Space";
const MOCK_SPACE_DESC: string = "This is win testing space";
const MOCK_SPACE_CREATED_AT: string = "2026-07-16"; 
const MOCK_SPACE_OWNER_ID: string = "1"; 
const MOCK_SPACE_OWNER_NAME: string = "Win";
const MOCK_SPACE_ICON_URL: string = bg.src;
const MOCK_EXTERNAL_LINKS: string[] = ["www.this.com", "www.that.com"]; 
// ============================================================================

export default function SpacePage({ params }: SpacePageProps) {
    const spaceId = params.id;

    // TODO: BACKEND - Fetch space members
    // We need a list of Profile objects for this space. 
    // Please perform a JOIN between 'space_members' and 'profiles' using space_members.profile_id = profiles.id.
    // Required fields from profiles: id, name, profile_pic_url, bio.

    // States for edit space
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [spaceName, setSpaceName] = useState(MOCK_SPACE_NAME);
    const [spaceDesc, setSpaceDesc] = useState(MOCK_SPACE_DESC);
    const [iconUrl, setIconUrl] = useState(MOCK_SPACE_ICON_URL); 
    const [externalLinks, setExternalLinks] = useState(MOCK_EXTERNAL_LINKS); 

    // Save Function
    const handleSave = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault(); 
        setIsSubmitting(true); 

        try {
            const formData = new FormData(e.currentTarget);
            const imageFile = formData.get("image") as File;
            const isImageRemoved = formData.get("isImageRemoved") === "true";
            
            // TODO: BACKEND - Add API call here to update the 'spaces' table
            // Example: await fetch(`/api/space/${spaceId}`, { method: 'PUT', body: formData })
            // The backend developer will handle uploading this File to a storage bucket 
            // and saving the resulting public URL to the icon_url column.

            setSpaceName(formData.get("name") as string);
            setSpaceDesc(formData.get("description") as string);
            
            const updatedLinks = formData.getAll("external_links") as string[];
            const filteredLinks = updatedLinks.filter(link => link.trim() !== "");
            setExternalLinks(filteredLinks);
            
            if (isImageRemoved) {
                setIconUrl(""); 
            } else if (imageFile && imageFile.size > 0) {
                setIconUrl(URL.createObjectURL(imageFile));
            }
            
            setIsEditing(false);
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
        setIsEditing(false); 
    };

    // Space Link Getter
    const spaceLink = `/spaces/${spaceId}`;

    return (
        <Tabs defaultValue="posts" className="flex flex-col items-center">
            <SpaceHeader 
                name={spaceName} 
                image={iconUrl} 
                memberCount={MOCK_MEMBERS.length} 
                spaceLink={spaceLink}    
            />
            <TabsContent value="about">
                <AboutSpace 
                    name={spaceName} 
                    created_at={MOCK_SPACE_CREATED_AT} 
                    memberCount={MOCK_MEMBERS.length} 
                    owner={MOCK_SPACE_OWNER_NAME} 
                    postCount={MOCK_POST_IDS.length} 
                    external_links={externalLinks}
                    spaceDescription={spaceDesc} 
                />
            </TabsContent>
            <TabsContent value="members">
                <SpaceMembers 
                    members={MOCK_MEMBERS}
                    memberCount={MOCK_MEMBERS.length}
                    owner_id={MOCK_SPACE_OWNER_ID}
                    spaceName={spaceName}
                    space_id={spaceId}
                />
            </TabsContent>
            <TabsContent value="posts">
                <PostPage postIds={MOCK_POST_IDS} />
            </TabsContent>
            <TabsContent value="settings">
                {isEditing ? (
                    <SpaceEdit 
                        spaceName={spaceName}
                        spaceDescription={spaceDesc}
                        spaceImage={iconUrl}
                        external_links={externalLinks}
                        onSubmit={handleSave} 
                        isSubmitting={isSubmitting}
                        onCancel={onCancel}
                    />
                ) : (
                    <SpaceSettings 
                        spaceName={spaceName}
                        spaceDescription={spaceDesc}
                        spaceImage={iconUrl}
                        onEdit={() => setIsEditing(true)} 
                        external_links={externalLinks}
                    />
                )}
            </TabsContent>
        </Tabs>
    ); 
}