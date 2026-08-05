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

async function checkRLSPolicies() {
  console.log("Checking RLS policies for posts, roles, applications...");
  
  // We can query pg_policies using rpc if available, or test delete/update response
  const { data: posts, error: pErr } = await supabase.from('posts').select('id, owner_id').limit(1);
  console.log("Sample post:", posts, pErr);

  if (posts && posts.length > 0) {
    const postId = posts[0].id;
    // Attempt update on post without session (should return 0 rows under RLS)
    const { data: upData, error: upErr } = await supabase.from('posts').update({ title: 'test_rls' }).eq('id', postId).select();
    console.log("Update post without auth:", upData, "Error:", upErr);

    const { data: delData, error: delErr } = await supabase.from('roles').delete().eq('post_id', postId).select();
    console.log("Delete roles without auth:", delData, "Error:", delErr);
  }
}

checkRLSPolicies();
