"use client";

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card";
import {
    Select,
    SelectValue,
    SelectTrigger,
    SelectGroup,
    SelectLabel,
    SelectItem,
    SelectContent,
} from "@/components/ui/select";
import {
  Field,
  FieldLabel,
  FieldGroup,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/ui/ImageUpload";
import { useState } from "react";
import { IoRemoveCircle } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import NumberCounter from "@/components/ui/NumberCounter";

export interface EditPostData {
    title: string;
    description: string;
    imageFile?: File | null;
    existingImageUrl?: string;
    commitmentLevel: string;
    roles: string[];
    quantities: number[];
}

interface EditPostModalProps {
    initialTitle: string;
    initialDescription: string;
    initialCommitmentLevel: string;
    initialImageUrl?: string;
    initialRoles: string[];
    initialQuantities: number[];
    onCancel: () => void;
    onSave: (postData: EditPostData) => Promise<void>;
}

export default function EditPostModal({
    initialTitle,
    initialDescription,
    initialCommitmentLevel,
    initialImageUrl,
    initialRoles,
    initialQuantities,
    onCancel,
    onSave,
}: EditPostModalProps) {
    const [title, setTitle] = useState<string>(initialTitle || "");
    const [description, setDescription] = useState<string>(initialDescription || "");
    const [commitmentLevel, setCommitmentLevel] = useState<string>(initialCommitmentLevel || "");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | undefined>(initialImageUrl);
    
    const [roles, setRoles] = useState<string[]>(
        initialRoles && initialRoles.length > 0 ? [...initialRoles, ""] : [""]
    );
    const [quantity, setQuantity] = useState<number[]>(
        initialQuantities && initialQuantities.length > 0 ? [...initialQuantities, 1] : [1]
    );
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleRoleChange = (index: number, value: string) => {
        let newRoles = [...roles];
        let newQuantity = [...quantity];

        newRoles[index] = value;

        if (value === "" && index !== newRoles.length - 1) {
            newRoles = newRoles.filter((_, idx) => idx !== index);
            newQuantity = newQuantity.filter((_, idx) => idx !== index);
        }

        while (
            newRoles.length > 1 &&
            newRoles[newRoles.length - 1] === "" &&
            newRoles[newRoles.length - 2] === ""
        ) {
            newRoles.pop();
            newQuantity.pop();
        }

        if (newRoles[newRoles.length - 1] !== "") {
            newRoles.push("");
            newQuantity.push(1);
        }

        setRoles(newRoles);
        setQuantity(newQuantity);
    };

    const handleRoleRemove = (index: number) => {
        const newRoles = roles.filter((_, idx) => idx !== index);
        const newQuantity = quantity.filter((_, idx) => idx !== index);

        if (newRoles.length === 0 || newRoles[newRoles.length - 1] !== "") {
            newRoles.push("");
            newQuantity.push(1);
        }
        setRoles(newRoles);
        setQuantity(newQuantity);
    };

    const handleQuantityChange = (index: number, value: number) => {
        const newQuantity = [...quantity];
        newQuantity[index] = value;
        setQuantity(newQuantity);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        const validRoles = roles.map((r) => r.trim()).filter(Boolean);
        if (validRoles.length === 0) {
            setErrorMsg("Please specify at least one open role for your post.");
            return;
        }

        setIsSaving(true);

        try {
            await onSave({
                title,
                description,
                imageFile,
                existingImageUrl,
                commitmentLevel,
                roles,
                quantities: quantity,
            });
        } catch (err: any) {
            console.error("Error saving edited post:", err);
            setErrorMsg(err.message || "Failed to update post. Please try again.");
            setIsSaving(false);
        }
    };

    return (
        <Card className="w-2xl max-h-[85vh] flex flex-col bg-comatch-background p-6 overflow-hidden">
            <CardHeader className="border-b text-center justify-center shrink-0 pb-4">
                <CardTitle className="text-heading">
                    Edit Post
                </CardTitle>
                <CardDescription>
                    Update your recruitment post details and open roles.
                </CardDescription>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[calc(85vh-120px)] pt-4">
                <form onSubmit={handleFormSubmit}>
                    <FieldGroup>
                        {/* Title */}
                        <Field>
                            <FieldLabel>Title</FieldLabel>
                            <Input
                                placeholder="Give a short title for your recruitment."
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </Field>

                        {/* Description */}
                        <Field>
                            <FieldLabel>Description</FieldLabel>
                            <Textarea
                                placeholder="Give a description of your project and requirements."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </Field>

                        {/* Image Upload */}
                        <Field>
                            <FieldLabel>Update Picture (Optional)</FieldLabel>
                            <ImageUpload
                                size="xl"
                                defaultImage={initialImageUrl}
                                onImageChange={(file) => {
                                    if (file) {
                                        setImageFile(file);
                                        setExistingImageUrl(undefined);
                                    } else {
                                        setImageFile(null);
                                        setExistingImageUrl(undefined);
                                    }
                                }}
                            />
                        </Field>

                        {/* Commitment Level */}
                        <Field className="flex flex-row">
                            <FieldLabel>Commitment Level</FieldLabel>
                            <Select value={commitmentLevel} onValueChange={setCommitmentLevel}>
                                <SelectTrigger className="w-full max-w-3xl">
                                    <SelectValue placeholder="Select Required Commitment" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Level of commitment your teammates need to give.</SelectLabel>
                                        <SelectItem value="low">Low (&lt;5 hours/ week)</SelectItem>
                                        <SelectItem value="medium">Medium (5-10 hours/ week)</SelectItem>
                                        <SelectItem value="high">High (10+ hours/ week)</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </Field>

                        {/* Open Roles */}
                        <Field>
                            <FieldLabel>
                                Open Roles & Positions
                            </FieldLabel>
                            {roles.map((role, index) => (
                                <div key={`role-${index}`} className="flex flex-row items-center gap-2 !w-xl">
                                    <Input
                                        type="text"
                                        name="role"
                                        id={`role-${index}`}
                                        placeholder={`role-${index + 1}`}
                                        value={role}
                                        onChange={(e) => handleRoleChange(index, e.target.value)}
                                        className="flex-1"
                                    />
                                    <NumberCounter
                                        min={1}
                                        value={quantity[index] || 1}
                                        onChange={(val: number) => handleQuantityChange(index, val)}
                                    />

                                    {index !== roles.length - 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRoleRemove(index)}
                                            className="text-comatch-danger hover:opacity-80 transition-opacity"
                                            aria-label={`Remove role ${index + 1}`}
                                        >
                                            <IoRemoveCircle size={24} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </Field>

                        {errorMsg && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 mb-2">
                                {errorMsg}
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex flex-row gap-3 justify-end">
                            <Button variant="secondary" type="button" onClick={onCancel} disabled={isSaving}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
}
