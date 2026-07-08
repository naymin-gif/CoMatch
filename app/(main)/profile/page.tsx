"use client"

import { useState, useEffect } from "react"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import PictureCard from "@/components/profile/PictureCard";
import BadgeCard from "@/components/profile/BadgeCard";
import { Button } from "@/components/ui/button"; 
import EditProfile from "./EditProfile";
import { MdOutlineLogout, MdErrorOutline } from "react-icons/md";
import { toast } from "sonner";
import { createClient } from '../../../utils/clients';
import { useRouter } from "next/navigation";
import { 
    AlertDialog, 
    AlertDialogTrigger, 
    AlertDialogContent, 
    AlertDialogHeader, 
    AlertDialogFooter, 
    AlertDialogCancel, 
    AlertDialogAction
} from "@/components/ui/alert-dialog"; 

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
}

export default function Profile() {
    const supabase = createClient();
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false); 
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [isOwner, setIsOwner] = useState(false);
    const [profileData, setProfileData] = useState<ProfileData>({
        id: '',
        name: '',
        email: '',
        bio: '',
        pronouns: '',
        organization: '',
        city: '',
        country: '',
        github: '',
        linkedin: '',
        skills: [],
        roles: [],
        profile_pic_url: '',
        bg_pic_url: '',
    });

    // Log out
    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            toast.success("Logged out successfully"); 
            
            // Redirect the user to your login page
            router.push("/login"); 
        } catch (err: any) {
            toast.error("Uh oh! Something went wrong.", {
                description: err.message || "There was a problem logging you out. Please try again.",
            });
        }
    };

    // Fetching data from supabase
    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                console.error('No user logged in!');
                setError("You must be logged in to view this page."); 
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (error) {
                console.error('Database fetch error:', error.message);
                setError("Failed to load profile data."); 
                return;
            }

            if (data) {
                setProfileData({ ...data });
                setIsOwner(true);
            } else {
                setProfileData((prev) => ({
                    ...prev,
                    id: user.id,
                    email: user.email || '',
                    name: 'New Member',
                }));
                setIsOwner(true);
            }
        };

        fetchProfile();
    }, []);

    // Error Handling
    if (error) {
        return (
            <div className="flex justify-center mt-10 w-full">
                <Alert variant="destructive" className="max-w-xl">
                    <MdErrorOutline className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {error} Please try refreshing the page.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (isEditing) {
        return <EditProfile 
            onCancel={() => setIsEditing(false)} 
            {...profileData}
            initialSkills={profileData.skills}
            initialRoles={profileData.roles}
        />;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 w-full mt-4 px-4 lg:px-0">
            <div className="lg:col-start-2 lg:col-span-3">
                <PictureCard 
                    {...profileData}
                    onEdit={() => setIsEditing(true)}
                    isOwner={isOwner}
                    onChat={() => console.log("Navigate to chat")}
                />
            </div>
            <div className="lg:col-start-5 lg:col-span-1">
                <BadgeCard 
                    title="Technical Skills"
                    items={profileData.skills}
                />
                <BadgeCard 
                    title="Preferred Roles"
                    items={profileData.roles}
                    className="mt-5"
                />
                {isOwner && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="mt-5 w-full lg:w-auto">
                                <MdOutlineLogout /> Log Out
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader className="font-heading">
                                Are you sure to log out?
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                    variant="destructive"
                                    onClick={handleLogout}
                                >
                                    Log Out
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </div>
    );
}