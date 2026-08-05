'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/clients';

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    const openCurrentUserProfile = async () => {
      const supabase = createClient();

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace('/login');
        return;
      }

      router.replace(`/profile/${user.id}`);
    };

    openCurrentUserProfile();
  }, [router]);

  return (
    <div className="flex justify-center mt-10 w-full text-muted-foreground font-heading">
      Loading profile...
    </div>
  );
}