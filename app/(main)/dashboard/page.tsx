'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Loading from '@/app/loading';
import PageWrapper from '@/components/old-ui/PageWrapper';

import {
  Dashboard,
  getMyApplications,
  getRequestsReceived,
  updateApplicationStatus,
} from '@/utils/DashboardActions';

// UI Components
import StatusBadge, { ApplicationStatus } from '@/components/old-ui/StatusBadge';
import Button from '@/components/old-ui/Button';
import Card from '@/components/old-ui/Card';
import Avatar from '@/components/old-ui/Avatar';
import SearchBar from '@/components/old-ui/SearchBar';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type TabState = 'inbound' | 'outbound';

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [outbound, setOutbound] = useState<Dashboard[]>([]);
  const [inbound, setInbound] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabState>('inbound');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        // Redirect if not authenticated instead of crashing
        if (!user) {
          router.push('/login');
          return;
        }

        setUserId(user.id);

        const [outboundData, inboundData] = await Promise.all([
          getMyApplications(supabase, user.id),
          getRequestsReceived(supabase, user.id),
        ]);

        setOutbound(outboundData);
        setInbound(inboundData);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  // Mark received applications as seen
  const markInboundAsSeen = async (unseenIds: string[]) => {
    if (unseenIds.length === 0) return;
    const { error } = await supabase
      .from('applications')
      .update({ owner_seen: true })
      .in('id', unseenIds);
      
    if (!error) {
      setInbound((prev) =>
        prev.map((app) =>
          unseenIds.includes(app.id) ? { ...app, owner_seen: true } : app
        )
      );
    }
  };

  // Mark my applications as seen
  const markOutboundAsSeen = async (unseenIds: string[]) => {
    if (unseenIds.length === 0) return;
    const { error } = await supabase
      .from('applications')
      .update({ applicant_seen: true })
      .in('id', unseenIds);

    if (!error) {
      setOutbound((prev) =>
        prev.map((app) =>
          unseenIds.includes(app.id) ? { ...app, applicant_seen: true } : app
        )
      );
    }
  };

  // Find unseen IDs
  const unseenInboundIds = inbound
    .filter((app) => app.status === 'Pending' && !app.owner_seen)
    .map((app) => app.id);

  const unseenOutboundIds = outbound
    .filter((app) => app.status !== 'Pending' && !app.applicant_seen)
    .map((app) => app.id);

  useEffect(() => {
    if (activeTab === 'inbound') {
      if (unseenInboundIds.length > 0) {
        markInboundAsSeen(unseenInboundIds);
      }
    } else {
      if (unseenOutboundIds.length > 0) {
        markOutboundAsSeen(unseenOutboundIds);
      }
    }
  }, [activeTab, unseenInboundIds.length, unseenOutboundIds.length]);

  const handleAction = async (
    appId: string,
    newStatus: 'Approved' | 'Rejected'
  ) => {
    if (!userId) return;

    // Optimistic UI update
    setInbound((prev) =>
      prev.map((app) =>
        app.id === appId ? { ...app, status: newStatus } : app
      )
    );

    try {
      await updateApplicationStatus(supabase, appId, newStatus, userId);
    } catch (error) {
      console.error(error);
      alert('Failed to update status. Please try again.');
      const refresh = await getRequestsReceived(supabase, userId);
      setInbound(refresh);
    }
  };

  if (loading) {
    return <Loading />;
  }

  // render list items based on the active tab
  const renderListItems = (data: Dashboard[], isOutbound: boolean) => {
    if (data.length === 0) {
      return (
        <Card className="flex justify-center items-center py-12 px-4 !shadow-sm border border-gray-100">
          <p className="text-gray-400 text-mini">
            {isOutbound
              ? "You haven't submitted any applications."
              : 'No requests received yet.'}
          </p>
        </Card>
      );
    }

    return data.map((app) => (
      <Card
        key={app.id}
        className="flex flex-col sm:flex-row sm:items-center justify-between !p-4 border border-gray-100 hover:shadow-lg transition-all cursor-pointer"
      >
        <div className="flex items-center gap-4 mb-3 sm:mb-0">
          <Avatar alt={app.id} className="w-12 h-12" />

          <div>
            <h3 className="font-bold text-gray-900 text-heading">
              Application: {app.id.substring(0, 8)}
            </h3>
            <div className="flex items-center text-gray-500 text-primary mt-0.5 gap-1.5">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span>
                {isOutbound
                  ? 'Tracking project request'
                  : 'Review applicant details'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={app.status as ApplicationStatus} />

          {/* Action Buttons for Pending Inbound */}
          {!isOutbound && app.status === 'Pending' && (
            <div className="flex gap-2 mr-2">
              <Button
                variant="success"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(app.id, 'Approved');
                }}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(app.id, 'Rejected');
                }}
              >
                Reject
              </Button>
            </div>
          )}

          {/* Chevron Right Indicator */}
          <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 flex-shrink-0">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </Card>
    ));
  };

  const filteredInbound = inbound.filter((app) => {
    const query = searchQuery.toLowerCase();
    const appId = app.id.toLowerCase();
    const postTitle = app.posts?.title?.toLowerCase() || '';
    const profileName = app.profiles?.name?.toLowerCase() || '';
    const introMsg = app.intro_message?.toLowerCase() || '';
    const roles = app.selected_roles?.join(' ').toLowerCase() || '';
    return (
      appId.includes(query) ||
      postTitle.includes(query) ||
      profileName.includes(query) ||
      introMsg.includes(query) ||
      roles.includes(query)
    );
  });

  const filteredOutbound = outbound.filter((app) => {
    const query = searchQuery.toLowerCase();
    const appId = app.id.toLowerCase();
    const postTitle = app.posts?.title?.toLowerCase() || '';
    const spaceName = app.posts?.spaces?.name?.toLowerCase() || '';
    return (
      appId.includes(query) ||
      postTitle.includes(query) ||
      spaceName.includes(query)
    );
  });

  return (
    <PageWrapper
      title="Dashboard"
      subtitle="Manage your team applications and incoming requests."
    >
      {/* Search Bar */}
      <div className="mb-6 w-full md:max-w-sm md:ml-auto">
        <SearchBar
          placeholder="Search applications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Custom Pill Tabs */}
      <div className="flex space-x-2 mb-6">
        <Button
          variant={activeTab === 'inbound' ? 'tab-active' : 'tab-inactive'}
          onClick={() => setActiveTab('inbound')}
        >
          <span className="flex items-center gap-1.5">
            Requests Received
            {unseenInboundIds.length > 0 && (
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-xs inline-block"></span>
            )}
          </span>
        </Button>

        <Button
          variant={activeTab === 'outbound' ? 'tab-active' : 'tab-inactive'}
          onClick={() => setActiveTab('outbound')}
        >
          <span className="flex items-center gap-1.5">
            My Applications
            {unseenOutboundIds.length > 0 && (
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-xs inline-block"></span>
            )}
          </span>
        </Button>
      </div>

      {/* LIST CONTENT */}
      <div className="flex flex-col gap-3">
        {activeTab === 'inbound'
          ? renderListItems(filteredInbound, false)
          : renderListItems(filteredOutbound, true)}
      </div>
    </PageWrapper>
  );
}
