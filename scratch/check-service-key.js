import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  console.log("Keys in .env.local:", content.split('\n').map(l => l.split('=')[0].trim()).filter(Boolean));
} else {
  console.log(".env.local not found");
}
