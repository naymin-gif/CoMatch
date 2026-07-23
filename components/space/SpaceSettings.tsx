import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card"; 
import Image from "next/image";
import { MdOutlineDriveFileRenameOutline } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
import { Button } from "@/components/ui/button"; 
import { BsLink45Deg } from "react-icons/bs";

interface SpaceSettingsProps {
    spaceImage?: string;
    spaceName: string;
    spaceDescription?: string;
    external_links?: string[]; 
    onEdit: () => void; 
}

export default function SpaceSettings({
    spaceImage,
    spaceName,
    spaceDescription,
    external_links, 
    onEdit
} : SpaceSettingsProps) {
    return (
        <Card className="w-2xl p-6 bg-comatch-background">
            <CardHeader className="border-b pb-6 flex flex-row items-center gap-4 px-0">
                <IoMdSettings />
                <div className="flex flex-col gap-1 flex-1">
                    <CardTitle>
                        Settings
                    </CardTitle>
                    <CardDescription>
                        You can only edit the following details of the space. 
                    </CardDescription>
                </div>
                
                <Button className="flex flex-row gap-2" onClick={onEdit}>
                    <MdOutlineDriveFileRenameOutline /> Edit
                </Button>
            </CardHeader>

            <CardContent className="px-0 flex flex-col gap-8">
                {/* Space Image */}
                <CardDescription className="flex flex-row gap-4">
                    <MdOutlineDriveFileRenameOutline className="mt-1" />
                    <div className="flex flex-col gap-4">
                        <span className="font-heading">Space Image</span>
                        <div className="relative flex justify-center rounded-lg items-center bg-muted w-72 h-16">
                            {spaceImage && 
                            <Image 
                                src={spaceImage}
                                alt="Space Image"
                                className="object-cover rounded-lg"
                                sizes="288px"
                                fill
                            />
                        }
                        </div>
                    </div>
                </CardDescription>

                {/* Space Name */} 
                <CardDescription className="flex flex-row gap-4">
                    <MdOutlineDriveFileRenameOutline className="mt-1" />
                    <div className="flex flex-col">
                        <span className="font-heading">Name</span>
                        {spaceName}
                    </div>
                </CardDescription>

                {/* Space Description */} 
                <CardDescription className="flex flex-row gap-4">
                    <MdOutlineDriveFileRenameOutline className="mt-1" />
                    <div className="flex flex-col">
                        <span className="font-heading">Description</span>
                        {spaceDescription}
                    </div>
                </CardDescription>

                {/* External Links */} 
                <CardDescription className="flex flex-row gap-4">
                    <MdOutlineDriveFileRenameOutline className="mt-1" />
                    <div className="flex flex-col">
                        <span className="font-heading">External Links</span>
                        {
                            external_links && external_links.length > 0 
                            ? (
                                external_links.map((el, index) => (
                                    <Button
                                        variant="link"
                                        className="h-auto p-0"
                                        key={index}
                                    >
                                        <BsLink45Deg />
                                        {el}
                                    </Button>
                                ))
                            )
                            : (<span>There is no link.</span>)
                        }
                    </div>
                </CardDescription>
            </CardContent>
        </Card>
    );
}