'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../../../utils/clients';
import toast from 'react-hot-toast';

// UI Components
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Badge from '@/components/ui/Badge';
import PageWrapper from '@/components/ui/PageWrapper';

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
      <div className="max-w-3xl mx-auto">
        <Card className="p-8 border border-gray-100 shadow-sm">
          <p className="text-gray-500">Form initializing...</p>
        </Card>
      </div>
    </PageWrapper>
  );
}
