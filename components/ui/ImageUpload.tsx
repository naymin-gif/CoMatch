"use client"

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { RiUploadLine } from "react-icons/ri";
import { IoMdRemoveCircleOutline } from "react-icons/io";
import { BsImageAlt } from "react-icons/bs";

interface ImageUploadProps {
    className?: string;
    shape?: "square" | "rectangle";
    size?: "lg" | "xl" | "2xl" | "3xl" | "full";
    defaultImage?: string;
    onImageChange?: (file: File | undefined) => void;
    initialImage?: File | null;
}

// Helper to map sizes and shapes to Tailwind classes
const getDimensions = (shape: string, size: string) => {
    if (size === "full") return "w-full h-full";

    const dimensions = {
        square: {
            lg: "w-32 h-32",
            xl: "w-48 h-48",
            "2xl": "w-64 h-64",
            "3xl": "w-96 h-96",
        },
        rectangle: {
            lg: "w-48 h-32",
            xl: "w-64 h-48",
            "2xl": "w-96 h-64",
            "3xl": "w-[32rem] h-96",
        }
    };

    return dimensions[shape as keyof typeof dimensions][size as keyof typeof dimensions["square"]];
};

export default function ImageUpload({
    className,
    shape = "rectangle",
    size = "lg",
    defaultImage,
    onImageChange,
    initialImage,
}: ImageUploadProps) {
    const [img, setImg] = useState<string | undefined>(defaultImage); 
    const imgRef = useRef<HTMLInputElement>(null); 

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; 
        if (!file) return; 

        setImg(URL.createObjectURL(file)); 
        if (onImageChange) onImageChange(file);
    };

    const removeSpaceImage = () => {
        setImg(undefined); 
        if (imgRef.current) {
            imgRef.current.value = ""; 
        }
        if (onImageChange) onImageChange(undefined);
    };

    const defaultClassName = `relative flex justify-center items-center bg-muted rounded-lg overflow-hidden ${getDimensions(shape, size)}`;
    const finalClassName = className || defaultClassName;

    useEffect(() => {
        if (initialImage) {
            const objectUrl = URL.createObjectURL(initialImage); 
            setImg(objectUrl); 
        }
    }, [initialImage])

    return (
        <div className="flex flex-col gap-4 relative">
            <input
                ref={imgRef}
                name="image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload} 
            />

            <div className={finalClassName}>
                {img ? (
                    <Image 
                        src={img} 
                        alt="Uploaded Image"
                        className="object-cover rounded-lg opacity-50" 
                        fill 
                    />
                ) : (
                    <BsImageAlt className="text-muted-foreground w-1/3 h-1/3 opacity-50" />
                )}
                
                {/* Upload and Remove Buttons Overlay */}
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
                        <IoMdRemoveCircleOutline className="text-comatch-danger" /> 
                    </Button>
                </div>
            </div>
        </div>
    );
}