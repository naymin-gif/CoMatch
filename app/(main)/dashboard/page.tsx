"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

import Loading from "@/app/loading";
import formatTimeAgo from "@/lib/TimeAgo";
import InboundPage from "@/components/dashboard/InboundPage";
import OutboundPage from "@/components/dashboard/OutboundPage";
import type { InboundAppCardProps } from "@/components/dashboard/InboundAppCard";
import type { OutboundAppCardProps } from "@/components/dashboard/OutboundAppCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { PiAirplaneLandingBold } from "react-icons/pi";
import { PiAirplaneTakeoffFill } from "react-icons/pi";
import {
  type ApplicationStatus,
  type Dashboard,
  getRequestsReceived,
  updateApplicationStatus,
} from "@/utils/DashboardActions";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type TabState = "inbound" | "outbound";
type OwnerNames = Record<string, string>;
type SpaceNames = Record<string, string>;

async function getOutboundApplications(userId: string): Promise<Dashboard[]> {
  const { data, error } = await supabase
    .from("applications")
    .select(
      `
        id,
        intro_message,
        selected_roles,
        status,
        created_at,
        last_edited_at,
        applicant_seen,
        posts!inner (
          id,
          title,
          owner_id,
          space_id,
          is_deleted
        )
      `,
    )
    .eq("applicant_id", userId)
    .order("last_edited_at", {
      ascending: false,
      nullsFirst: false,
    })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching outbound applications:", error);
    throw new Error("Could not load outbound applications.");
  }

  const applications = data as unknown as Dashboard[];

  return applications.filter(
    (application) => application.posts?.owner_id !== userId,
  );
}

