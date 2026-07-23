import { describe, it, expect } from 'vitest';
import { createClient } from '@/utils/clients';

describe('Real-Time 1-on-1 Chat & Security Integration Tests', () => {
  const supabase = createClient();

  it('verifies conversations table queries execute cleanly for user pairs', async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('id, user1_id, user2_id, created_at')
      .limit(5);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('verifies messages table queries and is_read column filters execute without schema errors', async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_id, content, is_read, created_at')
      .eq('is_read', false)
      .limit(5);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});
