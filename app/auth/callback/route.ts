import { NextResponse } from 'next/server';
import { createServer } from '@/utils/server'; // Pointing to our new server client

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    // 1. Initialize the SERVER client
    const supabase = await createServer();

    // 2. Exchange the code (the server can now read the cookie!)
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}/`);
    } else {
      console.error('Error exchanging code for session:', error);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-failed`);
}
