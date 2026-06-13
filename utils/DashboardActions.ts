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