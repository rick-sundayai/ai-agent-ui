// src/middleware.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Refresh the session
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // If user is not logged in, redirect to login page (unless they are already there)
  if (!user && pathname !== '/auth/login') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If user is logged in, handle role-based redirects
  if (user) {
    // Access the role from the custom claim in the JWT
    const userRole = user.app_metadata?.role;

    // Redirect admins away from the generic agent page to their dashboard
    if (userRole === 'admin' && pathname.startsWith('/agent')) {
      return NextResponse.redirect(new URL('/apps/admin/dashboard', request.url));
    }
    
    // Redirect non-admins away from admin pages
    if (userRole !== 'admin' && pathname.startsWith('/apps/admin')) {
        return NextResponse.redirect(new URL('/agent', request.url)); // Or an 'unauthorized' page
    }

    // Redirect logged-in users away from the login page
    if (pathname === '/auth/login') {
      const redirectUrl = userRole === 'admin' 
        ? new URL('/apps/admin/dashboard', request.url) 
        : new URL('/agent', request.url);
      return NextResponse.redirect(redirectUrl);
    }
    
    // If a logged-in user is at the root, redirect them based on role
    if (pathname === '/') {
        const redirectUrl = userRole === 'admin' 
        ? new URL('/apps/admin/dashboard', request.url) 
        : new URL('/agent', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};