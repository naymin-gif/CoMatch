import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";
import ImageContainer from "@/components/ui/ImageContainer";
import { Button } from "@/components/ui/button";
import { IoIosLink } from "react-icons/io";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"; 
import { MdOutlineRemoveRedEye } from "react-icons/md";
import Link from "next/link";

export interface SpacePreviewCardProps {
    spaceId: string;
    spaceImage?: string;
    spaceName: string;
    spaceDesc?: string;
    spaceLinks?: string[];
    spaceOwnerName: string;
    spaceOwnerPic?: string;
    spaceOwnerId: string | null;
    currentUserId: string;
}
const spacesBaseUrl = "/spaces/";

export default function SpacePreviewCard ({
    spaceId,
    spaceImage,
    spaceName,
    spaceDesc,
    spaceLinks,
    spaceOwnerName,
    spaceOwnerPic,
    spaceOwnerId,
    currentUserId,
} : SpacePreviewCardProps) {
    return (
        <Card className="w-[100px] h-[100px]">
            <ImageContainer 
                src={spaceImage}
                size="lg"
                shape="rectangle"
            />
            <CardHeader>
                <CardTitle>
                    {spaceName}
                </CardTitle>
                <CardDescription>
                    {spaceDesc} 
                </CardDescription>
            </CardHeader>

            {spaceLinks &&
                <CardContent>
                    {spaceLinks.map((link, index) => (
                        <span key={index}><IoIosLink className="mr-3"/> {link}</span>
                    ))}
                </CardContent>
            }

            <CardFooter>
                {/* Owner  */}
                <div>
                    <span>Created by: </span>
                    {currentUserId === spaceOwnerId ? (
                        <span className="font-heading">Me</span>
                    ) : (
                        <Button variant="ghost">
                            <Avatar>
                                <AvatarImage 
                                    src={spaceOwnerPic}
                                    alt="Owner Picture"
                                />
                                <AvatarFallback />
                            </Avatar>
                            {spaceOwnerName}
                        </Button>
                    )}
                </div>
                {/* Buttons  */}
                <div>
                    <Button asChild>
                        <Link href={`${spacesBaseUrl}${spaceId}`}>
                            <MdOutlineRemoveRedEye className="mr-3"/>
                            View Space
                        </Link>
                    </Button>
                </div>

            </CardFooter>
        </Card>
    );
}