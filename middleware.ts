import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { UserRole } from '@/types'

// ============================================================================
// ROUTE CONFIGURATION
// ============================================================================

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
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
  try {
    const { pathname, searchParams } = request.nextUrl
    const response = NextResponse.next()

    // Create Supabase client for server-side operations
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
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

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error in middleware:', sessionError)
    }

    const user = session?.user
    let userProfile = null

    // Get user profile if authenticated
    if (user) {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (profileError) {
          console.error('Profile error in middleware:', profileError)
        } else {
          userProfile = profile
        }
      } catch (error) {
        console.error('Error fetching user profile in middleware:', error)
      }
    }

    // ========================================================================
    // ROUTE PROTECTION LOGIC
    // ========================================================================

    const isPublicRoute = PUBLIC_ROUTES.some(route => {
      if (route === '/') return pathname === '/'
      return pathname.startsWith(route)
    })

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

    return response

  } catch (error) {
    console.error('Middleware error:', error)
    
    // In case of any error, redirect to login for protected routes
    const { pathname } = request.nextUrl
    const isPublicRoute = PUBLIC_ROUTES.some(route => {
      if (route === '/') return pathname === '/'
      return pathname.startsWith(route)
    })

    if (!isPublicRoute) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    return NextResponse.next()
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getDefaultRedirectForRole(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard'
    case 'sales_manager':
      return '/dashboard/sales'
    case 'recruiter':
      return '/dashboard/recruiter'
    default:
      return '/dashboard'
  }
}

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$|.*\\.webp$).*)',
  ],
}