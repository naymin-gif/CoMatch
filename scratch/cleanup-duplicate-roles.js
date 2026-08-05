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

async function inspectAllRoles() {
  const { data: roles } = await supabase.from('roles').select('*');
  console.log("Total roles in DB:", roles?.length);

  const postRoleCounts = {};
  roles?.forEach(r => {
    postRoleCounts[r.post_id] = (postRoleCounts[r.post_id] || 0) + 1;
  });

  console.log("Roles count per post_id:", postRoleCounts);
}

inspectAllRoles();
