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
// Using service role key if available, or anon key to check rpc
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspectPolicies() {
  const tables = ['posts', 'roles', 'applications', 'post_comments', 'post_likes'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(0);
    console.log(`Table ${table} accessible:`, !error, error?.message);
  }
}

inspectPolicies();
