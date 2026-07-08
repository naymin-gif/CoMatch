'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../utils/clients';
import Loading from './loading';
import {
  Plus,
  LayoutGrid,
  Users,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';
import PageWrapper from '@/components/old-ui/PageWrapper';
import Card from '@/components/old-ui/Card';
import Button from '@/components/old-ui/Button';
import SearchBar from '@/components/old-ui/SearchBar';
import Avatar from '@/components/old-ui/Avatar';
import toast from 'react-hot-toast';

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
  isJoined: boolean;
  isOwner: boolean;
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
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
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

        // 3. Fetch all space members
        const { data: membersData, error: membersError } = await supabase
          .from('space_members')
          .select('space_id, profile_id');

        if (membersError) throw membersError;

        // 4. Map space memberships
        const spaceMembersMap: Record<string, Set<string>> = {};
        if (membersData) {
          membersData.forEach(member => {
            if (!spaceMembersMap[member.space_id]) {
              spaceMembersMap[member.space_id] = new Set();
            }
            spaceMembersMap[member.space_id].add(member.profile_id);
          });
        }

        // 5. Build spaces listing with member counts
        const processedSpaces = (spacesData || []).map((space: Space) => {
          const membersSet = spaceMembersMap[space.id] || new Set();
          const isJoined = membersSet.has(user.id);
          const isOwner = space.owner_id === user.id;

          return {
            ...space,
            memberCount: Math.max(membersSet.size, 1), // Fallback to 1 (creator) if membership table doesn't have rows
            isJoined: isJoined || isOwner, // Owner is always joined
            isOwner
          };
        });

        setSpaces(processedSpaces);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSessionAndLoadData();
  }, [router, supabase]);

  const handleJoinSpace = async (spaceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;

    const spaceName = spaces.find(s => s.id === spaceId)?.name || 'space';

    try {
      const { error } = await supabase
        .from('space_members')
        .insert({
          space_id: spaceId,
          profile_id: currentUser.id
        });

      if (error) throw error;

      toast.success(`Joined ${spaceName} successfully!`);

      // Update state locally
      setSpaces(prevSpaces => 
        prevSpaces.map(space => 
          space.id === spaceId 
            ? { ...space, isJoined: true, memberCount: space.memberCount + 1 }
            : space
        )
      );
    } catch (err: any) {
      console.error('Error joining space:', err);
      toast.error('Could not join space: ' + err.message);
    }
  };

  const handleLeaveSpace = async (spaceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;

    const spaceName = spaces.find(s => s.id === spaceId)?.name || 'space';

    try {
      const { error } = await supabase
        .from('space_members')
        .delete()
        .eq('space_id', spaceId)
        .eq('profile_id', currentUser.id);

      if (error) throw error;

      toast.success(`Left ${spaceName}.`);

      // Update state locally
      setSpaces(prevSpaces => 
        prevSpaces.map(space => 
          space.id === spaceId 
            ? { ...space, isJoined: false, memberCount: Math.max(space.memberCount - 1, 1) }
            : space
        )
      );
    } catch (err: any) {
      console.error('Error leaving space:', err);
      toast.error('Could not leave space: ' + err.message);
    }
  };

  // Filter spaces based on search query AND membership mode
  const displayedSpaces = spaces.filter(space => {
    const matchesSearch = 
      space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      space.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Mode A: Empty search => show only joined/owned spaces
    if (!searchQuery) {
      return space.isJoined;
    }

    // Mode B: Active search => show all matches
    return true;
  });

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
          placeholder="Search all spaces..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Directory Title */}
      <h3 className="text-mini font-bold text-gray-400 uppercase tracking-widest mb-4">
        {searchQuery ? "All Spaces Search Results" : "My Joined & Owned Spaces"}
      </h3>

      {/* Spaces Directory */}
      {displayedSpaces.length === 0 ? (
        <Card className="text-center py-20 bg-white border border-gray-100 p-8 shadow-sm">
          <LayoutGrid className="w-16 h-16 mx-auto text-gray-300 mb-4 animate-pulse" />
          <h3 className="text-heading font-heading font-extrabold text-gray-800">
            No spaces found
          </h3>
          <p className="text-primary font-primary text-gray-400 max-w-sm mx-auto mt-1 mb-6">
            {searchQuery 
              ? "Try searching for a different keyword or explore other spaces." 
              : "You haven't joined or created any spaces yet. Try searching to explore!"}
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
          {displayedSpaces.map((space) => (
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
                  <h2 className="text-heading font-heading font-extrabold text-gray-900 group-hover:text-comatch-primary transition truncate">
                    {space.name}
                  </h2>
                  <p className="text-mini font-primary text-gray-400 mt-1 flex items-center gap-1.5 font-medium">
                    <Users size={12} />
                    {space.memberCount}{' '}
                    {space.memberCount === 1 ? 'member' : 'members'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Membership Actions */}
                {currentUser && (
                  <div className="relative z-20">
                    {space.isOwner ? (
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full select-none">
                        Owner
                      </span>
                    ) : space.isJoined ? (
                      <Button 
                        variant="outline" 
                        className="px-4! py-1! text-xs font-bold border-red-200! text-red-500! hover:bg-red-50! hover:border-red-300!"
                        onClick={(e) => handleLeaveSpace(space.id, e)}
                      >
                        Leave
                      </Button>
                    ) : (
                      <Button 
                        variant="primary" 
                        className="px-4! py-1! text-xs font-bold"
                        onClick={(e) => handleJoinSpace(space.id, e)}
                      >
                        Join
                      </Button>
                    )}
                  </div>
                )}

                {/* Chevron Link indicator */}
                <div className="p-2 bg-slate-50 group-hover:bg-blue-50 text-gray-400 group-hover:text-comatch-primary rounded-xl border border-gray-100 group-hover:border-comatch-light transition shadow-inner">
                  <ChevronRight size={18} className="group-hover:translate-x-0.5 transition duration-300" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
