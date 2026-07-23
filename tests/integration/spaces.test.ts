import { describe, it, expect } from 'vitest';
import { createClient } from '@/utils/clients';

describe('Spaces & Membership Integration Tests', () => {
  const supabase = createClient();

  it('verifies space uniqueness check query returns null for new unique names', async () => {
    const testName = `Integration Space ${Date.now()}`;

    const { data: existingSpace, error: checkError } = await supabase
      .from('spaces')
      .select('id, name')
      .eq('name', testName)
      .maybeSingle();

    expect(checkError).toBeNull();
    expect(existingSpace).toBeNull();
  });

  it('verifies space_members table query executes cleanly without database errors', async () => {
    const { count, error } = await supabase
      .from('space_members')
      .select('*', { count: 'exact', head: true });

    expect(error).toBeNull();
    expect(typeof count === 'number' || count === null).toBe(true);
  });
});
