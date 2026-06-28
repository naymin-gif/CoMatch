'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../utils/clients';
import {
  Globe,
  Settings,
  Users,
  MessageSquare,
  Plus,
  Clock,
  FileText,
  ExternalLink,
  ChevronRight,
  Info,
  ArrowLeft,
  Camera,
  Save,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

// Import shared UI components
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';

interface Space {
  id: string;
  name: string;
  description: string;
  external_link: string | null;
  icon_url: string | null;
  owner_id: string;
  created_at: string;
  last_edited_at: string;
}

interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  roles: string | null;
}

interface Post {
  id: string;
  title: string;
  description: string;
  open_roles: string[];
  commitment_level: string;
  total_members_required: number;
  created_at: string;
  owner: {
    name: string;
    avatar_url: string | null;
  };
}

export default function SpaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: spaceId } = use(params);
  const supabase = createClient();

  const [space, setSpace] = useState<Space | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<Profile | null>(null);
  const [members, setMembers] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  
  // Tabs & Editing State
  const [activeTab, setActiveTab] = useState<
    'calls' | 'members' | 'resources' | 'settings'
  >('calls');
  const [isEditing, setIsEditing] = useState(false);
  const [editDesc, setEditDesc] = useState('');
  const [editLink, setEditLink] = useState('');
  const [editIconFile, setEditIconFile] = useState<File | null>(null);
  const [editIconPreview, setEditIconPreview] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loadSpaceData = async () => {
      try {
        setIsLoading(true);
        setErrorMsg('');

        // 1. Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setCurrentUser(user);

        // 2. Fetch space details
        const { data: spaceData, error: spaceError } = await supabase
          .from('spaces')
          .select('*')
          .eq('id', spaceId)
          .maybeSingle();

        if (spaceError) throw spaceError;
        if (!spaceData) {
          setErrorMsg('Space not found.');
          setIsLoading(false);
          return;
        }

        setSpace(spaceData);
        setEditDesc(spaceData.description);
        setEditLink(spaceData.external_link || '');
        setEditIconPreview(spaceData.icon_url || null);

        // 3. Fetch owner profile
        const { data: ownerData } = await supabase
          .from('profiles')
          .select('id, name, email, avatar_url, roles')
          .eq('id', spaceData.owner_id)
          .maybeSingle();

        if (ownerData) setOwnerProfile(ownerData);

        // 4. Fetch space posts (teammate calls)
        const { data: postsData } = await supabase
          .from('posts')
          .select(
            `
            id, title, description, open_roles, commitment_level, total_members_required, created_at, owner_id
          `
          )
          .eq('space_id', spaceId)
          .order('created_at', { ascending: false });

        if (postsData) {
          // Fetch profiles for these posts
          const postsWithProfiles = await Promise.all(
            postsData.map(async (post: any) => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('name, avatar_url')
                .eq('id', post.owner_id)
                .maybeSingle();
              return {
                ...post,
                owner: {
                  name: profile?.name || 'Unknown User',
                  avatar_url: profile?.avatar_url || null,
                },
              };
            })
          );
          setPosts(postsWithProfiles);
        }

        // 5. Fetch members from space_members
        const { data: membersData, error: membersError } = await supabase
          .from('space_members')
          .select('profile_id')
          .eq('space_id', spaceId);

        if (membersError) throw membersError;

        const memberList: Profile[] = [];
        let userIsMember = false;

        if (membersData && membersData.length > 0) {
          const profileIds = membersData.map(m => m.profile_id);
          if (user) {
            userIsMember = profileIds.includes(user.id);
          }

          const { data: profileList } = await supabase
            .from('profiles')
            .select('id, name, email, avatar_url, roles')
            .in('id', profileIds);

          if (profileList) {
            memberList.push(...profileList);
          }
        } else {
          // Fallback if membership table is empty for this space
          if (ownerData) {
            memberList.push(ownerData);
          }
          if (user && spaceData.owner_id === user.id) {
            userIsMember = true;
          }
        }

        setMembers(memberList);
        setIsJoined(userIsMember || spaceData.owner_id === (user?.id || ''));

      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || 'Error loading space data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSpaceData();
  }, [spaceId, supabase]);

  const handleJoinSpace = async () => {
    if (!currentUser || !space) return;

    try {
      const { error } = await supabase
        .from('space_members')
        .insert({
          space_id: spaceId,
          profile_id: currentUser.id
        });

      if (error) throw error;

      toast.success(`Joined ${space.name} successfully!`);
      setIsJoined(true);

      // Add currentUser profile to the local member list
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url, roles')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (userProfile) {
        setMembers(prev => [...prev, userProfile]);
      }
    } catch (err: any) {
      console.error('Error joining space:', err);
      toast.error('Failed to join space: ' + err.message);
    }
  };

  const handleLeaveSpace = async () => {
    if (!currentUser || !space) return;

    try {
      const { error } = await supabase
        .from('space_members')
        .delete()
        .eq('space_id', spaceId)
        .eq('profile_id', currentUser.id);

      if (error) throw error;

      toast.success(`Left ${space.name}.`);
      setIsJoined(false);

      // Remove currentUser from the local member list
      setMembers(prev => prev.filter(m => m.id !== currentUser.id));
    } catch (err: any) {
      console.error('Error leaving space:', err);
      toast.error('Failed to leave space: ' + err.message);
    }
  };

  const handleUpdateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!space || !currentUser || currentUser.id !== space.owner_id) return;

    setIsSaving(true);
    try {
      let iconUrl = space.icon_url;

      // Upload new icon file if selected
      if (editIconFile) {
        const fileExt = editIconFile.name.split('.').pop();
        const fileName = `spaces/space-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, editIconFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        iconUrl = data.publicUrl;
      }

      const { data, error } = await supabase
        .from('spaces')
        .update({
          description: editDesc.trim(),
          external_link: editLink.trim() || null,
          icon_url: iconUrl,
          last_edited_at: new Date().toISOString(),
        })
        .eq('id', spaceId)
        .select()
        .single();

      if (error) throw error;

      setSpace(data);
      setEditIconFile(null); // Reset selected file state after saving
      setEditIconPreview(data.icon_url || null);
      setIsEditing(false);
    } catch (err: any) {
      alert('Failed to update space: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin h-10 w-10 text-blue-900"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-gray-500 font-medium">Loading Space...</span>
        </div>
      </div>
    );
  }

  if (errorMsg || !space) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md text-center bg-white p-8 rounded-2xl border border-gray-200 shadow-md">
          <Info size={48} className="mx-auto text-rose-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-500 mb-6">
            {errorMsg || 'Could not fetch space details.'}
          </p>
          <Link
            href="/"
            className="px-6 py-2 bg-blue-900 text-white rounded-full text-sm font-semibold hover:bg-blue-800 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = currentUser?.id === space.owner_id;
  const prettyJoinDate = new Date(space.created_at).toLocaleDateString(
    'en-US',
    {
      month: 'long',
      year: 'numeric',
    }
  );

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      {/* Banner / Cover */}
      <div className="h-60 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 w-full shadow-inner relative">
        <div className="absolute top-6 left-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-mini font-primary font-semibold rounded-full border border-white/10 transition"
          >
            <ArrowLeft size={14} />
            Dashboard
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Space Header Info */}
          <div className="p-8 border-b border-gray-100 bg-white/50 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
              <div className="flex items-center gap-5">
                {/* Space Icon (replaces custom div with Avatar UI component) */}
                <Avatar
                  src={space.icon_url || undefined}
                  alt={space.name}
                  size="xl"
                  className="border-2 border-white shadow-md !rounded-2xl"
                />
                <div>
                  <h1 className="text-heading-lg font-extrabold font-heading text-gray-900 tracking-tight">
                    {space.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-mini font-primary text-gray-500 mt-1.5">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      Created {prettyJoinDate}
                    </span>
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                    <span className="font-semibold text-comatch-primary font-primary">
                      Owner: {ownerProfile?.name || 'Administrator'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {currentUser && (
                  <div>
                    {isOwner ? (
                      <span className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-100 text-slate-500 font-bold text-mini font-primary rounded-xl border border-slate-200 select-none shadow-sm">
                        Owner
                      </span>
                    ) : isJoined ? (
                      <Button
                        variant="outline"
                        className="px-5! py-2.5! text-mini font-bold border-red-200! text-red-500! hover:bg-red-50! hover:border-red-300!"
                        onClick={handleLeaveSpace}
                      >
                        Leave Space
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        className="px-5! py-2.5! text-mini font-bold"
                        onClick={handleJoinSpace}
                      >
                        Join Space
                      </Button>
                    )}
                  </div>
                )}

                {space.external_link && (
                  <a 
                    href={space.external_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-comatch-primary hover:bg-blue-100 font-bold text-mini font-primary rounded-xl border border-blue-100 shadow-sm transition"
                  >
                    <Globe size={16} />
                    Visit Official Website
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Tab Navigation & Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Sidebar / Left Column Tabs */}
            <aside className="lg:col-span-3 border-r border-gray-100 p-6 bg-slate-50/40">
              <nav className="flex flex-col gap-1">
                <button
                  onClick={() => {
                    setActiveTab('calls');
                    setIsEditing(false);
                  }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-mini font-primary transition ${
                    activeTab === 'calls'
                      ? 'bg-blue-100/50 text-comatch-primary shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <MessageSquare size={18} />
                    Teammate Calls
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded-md text-mini font-primary border border-gray-200 font-semibold">
                    {posts.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('members');
                    setIsEditing(false);
                  }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-mini font-primary transition ${
                    activeTab === 'members'
                      ? 'bg-blue-100/50 text-comatch-primary shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Users size={18} />
                    Members
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded-md text-mini font-primary border border-gray-200 font-semibold">
                    {members.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('resources');
                    setIsEditing(false);
                  }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-mini font-primary transition ${
                    activeTab === 'resources'
                      ? 'bg-blue-100/50 text-comatch-primary shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <FileText size={18} />
                    Resources
                  </span>
                </button>

                {isOwner && (
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                    }}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-mini font-primary transition ${
                      activeTab === 'settings'
                        ? 'bg-blue-100/50 text-comatch-primary shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Settings size={18} />
                      Settings
                    </span>
                  </button>
                )}
              </nav>
            </aside>

            {/* Content Display / Right Column */}
            <section className="lg:col-span-9 p-8 sm:p-10 min-h-[500px]">
              {/* Tab 1: Teammate Calls */}
              {activeTab === 'calls' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-4 border-gray-100">
                    <div>
                      <h2 className="text-heading font-heading font-extrabold text-gray-900">
                        Teammate Calls
                      </h2>
                      <p className="text-mini font-primary text-gray-500">
                        Discover or publish recruitment postings for this space.
                      </p>
                    </div>
                    <Link
                      href={`/spaces/${spaceId}/posts/new`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-comatch-primary hover:opacity-90 text-white font-bold text-mini font-primary rounded-xl shadow transition"
                    >
                      <Plus size={14} />
                      Post Teammate Call
                    </Link>
                  </div>

                  {posts.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                      <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <h3 className="text-primary font-heading font-bold text-gray-700">
                        No active calls yet
                      </h3>
                      <p className="text-mini font-primary text-gray-400 max-w-sm mx-auto mt-1">
                        Be the first to post a recruitment call and form a team
                        for this project/module!
                      </p>
                      <Link
                        href={`/spaces/${spaceId}/posts/new`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-comatch-primary hover:opacity-90 text-white font-bold text-mini font-primary rounded-xl shadow transition mt-4"
                      >
                        <Plus size={14} />
                        Post Call
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-5">
                      {posts.map((post) => (
                        /* Post Card (replaces custom card div with Card UI component) */
                        <Card
                          key={post.id}
                          className="border border-gray-100 hover:shadow-md hover:border-comatch-light transition duration-300 flex flex-col justify-between p-6"
                        >
                          <div>
                            <div className="flex items-center gap-3 mb-4">
                              {/* Post Author Avatar (replaces custom profile picture div with Avatar UI component) */}
                              <Avatar
                                src={post.owner.avatar_url || undefined}
                                alt={post.owner.name}
                                size="sm"
                              />
                              <div>
                                <h4 className="text-mini font-primary font-semibold text-gray-900">
                                  {post.owner.name}
                                </h4>
                                <span className="text-mini font-primary text-gray-400 flex items-center gap-1">
                                  <Clock size={10} />
                                  {new Date(
                                    post.created_at
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            <h3 className="text-heading font-heading font-bold text-gray-900 mb-2">
                              {post.title}
                            </h3>
                            <p className="text-primary font-primary text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                              {post.description}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2 border-t pt-4 border-gray-5 mt-2 items-center">
                            {post.open_roles.map((role, idx) => (
                              /* Open Roles Badges (replaces custom spans with Badge UI component) */
                              <Badge key={idx} variant="light">
                                {role}
                              </Badge>
                            ))}

                            {/* Commitment Badge (replaces custom span with Badge UI component) */}
                            <Badge variant="outline" className="ml-auto">
                              Commitment: {post.commitment_level}
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Members */}
              {activeTab === 'members' && (
                <div className="space-y-6">
                  <div className="border-b pb-4 border-gray-100">
                    <h2 className="text-heading font-heading font-extrabold text-gray-900">
                      Space Members
                    </h2>
                    <p className="text-mini font-primary text-gray-500">
                      People collaborating within this space.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center justify-between hover:border-gray-200 transition"
                      >
                        <div className="flex items-center gap-3">
                          {/* Member Avatar (replaces custom div with Avatar UI component) */}
                          <Avatar
                            src={member.avatar_url || undefined}
                            alt={member.name}
                            size="md"
                            className="border"
                          />
                          <div>
                            <h4 className="text-primary font-primary font-bold text-gray-900">
                              {member.name}
                            </h4>
                            <p className="text-mini font-primary text-gray-400">
                              {member.roles || 'Developer'}
                            </p>
                          </div>
                        </div>
                        {currentUser?.id !== member.id && (
                          /* Chat Button (replaces custom button with Button UI component in outline variant) */
                          <Button
                            variant="outline"
                            onClick={() =>
                              router.push(`/chat?user=${member.id}`)
                            }
                            className="!px-3 !py-2 hover:bg-blue-50 text-gray-600 hover:text-comatch-primary border-gray-200 hover:border-comatch-light shadow-sm"
                            title="Chat with user"
                          >
                            <MessageSquare size={16} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Resources */}
              {activeTab === 'resources' && (
                <div className="space-y-6">
                  <div className="border-b pb-4 border-gray-100">
                    <h2 className="text-heading font-heading font-extrabold text-gray-900">
                      Resources
                    </h2>
                    <p className="text-mini font-primary text-gray-500">
                      Official links and documentation.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* About Card (replaces custom container div with Card UI component) */}
                    <Card className="border border-gray-100 p-5 shadow-sm">
                      <h3 className="text-heading font-heading font-bold text-gray-800 mb-1.5 flex items-center gap-2">
                        <Info size={18} className="text-comatch-primary" />
                        About {space.name}
                      </h3>
                      <p className="text-primary font-primary text-gray-600 leading-relaxed mb-4">
                        {space.description}
                      </p>

                      {space.external_link ? (
                        <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white rounded-lg text-comatch-primary shadow-sm border border-slate-200/50">
                              <Globe size={18} />
                            </div>
                            <div>
                              <h4 className="text-mini font-primary font-bold text-gray-800">
                                Official Web Resource
                              </h4>
                              <p className="text-mini font-primary text-gray-400 line-clamp-1 max-w-sm sm:max-w-md">
                                {space.external_link}
                              </p>
                            </div>
                          </div>
                          <a
                            href={space.external_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-white rounded-lg border border-slate-200 text-gray-600 hover:text-comatch-primary hover:border-blue-100 transition shadow-sm"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">
                          No external links attached to this space.
                        </p>
                      )}
                    </Card>
                  </div>
                </div>
              )}

              {/* Tab 4: Settings (Owner Only) */}
              {activeTab === 'settings' && isOwner && (
                <div className="space-y-6">
                  <div className="border-b pb-4 border-gray-100">
                    <h2 className="text-heading font-heading font-extrabold text-gray-900">
                      Space Settings
                    </h2>
                    <p className="text-mini font-primary text-gray-500">
                      Manage description and external resources.
                    </p>
                  </div>

                  <form onSubmit={handleUpdateSpace} className="space-y-5">
                    {/* Space Icon Edit (replaces custom preview div with Avatar UI component) */}
                    <div className="flex flex-col items-center sm:items-start mb-6">
                      <label className="block text-mini font-primary font-semibold text-gray-700 mb-2">
                        Space Icon
                      </label>
                      <div className="relative group">
                        <Avatar
                          src={editIconPreview || undefined}
                          alt={space.name}
                          size="lg"
                          className="!rounded-2xl border border-gray-200 shadow-inner"
                        />
                        <label className="absolute -bottom-1 -right-1 bg-comatch-primary hover:opacity-90 text-white p-1.5 rounded-full cursor-pointer shadow hover:scale-105 transition">
                          <Camera size={14} />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                const file = e.target.files[0];
                                setEditIconFile(file);
                                setEditIconPreview(URL.createObjectURL(file));
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Space Name (replaces custom input with Input UI component) */}
                    <div className="space-y-1">
                      <Input
                        type="text"
                        label="Space Name"
                        value={space.name}
                        disabled
                        className="cursor-not-allowed"
                      />
                      <span className="text-mini font-primary text-gray-400 block px-1">
                        To maintain integrity, the space name cannot be changed
                        after creation.
                      </span>
                    </div>

                    {/* Description (replaces custom textarea with Textarea UI component) */}
                    <Textarea
                      label="Description"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      rows={4}
                      placeholder="Space description..."
                      required
                      className="resize-none"
                    />

                    {/* External Link (replaces custom input with Input UI component) */}
                    <Input
                      type="url"
                      label="External Resource Link"
                      value={editLink}
                      onChange={(e) => setEditLink(e.target.value)}
                      placeholder="https://example.com"
                    />

                    {/* Submit settings (replaces custom button with Button UI component) */}
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 shadow"
                    >
                      {isSaving ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>Save Changes</span>
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
