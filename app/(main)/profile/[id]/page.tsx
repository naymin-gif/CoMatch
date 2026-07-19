"use client"

import { useState, useEffect, use } from "react"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import PictureCard from "@/components/profile/PictureCard";
import BadgeCard from "@/components/profile/BadgeCard";
import { MdErrorOutline } from "react-icons/md";
import { createClient } from '@/utils/clients'; 
import { useRouter } from 'next/navigation';

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

export default function PublicProfile({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const profileId = resolvedParams.id;
    const supabase = createClient();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);

    useEffect(() => {
        const fetchPublicProfile = async () => {
            setIsLoading(true);
            
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', profileId) 
                .maybeSingle();

            if (error) {
                console.error('Database fetch error:', error.message);
                setError("Failed to load profile data."); 
                setIsLoading(false);
                return;
            }

            if (data) {
                setProfileData(data as ProfileData);
                
                const { data: { user } } = await supabase.auth.getUser();
                if (user && user.id === profileId) { 
                    setIsOwner(true);
                }
            } else {
                setError("User not found.");
            }
            
            setIsLoading(false);
        };

        fetchPublicProfile();
    }, [profileId]);

    // Error Handling
    if (error) {
        return (
            <div className="flex justify-center mt-10 w-full">
                <Alert variant="destructive" className="max-w-xl">
                    <MdErrorOutline className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {error}
                    </AlertDescription>
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
            <div className="lg:col-start-2 lg:col-span-3">
                <PictureCard 
                    {...profileData}
                    email={profileData.show_email ? profileData.email : ""}
                    onEdit={() => {}} 
                    isOwner={isOwner}
                    onChat={() => router.push(`/chat?user=${profileId}`)}
                />
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