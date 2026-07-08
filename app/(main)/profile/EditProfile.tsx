"use client"

import Image, { StaticImageData } from "next/image";
import { RiUploadLine } from "react-icons/ri";
import { Button } from "@/components/ui/button"; 
import { IoMdRemoveCircleOutline } from "react-icons/io";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { IoRemoveCircle } from "react-icons/io5";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from '@/utils/clients';

import { 
    Card,
    CardHeader,
    CardTitle,
    CardContent
 } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; 
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EditProfileProps {
    onCancel?: () => void;
    name?: string;
    bio?: string;
    pronouns?: string;
    organization?: string;
    city?: string;
    country?: string;
    github?: string;
    linkedin?: string;
    initialSkills?: string[];
    initialRoles?: string[];
    profilePic?: string | StaticImageData;
    bgPic?: string | StaticImageData;
    email ?: string; 
}

const createProfileSchema = (supabase: any, currentEmail: string) => 
    z.object({
        email: z
            .string()
            .min(1, { message: "Email is required." })
            .email({ message: "Must be a valid email address." })
            .refine(
                async (email) => {
                    if (email.toLowerCase() === currentEmail.toLowerCase()) {
                        return true;
                    }
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('email')
                        .eq('email', email.toLowerCase())
                        .maybeSingle();

                    if (error) {
                        console.error("Uniqueness check failed:", error);
                        return false; 
                    }
                    return !data; 
                },
                { message: "This email is already in use." }
            ),
    });

type ProfileFormValues = {
    email: string;
};

