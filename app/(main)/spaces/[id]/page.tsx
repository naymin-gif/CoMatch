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
  Edit, 
  Save, 
  Clock, 
  FileText, 
  ExternalLink,
  ChevronRight,
  Info,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

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

export default function SpaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: spaceId } = use(params);
  const supabase = createClient();

  const [space, setSpace] = useState<Space | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<Profile | null>(null);
  const [members, setMembers] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  
  // Tabs & Editing State
  const [activeTab, setActiveTab] = useState<'calls' | 'members' | 'resources' | 'settings'>('calls');
  const [isEditing, setIsEditing] = useState(false);
  const [editDesc, setEditDesc] = useState('');
  const [editLink, setEditLink] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loadSpaceData = async () => {
      try {
        setIsLoading(true);
        setErrorMsg('');

        // 1. Get current user
        const { data: { user } } = await supabase.auth.getUser();
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
          .select(`
            id, title, description, open_roles, commitment_level, total_members_required, created_at, owner_id
          `)
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
                }
              };
            })
          );
          setPosts(postsWithProfiles);
        }

        // 5. Fetch members (defined as Owner + any Approved Applicants)
        const memberList: Profile[] = [];
        if (ownerData) {
          memberList.push(ownerData);
        }

        // Fetch approved applications for posts in this space
        const { data: approvedApps } = await supabase
          .from('applications')
          .select('applicant_id, status')
          .eq('status', 'Approved');

        // Filter applications that belong to posts in this space
        if (approvedApps && postsData && postsData.length > 0) {
          const postIds = postsData.map(p => p.id);
          const { data: appsInSpace } = await supabase
            .from('applications')
            .select('applicant_id')
            .in('post_id', postIds)
            .eq('status', 'Approved');

          if (appsInSpace) {
            const uniqueApplicantIds = Array.from(new Set(appsInSpace.map(a => a.applicant_id)));
            // Filter out the owner if they applied to their own post (edge case)
            const peerIds = uniqueApplicantIds.filter(id => id !== spaceData.owner_id);

            if (peerIds.length > 0) {
              const { data: peerProfiles } = await supabase
                .from('profiles')
                .select('id, name, email, avatar_url, roles')
                .in('id', peerIds);

              if (peerProfiles) {
                memberList.push(...peerProfiles);
              }
            }
          }
        }
        setMembers(memberList);

      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || 'Error loading space data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSpaceData();
  }, [spaceId, supabase]);

  const handleUpdateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!space || !currentUser || currentUser.id !== space.owner_id) return;

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('spaces')
        .update({
          description: editDesc.trim(),
          external_link: editLink.trim() || null,
          last_edited_at: new Date().toISOString()
        })
        .eq('id', spaceId)
        .select()
        .single();

      if (error) throw error;
      
      setSpace(data);
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
          <svg className="animate-spin h-10 w-10 text-blue-900" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-6">{errorMsg || 'Could not fetch space details.'}</p>
          <Link href="/" className="px-6 py-2 bg-blue-900 text-white rounded-full text-sm font-semibold hover:bg-blue-800 transition">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = currentUser?.id === space.owner_id;
  const prettyJoinDate = new Date(space.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      
      {/* Banner / Cover */}
      <div className="h-60 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 w-full shadow-inner relative">
        <div className="absolute top-6 left-6">
          <Link href="/" className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-sm font-semibold rounded-full border border-white/10 transition">
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
                <div className="w-20 h-20 bg-gradient-to-tr from-slate-100 to-slate-200 border-2 border-white shadow-md rounded-2xl overflow-hidden shrink-0 flex items-center justify-center text-gray-700 text-3xl font-extrabold">
                  {space.icon_url ? (
                    <img src={space.icon_url} alt={space.name} className="w-full h-full object-cover" />
                  ) : (
                    space.name.charAt(0)
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{space.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1.5">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      Created {prettyJoinDate}
                    </span>
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                    <span className="font-semibold text-blue-600">Owner: {ownerProfile?.name || 'Administrator'}</span>
                  </div>
                </div>
              </div>

              {space.external_link && (
                <a 
                  href={space.external_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-sm rounded-xl border border-blue-100 shadow-sm transition"
                >
                  <Globe size={16} />
                  Visit Official Website
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>

          {/* Tab Navigation & Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Sidebar / Left Column Tabs */}
            <aside className="lg:col-span-3 border-r border-gray-100 p-6 bg-slate-50/40">
              <nav className="flex flex-col gap-1">
                <button
                  onClick={() => { setActiveTab('calls'); setIsEditing(false); }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition ${
                    activeTab === 'calls' 
                      ? 'bg-blue-100/50 text-blue-700 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <MessageSquare size={18} />
                    Teammate Calls
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded-md text-xs border border-gray-200 font-semibold">{posts.length}</span>
                </button>

                <button
                  onClick={() => { setActiveTab('members'); setIsEditing(false); }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition ${
                    activeTab === 'members' 
                      ? 'bg-blue-100/50 text-blue-700 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Users size={18} />
                    Members
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded-md text-xs border border-gray-200 font-semibold">{members.length}</span>
                </button>

                <button
                  onClick={() => { setActiveTab('resources'); setIsEditing(false); }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition ${
                    activeTab === 'resources' 
                      ? 'bg-blue-100/50 text-blue-700 shadow-sm' 
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
                    onClick={() => { setActiveTab('settings'); }}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition ${
                      activeTab === 'settings' 
                        ? 'bg-blue-100/50 text-blue-700 shadow-sm' 
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
                      <h2 className="text-xl font-bold text-gray-900">Teammate Calls</h2>
                      <p className="text-xs text-gray-500">Discover or publish recruitment postings for this space.</p>
                    </div>
                    <Link
                      href={`/spaces/${spaceId}/posts/new`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow transition"
                    >
                      <Plus size={14} />
                      Post Teammate Call
                    </Link>
                  </div>

                  {posts.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                      <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <h3 className="text-base font-bold text-gray-700">No active calls yet</h3>
                      <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                        Be the first to post a recruitment call and form a team for this project/module!
                      </p>
                      <Link
                        href={`/spaces/${spaceId}/posts/new`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow transition mt-4"
                      >
                        <Plus size={14} />
                        Post Call
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-5">
                      {posts.map((post) => (
                        <div key={post.id} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-100 transition duration-300 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 text-sm font-extrabold overflow-hidden">
                                {post.owner.avatar_url ? (
                                  <img src={post.owner.avatar_url} alt={post.owner.name} className="w-full h-full object-cover" />
                                ) : (
                                  post.owner.name.charAt(0)
                                )}
                              </div>
                              <div>
                                <h4 className="text-xs font-semibold text-gray-900">{post.owner.name}</h4>
                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                  <Clock size={10} />
                                  {new Date(post.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">{post.description}</p>
                          </div>

                          <div className="flex flex-wrap gap-2 border-t pt-4 border-gray-50 mt-2">
                            {post.open_roles.map((role, idx) => (
                              <span key={idx} className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold text-[10px] rounded-lg border border-blue-100/50">
                                {role}
                              </span>
                            ))}
                            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 font-bold text-[10px] rounded-lg border border-purple-100/50 ml-auto">
                              Commitment: {post.commitment_level}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Members */}
              {activeTab === 'members' && (
                <div className="space-y-6">
                  <div className="border-b pb-4 border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Space Members</h2>
                    <p className="text-xs text-gray-500">People collaborating within this space.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {members.map((member) => (
                      <div key={member.id} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center justify-between hover:border-gray-200 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-800 text-base font-extrabold overflow-hidden border">
                            {member.avatar_url ? (
                              <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                              member.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900">{member.name}</h4>
                            <p className="text-[10px] text-gray-400">{member.roles || 'Developer'}</p>
                          </div>
                        </div>
                        {currentUser?.id !== member.id && (
                          <button
                            onClick={() => router.push(`/chat?user=${member.id}`)}
                            className="p-2 bg-slate-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-lg border border-gray-200 hover:border-blue-100 shadow-sm transition"
                            title="Chat with user"
                          >
                            <MessageSquare size={16} />
                          </button>
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
                    <h2 className="text-xl font-bold text-gray-900">Resources</h2>
                    <p className="text-xs text-gray-500">Official links and documentation.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                      <h3 className="text-base font-bold text-gray-800 mb-1.5 flex items-center gap-2">
                        <Info size={18} className="text-blue-600" />
                        About {space.name}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed mb-4">{space.description}</p>
                      
                      {space.external_link ? (
                        <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white rounded-lg text-blue-600 shadow-sm border border-slate-200/50">
                              <Globe size={18} />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-gray-800">Official Web Resource</h4>
                              <p className="text-[10px] text-gray-400 line-clamp-1 max-w-sm sm:max-w-md">{space.external_link}</p>
                            </div>
                          </div>
                          <a 
                            href={space.external_link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-2 hover:bg-white rounded-lg border border-slate-200 text-gray-600 hover:text-blue-600 hover:border-blue-100 transition shadow-sm"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">No external links attached to this space.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Settings (Owner Only) */}
              {activeTab === 'settings' && isOwner && (
                <div className="space-y-6">
                  <div className="border-b pb-4 border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Space Settings</h2>
                    <p className="text-xs text-gray-500">Manage description and external resources.</p>
                  </div>

                  <form onSubmit={handleUpdateSpace} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Space Name</label>
                      <input 
                        type="text" 
                        value={space.name} 
                        className="w-full px-4 py-2.5 bg-gray-100 text-gray-500 border border-gray-200 rounded-xl cursor-not-allowed focus:outline-none" 
                        disabled 
                      />
                      <span className="text-[10px] text-gray-400 mt-1 block">To maintain integrity, the space name cannot be changed after creation.</span>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                      <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none text-gray-900 placeholder-gray-400 resize-none transition"
                        placeholder="Space description..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">External Resource Link</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-4 text-gray-400">
                          <Globe size={16} />
                        </span>
                        <input
                          type="url"
                          value={editLink}
                          onChange={(e) => setEditLink(e.target.value)}
                          className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none text-gray-900 placeholder-gray-400 transition"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full sm:w-auto px-6 py-2.5 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-400 text-white rounded-xl font-bold transition flex items-center justify-center gap-1.5 shadow"
                    >
                      {isSaving ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
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
