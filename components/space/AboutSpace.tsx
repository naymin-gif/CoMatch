import {Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"; 
import { MdOutlineAccessTime } from "react-icons/md";
import { GrGroup } from "react-icons/gr";
import { BsPerson } from "react-icons/bs";
import { HiOutlineNewspaper } from "react-icons/hi";
import { FaInfoCircle } from "react-icons/fa";
import { TiPen } from "react-icons/ti";
import { BsLink45Deg } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import { TbWorld } from "react-icons/tb";

interface AboutSpaceProps {
    name: string;
    created_at: string;
    memberCount: number;
    owner: string;
    postCount: number;
    spaceDescription: string;
    external_links?: string[]; 
    className?: string; 
}

export default function AboutSpace({
    name,
    created_at,
    memberCount,
    owner,
    postCount,
    spaceDescription,
    external_links, 
    className
} : AboutSpaceProps) {
    return (
        <Card className={`${className} p-6 w-2xl bg-comatch-background`}>
            <CardHeader className="border-b">
                <CardTitle className="flex flex-row items-center gap-5">
                    <FaInfoCircle /> 
                    <span>About {name}</span>  
                </CardTitle>  
            </CardHeader>
            <CardContent className="flex flex-col gap-3">

                {/* Description */}
                <CardDescription className="flex flex-row gap-5">
                    <TiPen className="mt-1" /> 
                    <div className="flex flex-col">
                        <span className="font-heading">
                            Description
                        </span>
                        <span>{spaceDescription || "No Description for this Space"}</span>
                    </div>
                </CardDescription>

                {/* External Links */}
                <CardDescription className="flex flex-row gap-5">
                    <TbWorld className="mt-1" /> 
                    <div className="flex flex-col">
                        <span className="font-heading">
                            External Links
                        </span>
                        {
                            external_links && external_links.length > 0 
                            ? (
                                external_links.map((el, index) => (
                                    <Button
                                        variant="link"
                                        className="h-auto p-0"
                                        key={index}
                                    >
                                        <BsLink45Deg />
                                        {el}
                                    </Button>
                                ))
                            )
                            : (<span>There is no link.</span>)
                        }
                    </div>
                </CardDescription>

                {/* Created at */}
                <CardDescription className="flex flex-row gap-5">
                    <MdOutlineAccessTime className="mt-1" /> 
                    <div className="flex flex-col">
                        <span className="font-heading">
                            Created
                        </span>
                        <span>{created_at}</span>
                    </div>
                </CardDescription>

                {/* Total Members */}
                <CardDescription className="flex flex-row gap-5">
                    <GrGroup className="mt-1"/>
                    <div className="flex flex-col">
                        <span className="font-heading">
                            Members
                        </span>
                        <span>{memberCount} Total Members</span>
                    </div>
                </CardDescription>

                {/* Owner */}
                <CardDescription className="flex flex-row gap-5">
                    <BsPerson className="mt-1"/>
                    <div className="flex flex-col">
                        <span className="font-heading">
                            Owner
                        </span>
                        <span>{owner || "Unknown Owner"}</span>
                    </div>
                </CardDescription>

                {/* Posts */}
                <CardDescription className="flex flex-row gap-5">
                    <HiOutlineNewspaper className="mt-1"/>
                    <div className="flex flex-col">
                        <span className="font-heading">
                            Posts
                        </span>
                        <span>{postCount} Posts</span>
                    </div>
                </CardDescription>
            </CardContent>
        </Card>
    );
}