'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
import { createClient } from '@/lib/supabase/client'
import { authService } from '@/lib/auth/auth-service'
import { 
  AuthState, 
  UserProfile, 
  UserRole,
  LoginForm,
  ForgotPasswordForm,
  RegistrationRequest 
} from '@/types'

// ============================================================================
// AUTH CONTEXT
// ============================================================================

interface AuthContextType extends AuthState {
  signIn: (credentials: LoginForm) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<{ success: boolean; error?: string }>
  resetPassword: (form: ForgotPasswordForm) => Promise<{ success: boolean; error?: string }>
  submitRegistrationRequest: (request: RegistrationRequest) => Promise<{ success: boolean; error?: string }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>
  refreshProfile: () => Promise<void>
  hasPermission: (resource: string, action: string) => Promise<boolean>
  logActivity: (action: string, resource: string, resourceId?: string, metadata?: Record<string, unknown>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ============================================================================
// AUTH PROVIDER COMPONENT
// ============================================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null
  })

  const supabase = createClient()

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🔄 Initializing authentication...')
        const authData = await authService.getCurrentUser()

        if (authData) {
          const { user, profile } = authData;
          console.log('👤 User:', user ? `${user.id} (${user.email})` : 'No user');
          console.log('👤 Profile:', profile ? `${profile.first_name} ${profile.last_name} (${profile.role})` : 'No profile');
          
          setState({
            user: user ? { id: user.id, email: user.email || '', profile } : null,
            profile,
            loading: false,
            error: null
          });
        } else {
          console.log('👤 User: No user');
          console.log('👤 Profile: No profile');
          
          setState({
            user: null,
            profile: null,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        setState({
          user: null,
          profile: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Authentication error'
        })
      }
    }

    initAuth()
  }, [])

  // (The rest of your file remains the same)
  // ...
  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)

        if (event === 'SIGNED_IN' && session?.user) {
          // User signed in - get their profile
          try {
            const profile = await authService.getUserProfile(session.user.id)
            
            setState({
              user: { id: session.user.id, email: session.user.email || '', profile },
              profile,
              loading: false,
              error: null
            })

            // Log sign-in activity
            await authService.logActivity('sign_in', 'auth', session.user.id)
          } catch (error) {
            console.error('❌ Error handling sign in:', error)
            setState({
              user: null,
              profile: null,
              loading: false,
              error: error instanceof Error ? error.message : 'Authentication error'
            })
          }
        } 
        else if (event === 'SIGNED_OUT') {
          // User signed out
          setState({
            user: null,
            profile: null,
            loading: false,
            error: null
          })
        }
        else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Token refreshed - update user info
          try {
            const profile = await authService.getUserProfile(session.user.id)
            
            setState(prev => ({
              ...prev,
              user: { id: session.user.id, email: session.user.email || '', profile },
              profile,
              error: null
            }))
          } catch (error) {
            console.error('❌ Error handling token refresh:', error)
            // If token refresh fails with user errors, sign out
            if (error instanceof Error && error.message.includes('User from sub claim')) {
              console.log('🧹 Signing out due to invalid user in token')
              await authService.signOut()
            }
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // ============================================================================
  // AUTH METHODS
  // ============================================================================

  const signIn = async (credentials: LoginForm) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const { user, profile, error } = await authService.signIn(credentials)

      if (error) {
        setState(prev => ({ ...prev, loading: false, error }))
        return { success: false, error }
      }

      setState({
        user: user ? { id: user.id, email: user.email || '', profile } : null,
        profile,
        loading: false,
        error: null
      })

      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }

  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true }))
    
    try {
      // Log sign-out activity before signing out
      if (state.user) {
        await authService.logActivity('sign_out', 'auth', state.user.id)
      }
      
      const { success, error } = await authService.signOut()

      if (!success && error) {
        setState(prev => ({ ...prev, loading: false, error }))
        return { success: false, error }
      }

      setState({
        user: null,
        profile: null,
        loading: false,
        error: null
      })
      
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }

  const resetPassword = async (form: ForgotPasswordForm) => {
    setState(prev => ({ ...prev, error: null }))
    
    try {
      const { success, error } = await authService.resetPassword(form)

      if (!success && error) {
        setState(prev => ({ ...prev, error }))
        return { success: false, error }
      }

      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed'
      setState(prev => ({ ...prev, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }

  const submitRegistrationRequest = async (request: RegistrationRequest) => {
    setState(prev => ({ ...prev, error: null }))
    
    try {
      const { error } = await authService.submitRegistrationRequest(request)

      if (error) {
        setState(prev => ({ ...prev, error }))
        return { success: false, error }
      }

      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration request failed'
      setState(prev => ({ ...prev, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!state.user) {
      return { success: false, error: 'No user logged in' }
    }
    
    setState(prev => ({ ...prev, error: null }))
    
    try {
      const { profile, error } = await authService.updateProfile(state.user.id, updates)

      if (error) {
        setState(prev => ({ ...prev, error }))
        return { success: false, error }
      }

      setState(prev => ({
        ...prev,
        profile: profile || prev.profile
      }))

      // Log profile update activity
      await authService.logActivity('profile_update', 'user_profiles', state.user.id, updates)
      
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed'
      setState(prev => ({ ...prev, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }

  const refreshProfile = async () => {
    if (!state.user) return

    try {
      const profile = await authService.getUserProfile(state.user.id)
      setState(prev => ({ ...prev, profile }))
    } catch (error) {
      console.error('Failed to refresh profile:', error)
    }
  }

  // ============================================================================
  // PERMISSION & UTILITY METHODS
  // ============================================================================

  const hasPermission = async (resource: string, action: string): Promise<boolean> => {
    if (!state.profile?.role) return false

    try {
      return await authService.hasPermission(state.profile.role, resource, action)
    } catch (error) {
      console.error('Permission check failed:', error)
      return false
    }
  }

  const logActivity = async (
    action: string, 
    resource: string, 
    resourceId?: string, 
    metadata?: Record<string, unknown>
  ) => {
    try {
      await authService.logActivity(action, resource, resourceId, metadata)
    } catch (error) {
      console.error('Activity logging failed:', error)
    }
  }

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: AuthContextType = {
    ...state,
    signIn,
    signOut,
    resetPassword,
    submitRegistrationRequest,
    updateProfile,
    refreshProfile,
    hasPermission,
    logActivity
  }

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  )
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

export function useRequireAuth() {
  const auth = useAuth()
  
  useEffect(() => {
    if (!auth.loading && !auth.user) {
      // Redirect to login or show login modal
      // This can be customized based on your routing strategy
      window.location.href = '/auth/login'
    }
  }, [auth.loading, auth.user])
  
  return auth
}

export function useRequireRole(allowedRoles: UserRole[]) {
  const auth = useAuth()
  
  const hasRequiredRole = auth.profile && allowedRoles.includes(auth.profile.role)
  
  useEffect(() => {
    if (!auth.loading && auth.user && !hasRequiredRole) {
      // Redirect to unauthorized page or appropriate dashboard
      window.location.href = '/unauthorized'
    }
  }, [auth.loading, auth.user, hasRequiredRole])
  
  return { ...auth, hasRequiredRole }
}

export function usePermission(resource: string, action: string) {
  const auth = useAuth()
  const [hasPermission, setHasPermission] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  
  useEffect(() => {
    const checkPermission = async () => {
      if (!auth.profile?.role) {
        setHasPermission(false)
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        const permitted = await auth.hasPermission(resource, action)
        setHasPermission(permitted)
      } catch (error) {
        console.error('Permission check error:', error)
        setHasPermission(false)
      } finally {
        setLoading(false)
      }
    }
    
    checkPermission()
  }, [auth.profile?.role, resource, action, auth])
  
  return { hasPermission, loading }
}