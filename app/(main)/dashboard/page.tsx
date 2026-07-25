"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

import Loading from "@/app/loading";
import InboundPage from "@/components/dashboard/InboundPage";
import OutboundPage from "@/components/dashboard/OutboundPage";
import type { InboundAppCardProps } from "@/components/dashboard/InboundAppCard";
import type { OutboundAppCardProps } from "@/components/dashboard/OutboundAppCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
        applicant_seen,
        posts!inner (
          id,
          title,
          owner_id
        )
      `,
    )
    .eq("applicant_id", userId)
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

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [inbound, setInbound] = useState<Dashboard[]>([]);
  const [outbound, setOutbound] = useState<Dashboard[]>([]);
  const [ownerNames, setOwnerNames] = useState<OwnerNames>({});
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
        const fetchedOwnerNames = await getOwnerNames(outboundData);

        setInbound(inboundData);
        setOutbound(outboundData);
        setOwnerNames(fetchedOwnerNames);
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
        await updateApplicationStatus(
          supabase,
          applicationId,
          status,
          userId,
        );

        setInbound((current) =>
          current.map((application) =>
            application.id === applicationId
              ? { ...application, status }
              : application,
          ),
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
            applicantName: applicant.name,
            appliedRole: application.selected_roles ?? [],
            message: application.intro_message,
            postId: post.id,
            status: application.status,
            onApprove: () =>
              handleInboundAction(application.id, "Approved"),
            onReject: () =>
              handleInboundAction(application.id, "Rejected"),
          },
        ];
      }),
    [handleInboundAction, inbound],
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
            status: application.status,
          },
        ];
      }),
    [outbound, ownerNames],
  );

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
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabState)}
      >
        <TabsList>
          <TabsTrigger value="inbound">Inbound</TabsTrigger>
          <TabsTrigger value="outbound">Outbound</TabsTrigger>
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