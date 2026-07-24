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
import { IoMdAddCircleOutline } from "react-icons/io";
import { MdOutlineLogout } from "react-icons/md";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"; 

export interface SpacePreviewCardProps {
    spaceImage?: string;
    spaceName: string;
    spaceDesc?: string;
    spaceLinks?: string[];
    spaceOwnerName: string;
    spaceOwnerPic?: string;
    spaceOwnerLink: string;
    currentUserIsOwner: boolean;
    currentUserHasJoined: boolean; 
}

export default function SpacePreviewCard ({
    spaceImage,
    spaceName,
    spaceDesc,
    spaceLinks,
    spaceOwnerName,
    spaceOwnerPic,
    spaceOwnerLink,
    currentUserIsOwner,
    currentUserHasJoined,
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

            {!currentUserIsOwner && (
                <CardFooter className="flex flex-row justify-between items-center">
                    <span>Created by: </span>
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
                    {currentUserHasJoined ? (
                        <Button variant="destructive"> <MdOutlineLogout className="mr-3" /> Leave</Button>
                    ) : (
                        <Button variant="green"> <IoMdAddCircleOutline className="mr-3" /> Join</Button>
                    )}
                </CardFooter>
            )}
        </Card>
    );
}