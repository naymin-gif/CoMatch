import SpacePreviewCard, { type SpacePreviewCardProps } from "./SpacePreviewCard";
import { IoCompassOutline } from "react-icons/io5";

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
        <div className="p-10">
            <div className="flex flex-row gap-3 items-center mb-5 font-heading text-heading text-comatch-primary">
                <IoCompassOutline/>
                <span> Explore Spaces</span>
            </div>
            {/* Owned Spaces */}
            {ownedSpaces && ownedSpaces.length > 0 &&
                <div className="mb-10">
                    <span className="font-heading">Owned Spaces</span>
                    <div className="mt-3 flex flex-wrap gap-3">
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
                </div>
            }

            {/* Joined Spaces */}
            {joinedSpaces && joinedSpaces.length > 0 &&
                <div className="mb-10">
                    <span className="font-heading">Joined Spaces</span>
                    <div className="mt-3 flex flex-wrap gap-3">
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
                </div>
            }

            {/* Other Spaces */}
            {otherSpaces && otherSpaces.length > 0 && 
                <div className="mb-10">
                    <span className="font-heading">Other Spaces</span>
                    <div className="mt-3 flex flex-wrap gap-3">
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
                </div>
            }

            {!ownedSpaces && !joinedSpaces && !otherSpaces && (
                <span>There is no space to explore. Start creating one.</span>
            )}
        </div>
    ); 
}