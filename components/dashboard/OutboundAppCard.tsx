"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AiOutlineCheckCircle, AiOutlineClockCircle } from "react-icons/ai";
import { FaRegCircleXmark } from "react-icons/fa6";
import Link from "next/link";
import { toast } from "sonner";

export type OutboundApplicationStatus = "Pending" | "Approved" | "Rejected";

export interface OutboundAppCardProps {
  postTitle: string;
  ownerId: string;
  ownerPic?: string;
  ownerName: string;
  appliedRole: string[]; 
  message?: string;
  postId: string;
  spaceId: string;
  spaceName: string;
  status: OutboundApplicationStatus;
  timeAgo: string;
  isUpdated?: boolean; 
}

export default function OutboundAppCard({
  postTitle,
  ownerId,
  ownerPic,
  ownerName,
  appliedRole,
  message,
  postId,
  spaceId,
  spaceName, 
  status,
  timeAgo, 
  isUpdated = false,
}: OutboundAppCardProps) {
  const isDeleted = !postId || !postTitle || postTitle === "Post Deleted";
  const postLink = `/spaces/${spaceId}?post=${postId}`;
  const displaySpaceName = spaceName ? (spaceName.length > 20 ? spaceName.slice(0, 20) + "..." : spaceName) : "Unavailable"; 

  return (
    <Card className="bg-comatch-background w-[500px] p-3">
      <CardHeader>
        <div className="flex flex-row justify-between items-center">
          <CardTitle className="hover:text-comatch-primary flex flex-row gap-3 items-center">
            {isDeleted ? (
              <button
                type="button"
                onClick={() => toast.info("This recruitment post has been deleted by the owner.")}
                className="text-muted-foreground hover:underline italic font-medium cursor-pointer"
              >
                Post Deleted
              </button>
            ) : (
              <Link href={postLink}>
                {postTitle}
              </Link>
            )}
            <Badge variant="blue">
                {displaySpaceName}
            </Badge>
          </CardTitle>
          {isUpdated && !isDeleted && (
            <Badge className="bg-blue-600 hover:bg-blue-700 text-white animate-pulse font-bold text-[10px]">
              UPDATED
            </Badge>
          )}
        </div>

        {/* Time Ago  */}
        <div className="flex flex-row gap-3 items-center text-xs text-muted-foreground mt-1">
            <AiOutlineClockCircle />
            {timeAgo}
        </div>

        <div className="mt-3 flex flex-row items-center justify-between">
          {/* Owner  */}
          <div className="flex flex-col gap-3">
            <span className="text-xs">Owner: </span>
            <div className="flex flex-row items-center gap-3">
              <Avatar name={ownerName}>
                <AvatarImage
                  src={ownerPic}
                  alt={`${ownerName}'s profile picture`}
                />
                <AvatarFallback />
              </Avatar>
              <Link href={`/profile/${ownerId}`} className="hover:underline">
                {ownerName}
              </Link>
            </div>
          </div>

          <Button
            variant={
              status === "Approved"
                ? "green"
                : status === "Rejected"
                  ? "destructive"
                  : "outline"
            }
          >
            {status === "Approved" ? (
              <span className="flex flex-row items-center gap-3">
                <AiOutlineCheckCircle />
                Approved
              </span>
            ) : status === "Rejected" ? (
              <span className="flex flex-row items-center gap-3">
                <FaRegCircleXmark />
                Rejected
              </span>
            ) : (
              <span className="flex flex-row items-center gap-3">
                <AiOutlineClockCircle />
                Pending
              </span>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-row gap-2">
          <span>Applied Role: </span>
          {appliedRole.map((role, index) => (
            <Badge variant="secondary" key={index}>{role}</Badge>
          ))}
        </div>

        <Accordion type="single" collapsible>
          <AccordionItem value={`${ownerId}-${postId}`}>
            <AccordionTrigger className="text-comatch-primary">
              View Message
            </AccordionTrigger>
            <AccordionContent className="rounded-lg border p-3 pb-8">
              {message}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}