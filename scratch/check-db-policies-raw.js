import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  const env = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    lines.forEach((line) => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        env[parts[0].trim()] = parts.slice(1).join('=').trim();
      }
    });
  }
  return env;
}

const env = loadEnvLocal();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testSupabaseRPC() {
  console.log("Testing updating post...");
  const postId = '668bb720-e4b2-41d4-8c9d-6a0343e7607b';
  
  // Try update post title
  const { data: updateData, error: updateErr } = await supabase
    .from('posts')
    .update({ title: 'Post 1 Updated' })
    .eq('id', postId)
    .select();

  console.log("Update result without session:", updateData, "Error:", updateErr);
}

testSupabaseRPC();
