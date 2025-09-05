import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const next = searchParams.get('next') ?? '/';

  // Check for OAuth errors first
  if (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error)}`);
  }

  const supabase = await createClient();
  
  if (!supabase) {
    console.error('Supabase client not configured');
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=config`);
  }

  // Try to exchange the code if provided
  if (code) {
    try {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) {
        console.error('Code exchange error:', exchangeError);
        // Don't redirect to error page yet - check if user is already authenticated
      }
    } catch (err) {
      console.error('Unexpected error during code exchange:', err);
      // Don't redirect to error page yet - check if user is already authenticated
    }
  }

  // Check if user is authenticated (regardless of code exchange success)
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // User is authenticated, redirect to home
      const forwardedHost = request.headers.get('x-forwarded-host');
      const redirectUrl = forwardedHost
        ? `${request.headers.get('x-forwarded-proto')}://${forwardedHost}${next}`
        : `${origin}${next}`;
      return NextResponse.redirect(redirectUrl);
    }
  } catch (userCheckError) {
    console.error('Error checking user:', userCheckError);
  }

  // If we get here, user is not authenticated
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=not_authenticated`);
}
