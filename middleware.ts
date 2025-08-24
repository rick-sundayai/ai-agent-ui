import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { UserRole } from '@/types'
import { getDefaultRedirectForRole } from '@/lib/auth/permissions'

// This should log when the middleware file is loaded
console.log('🔥 MIDDLEWARE FILE LOADED - Config:', {
  nodeEnv: process.env.NODE_ENV,
  timestamp: new Date().toISOString()
})

// ============================================================================
// ROUTE CONFIGURATION
// ============================================================================

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register', 
  '/auth/forgot-password',
  '/auth/setup-password',
  '/auth/verify-email',
  '/auth/reset-password'
]

// Admin-only routes
const ADMIN_ROUTES = [
  '/admin',
  '/admin/users',
  '/admin/permissions',
  '/admin/system-settings',
  '/admin/audit-logs',
  '/admin/invitations'
]

// Sales Manager routes (accessible to admin and sales managers)
const SALES_MANAGER_ROUTES = [
  '/dashboard/sales',
  '/reports/team',
  '/analytics/performance',
  '/team-management'
]

// Routes that require authentication but are available to all roles
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings'
]

// ============================================================================
// MIDDLEWARE FUNCTION
// ============================================================================

export async function middleware(request: NextRequest) {
  const startTime = Date.now()
  console.log('🚀 MIDDLEWARE START - Path:', request.nextUrl.pathname, 'Method:', request.method)
  
  try {
    const { pathname, searchParams } = request.nextUrl
    const response = NextResponse.next()
    
    console.log('📍 Processing path:', pathname)
    console.log('🔧 Matcher config should include this path')

    // Create Supabase client for server-side operations
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll().map(({ name, value }) => ({ name, value }))
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    // ========================================================================
    // AUTHENTICATION CHECK
    // ========================================================================

    console.log('🔍 Checking session...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Session error in middleware:', sessionError)
    }

    const user = session?.user
    console.log('👤 User found:', user ? `${user.id} (${user.email})` : 'No user')
    
    let userProfile = null

    // Get user profile if authenticated
    if (user) {
      console.log('🔍 Fetching user profile for:', user.id)
      try {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (profileError) {
          console.error('❌ Profile error in middleware:', profileError)
          // Continue without profile - middleware will handle accordingly
          if (profileError.code === '42P17') {
            console.log('⚠️ RLS infinite recursion detected - continuing without profile')
          }
        } else {
          userProfile = profile
          console.log('✅ Profile loaded:', profile ? `${profile.first_name} ${profile.last_name} (${profile.role})` : 'No profile data')
        }
      } catch (error) {
        console.error('❌ Exception fetching user profile in middleware:', error)
        // Continue without profile rather than failing
      }
    }

    // ========================================================================
    // ROUTE PROTECTION LOGIC
    // ========================================================================

    // ========================================================================
    // HOME PAGE ROUTING
    // ========================================================================
    
    // Handle home page specially
    if (pathname === '/') {
      console.log('🏠 Home page detected!')
      console.log('👤 Auth status:', { 
        hasUser: !!user, 
        hasProfile: !!userProfile, 
        status: userProfile?.status,
        role: userProfile?.role 
      })
      
      if (user && userProfile && userProfile.status === 'active') {
        // Authenticated user - redirect to their dashboard
        const redirectTo = getDefaultRedirectForRole(userProfile.role)
        console.log('✅ Redirecting authenticated user to:', redirectTo)
        return NextResponse.redirect(new URL(redirectTo, request.url))
      } else {
        // Unauthenticated user - redirect to login
        console.log('🔑 Redirecting unauthenticated user to: /auth/login')
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }
    }

    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))
    const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route))
    const isSalesManagerRoute = SALES_MANAGER_ROUTES.some(route => pathname.startsWith(route))
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route)) ||
                            isAdminRoute || 
                            isSalesManagerRoute

    // If it's a public route, allow access
    if (isPublicRoute) {
      // If user is already authenticated and trying to access auth pages, redirect to dashboard
      if (user && userProfile && pathname.startsWith('/auth/')) {
        const redirectTo = getDefaultRedirectForRole(userProfile.role)
        return NextResponse.redirect(new URL(redirectTo, request.url))
      }
      return response
    }

    // For protected routes, check authentication
    if (isProtectedRoute) {
      // No user session - redirect to login
      if (!user) {
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // User exists but no profile - this is an error state
      if (!userProfile) {
        console.error('User exists but no profile found:', user.id)
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('error', 'profile-not-found')
        return NextResponse.redirect(loginUrl)
      }

      // Check if user account is active
      if (userProfile.status !== 'active') {
        const errorUrl = new URL('/auth/pending', request.url)
        errorUrl.searchParams.set('status', userProfile.status)
        return NextResponse.redirect(errorUrl)
      }

      // ======================================================================
      // ROLE-BASED ACCESS CONTROL
      // ======================================================================

      const userRole = userProfile.role as UserRole

      // Check admin routes
      if (isAdminRoute && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }

      // Check sales manager routes (admin can access all)
      if (isSalesManagerRoute && !['admin', 'sales_manager'].includes(userRole)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }

      // ======================================================================
      // ROLE-BASED REDIRECTS
      // ======================================================================

      // Root dashboard redirect based on role
      if (pathname === '/dashboard') {
        const roleBasedDashboard = getDefaultRedirectForRole(userRole)
        if (roleBasedDashboard !== '/dashboard') {
          return NextResponse.redirect(new URL(roleBasedDashboard, request.url))
        }
      }

      // Home page redirect for authenticated users
      if (pathname === '/' && user && userProfile) {
        const redirectTo = getDefaultRedirectForRole(userRole)
        return NextResponse.redirect(new URL(redirectTo, request.url))
      }
    }

    // Add user info to response headers for client-side use (optional)
    if (user && userProfile) {
      response.headers.set('x-user-id', user.id)
      response.headers.set('x-user-role', userProfile.role)
      response.headers.set('x-user-status', userProfile.status)
    }

    const endTime = Date.now()
    console.log(`⚡ MIDDLEWARE END - Path: ${pathname} - Duration: ${endTime - startTime}ms - No redirect`)
    return response

  } catch (error) {
    console.error('❌ Critical middleware error:', error)
    console.log('🔧 Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack?.substring(0, 500) : 'No stack trace',
      pathname: request.nextUrl.pathname
    })
    
    const { pathname } = request.nextUrl
    
    // For home page, always redirect to login if middleware fails
    if (pathname === '/') {
      console.log('🚨 Middleware failed on home page - forcing redirect to login')
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    
    // In case of any error, redirect to login for protected routes  
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))

    if (!isPublicRoute) {
      console.log('🚨 Middleware failed on protected route - redirecting to login')
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    return NextResponse.next()
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// getDefaultRedirectForRole is now imported from @/lib/auth/permissions

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

export const config = {
  matcher: [
    /*
     * Explicitly match paths we want middleware to handle
     * This is more reliable than complex regex exclusions
     */
    '/',
    '/auth/:path*',
    '/admin/:path*', 
    '/dashboard/:path*',
    '/profile',
    '/settings',
    '/unauthorized',
    '/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon.ico|.*\\.(png|jpg|jpeg|gif|svg|ico|webp)$).*)',
  ],
}