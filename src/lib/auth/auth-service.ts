import { createClient } from '../supabase/client'
// import { createClient as createServerClient } from '../supabase/server'
import { 
  UserProfile, 
  UserRole, 
  LoginForm, 
  RegistrationRequest,
  UserInvitation,
  PasswordSetupForm,
  ForgotPasswordForm 
} from '@/types'

export class AuthService {
  private supabase = createClient()

  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================

  async signIn({ email, password }: LoginForm) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Get user profile after successful login
      if (data.user) {
        const profile = await this.getUserProfile(data.user.id)
        return { user: data.user, profile, error: null }
      }

      return { user: data.user, profile: null, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { 
        user: null, 
        profile: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut()
      if (error) throw error
      return { success: true, error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()
      
      if (error) throw error
      if (!user) return { user: null, profile: null, error: null }

      const profile = await this.getUserProfile(user.id)
      return { user, profile, error: null }
    } catch (error) {
      console.error('Get current user error:', error)
      return { 
        user: null, 
        profile: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  async resetPassword({ email }: ForgotPasswordForm) {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) throw error
      return { success: true, error: null }
    } catch (error) {
      console.error('Reset password error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  async updatePassword({ password }: { password: string }) {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password
      })

      if (error) throw error
      return { success: true, error: null }
    } catch (error) {
      console.error('Update password error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // ============================================================================
  // PROFILE MANAGEMENT METHODS
  // ============================================================================

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found - this is ok for new users
          return null
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Get user profile error:', error)
      return null
    }
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return { profile: data, error: null }
    } catch (error) {
      console.error('Update profile error:', error)
      return { 
        profile: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // ============================================================================
  // REGISTRATION & INVITATION METHODS
  // ============================================================================

  async submitRegistrationRequest(request: RegistrationRequest) {
    try {
      const { data, error } = await this.supabase
        .from('registration_requests')
        .insert([request])
        .select()
        .single()

      if (error) throw error
      return { request: data, error: null }
    } catch (error) {
      console.error('Submit registration request error:', error)
      return { 
        request: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  async acceptInvitation(token: string, { password, confirmPassword }: PasswordSetupForm) {
    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match')
      }

      // Get invitation details
      const { data: invitation, error: inviteError } = await this.supabase
        .from('user_invitations')
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .single()

      if (inviteError || !invitation) {
        throw new Error('Invalid or expired invitation')
      }

      // Check if invitation is expired
      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error('Invitation has expired')
      }

      // Create user account
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email: invitation.email,
        password,
        options: {
          data: {
            first_name: invitation.first_name,
            last_name: invitation.last_name,
            role: invitation.role
          }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create user account')

      // Update invitation status
      await this.supabase
        .from('user_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('token', token)

      return { user: authData.user, error: null }
    } catch (error) {
      console.error('Accept invitation error:', error)
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  async getInvitationDetails(token: string) {
    try {
      const { data, error } = await this.supabase
        .from('user_invitations')
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Invalid or expired invitation')
        }
        throw error
      }

      // Check if expired
      if (new Date(data.expires_at) < new Date()) {
        throw new Error('Invitation has expired')
      }

      return { invitation: data, error: null }
    } catch (error) {
      console.error('Get invitation details error:', error)
      return { 
        invitation: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // ============================================================================
  // PERMISSION & ROLE METHODS
  // ============================================================================

  async hasPermission(role: UserRole, resource: string, action: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .rpc('has_permission', {
          user_role: role,
          resource_name: resource,
          action_name: action
        })

      if (error) throw error
      return data || false
    } catch (error) {
      console.error('Check permission error:', error)
      return false
    }
  }

  async getUserPermissions(role: UserRole) {
    try {
      const { data, error } = await this.supabase
        .from('user_permissions')
        .select('resource, action')
        .eq('role', role)

      if (error) throw error
      
      // Group permissions by resource
      const permissions: Record<string, string[]> = {}
      data?.forEach(({ resource, action }) => {
        if (!permissions[resource]) {
          permissions[resource] = []
        }
        permissions[resource].push(action)
      })

      return { permissions, error: null }
    } catch (error) {
      console.error('Get user permissions error:', error)
      return { 
        permissions: {}, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // ============================================================================
  // ADMIN METHODS
  // ============================================================================

  async getAllUsers() {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return { users: data || [], error: null }
    } catch (error) {
      console.error('Get all users error:', error)
      return { 
        users: [], 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  async createUserInvitation(invitation: Omit<UserInvitation, 'id' | 'token' | 'status' | 'created_at' | 'updated_at' | 'accepted_at'>) {
    try {
      // Generate secure token
      const token = crypto.randomUUID()
      
      const { data, error } = await this.supabase
        .from('user_invitations')
        .insert([{
          ...invitation,
          token,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        }])
        .select()
        .single()

      if (error) throw error
      return { invitation: data, error: null }
    } catch (error) {
      console.error('Create user invitation error:', error)
      return { 
        invitation: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  async updateUserStatus(userId: string, status: UserProfile['status']) {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return { profile: data, error: null }
    } catch (error) {
      console.error('Update user status error:', error)
      return { 
        profile: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  async updateUserRole(userId: string, role: UserRole) {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return { profile: data, error: null }
    } catch (error) {
      console.error('Update user role error:', error)
      return { 
        profile: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // ============================================================================
  // AUDIT METHODS
  // ============================================================================

  async logActivity(action: string, resource: string, resourceId?: string, metadata?: Record<string, unknown>) {
    try {
      const { data, error } = await this.supabase
        .rpc('log_user_activity', {
          action_name: action,
          resource_name: resource,
          resource_uuid: resourceId || null,
          metadata_json: metadata || null
        })

      if (error) throw error
      return { activityId: data, error: null }
    } catch (error) {
      console.error('Log activity error:', error)
      return { 
        activityId: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
}

// Singleton instance
export const authService = new AuthService()