import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { FaRegCircleXmark } from "react-icons/fa6";

export interface OutboundAppCardProps {
    postTitle: string;
    ownerId: string;
    ownerPic?: string;
    ownerName: string;
    appliedRole: string;
    message?: string;
    postId: string;
    result: boolean;
}

export default function OutboundAppCard({
    postTitle,
    ownerId,
    ownerPic,
    ownerName,
    appliedRole,
    message,
    postId,
    result,
}: OutboundAppCardProps) {
    return (
        <Card className="bg-comatch-background w-[500px] p-3">
            <CardHeader>
                <CardTitle>{postTitle}</CardTitle>

                <div className="mt-3 flex flex-row items-center justify-between">
                    {/* Post owner picture and name */}
                    <div className="flex flex-row items-center gap-3">
                        <Avatar name={ownerName}>
                            <AvatarImage
                                src={ownerPic}
                                alt={`${ownerName}'s profile picture`}
                            />
                            <AvatarFallback />
                        </Avatar>
                        <span>{ownerName}</span>
                    </div>

                    {/* Application result */}
                    <Button variant={result ? "green" : "destructive"}>

                        {result ? (
                            <div className="flex flex-row gap-3 items-center">
                                <AiOutlineCheckCircle /> 
                                <span>Approved</span>
                            </div>
                        ) : (
                            <div className="flex flex-row gap-3 items-center">
                                <FaRegCircleXmark /> 
                                <span>Rejected</span>
                            </div>
                        )}
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                {/* Applied role */}
                <div className="flex flex-row gap-2">
                    <span>Applied Role: </span>
                    <Badge variant="secondary">{appliedRole}</Badge>
                </div>

                {/* Application message */}
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