export default function EditProfile({ 
    onCancel, 
    name, 
    bio, 
    pronouns, 
    organization, 
    city, 
    country, 
    github, 
    linkedin, 
    initialSkills, 
    initialRoles, 
    profilePic, 
    bgPic,
    email
}: EditProfileProps) {
    const pronounsList = [
        {label : "Select your pronouns", value : "null"},
        {label : "He/ Him", value : "he/him"},
        {label : "She/ Her", value : "she/her"},
        {label : "They/ Them", value : "they/them"},
        {label : "Ze/ Hir", value : "ze/hir"}
    ];
    const supabase = createClient();
    type ProfileFormValues = { email: string; };

    const {
        register,
        handleSubmit: rhfSubmit,
        formState: { errors },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(createProfileSchema(supabase, email || "")),
        defaultValues: { email: email || "" },
        mode: "onBlur", 
    });
    

    const [skills, setSkills] = useState(initialSkills && initialSkills.length > 0 ? [...initialSkills, ""] : [""]);
    const [roles, setRoles] = useState(initialRoles && initialRoles.length > 0 ? [...initialRoles, ""] : [""]);

    const [profileImage, setProfileImage] = useState<string | StaticImageData | undefined>(profilePic);
    const [backgroundImage, setBackgroundImage] = useState<string | StaticImageData | undefined>(bgPic);

    const [profileFile, setProfileFile] = useState<File | null>(null);
    const [backgroundFile, setBackgroundFile] = useState<File | null>(null);

    const profileInputRef = useRef<HTMLInputElement>(null);
    const backgroundInputRef = useRef<HTMLInputElement>(null);

    const [checked, setChecked] = useState(false); 

    const [selectedPronouns, setSelectedPronouns] = useState(
        pronouns?.toLowerCase().replace(" ", "") || "null"
    );

    // Cleanup object URLs to avoid memory leaks
    useEffect(() => {
        return () => {
            if (typeof profileImage === 'string' && profileImage.startsWith('blob:')) {
                URL.revokeObjectURL(profileImage);
            }
            if (typeof backgroundImage === 'string' && backgroundImage.startsWith('blob:')) {
                URL.revokeObjectURL(backgroundImage);
            }
        };
    }, [profileImage, backgroundImage]);

    const handleInputChange = (items : string[], index : number, value : string) => {
        const newItems = [...items]; 
        newItems[index] = value; 

        if (index === items.length - 1 && value.trim() !== "") {
            newItems.push("");
        }

        if (value.trim() === "" && index !== newItems.length - 1) {
            newItems.splice(index, 1);
            }

        if (items === skills) {
            setSkills(newItems);
        } else {
            setRoles(newItems); 
        }
    }

    const handleRemoveItem = (items: string[], index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        
        if (items === skills) {
            setSkills(newItems);
        } else {
            setRoles(newItems);
        }
    };

    const handleProfileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setProfileFile(file);
        setProfileImage(URL.createObjectURL(file)); 
    };

    const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setBackgroundFile(file);
        setBackgroundImage(URL.createObjectURL(file));
    };

    const removeProfileImage = () => {
        setProfileImage(undefined);
    };

    const removeBackgroundImage = () => {
        setBackgroundImage(undefined);
    };

    const onSubmit = async (data: ProfileFormValues, e?: React.BaseSyntheticEvent) => {
        e?.preventDefault();

        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            
            if (authError || !user) {
                toast.error("Authentication Error", {
                    description: "You must be logged in to update your profile.",
                });
                return;
            }

            const formData = new FormData(e?.target as HTMLFormElement);
            const dbPayload: any = {
                name: formData.get("name"),
                email: data.email, 
                show_email: checked, 
                pronouns: selectedPronouns === "null" ? null : selectedPronouns, 
                bio: formData.get("bio"),
                organization: formData.get("org"),
                city: formData.get("city"),
                country: formData.get("country"),
                linkedin: formData.get("linkedin"),
                github: formData.get("github"),
                skills: skills.filter(skill => skill.trim() !== ""), 
                roles: roles.filter(role => role.trim() !== "")      
            };

            const uploadImage = async (file: File, pathPrefix: string) => {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${pathPrefix}-${Date.now()}.${fileExt}`;
                
                const { error: uploadError } = await supabase.storage
                    .from('profile_images') 
                    .upload(fileName, file, { upsert: true });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('profile_images')
                    .getPublicUrl(fileName);

                return publicUrl;
            };

            if (profileFile) {
                dbPayload.profile_pic_url = await uploadImage(profileFile, 'avatar');
            }
            if (backgroundFile) {
                dbPayload.bg_pic_url = await uploadImage(backgroundFile, 'background');
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .update(dbPayload)
                .eq('id', user.id);

            if (updateError) throw updateError;

            toast.success("Profile Updated", {
                description: "Your profile has been saved successfully.",
            });

            if (onCancel) {
                onCancel(); 
            }

        } catch (error: any) {
            console.error("Profile update failed:", error);
            toast.error("Update Failed", {
                description: error.message || "An unexpected error occurred while saving.",
            });
        }
    };

    return (
        <form className="mb-6 mt-4" onSubmit={rhfSubmit(onSubmit)}>
                <input
                ref={backgroundInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBackgroundUpload}
            />

            <input
                ref={profileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileUpload}
            />

            {/* Picture Card */}
            <Card className="w-full max-w-4xl mx-auto rounded-[var(--radius-card)] shadow-lg border border-border bg-comatch-background text-card-foreground overflow-hidden p-0">
                {/* background */}
                <div className="flex flex-row gap-3 justify-center items-center relative h-48 sm:h-64 w-full bg-muted">
                    {backgroundImage && (
                        <Image src={backgroundImage} alt="Background" fill className="object-cover opacity-60" priority />
                    )}
                    <div className="z-10 flex flex-row gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            className="bg-background/50 backdrop-blur-sm"
                            onClick={() => backgroundInputRef.current?.click()}
                        >
                            <RiUploadLine className="mr-2" /> Upload a New Background
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="bg-background/50 backdrop-blur-sm"
                            onClick={removeBackgroundImage}
                        >
                            <IoMdRemoveCircleOutline className="mr-2 text-comatch-danger" /> Remove Background
                        </Button>
                    </div>
                </div>

                {/* profile image */}
                <div className="relative px-6 sm:px-8 -mt-16 sm:-mt-24 z-10 pb-8">
                    <div className="relative flex flex-col gap-2 justify-center items-center h-32 w-32 sm:h-48 sm:w-48 bg-muted rounded-full border-4 border-background shadow-md overflow-hidden">
                        {profileImage && (
                            <Image src={profileImage} alt="Profile" fill className="object-cover opacity-60" />
                        )}
                        <div className="z-10 flex flex-row justify-center gap-2 items-center w-full px-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-xs sm:text-sm h-auto py-1 bg-background/50 backdrop-blur-sm"
                                onClick={() => profileInputRef.current?.click()}
                            >
                                <RiUploadLine /> 
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-xs sm:text-sm h-auto py-1 text-comatch-danger hover:text-red-600 bg-background/50 backdrop-blur-sm"
                                onClick={removeProfileImage}
                            >
                                <IoMdRemoveCircleOutline className="text-comatch-danger" /> 
                            </Button>
                        </div>
                    </div>
                </div>

                <CardContent className="p-5">
                    <FieldSet>
                        <FieldGroup className="w-128">
                            {/* name */}
                            <Field>
                                <FieldLabel htmlFor="name" className="font-heading">
                                    Name <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Input 
                                    defaultValue={name}
                                    id="name" 
                                    placeholder="eg; John Doe" 
                                    required 
                                    type="text"
                                    name="name"
                                />
                                <FieldDescription>
                                    This field is required. 
                                </FieldDescription>
                            </Field>

                            {/* Email */}
                            <Field>
                                <FieldLabel htmlFor="email" className="font-heading">
                                    Email <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Input 
                                    type="text"
                                    id="email"
                                    placeholder="eg; johndoe@gmail.com"
                                    {...register("email")}
                                />
                                
                                {errors.email ? (
                                    <p className="text-[0.8rem] font-medium text-destructive mt-1">
                                        {errors.email.message as string}
                                    </p>
                                ) : (
                                    <FieldDescription>
                                        This field is required. 
                                    </FieldDescription>
                                )}

                                <Field orientation="horizontal" className="mt-2">
                                    <Checkbox 
                                        checked={checked} 
                                        onCheckedChange={(value: boolean | "indeterminate") => setChecked(value === true)} 
                                        id="show-email"
                                    />
                                    <FieldLabel htmlFor="show-email">
                                        Show email on public profile. 
                                    </FieldLabel>
                                </Field>
                            </Field>


                            {/* pronouns */}
                            <Field>
                                <FieldLabel htmlFor="pronouns" className="font-heading">
                                    Pronouns
                                </FieldLabel>
                                <Select 
                                    value={selectedPronouns} 
                                    onValueChange={setSelectedPronouns}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choose Your Pronouns" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Pronouns</SelectLabel>
                                            {pronounsList.map((p) => (
                                                <SelectItem key={p.value} value={p.value}>
                                                    {p.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </Field>

                            {/* Bio */}
                            <Field>
                                <FieldLabel htmlFor="bio" className="font-heading">
                                    Bio
                                </FieldLabel>
                                <Input 
                                    type="text"
                                    defaultValue={bio}
                                    id="bio"
                                    placeholder="eg; I have won 10 hackathons."
                                    name="bio"
                                />
                            </Field>

                            {/* Organization */}
                            <Field>
                                <FieldLabel htmlFor="org" className="font-heading">
                                    Organization
                                </FieldLabel>
                                <Input 
                                    type="text"
                                    defaultValue={organization}
                                    id="org"
                                    placeholder="eg; University of Yangon"
                                    name="org"
                                />
                            </Field>

                            {/* City and Country */}
                            <div className="grid grid-cols-2 gap-4">
                                <Field>
                                    <FieldLabel htmlFor="city" className="font-heading">City</FieldLabel>
                                    <Input 
                                        id="city" 
                                        type="text" 
                                        placeholder="eg; Yangon" 
                                        defaultValue={city}
                                        name="city"
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="country" className="font-heading">Country</FieldLabel>
                                    <Input 
                                        id="country" 
                                        type="text" 
                                        placeholder="eg; Myanmar" 
                                        defaultValue={country}
                                        name="country"
                                    />
                                </Field>
                            </div>

                            {/* LinkedIn */}
                            <Field>
                                <FieldLabel htmlFor="linkedin" className="font-heading">
                                    LinkedIn Link
                                </FieldLabel>
                                <Input 
                                    type="text"
                                    defaultValue={linkedin}
                                    id="linkedin"
                                    placeholder="eg; https://www.linkedin.com/in/itsme/"
                                    name="linkedin"
                                />
                            </Field>

                            {/* GitHub */}
                            <Field>
                                <FieldLabel htmlFor="github" className="font-heading">
                                    GitHub Link
                                </FieldLabel>
                                <Input 
                                    type="text"
                                    defaultValue={github}
                                    id="github"
                                    placeholder="eg; https://github.com/itsme"
                                    name="github"
                                />
                            </Field>
                        </FieldGroup>
                    </FieldSet>
                </CardContent>
            </Card>

            {/* Technical Skills Card */}
            <Card className="w-full max-w-4xl mx-auto rounded-[var(--radius-card)] shadow-lg border border-border bg-comatch-background text-card-foreground overflow-hidden mt-4">
                <CardHeader className="border-b p-5">
                    <CardTitle>Technical Skills</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 p-5">
                    {skills.map((s, index) => (
                        <Field
                            key={index} 
                            className="animate-in fade-in slide-in-from-top-1 duration-200"
                        >
                            <div className="flex items-center gap-2">
                                <Input
                                    type="text"
                                    id={`skill-${index}`}
                                    placeholder={`Skill ${index + 1}`}
                                    value={s}
                                    onChange={(e) => handleInputChange(skills, index, e.target.value)}
                                    className="w-128"
                                />
                                {index !== skills.length - 1 ? (
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveItem(skills, index)}
                                        className="text-comatch-danger hover:opacity-80 transition-opacity flex-shrink-0"
                                        aria-label="Remove skill"
                                    >
                                        <IoRemoveCircle size={24} />
                                    </button>
                                ) : (
                                    <div className="w-6" aria-hidden="true" />
                                )}
                            </div>
                        </Field>
                    ))}
                </CardContent>
            </Card>

            {/* Preferred Roles Card */}
            <Card className="w-full max-w-4xl mx-auto rounded-[var(--radius-card)] shadow-lg border border-border bg-comatch-background text-card-foreground overflow-hidden mt-4">
                <CardHeader className="border-b p-5">
                    <CardTitle>Preferred Roles</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 p-5">
                    {roles.map((r, index) => (
                        <Field
                            key={index} 
                            className="animate-in fade-in slide-in-from-top-1 duration-200"
                        >
                            <div className="flex items-center gap-2">
                                <Input
                                    type="text"
                                    id={`role-${index}`}
                                    placeholder={`role ${index + 1}`}
                                    value={r}
                                    onChange={(e) => handleInputChange(roles, index, e.target.value)}
                                    className="w-128"
                                />
                                {index !== roles.length - 1 ? (
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveItem(roles, index)}
                                        className="text-comatch-danger hover:opacity-80 transition-opacity flex-shrink-0"
                                        aria-label="Remove role"
                                    >
                                        <IoRemoveCircle size={24} />
                                    </button>
                                ) : (
                                    <div className="w-6" aria-hidden="true" />
                                )}
                            </div>
                        </Field>
                    ))}
                </CardContent>
            </Card>

            <div className="flex flex-row w-full max-w-4xl mx-auto mt-4 justify-between">
                {/* Delete Account */}
                <div className="flex flex-row justify-start">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">Delete Account</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Are you sure to delete this account?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    All the data related to your account will be lost. <br />
                                    This action cannot be undone. 
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction variant="destructive">
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                {/* Cancel and Save Buttons */}
                <div className="flex flex-row justify-end gap-3">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button type="submit">Update</Button>
                </div>
            </div>
        </form>
    ); 
}