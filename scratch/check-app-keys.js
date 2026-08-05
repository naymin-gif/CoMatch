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

async function checkAppKeys() {
  const { data: posts } = await supabase.from('posts').select('id, owner_id').limit(1);
  if (!posts || posts.length === 0) return;

  const postId = posts[0].id;
  const ownerId = posts[0].owner_id;

  const { data: appData, error: appErr } = await supabase
    .from('applications')
    .select(`
      *,
      posts (
        id,
        title,
        owner_id
      )
    `)
    .limit(1);

  console.log("App data:", appData, "Error:", appErr);
}

checkAppKeys();
