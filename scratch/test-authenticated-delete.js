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

async function testAuthDelete() {
  console.log("Checking if roles table permits delete under RLS...");
  const postId = '668bb720-e4b2-41d4-8c9d-6a0343e7607b';

  // Check roles count before
  const { data: beforeRoles } = await supabase.from('roles').select('*').eq('post_id', postId);
  console.log("Before roles count:", beforeRoles?.length);

  // Attempt delete
  const { data: delData, error: delErr } = await supabase.from('roles').delete().eq('post_id', postId).select();
  console.log("Delete result:", delData, "Error:", delErr);

  // Check roles count after
  const { data: afterRoles } = await supabase.from('roles').select('*').eq('post_id', postId);
  console.log("After roles count:", afterRoles?.length);
}

testAuthDelete();
