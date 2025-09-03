import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // TEMPORARILY DISABLED FOR TESTING
  // TODO: Re-enable after fixing session handling
  
  // For now, allow all requests to pass through
  return NextResponse.next();
  
  // Original middleware code (commented out):
  /*
  // Define public routes that don't require authentication
  const publicRoutes = ['/auth', '/api/auth'];
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // Allow public routes to pass through
  if (isPublicRoute) {
    return NextResponse.next();
  }

  try {
    // Create Supabase client for middleware
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('Middleware: Supabase not configured, redirecting to auth');
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // This is handled by the server component
        },
      },
    });
    
    // Check if user is authenticated
    const { data: { user }, error } = await supabase.auth.getSession();
    
    console.log('Middleware: Auth check result:', { 
      hasUser: !!user, 
      error: error?.message,
      path: request.nextUrl.pathname 
    });
    
    if (error) {
      console.log('Middleware: Auth error, redirecting to auth');
      return NextResponse.redirect(new URL('/auth', request.url));
    }
    
    if (!user) {
      console.log('Middleware: No user found, redirecting to auth');
      return NextResponse.redirect(new URL('/auth', request.url));
    }
    
    console.log('Middleware: User authenticated, allowing access');
    // User is authenticated, allow access
    return NextResponse.next();
    
  } catch (error) {
    console.error('Middleware Supabase error:', error);
    // On error, redirect to auth page
    return NextResponse.redirect(new URL('/auth', request.url));
  }
  */
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
