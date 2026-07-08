'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../../../utils/clients';
import toast from 'react-hot-toast';

// UI Components
import Card from '@/components/old-ui/Card';
import Button from '@/components/old-ui/Button';
import Input from '@/components/old-ui/Input';
import Textarea from '@/components/old-ui/Textarea';
import Badge from '@/components/old-ui/Badge';
import PageWrapper from '@/components/old-ui/PageWrapper';

export default function NewPostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: spaceId } = use(params);
  const supabase = createClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [commitmentLevel, setCommitmentLevel] = useState('Medium (5-10 hours/week)');
  const [totalMembers, setTotalMembers] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rolesList, setRolesList] = useState<string[]>([]);
  const [newRole, setNewRole] = useState('');
  const handleAddRole = (e: React.MouseEvent) => {
    e.preventDefault(); // Stop the form from submitting
    const trimmed = newRole.trim();
    if (trimmed && !rolesList.includes(trimmed)) {
      setRolesList([...rolesList, trimmed]); // Append new role
      setNewRole(''); // Clear typing input
    }
  };
  const handleRemoveRole = (roleToRemove: string) => {
    setRolesList(rolesList.filter((role) => role !== roleToRemove)); // Remove role from array
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in the title and description.');
      return;
    }
    if (rolesList.length === 0) {
      toast.error('Please add at least one open role.');
      return;
    }
    setIsSubmitting(true);
    try {
      // 1. Get logged-in user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('You must be logged in to create a post.');
      }
      // 2. Insert the post into database
      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          title: title.trim(),
          description: description.trim(),
          open_roles: rolesList, // Directly insert JavaScript string array into text[] column
          commitment_level: commitmentLevel,
          total_members_required: parseInt(totalMembers) || 1,
          space_id: spaceId,
          owner_id: user.id,
        });
      if (insertError) throw insertError;
      toast.success('Teammate call posted successfully!');
      
      // 3. Go back to space dashboard page
      router.push(`/spaces/${spaceId}`);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to post teammate call.');
    } finally {
      setIsSubmitting(false);
    }
  };
    return (
    <PageWrapper
      title="Post Teammate Call"
      subtitle="Recruit members for your project or study group."
    >
      <div className="max-w-3xl mx-auto pb-12">
        <Card className="p-8 border border-gray-100 shadow-sm bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title */}
            <Input
              label="Teammate Call Title"
              type="text"
              placeholder="e.g. Seeking React Native developers for mobile prototype"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            {/* Description */}
            <Textarea
              label="Project Description & Expectations"
              placeholder="Describe the project goal, what you have built so far, and what you expect from your teammates..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="min-h-[150px]"
            />

            {/* Commitment & Members Needed Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Commitment Level Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-mini font-medium text-gray-700">Commitment Level</label>
                <select
                  value={commitmentLevel}
                  onChange={(e) => setCommitmentLevel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-comatch-primary focus:border-comatch-primary text-gray-900 bg-white text-sm min-h-[42px] transition-shadow"
                >
                  <option>Low (&lt; 5 hours/week)</option>
                  <option>Medium (5-10 hours/week)</option>
                  <option>High (10+ hours/week)</option>
                </select>
              </div>

              {/* Total Members Required */}
              <Input
                label="Total Members Needed"
                type="number"
                min="1"
                placeholder="1"
                value={totalMembers}
                onChange={(e) => setTotalMembers(e.target.value)}
                required
              />
            </div>

            {/* Roles Tag Builder */}
            <div className="space-y-2">
              <label className="text-mini font-medium text-gray-700 block">Open Roles</label>
              
              {/* Display currently added roles */}
              {rolesList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {rolesList.map((role, idx) => (
                    <Badge 
                      key={idx} 
                      variant="outline"
                      className="flex items-center gap-1.5 pr-2 bg-blue-50/30"
                    >
                      {role}
                      <button
                        type="button"
                        onClick={() => handleRemoveRole(role)}
                        className="text-gray-400 hover:text-red-500 font-bold leading-none cursor-pointer focus:outline-none transition-colors"
                        aria-label={`Remove role ${role}`}
                      >
                        &times;
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Add dynamic role input */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="e.g. Frontend Developer"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddRole}
                  className="px-5! py-2! shrink-0 flex items-center justify-center font-bold"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Form Actions Footer */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.push(`/spaces/${spaceId}`)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Posting...' : 'Post Teammate Call'}
              </Button>
            </div>

          </form>
        </Card>
      </div>
    </PageWrapper>
  );
}
