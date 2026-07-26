"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CgProfile } from "react-icons/cg";
import { FiMessageSquare } from 'react-icons/fi';
import { createClient } from "@/utils/clients";

interface ProfilePreviewCardProps {
    id: string;
    profilePic?: string;
    name: string;
    bio?: string;
    currentUserId?: string;
}

export default function ProfilePreviewCard({
    id,
    profilePic,
    name,
    bio,
    currentUserId: propCurrentUserId,
} : ProfilePreviewCardProps) {
    const [currentUserId, setCurrentUserId] = useState<string | undefined>(propCurrentUserId);

    useEffect(() => {
        if (!currentUserId) {
            const supabase = createClient();
            supabase.auth.getUser().then(({ data }) => {
                if (data?.user) {
                    setCurrentUserId(data.user.id);
                }
            });
        }
    }, [currentUserId]);

    const isSelf = Boolean(currentUserId && currentUserId === id);

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

            {/* View Profile and Chat Button */}
            <div className="flex flex-row items-center gap-1">
                <a href={`/profile/${id}`} className="col-span-1">
                    <Button variant="ghost">
                        <CgProfile />
                    </Button>
                </a>
                {!isSelf && (
                    <a href={`/chat?user=${id}`} className="col-span-1">
                        <Button variant="ghost">
                            <FiMessageSquare />
                        </Button>
                    </a>
                )}
            </div>
        </Card>
    );
}