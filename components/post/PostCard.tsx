"use client"; 

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { IoIosHeartEmpty } from "react-icons/io";
import { IoIosHeart } from "react-icons/io";
import { VscComment } from "react-icons/vsc";
import { RiTelegram2Line } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { MdArrowOutward } from "react-icons/md";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"; 
import ShareLink from "@/components/ui/ShareLink";
import { Comment } from "./CommentPage";
import CommentPage from "./CommentPage";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import ApplyModal from "./ApplyModal";
import { MdOutlineDownloadDone } from "react-icons/md";

import { 
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from "@/components/ui/card";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table"; 
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";

// mock data
import pf from "@/public/pics/profilepicture.jpg"; 
import pp from "@/public/pics/background.jpg"; 

interface PostCardProps {
    postid: string;
}

export interface RoleAndPosition {
    role: string;
    position: number;
}

export default function PostCard({
    postid
} : PostCardProps) {
    // container reference
    const containerRef = useRef<HTMLDivElement>(null); 

    // states
    const [textSeeMore, setTextSeeMore] = useState<boolean>(false); 
    const [rolesSeeMore, setRolesSeeMore] = useState<boolean>(false); 
    const [liked, setLiked] = useState<boolean>(false); 
    const [isMounted, setIsMounted] = useState<boolean>(false); 
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
    const [applied, setApplied] = useState<boolean>(false);

    useEffect(() => {
        setIsMounted(true);
    }, [])

    // mock data 
    const ownerName: string = "Win"
    const postDate: string = "12 hours ago"
    const [likeCount, setLikeCount] = useState<number>(12);
    const postTitle: string = "3 Frontend Developers Needed"
    const postDescription: string = "Writebox is a text editor designed with simplicity and distraction-free writing. While many applications tend to become feature-rich and complex over time, Writebox takes a different approach. Writebox continues to focus on the essential features required for writing on a computer, providing an environment that allows writers to concentrate without unnecessary distractions."
    const postImage: string = "somelink"
    const commitmentLevel: string = "Medium";
    const RolesAndPositions: RoleAndPosition[] = [
        {role: "Software Engineer", position: 1},
        {role: "AI Engineer", position: 2},
        {role: "Prompt Engineer", position: 100},
        {role: "Vibe Engineer", position: 1},
        {role: "Social Engineer", position: 2},
        {role: "Eating Engineer", position: 100},
        {role: "Shitting Engineer", position: 1},
        {role: "Screwing Engineer", position: 2},
        {role: "Nutting Engineer", position: 100},
    ]
    const [comments, setComments] = useState<Comment[]>([
        {
            id: "c1a2b3c4-1234-5678-90ab-cdef12345678",
            content: "This is a fantastic feature! Really looking forward to seeing how it evolves in the next update. Great job to the team.",
            created_at: "2026-07-20T14:30:00Z",
            profiles: {
            name: "Alice Chen",
            profile_pic_url: "https://i.pravatar.cc/150?u=alice"
            }
        },
        {
            id: "d5e6f7a8-2345-6789-01bc-def012345679",
            content: "I've been testing this extensively over the past few weeks and I have to say, the performance improvements are staggering. However, I did notice a small edge case when loading a massive dataset on slower networks. It might be worth adding some skeleton loaders or a more prominent loading spinner to keep the user engaged while the backend crunches the numbers. Otherwise, stellar work!",
            created_at: "2026-07-21T09:15:22Z",
            profiles: {
            name: "Marcus Johnson",
            }
        },
        {
            id: "e9f0a1b2-3456-7890-12cd-ef0123456780",
            content: "Looks good to me 👍",
            created_at: "2026-07-21T11:45:10Z",
            profiles: {
            name: "Samira Patel",
            profile_pic_url: "https://i.pravatar.cc/150?u=samira"
            }
        },
    ]); 
    
    // ###################################################

    const displayedRoles = rolesSeeMore ? RolesAndPositions : RolesAndPositions.slice(0, 3);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "");
    const postLink = `${baseUrl}/posts/${postid}`;

    // functions
    const handleLike = () => {
        if (liked) {
            setLikeCount(likeCount - 1)
        } else {
            setLikeCount(likeCount + 1)
        }
        setLiked(!liked);
    }

    const handleNewComment = (newComment: Comment) => {
        setComments(prevComments => [...prevComments, newComment]); 
    }

    const onCancel = () => {
        setIsApplyModalOpen(false); 
    }

    const onApply = () => {
        setIsApplyModalOpen(false); 
        setApplied(true);
    }

    return (
        <Card 
            className="w-2xl bg-comatch-background relative overflow-hidden" 
            ref={containerRef}
        >
            {/* Header: Name and Date */}
            <CardHeader className="flex flex-row gap-4 items-center">
                <Avatar name={ownerName}>
                    <AvatarImage
                        src={pf.src}
                        alt={`${ownerName}'s Profile`}
                    />
                    <AvatarFallback />
                </Avatar>
                <div className="flex flex-col">
                    <CardTitle>
                        {ownerName}
                    </CardTitle>
                    <CardDescription>
                        {postDate}
                    </CardDescription>
                </div>
            </CardHeader>

            {/* Image */}
            <div>
                {postImage && (
                    <Image 
                        src={pp}
                        alt="Post Image"
                        className="w-full aspect-[4/3] object-cover rounded-sm"
                        height={32}
                        sizes="(max-width: 768px) 100vw, 600px"
                    />
                )}
            </div>

            <CardContent className="flex flex-col gap-3">
                {/* Title */}
                <CardTitle>
                    {postTitle}
                </CardTitle>

                {/* Description */}
                <div className="flex flex-col items-start">
                    <CardDescription className={textSeeMore ? "" : "line-clamp-1"}>
                        {postDescription}
                    </CardDescription>
                    <button 
                        onClick={() => setTextSeeMore(!textSeeMore)}
                        className="text-sm font-medium text-gray-500 hover:text-gray-700 hover:underline mt-2"
                    >
                        {textSeeMore ? "See less" : "See more"}
                    </button>
                </div>

                {/* Commitment Level  */}
                <CardDescription>
                    <span className="font-heading">Commitment Level: </span> 
                    <Badge variant="outline">{commitmentLevel}</Badge>
                </CardDescription>

                {/* Roles and Positions */}
                <CardDescription>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-50">Role</TableHead>
                                <TableHead className="text-50">Positions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {displayedRoles.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.role}</TableCell>
                                    <TableCell>
                                        {item.position}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardDescription>

                {/* View More Roles */}
                {RolesAndPositions.length > 3 && (
                    <Button 
                        variant="secondary" 
                        className="w-32 mt-2"
                        onClick={() => setRolesSeeMore(!rolesSeeMore)}
                    >
                        {rolesSeeMore ? "View fewer roles" : "View all roles"}
                    </Button>
                )}
            </CardContent>

            {/* Footer */}
            <CardFooter 
                className="flex flex-row justify-between"
            >
                <div>
                    <Button variant="ghost" onClick={handleLike}>
                        {liked ? <IoIosHeart className="text-red-500"/> : <IoIosHeartEmpty />}
                        {likeCount}
                    </Button>

                    {/* Comments */}
                    <Drawer 
                        modal={false} 
                        open={isDrawerOpen}
                        direction="bottom"
                        onOpenChange={setIsDrawerOpen}
                    >
                        <DrawerTrigger asChild>
                            <Button variant="ghost">
                                <VscComment /> {comments.length}
                            </Button>
                        </DrawerTrigger>

                        {isMounted && (
                            <DrawerContent 
                                container={containerRef.current}
                                className="h-[60%] absolute bottom-0"
                                onPointerDownOutside={() => setIsDrawerOpen(false)}
                            >
                                <DrawerHeader className="font-heading">
                                    Comments
                                </DrawerHeader>
                                <div className="flex-1 p-4 overflow-y-auto">
                                    <CommentPage 
                                        profile_pic_url={pf.src}
                                        name={ownerName}
                                        comments={comments}
                                        postid= {postid}
                                        onAddComment={handleNewComment}
                                    />
                                </div>
                            </DrawerContent>
                        )}
                    </Drawer>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost">
                                <RiTelegram2Line />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                            <ShareLink name="post" link={postLink} />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Apply Buttons */}
                {applied ? (
                    <Button variant="green">
                        <MdOutlineDownloadDone /> Applied
                    </Button>
                ) : (
                    <Button onClick={() => {setIsApplyModalOpen(true)}}>
                        Apply <MdArrowOutward />
                    </Button>
                )}
                
            </CardFooter>

             <AlertDialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
                <AlertDialogContent className="p-0 bg-transparent border-none shadow-none justify-center">
                    <ApplyModal
                        onCancel={onCancel} 
                        onApply={onApply}
                        rolesAndPositions={RolesAndPositions}
                    />
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );  

}
 