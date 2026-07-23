import { describe, it, expect } from 'vitest';
import { createClient } from '@/utils/clients';

describe('Applications & Dashboard Integration Tests', () => {
  const supabase = createClient();

  it('verifies applications query executes cleanly for pending status filters', async () => {
    const { data, error } = await supabase
      .from('applications')
      .select('id, status, owner_seen, applicant_seen')
      .eq('status', 'Pending')
      .limit(5);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('verifies applications notification tracking columns (owner_seen & applicant_seen) exist and are queryable', async () => {
    const { error: ownerError } = await supabase
      .from('applications')
      .select('id')
      .eq('owner_seen', false)
      .limit(1);

    const { error: applicantError } = await supabase
      .from('applications')
      .select('id')
      .eq('applicant_seen', false)
      .limit(1);

    expect(ownerError).toBeNull();
    expect(applicantError).toBeNull();
  });
});
