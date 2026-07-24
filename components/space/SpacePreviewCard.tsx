import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IoIosLink } from "react-icons/io";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"; 
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { BsImageAlt } from "react-icons/bs";
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
        <Card className="overflow-hidden p-0 w-[400px] bg-comatch-background">
            {spaceImage ? (
                <img
                    src={spaceImage}
                    alt={`${spaceName} cover`}
                    className="block h-48 w-full object-cover"
                />
            ) : (
                <div
                    className="flex h-48 w-full items-center justify-center bg-muted"
                    aria-label="No image available"
                >
                    <BsImageAlt
                        className="h-12 w-12 text-muted-foreground"
                        aria-hidden="true"
                    />
                </div>
            )}
            <CardHeader>
                <CardTitle>
                    {spaceName}
                </CardTitle>
                <CardDescription className="line-clamp-3 h-[3.75rem]">
                    {spaceDesc} 
                </CardDescription>
            </CardHeader>

            <CardContent className="flex h-[5.5rem] flex-col gap-2 overflow-hidden">
                {spaceLinks?.slice(0, 3).map((link, index) => (
                    <Button
                        key={`${link}-${index}`}
                        variant="link"
                        className="h-6 w-full shrink-0 justify-start p-0"
                        asChild
                    >
                        <Link href={link}>
                            <IoIosLink className="shrink-0"/>
                            <span className="truncate">
                                {link}
                            </span>
                        </Link>
                    </Button>
                ))}
            </CardContent>

            <CardFooter className="flex flex-row justify-between items-center">
                {/* Owner  */}
                <div className="flex flex-col gap-3">
                    <span className="text-xs">Created by: </span>
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
                    <Button variant="blue" asChild>
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