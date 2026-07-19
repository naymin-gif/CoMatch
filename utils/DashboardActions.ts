import { SupabaseClient } from '@supabase/supabase-js';

export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Dashboard {
  id: string;
  status: ApplicationStatus;
  created_at: string;
  intro_message?: string;
  selected_roles?: string[];
  owner_seen?: boolean;
  applicant_seen?: boolean;
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
      applicant_seen,
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
      owner_seen,
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
  // Authorization Check & fetch applicant details and space ID
  const { data: appData, error: verifyError } = await supabase
    .from('applications')
    .select('applicant_id, posts!inner(owner_id, space_id)')
    .eq('id', applicationId)
    .single();

  if (verifyError || !appData) {
    throw new Error('Application not found.');
  }

  const postData = appData.posts as any;
  const ownerId = Array.isArray(postData) ? postData[0]?.owner_id : postData?.owner_id;
  const spaceId = Array.isArray(postData) ? postData[0]?.space_id : postData?.space_id;

  if (ownerId !== currentUserId) {
    throw new Error(
      'Unauthorized: You do not have permission to update this application.'
    );
  }

  // 1. Update the application status and reset applicant_seen to false
  const { data, error } = await supabase
    .from('applications')
    .update({ status: newStatus, applicant_seen: false })
    .eq('id', applicationId)
    .select()
    .single();

  if (error) {
    console.error('Error updating application status:', error);
    throw new Error('Failed to update status.');
  }

  // 2. Consequence: If approved, automatically insert applicant into space_members
  if (newStatus === 'Approved' && spaceId && appData.applicant_id) {
    try {
      const { error: memberError } = await supabase
        .from('space_members')
        .upsert(
          {
            space_id: spaceId,
            profile_id: appData.applicant_id,
          },
          { onConflict: 'space_id,profile_id' }
        );

      if (memberError) {
        console.error(
          'Error adding approved applicant to space members:',
          memberError.message
        );
      }
    } catch (err) {
      console.error('Failed to auto-join member:', err);
    }
  }

  return data as unknown as Dashboard;
}
