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

export type OutboundApplicationStatus = "Pending" | "Approved" | "Rejected";

export interface OutboundAppCardProps {
  postTitle: string;
  ownerId: string;
  ownerPic?: string;
  ownerName: string;
  appliedRole: string;
  message?: string;
  postId: string;
  status: OutboundApplicationStatus;
}

export default function OutboundAppCard({
  postTitle,
  ownerId,
  ownerPic,
  ownerName,
  appliedRole,
  message,
  postId,
  status,
}: OutboundAppCardProps) {
  return (
    <Card className="bg-comatch-background w-[500px] p-3">
      <CardHeader>
        <CardTitle>{postTitle}</CardTitle>

        <div className="mt-3 flex flex-row items-center justify-between">
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
          <Badge variant="secondary">{appliedRole}</Badge>
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