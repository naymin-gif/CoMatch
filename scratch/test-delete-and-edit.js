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

async function testOperations() {
  const postId = '327db05e-d6e8-4423-8388-d288bbc94a43';

  console.log("--- 1. Testing Role Deletion for post ---");
  const { data: delRoles, error: errRoles } = await supabase.from('roles').delete().eq('post_id', postId).select();
  console.log("Delete roles result:", delRoles, "Error:", errRoles);

  console.log("--- 2. Testing Post Deletion ---");
  const { data: delPost, error: errPost } = await supabase.from('posts').delete().eq('id', postId).select();
  console.log("Delete post result:", delPost, "Error:", errPost);
}

testOperations();
