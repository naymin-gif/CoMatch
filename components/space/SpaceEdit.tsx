"use client"

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card"; 
import { MdOutlineDriveFileRenameOutline } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
import { Button } from "@/components/ui/button"; 
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react"; 
import { StaticImageData } from "next/image";
import Image  from "next/image";
import { RiUploadLine } from "react-icons/ri";
import { IoMdRemoveCircleOutline } from "react-icons/io";
import { Spinner } from "@/components/ui/spinner";
import { IoRemoveCircle } from "react-icons/io5";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";

interface SpaceEditProps {
    spaceImage?: string;
    spaceName: string;
    spaceDescription?: string;
    external_links: string[]; 
    onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
    isSubmitting: boolean; 
    onCancel: () => void;
}

export default function SpaceEdit({
    spaceImage,
    spaceName,
    spaceDescription,
    external_links,
    onSubmit,
    isSubmitting, 
    onCancel,
} : SpaceEditProps) {
    const [img, setImg] = useState<string | undefined | StaticImageData>(spaceImage); 
    const imgRef = useRef<HTMLInputElement>(null); 

    // Initialize state with provided links, filtering out any existing empty ones, 
    // and ensuring there is exactly one empty string at the end.
    const [links, setLinks] = useState<string[]>(
        [...external_links.filter(link => link.trim() !== ""), ""]
    );

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImg(URL.createObjectURL(file)); 
    };

    const removeSpaceImage = () => {
        setImg(undefined);
        if (imgRef.current) {
            imgRef.current.value = ""; 
        }
    };

    const handleLinkChange = (index: number, value: string) => {
        const newLinks = [...links];
        newLinks[index] = value;

        // Remove excess empty boxes at the end to ensure only one remains
        while (
            newLinks.length > 1 && 
            newLinks[newLinks.length - 1] === "" && 
            newLinks[newLinks.length - 2] === ""
        ) {
            newLinks.pop();
        }

        // Always push an empty box to the end if the last box has content
        if (newLinks[newLinks.length - 1] !== "") {
            newLinks.push("");
        }

        setLinks(newLinks);
    };

    // New handler to remove a specific link
    const handleRemoveLink = (indexToRemove: number) => {
        const newLinks = links.filter((_, index) => index !== indexToRemove);
        
        // Ensure there is always at least one empty box at the end
        if (newLinks.length === 0 || newLinks[newLinks.length - 1] !== "") {
            newLinks.push("");
        }
        
        setLinks(newLinks);
    };

    return (
        <form action="" onSubmit={onSubmit}>
            {/* Image Remove */}
            <input type="hidden" name="isImageRemoved" value={img === undefined ? "true" : "false"} />

            {/* Image Upload */}
            <input
                ref={imgRef}
                name="image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
            />

            <Card className="w-2xl p-6 bg-comatch-background">
                <CardHeader className="border-b pb-6 flex flex-row items-center gap-4 px-0">
                    <IoMdSettings />
                    <div className="flex flex-col gap-1">
                        <CardTitle>
                            Settings
                        </CardTitle>
                        <CardDescription>
                            You can only edit the following details of the space. 
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="px-0 flex flex-col gap-8">
                    {/* Edit Space Image */}
                    <CardDescription className="flex flex-row gap-4">
                        <MdOutlineDriveFileRenameOutline className="mt-1" />
                        <div className="flex flex-col gap-4 relative">
                            <span className="font-heading">Space Image</span>
                            <div className="relative flex justify-center rounded-lg items-center bg-muted w-72 h-16">
                                {img && 
                                    <Image 
                                        src={typeof img === "string" ? img : img.src}
                                        alt="Space Image"
                                        className="object-cover rounded-lg opacity-50"
                                        sizes="288px"
                                        fill
                                    />
                                }
                                <div className="absolute z-10 flex flex-row gap-3">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="bg-background/50 backdrop-blur-sm"
                                        onClick={() => imgRef.current?.click()}
                                    >
                                        <RiUploadLine />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="bg-background/50 backdrop-blur-sm"
                                        onClick={removeSpaceImage}
                                    >
                                        <IoMdRemoveCircleOutline className="text-comatch-danger"/> 
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardDescription>

                    {/* Other Fields */}
                    <CardDescription>
                        <FieldSet>
                            <FieldGroup className="flex flex-col gap-6">
                                {/* Edit Space Name */}
                                <Field className="flex flex-col gap-3">
                                    <FieldLabel htmlFor="name" className="font-heading flex flex-row items-center gap-4">
                                        <MdOutlineDriveFileRenameOutline />
                                        <span>Name <span className="text-destructive">*</span></span>
                                    </FieldLabel>
                                    <Input 
                                        defaultValue={spaceName}
                                        id="name" 
                                        placeholder="eg; Orbital Project" 
                                        required 
                                        type="text"
                                        name="name"
                                        className="ml-8 !w-xl"
                                    />
                                    <FieldDescription className="ml-8">
                                        This field is required. 
                                    </FieldDescription>
                                </Field>

                                {/* Edit Space Description */}
                                <Field className="flex flex-col gap-3">
                                    <FieldLabel htmlFor="description" className="font-heading flex flex-row items-center gap-4">
                                        <MdOutlineDriveFileRenameOutline />
                                        <span>Description</span>
                                    </FieldLabel>
                                    <Input 
                                        defaultValue={spaceDescription}
                                        id="description" 
                                        placeholder="eg; This space is to find teammates." 
                                        type="text"
                                        name="description"
                                        className="ml-8 !w-xl"
                                    />
                                </Field>

                                {/* Edit External Links */}
                                <Field className="flex flex-col gap-3">
                                    <FieldLabel htmlFor="external-links" className="font-heading flex flex-row items-center gap-4">
                                        <MdOutlineDriveFileRenameOutline />
                                        <span>External Links</span>
                                    </FieldLabel>
                                    {links.map((link, index) => (
                                        <div key={`link-${index}`} className="ml-8 flex flex-row items-center gap-2 !w-xl">
                                            <Input
                                                type="text"
                                                name="external_links" 
                                                id={`link-${index}`}
                                                placeholder={`Link ${index + 1}`}
                                                value={link}
                                                onChange={(e) => handleLinkChange(index, e.target.value)}
                                                className="flex-1"
                                            />
                                            {/* Hide remove icon for the final empty placeholder input */}
                                            {index !== links.length - 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveLink(index)}
                                                    className="text-comatch-danger hover:opacity-80 transition-opacity"
                                                    aria-label={`Remove link ${index + 1}`}
                                                >
                                                    <IoRemoveCircle size={24} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </Field>
                            </FieldGroup>
                        </FieldSet>
                    </CardDescription>

                    {/* Buttons */}
                    <div className="flex flex-row justify-end gap-3 w-full mt-2">
                        <Button 
                            type="button" 
                            variant="secondary" 
                            disabled={isSubmitting}
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Spinner className="mr-2"/>}
                            Save
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}