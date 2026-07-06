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
