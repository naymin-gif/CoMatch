"use client"; 

import {
    Card,
    CardHeader,
    CardTitle,
    CardContent
} from "@/components/ui/card";
import { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";
import { FcStackOfPhotos } from "react-icons/fc";
import { BsPlusSquareFill } from "react-icons/bs";
import { MdGroupAdd } from "react-icons/md";
import CreatePostModal from "./CreatePostModal";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { NewPostData } from "./PostPage";

interface PostPageHeaderProps {
    profile_pic_url ?: string;
    name: string;
    onPost: (postData: NewPostData) => void;
}

export default function PostPageHeader({
    profile_pic_url,
    name, 
    onPost,
} : PostPageHeaderProps) {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false); 
    const [selectedImage, setSelectedImage] = useState< File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null); 

    const onCancel = () => {
        setIsModalOpen(false); 
    }

    const handlePhotoClick = () => {
        fileInputRef.current?.click(); 
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; 
        if (file) {
            setSelectedImage(file);
            setIsModalOpen(true); 
        }
        if (e.target) {
            e.target.value = ""; 
        }
    }
    return (
        <Card className="w-2xl bg-comatch-background">
            <CardHeader className="flex flex-col gap-3 border-b">
                <CardTitle className="flex flex-row items-center gap-3 mr-18 ml-18">
                    <MdGroupAdd /> <span>Need Teammates for your Project?</span>
                </CardTitle>
            </CardHeader>

            <CardContent className="mr-18 ml-18 flex flex-col gap-3">
                <div className="flex flex-row items-center gap-3 w-full">
                    {/* Profile Image */}
                    <Avatar name={name}>
                        <AvatarImage
                            src={profile_pic_url || undefined}
                            alt={`${name} Profile Picture`}
                            sizes="sm"
                        />
                        <AvatarFallback />
                    </Avatar>

                    {/* Tell us about your project */}
                    <Button 
                        variant="input" 
                        className="w-full flex-1 justify-start"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Tell us about your project...
                    </Button>
                </div>

                {/* Icons */}
                <div className="flex flex-row items-center justify-end gap-2 w-full">
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                    />
                    <Button variant="ghost" onClick={handlePhotoClick}>
                        <FcStackOfPhotos className="size-8" />
                    </Button>
                    <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
                        <BsPlusSquareFill /> New Post
                    </Button>
                </div>
            </CardContent>

            <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <AlertDialogContent className="p-0 bg-transparent border-none shadow-none justify-center">
                    <CreatePostModal 
                        onCancel={onCancel} 
                        onPost={(data: NewPostData) => {
                            onPost(data); 
                            setIsModalOpen(false); 
                        }}
                        initialImage={selectedImage}
                    />
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    ); 
}