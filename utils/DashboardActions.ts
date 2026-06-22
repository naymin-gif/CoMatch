import { SupabaseClient } from '@supabase/supabase-js';

export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Dashboard {
  id: string;
  status: ApplicationStatus;
  created_at: string;
  intro_message?: string;
  selected_roles?: string[];
  posts?: {
    id: string;
    title: string;
    owner_id?: string;
    spaces?: {
      name: string;
    } | null;
  } | null;
  profiles?: {
    id: string;
    name: string;
  } | null;
}

// Fetches applications the user sent to other teams
export async function getMyApplications(
  supabase: SupabaseClient,
  userId: string
): Promise<Dashboard[]> {
  const { data, error } = await supabase
    .from('applications')
    .select(
      `
      id,
      status,
      created_at,
      posts (
        id,
        title,
        spaces (
          name
        )
      )
    `
    )
    .eq('applicant_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching my applications:', error);
    throw new Error('Could not load applications.');
  }

  return data as unknown as Dashboard[];
}

// Fetches applications the user received from other users
export async function getRequestsReceived(
  supabase: SupabaseClient,
  userId: string
): Promise<Dashboard[]> {
  const { data, error } = await supabase
    .from('applications')
    .select(
      `
      id,
      intro_message,
      selected_roles,
      status,
      created_at,
      profiles (
        id,
        name
      ),
      posts!inner (
        id,
        title,
        owner_id
      )
    `
    )
    .eq('posts.owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching received requests:', error);
    throw new Error('Could not load inbound requests.');
  }

  return data as unknown as Dashboard[];
}

export async function updateApplicationStatus(
  supabase: SupabaseClient,
  applicationId: string,
  newStatus: ApplicationStatus,
  currentUserId: string
): Promise<Dashboard> {
  // Authorization Check
  const { data: appData, error: verifyError } = await supabase
    .from('applications')
    .select('posts!inner(owner_id)')
    .eq('id', applicationId)
    .single();

  const postData = appData?.posts as any;
  const ownerId = Array.isArray(postData)
    ? postData[0]?.owner_id
    : postData?.owner_id;

  if (verifyError || ownerId !== currentUserId) {
    throw new Error(
      'Unauthorized: You do not have permission to update this application.'
    );
  }

  const { data, error } = await supabase
    .from('applications')
    .update({ status: newStatus })
    .eq('id', applicationId)
    .select()
    .single();

  if (error) {
    console.error('Error updating application status:', error);
    throw new Error('Failed to update status.');
  }

  return data as unknown as Dashboard;
}