async function getOwnerNames(applications: Dashboard[]): Promise<OwnerNames> {
  const ownerIds = Array.from(
    new Set(
      applications
        .map((application) => application.posts?.owner_id)
        .filter((ownerId): ownerId is string => Boolean(ownerId)),
    ),
  );

  if (ownerIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, name")
    .in("id", ownerIds);

  if (error) {
    console.error("Error fetching post owners:", error);
    throw new Error("Could not load post owners.");
  }

  return Object.fromEntries(
    (data ?? []).map((profile) => [profile.id, profile.name]),
  );
}

async function getSpaceNames(
  applications: Dashboard[],
): Promise<SpaceNames> {
  const spaceIds = Array.from(
    new Set(
      applications
        .map((application) => application.posts?.space_id)
        .filter((spaceId): spaceId is string => Boolean(spaceId)),
    ),
  );

  if (spaceIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from("spaces")
    .select("id, name")
    .in("id", spaceIds);

  if (error) {
    console.error("Error fetching space names:", error);
    throw new Error("Could not load space names.");
  }

  return Object.fromEntries(
    (data ?? []).map((space) => [space.id, space.name]),
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [inbound, setInbound] = useState<Dashboard[]>([]);
  const [outbound, setOutbound] = useState<Dashboard[]>([]);
  const [ownerNames, setOwnerNames] = useState<OwnerNames>({});
  const [spaceNames, setSpaceNames] = useState<SpaceNames>({});
  const [activeTab, setActiveTab] = useState<TabState>("inbound");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/login");
          return;
        }

        setUserId(user.id);

        const [inboundData, outboundData] = await Promise.all([
          getRequestsReceived(supabase, user.id),
          getOutboundApplications(user.id),
        ]);
        const [fetchedOwnerNames, fetchedSpaceNames] = await Promise.all([
          getOwnerNames(outboundData),
          getSpaceNames([...inboundData, ...outboundData]),
        ]);

        setInbound(inboundData);
        setOutbound(outboundData);
        setOwnerNames(fetchedOwnerNames);
        setSpaceNames(fetchedSpaceNames);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
        setLoadError("Failed to load applications. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, [router]);

  const unseenInboundIds = useMemo(
    () =>
      inbound
        .filter(
          (application) =>
            application.status === "Pending" && !application.owner_seen,
        )
        .map((application) => application.id),
    [inbound],
  );

  const unseenOutboundIds = useMemo(
    () =>
      outbound
        .filter(
          (application) =>
            application.status !== "Pending" && !application.applicant_seen,
        )
        .map((application) => application.id),
    [outbound],
  );

  useEffect(() => {
    async function markApplicationsAsSeen() {
      const isInbound = activeTab === "inbound";
      const unseenIds = isInbound ? unseenInboundIds : unseenOutboundIds;

      if (unseenIds.length === 0) {
        return;
      }

      const seenColumn = isInbound ? "owner_seen" : "applicant_seen";
      const { error } = await supabase
        .from("applications")
        .update({ [seenColumn]: true })
        .in("id", unseenIds);

      if (error) {
        console.error(`Failed to update ${seenColumn}:`, error);
        return;
      }

      if (isInbound) {
        setInbound((current) =>
          current.map((application) =>
            unseenIds.includes(application.id)
              ? { ...application, owner_seen: true }
              : application,
          ),
        );
      } else {
        setOutbound((current) =>
          current.map((application) =>
            unseenIds.includes(application.id)
              ? { ...application, applicant_seen: true }
              : application,
          ),
        );
      }
    }

    void markApplicationsAsSeen();
  }, [activeTab, unseenInboundIds, unseenOutboundIds]);

  const handleInboundAction = useCallback(
    async (
      applicationId: string,
      status: Exclude<ApplicationStatus, "Pending">,
    ) => {
      if (!userId) {
        return;
      }

      try {
        const updatedApplication = await updateApplicationStatus(
          supabase,
          applicationId,
          status,
          userId,
        );

        setInbound((current) =>
          current
            .map((application) =>
              application.id === applicationId
                ? {
                    ...application,
                    status: updatedApplication.status,
                    last_edited_at: updatedApplication.last_edited_at,
                  }
                : application,
            )
            .sort((a, b) => {
              const aTime = a.last_edited_at
                ? new Date(a.last_edited_at).getTime()
                : 0;

              const bTime = b.last_edited_at
                ? new Date(b.last_edited_at).getTime()
                : 0;

              return bTime - aTime;
            }),
        );
      } catch (error) {
        console.error("Failed to update application:", error);
        window.alert("Failed to update the application. Please try again.");
      }
    },
    [userId],
  );

  const inboundCardProps = useMemo<InboundAppCardProps[]>(
    () =>
      inbound.flatMap((application) => {
        const post = application.posts;
        const applicant = application.profiles;

        if (!post || !applicant) {
          return [];
        }

        return [
          {
            postTitle: post.title,
            applicantId: applicant.id,
            spaceId: post.space_id,
            spaceName: spaceNames[post.space_id] ?? "Unknown space",
            applicantName: applicant.name,
            appliedRole: application.selected_roles ?? [],
            message: application.intro_message,
            postId: post.id,
            status: application.status,
            isNew: !application.owner_seen && application.status === "Pending",
            isDeletedPost: Boolean(post?.is_deleted),
            timeAgo: formatTimeAgo(
              application.last_edited_at ?? application.created_at,
            ),
            onApprove: () =>
              handleInboundAction(application.id, "Approved"),
            onReject: () =>
              handleInboundAction(application.id, "Rejected"),
          },
        ];
      }),
    [handleInboundAction, inbound, spaceNames],
  );

  const outboundApplications = useMemo<OutboundAppCardProps[]>(
    () =>
      outbound.flatMap((application) => {
        const post = application.posts;
        const ownerId = post?.owner_id;

        if (!post || !ownerId) {
          return [];
        }

        return [
          {
            postTitle: post.title,
            ownerId,
            ownerName: ownerNames[ownerId] ?? ownerId,
            appliedRole: application.selected_roles ?? [],
            message: application.intro_message,
            postId: post.id,
            spaceId: post.space_id,
            spaceName: spaceNames[post.space_id] ?? "Unknown space",
            status: application.status,
            isUpdated: !application.applicant_seen && application.status !== "Pending",
            isDeletedPost: Boolean(post?.is_deleted),
            timeAgo: formatTimeAgo(
              application.last_edited_at ?? application.created_at,
            ),
          },
        ];
      }),
    [outbound, ownerNames, spaceNames],
  );

  const hasUnseenInbound = unseenInboundIds.length > 0;
  const hasUnseenOutbound = unseenOutboundIds.length > 0;

  if (loading) {
    return <Loading />;
  }

  if (loadError) {
    return (
      <div className="p-10">
        <p role="alert" className="text-destructive">
          {loadError}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-10">
      <div className="flex flex-row gap-3 items-center text-heading text-comatch-primary font-heading">
        <TbLayoutDashboardFilled />
        <span>Dashboard</span>
      </div>
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabState)}
      >
        <TabsList className="mb-5 w-md pt-5 pb-5">
          <TabsTrigger value="inbound" className="relative pt-4 pb-4 data-[state=active]:bg-blue-500/30 data-[state=active]:text-blue-900"> 
            <PiAirplaneLandingBold className="mr-3"/> 
            <span className="font-heading">Inbound</span>
            {hasUnseenInbound && (
              <span className="ml-2 flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
            )}
          </TabsTrigger>
          <TabsTrigger value="outbound" className="relative pt-4 pb-4 data-[state=active]:bg-blue-500/30 data-[state=active]:text-blue-900"> 
            <PiAirplaneTakeoffFill className="mr-3"/> 
            <span className="font-heading">Outbound</span>
            {hasUnseenOutbound && (
              <span className="ml-2 flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbound">
          <InboundPage inboundCardProps={inboundCardProps} />
        </TabsContent>

        <TabsContent value="outbound">
          <OutboundPage applications={outboundApplications} />
        </TabsContent>
      </Tabs>
    </div>
  );
}