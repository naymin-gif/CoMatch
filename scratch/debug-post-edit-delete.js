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
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPostRelations() {
  console.log("--- Checking Posts Table ---");
  const { data: posts, error: postsErr } = await supabase.from('posts').select('id, title, owner_id').limit(5);
  console.log("Posts sample:", posts, "Error:", postsErr);

  if (posts && posts.length > 0) {
    const testPostId = posts[0].id;
    console.log(`--- Checking Roles for post_id ${testPostId} ---`);
    const { data: roles, error: rolesErr } = await supabase.from('roles').select('*').eq('post_id', testPostId);
    console.log("Roles count:", roles?.length, "Roles:", roles, "Error:", rolesErr);
  }
}

checkPostRelations();
