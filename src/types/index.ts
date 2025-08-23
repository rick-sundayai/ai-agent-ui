// ============ EXISTING WORKSPACE TYPES ============
export interface Session {
  id: string
  title: string
  timestamp: string
  isActive?: boolean
}

export interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: string
  status?: 'sending' | 'generating' | 'complete' | 'error'
}

export interface SuggestionChip {
  id: string
  label: string
  action: () => void
}

export type AIStatus = 'ready' | 'thinking' | 'generating' | 'analyzing' | 'idle' | 'error'

export interface WorkspaceState {
  leftPaneOpen: boolean
  rightPaneOpen: boolean
  currentSession: Session | null
  messages: Message[]
  aiStatus: AIStatus
}

// ============ AUTHENTICATION & USER TYPES ============

export type UserRole = 'admin' | 'sales_manager' | 'recruiter'
export type UserStatus = 'active' | 'inactive' | 'pending' | 'invited'

export interface UserProfile {
  id: string
  user_id: string // References auth.users.id
  email: string
  first_name: string
  last_name: string
  role: UserRole
  department?: string
  team?: string
  status: UserStatus
  avatar_url?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  email: string
  profile?: UserProfile | null
}

export interface AuthState {
  user: AuthUser | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
}

// Registration and invitation types
export interface RegistrationRequest {
  email: string
  first_name: string
  last_name: string
  role: UserRole
  department?: string
  reason?: string // Why they need access
}

export interface UserInvitation {
  id: string
  email: string
  role: UserRole
  first_name: string
  last_name: string
  department?: string
  team?: string
  invited_by: string
  expires_at: string
  token: string
  status: 'pending' | 'accepted' | 'expired'
  created_at: string
}

// Permission and access types
export interface Permission {
  id: string
  role: UserRole
  resource: string
  action: string // 'read', 'write', 'delete', 'admin'
}

export interface RolePermissions {
  [key: string]: string[] // resource: [actions]
}

// Role-based routing types
export interface RoleRoute {
  path: string
  roles: UserRole[]
  redirect?: string // Where to redirect if access denied
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface PasswordSetupForm {
  password: string
  confirmPassword: string
}

export interface ForgotPasswordForm {
  email: string
}

// UI State types
export interface AuthModalState {
  isOpen: boolean
  mode: 'login' | 'register' | 'forgot-password' | 'setup-password'
  loading: boolean
  error: string | null
}