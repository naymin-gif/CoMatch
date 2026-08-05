"use client"; 

import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
} from "@/components/ui/card";
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "@/components/ui/avatar"; 
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { FaRegCircleXmark } from "react-icons/fa6";
import { Badge } from "@/components/ui/badge";
import { AiOutlineClockCircle } from "react-icons/ai";
import Link from "next/link";

export interface InboundAppCardProps {
    postTitle: string;
    applicantId: string;
    applicantPic?: string;
    applicantName: string;
    appliedRole: string[]; 
    message?: string;
    postId: string;
    spaceId: string;
    timeAgo: string;
    spaceName: string;
    status: "Pending" | "Approved" | "Rejected";
    isNew?: boolean;
    onApprove: () => Promise<void>;
    onReject: () => Promise<void>;
}

type ApplicationDecision = "approved" | "rejected" | null;

export default function InboundAppCard({
    postTitle,
    applicantId,
    applicantPic,
    applicantName,
    appliedRole,
    message,
    postId,
    spaceId,
    timeAgo,
    spaceName, 
    status,
    isNew = false,
    onApprove,
    onReject,
} : InboundAppCardProps) {
    const decision: ApplicationDecision =
        status === "Approved"
            ? "approved"
            : status === "Rejected"
                ? "rejected"
                : null;

    const hasDecision = decision !== null;
    const postLink = `/spaces/${spaceId}?post=${postId}`;
    const displaySpaceName = spaceName.length > 20 ? spaceName.slice(0, 20) + "..." : spaceName; 

    return (
        <Card className="bg-comatch-background p-3 w-[500px]">
            <CardHeader>
                <div className="flex flex-row justify-between items-center">
                    <CardTitle className="hover:text-comatch-primary flex flex-row gap-3 items-center">
                        <Link href={postLink}>
                            {postTitle}
                        </Link>
                        <Badge variant="blue">
                            {displaySpaceName}
                        </Badge>
                    </CardTitle>
                    {isNew && (
                        <Badge variant="destructive" className="animate-pulse font-bold text-[10px]">
                            NEW REQUEST
                        </Badge>
                    )}
                </div>

                {/* Time Ago  */}
                <div className="flex flex-row gap-3 items-center text-xs text-muted-foreground mt-1">
                    <AiOutlineClockCircle />
                    {timeAgo}
                </div>

                <div className="mt-3 flex flex-row justify-between">
                    {/* Applicant Pic and Name */}
                    <div className="flex flex-col gap-3">
                        <span className="text-xs">Applicant: </span>
                        <div className="flex flex-row gap-3 items-center">
                            <Avatar name={applicantName}>
                                <AvatarImage 
                                    src={applicantPic}
                                    alt="Applicant Picture"
                                />
                                <AvatarFallback />
                            </Avatar>
                            <Link href={`/profile/${applicantId}`} className="hover:underline">
                                {applicantName}
                            </Link>
                        </div>
                    </div>

                    {/* Buttons  */}
                    <div className="flex flex-row gap-3">
                        {/* Approve Button  */}
                        {decision !== "rejected" && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="green"
                                        disabled={hasDecision}
                                        style={{ opacity: 1 }}
                                    >
                                        <AiOutlineCheckCircle />
                                        {decision === "approved" ? "Approved" : "Approve"}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Approve this application?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to approve{" "}
                                            {applicantName}&apos;s application?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            variant="green"
                                            onClick={() => void onApprove()}
                                        >
                                            Confirm
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                        {/* Reject Button */}
                        {decision !== "approved" && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        disabled={hasDecision}
                                        style={{ opacity: 1 }}
                                    >
                                        <FaRegCircleXmark />
                                        {decision === "rejected" ? "Rejected" : "Reject"}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Reject this application?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to reject{" "}
                                            {applicantName}&apos;s application?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            variant="destructive"
                                            onClick={() => void onReject()}
                                        >
                                            Confirm
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {/* Applied Role */}
                <div className="flex flex-row gap-2">
                    <span>Applied Role: </span>
                    {appliedRole.map((role, index) => (
                        <Badge variant="secondary" key={index}>{role}</Badge>
                    ))}
                </div>

                {/* Message  */}
                <Accordion type="single" collapsible>
                    <AccordionItem value={applicantId}>
                        <AccordionTrigger className="text-comatch-primary">
                            View Message
                        </AccordionTrigger>
                        <AccordionContent className="border rounded-lg p-3 pb-8">
                            {message}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
}