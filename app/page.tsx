'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../utils/clients';
import Loading from './loading';
import { Plus, LayoutGrid, Users, ChevronRight, PlusCircle } from 'lucide-react';
import PageWrapper from '@/components/ui/PageWrapper';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SearchBar from '@/components/ui/SearchBar';
import Avatar from '@/components/ui/Avatar';

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
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  useEffect(() => {
    const checkSessionAndLoadData = async () => {
      try {
        setLoading(true);
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
        setLoading(false);
      }
    };

    checkSessionAndLoadData();
  }, [router, supabase]);

  // Filter spaces based on search query
  const filteredSpaces = spaces.filter(space => 
    space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    space.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
      return <Loading />;
    }

  return (
    <PageWrapper
      title="My Spaces"
      subtitle="Select a workspace hub to find your dream team."
      headerAction={
        <Button
          onClick={() => router.push('/spaces/new')}
          className="flex items-center gap-2 justify-center shadow-md"
        >
          <Plus size={18} />
          New Space
        </Button>
      }
    >
      {/* Search Bar */}
      <div className="mb-6 w-full md:max-w-sm md:ml-auto">
        <SearchBar
          placeholder="Search a space..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Spaces Directory */}
      {filteredSpaces.length === 0 ? (
        <Card className="text-center py-20 bg-white border border-gray-100 p-8 shadow-sm">
          <LayoutGrid className="w-16 h-16 mx-auto text-gray-300 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-gray-800">No spaces found</h3>
          <p className="text-sm text-gray-400 max-w-sm mx-auto mt-1 mb-6">
            {searchQuery 
              ? "Try searching for a different keyword or create a new space." 
              : "Get started by creating your very first space!"}
          </p>
          
          <Button
            onClick={() => router.push('/spaces/new')}
            className="inline-flex items-center gap-2"
          >
            <PlusCircle size={14} />
            Create Space
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSpaces.map((space) => (
            <Card 
              key={space.id} 
              onClick={() => router.push(`/spaces/${space.id}`)}
              className="hover:shadow-md hover:border-comatch-light transition duration-300 flex items-center justify-between cursor-pointer group p-5 border border-gray-100"
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Space Icon */}
                <Avatar
                  src={space.icon_url || undefined}
                  alt={space.name}
                  size="lg"
                  className="group-hover:scale-105 transition duration-300"
                />
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-gray-900 group-hover:text-comatch-primary transition truncate">{space.name}</h2>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5 font-medium">
                    <Users size={12} />
                    {space.memberCount} {space.memberCount === 1 ? 'member' : 'members'}
                  </p>
                </div>
              </div>

              <div className="p-2 bg-slate-50 group-hover:bg-blue-50 text-gray-400 group-hover:text-comatch-primary rounded-xl border border-gray-100 group-hover:border-comatch-light transition shadow-inner">
                <ChevronRight size={18} className="group-hover:translate-x-0.5 transition duration-300" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}