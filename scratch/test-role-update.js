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

async function testRoleUpdate() {
  console.log("Testing role UPDATE...");
  const postId = '668bb720-e4b2-41d4-8c9d-6a0343e7607b';
  const { data: existingRoles } = await supabase.from('roles').select('id, role, quantity').eq('post_id', postId);
  console.log("Existing roles:", existingRoles);

  if (existingRoles && existingRoles.length > 0) {
    const firstRoleId = existingRoles[0].id;
    const { data: upData, error: upErr } = await supabase
      .from('roles')
      .update({ role: 'Software Engineer', quantity: 1 })
      .eq('id', firstRoleId)
      .select();

    console.log("Update role result:", upData, "Error:", upErr);
  }
}

testRoleUpdate();
