"use client";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
  ItemHeader
} from "@/components/ui/item"; 
import { Button } from "@/components/ui/button";
import { IoCopyOutline } from "react-icons/io5";
import { LuCopyCheck } from "react-icons/lu";
import { useState } from "react";

interface ShareLinkProps {
    name?: string;
    link: string;
}

export default function ShareLink({
    name,
    link
} : ShareLinkProps) {
    const [copied, setCopied] = useState<boolean>(false); 

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(link);
            
            setCopied(true);
            
            setTimeout(() => {
                setCopied(false);
            }, 1000);
        } catch (error) {
            console.error("Failed to copy link: ", error);
        }
    };

    return (
        <Item className="w-full p-0">
            <ItemContent>
                <ItemTitle className="font-heading">
                    Share {name} link. 
                </ItemTitle>
                <ItemDescription>
                    {link}
                </ItemDescription>
            </ItemContent>
            <ItemActions>
                <Button variant="ghost" onClick={handleCopy}>
                    {copied ? (
                        <>
                            <LuCopyCheck className="mr-2" /> Copied
                        </>
                    ) : (
                        <>
                            <IoCopyOutline className="mr-2" /> Copy
                        </>
                    )}
                </Button>
            </ItemActions>
        </Item>
    ); 
}