import Image from "next/image";
import { BsImageAlt } from "react-icons/bs";

interface ImageContainerProps {
    className?: string;
    shape?: "square" | "rectangle";
    size?: "lg" | "xl" | "2xl" | "3xl" | "full";
    defaultImage?: string;
    src?: string;
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

export default function ImageContainer({
    className,
    shape = "rectangle",
    size = "lg",
    defaultImage,
    src,
}: ImageContainerProps) {
    const defaultClassName = `relative flex justify-center items-center bg-muted rounded-lg overflow-hidden ${getDimensions(shape, size)}`;
    const finalClassName = className || defaultClassName;

    return (
        <div className="flex flex-col gap-4 relative">
            <div className={finalClassName}>
                {src ? (
                    <Image 
                        src={src} 
                        alt="Uploaded Image"
                        className="object-cover rounded-lg opacity-50" 
                        fill 
                    />
                ) : (
                    <BsImageAlt className="text-muted-foreground w-1/3 h-1/3 opacity-50" />
                )}
            </div>
        </div>
    );
}