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

interface CreatePostModalProps {
    onCancel: () => void;
    onPost: () => void;
    initialImage?: File | null; 
}

export default function CreatePostModal({
    onCancel,
    onPost,
    initialImage,
} : CreatePostModalProps) {
    const [roles, setRoles] = useState<string[]>([""]);
    const [quantity, setQuantity] = useState<number[]>([1]);

    // functions
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
    }

    const handleRoleRemove = (index: number) => {
        const newRoles = roles.filter((_, idx) => (idx !== index)); 
        const newQuantity = quantity.filter((_, idx) => (idx !== index));
        
        if (newRoles.length === 0 || newRoles[newRoles.length - 1] !== "") {
            newRoles.push("");
            newQuantity.push(1);
        }
        setRoles(newRoles);
        setQuantity(newQuantity);
    }

    const handleQuantityChange = (index: number, value: number) => {
        const newQuantity = [...quantity];
        newQuantity[index] = value;
        setQuantity(newQuantity);
    }

    return (
        <Card className="w-2xl bg-comatch-background p-6">
            <CardHeader className="border-b text-center justify-center">
                <CardTitle className="text-heading">
                    Create Post
                </CardTitle>
                <CardDescription>
                    Share your work and get the best teammates!
                </CardDescription>
            </CardHeader>
            <CardContent>
                <FieldGroup>
                    {/* Title */}
                    <Field>
                        <FieldLabel>Title</FieldLabel>
                        <Input
                            placeholder="Give a short title for your recruitment. "
                        />
                    </Field>

                    {/* Description */}
                    <Field>
                        <FieldLabel>Description</FieldLabel>
                        <Textarea placeholder="Give a description of your project and requirements to join your team."/>
                    </Field>

                    {/* Image Upload  */}
                    <Field>
                        <FieldLabel>Upload a picture.</FieldLabel>
                        <ImageUpload 
                            size="xl"
                            initialImage={initialImage}
                        />
                    </Field>

                    {/* Commitment Level  */}
                    <Field className="flex flex-row">
                        <FieldLabel>Commitment Level</FieldLabel>
                        <Select>
                            <SelectTrigger className="w-full max-w-3xl">
                                <SelectValue placeholder="Select Required Commitment"/>
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

                    {/* Open Roles  */}
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

                    {/* Buttons  */}
                    <div className="flex flex-row gap-3 justify-end">
                        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
                        <Button onClick={onPost}>Post</Button>
                    </div>
                </FieldGroup>
            </CardContent>
        </Card>
    ); 
}