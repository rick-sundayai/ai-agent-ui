import { UserRole } from '@/types'

// ============================================================================
// ROLE HIERARCHY & DEFINITIONS
// ============================================================================

export const ROLES = {
  ADMIN: 'admin' as const,
  SALES_MANAGER: 'sales_manager' as const,
  RECRUITER: 'recruiter' as const
}

export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 3,
  [ROLES.SALES_MANAGER]: 2,
  [ROLES.RECRUITER]: 1
}

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.SALES_MANAGER]: 'Sales Manager', 
  [ROLES.RECRUITER]: 'Recruiter'
}

export const ROLE_DESCRIPTIONS = {
  [ROLES.ADMIN]: 'Full system access and user management',
  [ROLES.SALES_MANAGER]: 'Team oversight and sales analytics',
  [ROLES.RECRUITER]: 'Individual contributor with candidate focus'
}

// ============================================================================
// PERMISSION DEFINITIONS
// ============================================================================

export const RESOURCES = {
  USERS: 'users',
  PROFILES: 'profiles', 
  REPORTS: 'reports',
  CANDIDATES: 'candidates',
  TEAM: 'team',
  SYSTEM: 'system',
  INVITATIONS: 'invitations',
  PERMISSIONS: 'permissions',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings'
} as const

export const ACTIONS = {
  READ: 'read',
  WRITE: 'write', 
  DELETE: 'delete',
  ADMIN: 'admin'
} as const

// Default permissions per role
export const DEFAULT_PERMISSIONS = {
  [ROLES.ADMIN]: {
    [RESOURCES.USERS]: [ACTIONS.READ, ACTIONS.WRITE, ACTIONS.DELETE, ACTIONS.ADMIN],
    [RESOURCES.PROFILES]: [ACTIONS.READ, ACTIONS.WRITE, ACTIONS.DELETE, ACTIONS.ADMIN],
    [RESOURCES.REPORTS]: [ACTIONS.READ, ACTIONS.WRITE, ACTIONS.DELETE, ACTIONS.ADMIN],
    [RESOURCES.CANDIDATES]: [ACTIONS.READ, ACTIONS.WRITE, ACTIONS.DELETE, ACTIONS.ADMIN],
    [RESOURCES.TEAM]: [ACTIONS.READ, ACTIONS.WRITE, ACTIONS.DELETE, ACTIONS.ADMIN],
    [RESOURCES.SYSTEM]: [ACTIONS.ADMIN],
    [RESOURCES.INVITATIONS]: [ACTIONS.READ, ACTIONS.WRITE, ACTIONS.DELETE, ACTIONS.ADMIN],
    [RESOURCES.PERMISSIONS]: [ACTIONS.READ, ACTIONS.WRITE, ACTIONS.DELETE, ACTIONS.ADMIN],
    [RESOURCES.ANALYTICS]: [ACTIONS.READ, ACTIONS.WRITE, ACTIONS.ADMIN],
    [RESOURCES.SETTINGS]: [ACTIONS.READ, ACTIONS.WRITE, ACTIONS.ADMIN]
  },
  
  [ROLES.SALES_MANAGER]: {
    [RESOURCES.USERS]: [ACTIONS.READ],
    [RESOURCES.PROFILES]: [ACTIONS.READ, ACTIONS.WRITE], // Own profile only
    [RESOURCES.REPORTS]: [ACTIONS.READ, ACTIONS.WRITE],
    [RESOURCES.CANDIDATES]: [ACTIONS.READ, ACTIONS.WRITE],
    [RESOURCES.TEAM]: [ACTIONS.READ, ACTIONS.WRITE],
    [RESOURCES.ANALYTICS]: [ACTIONS.READ],
    [RESOURCES.SETTINGS]: [ACTIONS.READ]
  },
  
  [ROLES.RECRUITER]: {
    [RESOURCES.PROFILES]: [ACTIONS.READ, ACTIONS.WRITE], // Own profile only
    [RESOURCES.CANDIDATES]: [ACTIONS.READ, ACTIONS.WRITE],
    [RESOURCES.REPORTS]: [ACTIONS.READ],
    [RESOURCES.SETTINGS]: [ACTIONS.READ]
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY[role] || 0
}

export function hasHigherRole(userRole: UserRole, targetRole: UserRole): boolean {
  return getRoleLevel(userRole) > getRoleLevel(targetRole)
}

export function hasEqualOrHigherRole(userRole: UserRole, targetRole: UserRole): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(targetRole)
}

export function canManageUser(managerRole: UserRole, targetRole: UserRole): boolean {
  // Admins can manage everyone
  if (managerRole === ROLES.ADMIN) return true
  
  // Sales managers can manage recruiters
  if (managerRole === ROLES.SALES_MANAGER && targetRole === ROLES.RECRUITER) return true
  
  return false
}

