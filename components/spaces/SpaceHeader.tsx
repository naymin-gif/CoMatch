"use client"; 

import { Card, CardTitle, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import Image, { StaticImageData } from "next/image";
import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs"; 
import { FaShare } from "react-icons/fa";
import { MdOutlineLogout } from "react-icons/md";
import { GrGroup } from "react-icons/gr";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"; 
import ShareLink from "@/components/ui/ShareLink";


interface SpaceHeaderProps {
    image?: string | StaticImageData;
    name: string;
    memberCount: number; 
    spaceLink: string;
}

export default function SpaceHeader({
    image,
    name, 
    memberCount,
    spaceLink
} : SpaceHeaderProps) {
    return (
        <Card className="mt-3 mb-3 w-6xl p-0 bg-comatch-background">
            {/* Space Image */}
            <div className="relative h-48 sm:h-64 w-full bg-muted">
                {image && (
                    <Image 
                        src={image} 
                        alt="Space Image" 
                        fill
                        className="object-cover"
                        priority
                    />
                )}
            </div>
            <Card variant="ghost" className="p-3">
                <CardHeader>
                    <CardTitle className="text-heading">
                        {name}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Page Details */}
                    <div className="flex flex-row justify-between">
                        <div className="flex flex-row items-center gap-3">
                            <GrGroup />
                            {memberCount} Members
                        </div>
                        <div className="flex flex-row gap-3">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="secondary">
                                        Share <FaShare />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <ShareLink name="space" link={spaceLink} />
                                </PopoverContent>
                            </Popover>
                            <Button variant="destructive">
                                Leave <MdOutlineLogout />
                            </Button>
                        </div>
                    </div>
                    {/* Tabs */}
                    <TabsList variant="line" className="-ml-[9px]">
                        <TabsTrigger value="about">About</TabsTrigger>
                        <TabsTrigger value="posts">Posts</TabsTrigger>
                        <TabsTrigger value="members">Members</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>
                </CardContent>
            </Card>
        </Card>
    ); 

}; 