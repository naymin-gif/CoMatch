import {
    Card,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "@/components/ui/avatar";
import { FaInfoCircle } from "react-icons/fa";

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
        <Card>
            <Avatar name={name}>
                <AvatarImage 
                    src={profile_pic_url}
                    alt="Profile Picture"
                />
                <AvatarFallback />
            </Avatar>
            <CardHeader>
                <CardTitle>
                    {name}
                </CardTitle>
                <div>
                    <FaInfoCircle />
                    <span>View Profile</span>
                </div>
            </CardHeader>
        </Card>
    );
}