export function getDefaultPermissions(role: UserRole) {
  return DEFAULT_PERMISSIONS[role] || {}
}

export function hasDefaultPermission(role: UserRole, resource: string, action: string): boolean {
  const permissions = getDefaultPermissions(role)
  const resourcePerms = permissions[resource as keyof typeof permissions] as string[] | undefined
  return resourcePerms ? resourcePerms.includes(action) : false
}

// ============================================================================
// ROUTE PROTECTION UTILITIES
// ============================================================================

export const PROTECTED_ROUTES = {
  // Admin-only routes
  ADMIN: [
    '/admin',
    '/admin/users',
    '/admin/permissions',
    '/admin/system-settings',
    '/admin/audit-logs'
  ],
  
  // Sales Manager routes (and admin)
  SALES_MANAGER: [
    '/dashboard/sales',
    '/reports/team',
    '/analytics/performance',
    '/team-management'
  ],
  
  // Routes available to all authenticated users
  ALL_USERS: [
    '/dashboard',
    '/profile',
    '/settings'
  ]
} as const

export function getRoutesForRole(role: UserRole): string[] {
  switch (role) {
    case ROLES.ADMIN:
      return [
        ...PROTECTED_ROUTES.ALL_USERS,
        ...PROTECTED_ROUTES.SALES_MANAGER,
        ...PROTECTED_ROUTES.ADMIN
      ]
    case ROLES.SALES_MANAGER:
      return [
        ...PROTECTED_ROUTES.ALL_USERS,
        ...PROTECTED_ROUTES.SALES_MANAGER
      ]
    case ROLES.RECRUITER:
      return [...PROTECTED_ROUTES.ALL_USERS]
    default:
      return []
  }
}

export function canAccessRoute(role: UserRole, path: string): boolean {
  const allowedRoutes = getRoutesForRole(role)
  return allowedRoutes.some(route => path.startsWith(route))
}

export function getDefaultRedirectForRole(role: UserRole): string {
  switch (role) {
    case ROLES.ADMIN:
      return '/admin/dashboard'
    case ROLES.SALES_MANAGER:
      return '/dashboard/sales'
    case ROLES.RECRUITER:
      return '/dashboard/recruiter'
    default:
      return '/dashboard'
  }
}

// ============================================================================
// UI UTILITIES
// ============================================================================

export function getRoleColor(role: UserRole): string {
  switch (role) {
    case ROLES.ADMIN:
      return 'bg-red-100 text-red-800 border-red-200'
    case ROLES.SALES_MANAGER:
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case ROLES.RECRUITER:
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getRoleBadgeClasses(role: UserRole): string {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border'
  const colorClasses = getRoleColor(role)
  return `${baseClasses} ${colorClasses}`
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export function isValidRole(role: string): role is UserRole {
  return Object.values(ROLES).includes(role as UserRole)
}

export function validateRoleTransition(fromRole: UserRole, toRole: UserRole, updaterRole: UserRole): boolean {
  // Admins can change any role to any role
  if (updaterRole === ROLES.ADMIN) return true
  
  // Sales managers can promote recruiters to sales manager (if company policy allows)
  // This might be restricted based on business rules
  if (updaterRole === ROLES.SALES_MANAGER && fromRole === ROLES.RECRUITER && toRole === ROLES.SALES_MANAGER) {
    return false // Usually this would require admin approval
  }
  
  // Generally, users cannot change their own roles or others' roles unless they're admin
  return false
}

// ============================================================================
// PERMISSION CHECKING UTILITIES
// ============================================================================

export interface PermissionCheck {
  allowed: boolean
  reason?: string
}

export function checkResourceAccess(
  userRole: UserRole, 
  targetUserId: string, 
  currentUserId: string, 
  resource: string, 
  action: string
): PermissionCheck {
  // Check if user has base permission for resource/action
  if (!hasDefaultPermission(userRole, resource, action)) {
    return {
      allowed: false,
      reason: `Role ${userRole} does not have ${action} permission for ${resource}`
    }
  }
  
  // Special rules for user-specific resources
  if (resource === RESOURCES.PROFILES) {
    // Users can always access their own profile
    if (targetUserId === currentUserId) {
      return { allowed: true }
    }
    
    // Admins can access any profile
    if (userRole === ROLES.ADMIN) {
      return { allowed: true }
    }
    
    // Sales managers can read team member profiles
    if (userRole === ROLES.SALES_MANAGER && action === ACTIONS.READ) {
      return { allowed: true } // Would need team membership check in real implementation
    }
    
    return {
      allowed: false,
      reason: 'Cannot access other user profiles'
    }
  }
  
  return { allowed: true }
}