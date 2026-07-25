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

export interface InboundAppCardProps {
    postTitle: string;
    applicantId: string;
    applicantPic?: string;
    applicantName: string;
    appliedRole: string[]; 
    message?: string;
    postId: string;
    status: "Pending" | "Approved" | "Rejected";
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
    status,
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

    return (
        <Card className="bg-comatch-background p-3 w-[500px]">
            <CardHeader>
                <CardTitle>
                    {postTitle}
                </CardTitle>
                <div className="mt-3 flex flex-row justify-between">
                    {/* Applicant Pic and Name */}
                    <div className="flex flex-row gap-3 items-center">
                        <Avatar name={applicantName}>
                            <AvatarImage 
                                src={applicantPic}
                                alt="Applicant Picture"
                            />
                            <AvatarFallback />
                        </Avatar>
                        <span>{applicantName}</span>
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