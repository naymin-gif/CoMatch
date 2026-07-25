import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "@/components/ui/avatar";
import { FaInfoCircle } from "react-icons/fa";
import { Button } from "@/components/ui/button"; 

interface ConversationPageHeaderProps {
    profile_pic_url?: string;
    name: string;
    profileid: string;
}

export default function ConversationPageHeader({
    profile_pic_url,
    name,
    profileid,
} : ConversationPageHeaderProps) {
    return (
        <Card className="flex flex-row justify-between p-5 rounded-none shadow-md bg-comatch-light bg-muted">
            <div className="flex flex-row items-center">
                <Avatar name={name}>
                    <AvatarImage 
                        src={profile_pic_url}
                        alt="Profile Picture"
                    />
                    <AvatarFallback />
                </Avatar>
                <CardContent>
                    <span className="font-heading">{name}</span>
                </CardContent>
            </div>
            <a href={`/profile/${profileid}`}>
                <Button variant="ghost" className="flex flex-row gap-3 items-center">
                    <FaInfoCircle />
                    <span>View Profile</span>
                </Button>
            </a>
        </Card>
    );
}