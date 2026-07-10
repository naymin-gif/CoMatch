import { Card } from "@/components/ui/card"; 
import Image, { StaticImageData } from "next/image";
import Avatar from "@/components/ui/Avatar";
import { IoLocation } from "react-icons/io5";
import { Badge } from "@/components/ui/badge";
import { FaSchool } from "react-icons/fa";
import { FaUserEdit } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { FaGithub } from "react-icons/fa";
import { IoLogoLinkedin } from "react-icons/io";
import { IoMail } from "react-icons/io5";
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";

interface PictureCardProps {
    name : string;
    profile_pic_url ?: string | StaticImageData; 
    bg_pic_url ?: string | StaticImageData;
    pronouns ?: string;
    bio ?: string;
    organization ?: string;
    city ?: string;
    country ?: string;
    linkedin ?: string;
    github ?: string;
    onEdit?: () => void;
    email ?: string;
    isOwner?: boolean; 
    onChat?: () => void;
}

export default function PictureCard({
    name,
    profile_pic_url, 
    bg_pic_url,
    pronouns, 
    bio,
    organization,
    city, 
    country,
    github,
    linkedin,
    onEdit,
    email, 
    isOwner,
    onChat
} : PictureCardProps) {
    const location = [city, country].filter(Boolean).join(", ");
    return (
        <Card className="w-full max-w-4xl mx-auto rounded-[var(--radius-card)] shadow-lg border border-border bg-comatch-background text-card-foreground overflow-hidden p-0">
            
            <div className="relative h-48 sm:h-64 w-full bg-muted">
                {bg_pic_url && (
                    <Image 
                        src={bg_pic_url}
                        alt="background"
                        fill
                        className="object-cover"
                        priority
                        unoptimized
                    />
                )}
            </div>
        
            <div className="relative px-6 sm:px-8 pb-8">
                <div className="flex flex-row justify-between items-start pt-2 sm:pt-0">
                    <div className="relative -mt-16 sm:-mt-20 mb-4 z-20">
                        <Avatar 
                            name={name}
                            src={profile_pic_url}
                        />
                    </div>

                    {isOwner ? (
                        <Button variant="secondary" onClick={onEdit}>
                            <FaUserEdit className="mr-2" /> Edit
                        </Button>
                    ) : (
                        <Button onClick={onChat}>
                            <IoChatbubbleEllipsesSharp /> Chat
                        </Button>
                    )}
                </div>
                
                <div className="mt-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="font-heading text-heading text-foreground font-bold">{name}</h1>
                        <span className="text-mini text-muted-foreground font-normal mt-1">{pronouns}</span>
                    </div>
                    <p className="mt-1 text-base text-foreground font-sans">
                        {bio}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-3">
                        {organization && (
                            <Badge variant="outline">
                                <FaSchool className="mr-1" />{organization}
                            </Badge>
                        )}
                        {(city || country) && (
                            <Badge variant="outline">
                                <IoLocation className="mr-1" />{location}
                            </Badge>  
                        )}
                    </div>
                    {github && (
                        <a href={github} target="_blank">
                            <Badge className="mt-3 mr-3" variant="link">
                                <FaGithub /> GitHub
                            </Badge>
                        </a>
                    )}
                    {linkedin && (
                        <a href={linkedin} target="_blank">
                            <Badge className="mt-3 mr-3" variant="link">
                                <IoLogoLinkedin /> LinkedIn
                            </Badge>
                        </a>
                    )} 
                    {email && (
                        <a href={`mailto:${email}`}>
                            <Badge className="mt-3" variant="link">
                                <IoMail /> {email}
                            </Badge>
                        </a>
                    )}            
                </div>
            </div>
        </Card>
    );
}