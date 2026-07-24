import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription,
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
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { FaRegCircleXmark } from "react-icons/fa6";
import { Badge } from "@/components/ui/badge";

export interface ApplicationCardProps {
    postTitle: string;
    applicantId: string;
    applicantPic?: string;
    applicantName: string;
    appliedRole: string;
    message?: string;
    postId: string;
    onApprove: () => void;
    onReject: () => void;
}

export default function ApplicationCard({
    postTitle,
    applicantId,
    applicantPic,
    applicantName,
    appliedRole,
    message,
    postId,
    onApprove,
    onReject,
} : ApplicationCardProps) {
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
                        <Button variant="green">
                            <AiOutlineCheckCircle /> Approve
                        </Button>
                        <Button variant="destructive">
                            <FaRegCircleXmark /> Reject
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {/* Applied Role */}
                <div className="flex flex-row gap-2">
                    <span>Applied Role: </span>
                    <Badge variant="secondary">{appliedRole}</Badge>
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