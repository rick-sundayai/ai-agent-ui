/**
 * Utility to clear authentication state from browser
 * Use this when encountering JWT/token mismatch errors
 */

export async function clearAuthState() {
  try {
    console.log('🧹 Clearing browser authentication state...')
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.clear()
      console.log('✅ localStorage cleared')
      
      // Clear sessionStorage
      sessionStorage.clear()
      console.log('✅ sessionStorage cleared')
      
      // Clear cookies (Supabase auth cookies)
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=")
        const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim()
        if (name.includes('supabase') || name.includes('sb-')) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
        }
      })
      console.log('✅ Supabase cookies cleared')
      
      console.log('✅ Browser authentication state cleared successfully')
      console.log('💡 Please refresh the page or restart your browser')
    }
  } catch (error) {
    console.error('❌ Error clearing auth state:', error)
  }
}

// Function to check if we're likely experiencing JWT issues
export function detectJWTIssues(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check if there are any Supabase auth cookies
  const hasSBCookies = document.cookie.includes('supabase') || document.cookie.includes('sb-')
  
  // Check localStorage for any Supabase tokens
  const hasLSTokens = Object.keys(localStorage).some(key => 
    key.includes('supabase') || key.includes('sb-')
  )
  
  return hasSBCookies || hasLSTokens
}

// Auto-clear on specific errors
export function handleAuthError(error: Error) {
  const isJWTError = 
    error.message.includes('User from sub claim in JWT does not exist') ||
    error.message.includes('JWT') ||
    error.message.includes('token') ||
    error.message.includes('Invalid JWT')
  
  if (isJWTError) {
    console.log('🔍 JWT error detected, clearing auth state...')
    clearAuthState()
    return true
  }
  
  return false
}