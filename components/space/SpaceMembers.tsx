"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardDescription, CardTitle, CardContent } from "@/components/ui/card";
import SearchBar  from "@/components/ui/searchbar"; 
import ProfilePreviewCard from "./ProfilePreviewCard";
import { HiMiniUserGroup } from "react-icons/hi2";

interface Profile {
    id: string; 
    profile_pic_url?: string; 
    name: string;
    bio?: string;
}

interface SpaceMembersProps {
    members: Profile[] 
    owner_id: string;
    memberCount: number;
    spaceName: string; 
    space_id: string; 
}

export default function SpaceMembers({
    members,
    owner_id,
    memberCount,
    spaceName
} : SpaceMembersProps) {

    const [searchQuery, setSearchQuery] = useState("");

    const { owner, otherMembers } = useMemo(() => {
        let owner: Profile | undefined;
        const otherMembers: Profile[] = [];

        for (const member of members) {
            if (member.id === owner_id) {
                owner = member;
            } else {
                otherMembers.push(member);
            }
        }

        return { owner, otherMembers };
    }, [members, owner_id]);

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        
        return members.filter((m) => 
            m.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [members, searchQuery]);

    const isSearching = searchQuery.trim().length > 0;

    return (
        <Card className="p-6 w-2xl bg-comatch-background">
            <CardHeader className="border-b flex flex-col gap-2">
                <CardTitle className="flex flex-row gap-4 items-center">
                    <HiMiniUserGroup /> 
                    <span>Members of {spaceName}</span>
                </CardTitle>
                <CardDescription className="mr-8 ml-8">
                    {memberCount} Members
                </CardDescription>
                <div className="w-full mr-8 ml-8" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}>
                    <SearchBar placeholder="Search Members"/>
                </div>
            </CardHeader>
            <CardContent>
                {isSearching ? (
                    // search results
                    <div className="pt-4">
                        <span className="font-heading block mb-2">Search Results</span>
                        {searchResults.length === 0 ? (
                            <p className="text-sm text-gray-500">No members found matching "{searchQuery}".</p>
                        ) : (
                            searchResults.map((m) => (
                                <ProfilePreviewCard 
                                    id={m.id}
                                    key={m.id}
                                    profilePic={m.profile_pic_url} 
                                    name={m.name}
                                    bio={m.bio}
                                />
                            ))
                        )}
                    </div>
                ) : (
                    // default
                    <>
                        <div className="border-b pb-4 mb-4">
                            <span className="font-heading block mb-2">Owner</span>
                            {owner ? (
                                <ProfilePreviewCard 
                                    id={owner.id}
                                    profilePic={owner.profile_pic_url} 
                                    name={owner.name}
                                    bio={owner.bio}
                                />
                            ) : (
                                <p className="text-sm text-gray-500">Owner information not found in members list.</p>
                            )}
                        </div>
                        <div>
                            <span className="font-heading block mb-2">Other Members</span>
                            {otherMembers.length === 0 ? (
                                <p className="text-sm text-gray-500">No Member Except the Owner in this Space</p>
                            ) : (
                                otherMembers.map((m) => (
                                    <ProfilePreviewCard 
                                        id={m.id}
                                        key={m.id}
                                        profilePic={m.profile_pic_url} 
                                        name={m.name}
                                        bio={m.bio}
                                    />
                                ))
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    ); 
}