'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../utils/clients';
import { Search, Plus, LayoutGrid, Users, ChevronRight, MessageSquare, PlusCircle } from 'lucide-react';
import Link from 'next/link';

interface Space {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
  owner_id: string;
  created_at: string;
}

interface SpaceWithMemberCount extends Space {
  memberCount: number;
}

export default function Home() {
  const router = useRouter();
  const supabase = createClient();

  const [spaces, setSpaces] = useState<SpaceWithMemberCount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  useEffect(() => {
    const checkSessionAndLoadData = async () => {
      try {
        setIsLoading(true);
        // 1. Get logged in user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          router.push('/login');
          return;
        }
        setCurrentUser(user);

        // 2. Fetch all spaces
        const { data: spacesData, error: spacesError } = await supabase
          .from('spaces')
          .select('*')
          .order('created_at', { ascending: false });

        if (spacesError) throw spacesError;

        if (spacesData && spacesData.length > 0) {
          // 3. Fetch all posts to map post_id -> space_id
          const { data: postsData } = await supabase
            .from('posts')
            .select('id, space_id');

          const postToSpaceMap: Record<string, string> = {};
          if (postsData) {
            postsData.forEach(p => {
              postToSpaceMap[p.id] = p.space_id;
            });
          }

          // 4. Fetch approved applications to count unique members per space
          const { data: appsData } = await supabase
            .from('applications')
            .select('post_id, applicant_id, status')
            .eq('status', 'Approved');

          const spaceMembersMap: Record<string, Set<string>> = {};
          if (appsData) {
            appsData.forEach(app => {
              const spaceId = postToSpaceMap[app.post_id];
              if (spaceId) {
                if (!spaceMembersMap[spaceId]) {
                  spaceMembersMap[spaceId] = new Set();
                }
                spaceMembersMap[spaceId].add(app.applicant_id);
              }
            });
          }

          // 5. Build spaces listing with member counts
          const processedSpaces = spacesData.map((space: Space) => {
            const uniqueApprovedPeers = spaceMembersMap[space.id]?.size || 0;
            // Total members = unique approved peers + 1 (the space owner)
            const totalMembers = uniqueApprovedPeers + 1;
            return {
              ...space,
              memberCount: totalMembers
            };
          });

          setSpaces(processedSpaces);
        } else {
          setSpaces([]);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSessionAndLoadData();
  }, [router, supabase]);

  // Filter spaces based on search query
  const filteredSpaces = spaces.filter(space => 
    space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    space.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-10 w-10 text-blue-900" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-gray-500 font-medium">Loading spaces...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-28 pt-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Spaces</h1>
            <p className="text-sm text-gray-500 mt-1">Select a workspace hub to find your dream team.</p>
          </div>
          <Link
            href="/spaces/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md transition hover:scale-102"
          >
            <Plus size={18} />
            New Space
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">
            <Search size={20} />
          </span>
          <input
            type="text"
            placeholder="Search a space..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 placeholder-gray-400 transition"
          />
        </div>

        {/* Spaces Directory */}
        {filteredSpaces.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <LayoutGrid className="w-16 h-16 mx-auto text-gray-300 mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-gray-800">No spaces found</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto mt-1">
              {searchQuery 
                ? "Try searching for a different keyword or create a new space." 
                : "Get started by creating your very first space!"}
            </p>
            <Link
              href="/spaces/new"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow mt-6 transition"
            >
              <PlusCircle size={14} />
              Create Space
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredSpaces.map((space) => (
              <div 
                key={space.id} 
                onClick={() => router.push(`/spaces/${space.id}`)}
                className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition duration-300 flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 bg-gradient-to-tr from-slate-50 to-slate-100 border rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-gray-700 text-xl font-extrabold group-hover:scale-105 transition duration-300">
                    {space.icon_url ? (
                      <img src={space.icon_url} alt={space.name} className="w-full h-full object-cover" />
                    ) : (
                      space.name.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-900 transition truncate">{space.name}</h2>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5 font-medium">
                      <Users size={12} />
                      {space.memberCount} {space.memberCount === 1 ? 'member' : 'members'}
                    </p>
                  </div>
                </div>

                <div className="p-2 bg-slate-50 group-hover:bg-blue-50 text-gray-400 group-hover:text-blue-600 rounded-xl border border-gray-100 group-hover:border-blue-100 transition shadow-inner">
                  <ChevronRight size={18} className="group-hover:translate-x-0.5 transition duration-300" />
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}