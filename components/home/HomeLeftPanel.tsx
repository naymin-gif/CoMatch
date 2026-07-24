"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"; 
import { Button } from "@/components/ui/button"; 
import { GoHomeFill } from "react-icons/go";
import { MdRocketLaunch } from "react-icons/md";
import { usePathname } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"; 
import { FaPlus } from "react-icons/fa";

// mock data

const ownedSpaces = [
  { name: "Engineering Team", url: "#" },
  { name: "Product Planning", url: "#" },
];

const joinedSpaces = [
  { name: "Company General", url: "#" },
  { name: "Design System", url: "#" },
];

const otherSpaces = [
  { name: "Marketing", url: "#" },
  { name: "Sales", url: "#" },
];

const userName = "Win"
const profile_pic_url = ""; 

// #############################################

export default function HomeLeftPanel() {
    const pathname = usePathname()
    console.log(pathname)
    return (
        <Sidebar className="top-16 h-[calc(100vh-4rem)] border-r">
            <SidebarHeader />
            <SidebarContent className="p-3">
                {/* Home */}
                <SidebarGroup>
                <SidebarGroupContent>
                    <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            isActive={pathname === "/home"}
                            className="flex flex-row gap-3 items-center h-[40px]" 
                            asChild
                        >
                            <a href="">
                                <GoHomeFill /> 
                                <span> Home </span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
                </SidebarGroup>

                {/* Owned Spaces */}
                <SidebarGroup>
                <SidebarGroupLabel>Owned Spaces</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                    {ownedSpaces.map((space) => (
                        <SidebarMenuItem key={space.name}>
                            <SidebarMenuButton 
                                isActive={pathname === space.url} 
                                className="flex flex-row gap-3 h-[40px]" 
                                asChild
                            >
                                <a href={space.url}>
                                    <Avatar name={space.name}>
                                        <AvatarImage
                                            src=""
                                            alt="Space Image"
                                            sizes="sm" 
                                        />
                                        <AvatarFallback />
                                    </Avatar>
                                    <span>{space.name}</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                    </SidebarMenu>
                </SidebarGroupContent>
                </SidebarGroup>

                {/* Joined Spaces */}
                <SidebarGroup>
                <SidebarGroupLabel>Joined Spaces</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {joinedSpaces.map((space) => (
                            <SidebarMenuItem key={space.name}>
                                <SidebarMenuButton 
                                    isActive={pathname === space.url} 
                                    className="flex flex-row gap-3 h-[40px]" 
                                    asChild
                                >
                                    <a href={space.url}>
                                        <Avatar name={space.name}>
                                            <AvatarImage
                                                src=""
                                                alt="Space Image"
                                                sizes="sm" 
                                            />
                                            <AvatarFallback />
                                        </Avatar>
                                        <span>{space.name}</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroupContent>
                </SidebarGroup>

                {/* Other Spaces */}
                <SidebarGroup>
                    <SidebarGroupLabel>Other Spaces</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                        {otherSpaces.map((space, index) => (
                            <SidebarMenuItem key={index}>
                                <SidebarMenuButton 
                                    isActive={pathname === space.url}
                                    className="flex flex-row gap-3 h-[40px]"  
                                    asChild
                                >
                                    <a href={space.url}>
                                        <Avatar name={space.name}>
                                            <AvatarImage
                                                src=""
                                                alt="Space Image"
                                                sizes="sm" 
                                            />
                                            <AvatarFallback />
                                        </Avatar>
                                        <span>{space.name}</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-5 pb-20">
                <Button variant="blue">
                    <FaPlus className="mr-3"/>
                    Create a New Space
                </Button>
                <Button variant="default" className="w-full">
                    <MdRocketLaunch className="mr-3" />
                    Explore All Spaces
                </Button>
                <Button variant="blue" className="flex flex-row justify-center gap-3 h-[40px]">
                    <Avatar name={userName}>
                        <AvatarImage
                            src={profile_pic_url}
                            alt="Profile Picture"
                            sizes="sm" 
                        />
                        <AvatarFallback />
                    </Avatar>
                    <span className="font-heading">{userName}</span>
                </Button>
            </SidebarFooter>
        </Sidebar>
    );
}