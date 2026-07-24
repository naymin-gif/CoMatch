"use client";

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
import { IoCompassSharp } from "react-icons/io5";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FaPlus } from "react-icons/fa";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import CreateSpaceModal, {
  CreateSpaceData,
} from "@/components/space/CreateSpaceModal";

export interface HomeSidebarSpace {
  spaceId: string;
  spaceName: string;
  spaceImage?: string | null;
}

interface HomeLeftPanelProps {
  ownedSpaces?: HomeSidebarSpace[];
  joinedSpaces?: HomeSidebarSpace[];
  otherSpaces?: HomeSidebarSpace[];
  currentUserName: string;
  currentUserProfilePic?: string;
  onExploreSpaces?: () => void;
  onCreate: (spaceData: CreateSpaceData) => Promise<string>;
}

const spacesBaseUrl = "/spaces/";

export default function HomeLeftPanel({
  ownedSpaces,
  joinedSpaces,
  otherSpaces,
  currentUserName,
  currentUserProfilePic,
  onExploreSpaces,
  onCreate,
}: HomeLeftPanelProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const onCancel = () => {
    setIsModalOpen(false);
  };

  const handleCreate = async (spaceData: CreateSpaceData) => {
    const createdSpaceId = await onCreate(spaceData);
    setIsModalOpen(false);
    router.push(`${spacesBaseUrl}${createdSpaceId}`);
  };

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
                  isActive={pathname === "/"} 
                  asChild
                  className="flex flex-row gap-3 h-[40px]"
                >
                  <Link href="/">
                    <GoHomeFill />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Owned Spaces */}
        <SidebarGroup>
          <SidebarGroupLabel>Owned Spaces</SidebarGroupLabel>
          <SidebarGroupContent>
            {ownedSpaces ? (
              <SidebarMenu>
                {ownedSpaces.map((space) => (
                  <SidebarMenuItem key={space.spaceId}>
                    <SidebarMenuButton
                      isActive={pathname === `${spacesBaseUrl}${space.spaceId}`}
                      className="flex flex-row gap-3 h-[40px]"
                      asChild
                    >
                      <a href={`${spacesBaseUrl}${space.spaceId}`}>
                        <Avatar name={space.spaceName}>
                          <AvatarImage
                            src={space.spaceImage ?? ""}
                            alt="Space Image"
                            sizes="sm"
                          />
                          <AvatarFallback />
                        </Avatar>
                        <span>{space.spaceName}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            ) : (
              <span>You have not created any spaces.</span>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Joined Spaces */}
        <SidebarGroup>
          <SidebarGroupLabel>Joined Spaces</SidebarGroupLabel>
          <SidebarGroupContent>
            {joinedSpaces ? (
              <SidebarMenu>
                {joinedSpaces.map((space) => (
                  <SidebarMenuItem key={space.spaceId}>
                    <SidebarMenuButton
                      isActive={pathname === `${spacesBaseUrl}${space.spaceId}`}
                      className="flex flex-row gap-3 h-[40px]"
                      asChild
                    >
                      <a href={`${spacesBaseUrl}${space.spaceId}`}>
                        <Avatar name={space.spaceName}>
                          <AvatarImage
                            src={space.spaceImage ?? ""}
                            alt="Space Image"
                            sizes="sm"
                          />
                          <AvatarFallback />
                        </Avatar>
                        <span>{space.spaceName}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            ) : (
              <span>You have not joined any spaces.</span>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Other Spaces */}
        <SidebarGroup>
          <SidebarGroupLabel>Other Spaces</SidebarGroupLabel>
          <SidebarGroupContent>
            {otherSpaces ? (
              <SidebarMenu>
                {otherSpaces.map((space) => (
                  <SidebarMenuItem key={space.spaceId}>
                    <SidebarMenuButton
                      isActive={pathname === `${spacesBaseUrl}${space.spaceId}`}
                      className="flex flex-row gap-3 h-[40px]"
                      asChild
                    >
                      <a href={`${spacesBaseUrl}${space.spaceId}`}>
                        <Avatar name={space.spaceName}>
                          <AvatarImage
                            src={space.spaceImage ?? ""}
                            alt="Space Image"
                            sizes="sm"
                          />
                          <AvatarFallback />
                        </Avatar>
                        <span>{space.spaceName}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            ) : (
              <span>Be the first to create spaces on the app.</span>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-5 pb-20">
        {/* Create a New Space  */}
        <Button variant="blue" onClick={() => setIsModalOpen(true)}>
          <FaPlus className="mr-3" />
          Create a New Space
        </Button>

        {/* Explore All Spaces */}
        <Button variant="default" className="w-full" onClick={onExploreSpaces}>
          <IoCompassSharp className="mr-3" />
          Explore All Spaces
        </Button>

        {/* Current User Profile */}
        <Button
          variant="blue"
          className="flex flex-row justify-start pl-5 gap-3 h-[40px]"
          asChild
        >
          <Link href="/profile">
            <Avatar name={currentUserName}>
              <AvatarImage
                src={currentUserProfilePic ?? ""}
                alt="Profile Picture"
                sizes="sm"
              />
              <AvatarFallback />
            </Avatar>
            <span className="font-heading">{currentUserName}</span>
          </Link>
        </Button>
      </SidebarFooter>

      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent className="p-0 bg-transparent border-none shadow-none justify-center">
          <CreateSpaceModal onCancel={onCancel} onCreate={handleCreate} />
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}