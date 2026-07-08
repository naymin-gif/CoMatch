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
import { 
    AlertDialog, 
    AlertDialogTrigger, 
    AlertDialogContent, 
    AlertDialogHeader, 
    AlertDialogFooter, 
    AlertDialogCancel, 
    AlertDialogAction
} from "@/components/ui/alert-dialog"; 

export interface UserProfile {
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

const mockSupabaseData: UserProfile = {
    id: "d290f1ee-6c54-4b01-90e6-d701748f0851", // Mock UUID
    name: "Win Htut Khaung Soe",
    bio: "NUS Computer Science ’29 | NUS ASEAN Undergraduate Scholar | Vice President of Myanmar Community @ NUS | YSEALI AFP ‘24",
    pronouns: "He/ Him",
    organization: "National University of Singapore",
    city: "Singapore",
    country: "Singapore",
    github: "https://github.com/winhks25",
    linkedin: "https://www.linkedin.com/in/winhks25",
    email: "whks3777@gmail.com",
    skills: ["Love", "Laugh", "Play", "Sleep"],
    roles: ["Software Engineer", "Product Manager", "Front End Developer", "AI Engineer"],
    // Mocking the URLs that Supabase Storage would return
    profile_pic_url: "/pics/profilepicture.jpg", 
    bg_pic_url: "/pics/background.jpg"
};

export default function Profile() {
    const supabase = createClient();
    const [isEditing, setIsEditing] = useState(false); 

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [isOwner, setIsOwner] = useState(false);
    const [profileData, setProfileData] = useState({
        id: '',
        name: '',
        email: '',
        bio: '',
        skills: [''],
        roles: [''],
        links: '',
        joinDate: '',
        avatar_url: '',
        background_url: '',
    });

    // Log out
    const handleLogout = async () => {
        try {
            // Backend developer will place actual auth sign-out logic here
            // throw new Error("Network timeout"); // Uncomment to test the error UI
            
            // Optional: Show a success toast using the CircleCheckIcon mapped in your wrapper
            toast.success("Logged out successfully"); 
        } catch (err) {
            // Trigger the error toast using the OctagonXIcon mapped in your wrapper
            toast.error("Uh oh! Something went wrong.", {
                description: "There was a problem logging you out. Please try again.",
            });
        }
    };

    // Fetching data from supabase
    useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error('No user logged in!');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        let prettyDate = '';
        if (data.join_date) {
          prettyDate = new Date(data.join_date).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          });
        }
        setProfileData({ ...data, joinDate: prettyDate });
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

      if (error) {
        console.error('Database fetch error:', error.message);
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
/*
    Expected Supabase Schema (Table: profiles)

    id: uuid (Primary Key, references auth.users)
    name, bio, pronouns, organization, city, country, github, linkedin, email: text
    skills, roles: text[] (Array of text)
    profile_pic_url, bg_pic_url: text (URLs from Supabase Storage)
*/