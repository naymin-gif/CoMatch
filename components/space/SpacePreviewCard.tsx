import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProfilePreviewCardProps {
    id: string;
    spaceId: string;
    profilePic?: string;
    name: string;
    bio?: string;
}

export default function ProfilePreviewCard({
    id,
    spaceId,
    profilePic,
    name,
    bio,
} : ProfilePreviewCardProps) {
    return (
        <Card className="grid grid-cols-4 items-center p-3 w-2xl" variant="ghost">
            {/* Profile Picture */}
            <Avatar
                name={name}
                size="md"
                className="col-span-1"
            >
                <AvatarImage 
                    src={profilePic}
                    alt={`${name}'s Profile Picture`}
                />
                <AvatarFallback />
            </Avatar>

            {/* Name and Bio */}
            <CardHeader className="col-span-2">
                <CardTitle>
                    {name}
                </CardTitle>
                <CardDescription>
                    {bio}
                </CardDescription>
            </CardHeader>

            {/* Owner Profile and Space Buttons */}
            <div className="flex flex-row">
                <a href={`/profile/${id}`} className="col-span-1">
                    <Button variant="ghost">
                        Owner
                    </Button>
                </a>
                <a href={`/spaces/${spaceId}`} className="col-span-1">
                    <Button variant="ghost">
                        View Space
                    </Button>
                </a>
            </div>
        </Card>
    );
}
