import { NextResponse } from 'next/server';
import { createClient } from '@/utils/clients'; // Ensure this points to your server-side Supabase client

export async function GET(request: Request) {
    // 1. Get the URL parameters
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const origin = requestUrl.origin;

    if (code) {
        // 2. Initialize the Supabase client
        const supabase = createClient();

        // 3. Exchange the secure code for an active user session
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // 4. On success, redirect to the home page (app/page.tsx)
            return NextResponse.redirect(`${origin}/`);
        } else {
            console.error('Error exchanging code for session:', error);
        }
    }

    // 5. If there is no code or an error occurred, redirect to login with an error flag
    return NextResponse.redirect(`${origin}/login?error=auth-failed`);
}