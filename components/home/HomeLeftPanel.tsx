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

export default function HomeLeftPanel() {
    const pathname = usePathname()
    console.log(pathname)
    return (
        <Sidebar className="top-16 h-[calc(100vh-4rem)] border-r">
        <SidebarHeader />
        <SidebarContent>
            {/* Home */}
            <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton isActive={pathname === "/home"} asChild>
                    <a href="">
                        <span className="flex flex-row gap-3 items-center">
                            <GoHomeFill /> Home
                        </span>
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
                    <SidebarMenuButton isActive={pathname === space.url} asChild>
                        <a href={space.url}>
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
                            <SidebarMenuButton isActive={pathname === space.url} asChild>
                            <a href={space.url}>
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
                    <SidebarMenuButton isActive={pathname === space.url} asChild>
                        <a href={space.url}>
                        <span>{space.name}</span>
                        </a>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
                </SidebarMenu>
            </SidebarGroupContent>
            </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4">
            <Button variant="default" className="w-full">
            <MdRocketLaunch className="mr-3" />
            Explore All Spaces
            </Button>
        </SidebarFooter>
        </Sidebar>
    );
}