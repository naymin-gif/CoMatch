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
import CommentPage, { Comment } from "./CommentPage";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import ApplyModal from "./ApplyModal";
import { MdOutlineDownloadDone } from "react-icons/md";
import { RoleAndPosition } from "./PostPage";

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

export interface PostCardProps {
    postid: string;
    ownerName: string;
    ownerAvatarUrl?: string;
    postDate: string;
    initialLikeCount: number;
    postTitle: string;
    postDescription: string;
    postImageUrl?: string;
    commitmentLevel: string;
    rolesAndPositions: RoleAndPosition[];
    initialComments: Comment[];
}

export default function PostCard({
    postid,
    ownerName,
    ownerAvatarUrl,
    postDate,
    initialLikeCount,
    postTitle,
    postDescription,
    postImageUrl,
    commitmentLevel,
    rolesAndPositions,
    initialComments
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

    // Initializing state with props
    const [likeCount, setLikeCount] = useState<number>(initialLikeCount);
    const [comments, setComments] = useState<Comment[]>(initialComments); 

    useEffect(() => {
        setIsMounted(true);
    }, [])
    
    // ###################################################

    const displayedRoles = rolesSeeMore ? rolesAndPositions : rolesAndPositions.slice(0, 3);
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
                        src={ownerAvatarUrl || ""}
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
                {postImageUrl && (
                    <Image 
                        src={postImageUrl}
                        alt="Post Image"
                        className="w-full aspect-[4/3] object-cover rounded-sm"
                        width={800}
                        height={600}
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
                {rolesAndPositions.length > 3 && (
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
                                        profile_pic_url={ownerAvatarUrl || ""}
                                        name={ownerName}
                                        comments={comments}
                                        postid={postid}
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
                        rolesAndPositions={rolesAndPositions}
                    />
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );  
}