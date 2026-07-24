import SpacePreviewCard, { SpacePreviewCardProps } from "./SpacePreviewCard";

interface ExpoloreSpacesProps {
    currentUserId: string;
    ownedSpaces?: SpacePreviewCardProps[];
    joinedSpaces?: SpacePreviewCardProps[];
    otherSpaces?: SpacePreviewCardProps[];
}

export default function ExploreSpaces ({
    currentUserId,
    ownedSpaces,
    joinedSpaces,
    otherSpaces,
} : ExpoloreSpacesProps) {
    return (
        <div>
            {/* Owned Spaces */}
            {ownedSpaces && 
                <div>
                    {ownedSpaces.map((space) => (
                        <SpacePreviewCard 
                            key={space.spaceId}
                            spaceId={space.spaceId}
                            spaceImage={space.spaceImage}
                            spaceName={space.spaceName}
                            spaceDesc={space.spaceDesc}
                            spaceLinks={space.spaceLinks}
                            spaceOwnerId={space.spaceOwnerId}
                            spaceOwnerName={space.spaceOwnerName}
                            spaceOwnerPic={space.spaceOwnerPic}
                            currentUserId={currentUserId}
                        />
                    ))}
                </div>
            }

            {/* Joined Spaces */}
            {joinedSpaces && 
                <div>
                    {joinedSpaces.map((space) => (
                        <SpacePreviewCard 
                            key={space.spaceId}
                            spaceId={space.spaceId}
                            spaceImage={space.spaceImage}
                            spaceName={space.spaceName}
                            spaceDesc={space.spaceDesc}
                            spaceLinks={space.spaceLinks}
                            spaceOwnerId={space.spaceOwnerId}
                            spaceOwnerName={space.spaceOwnerName}
                            spaceOwnerPic={space.spaceOwnerPic}
                            currentUserId={currentUserId}
                        />
                    ))}
                </div>
            }

            {/* Other Spaces */}
            {otherSpaces && 
                <div>
                    {otherSpaces.map((space) => (
                        <SpacePreviewCard 
                            key={space.spaceId}
                            spaceId={space.spaceId}
                            spaceImage={space.spaceImage}
                            spaceName={space.spaceName}
                            spaceDesc={space.spaceDesc}
                            spaceLinks={space.spaceLinks}
                            spaceOwnerId={space.spaceOwnerId}
                            spaceOwnerName={space.spaceOwnerName}
                            spaceOwnerPic={space.spaceOwnerPic}
                            currentUserId={currentUserId}
                        />
                    ))}
                </div>
            }

            {!ownedSpaces && !joinedSpaces && !otherSpaces && (
                <span>There is no space to explore. Start creating one.</span>
            )}
        </div>
    ); 
}