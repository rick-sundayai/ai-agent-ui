'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getDefaultRedirectForRole } from '@/lib/auth/permissions'
import LoginForm, { LoginFormSkeleton } from '@/components/auth/LoginForm'

export default function LoginPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user && profile) {
      const redirectTo = getDefaultRedirectForRole(profile.role)
      router.replace(redirectTo)
    }
  }, [user, profile, loading, router])

  const handleLoginSuccess = () => {
    // The useAuth hook will handle the redirect automatically
    // based on the user's role when auth state changes
  }

  // Show loading skeleton while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#191D24] flex items-center justify-center p-4">
        <LoginFormSkeleton />
      </div>
    )
  }

  // Don't render login form if user is already authenticated
  if (user && profile) {
    return (
      <div className="min-h-screen bg-[#191D24] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#34D399] mx-auto mb-4"></div>
          <p className="text-[#F5F5F5]">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#191D24] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex items-center justify-center">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">
          {/* Left side - Branding/Welcome */}
          <div className="flex-1 max-w-lg text-center lg:text-left">
            <div className="mb-8">
              <h1 className="text-4xl lg:text-5xl font-bold text-[#F5F5F5] mb-4">
                AI Agent
                <span className="block text-[#34D399]">Workspace</span>
              </h1>
              <p className="text-lg text-gray-400 mb-6">
                Your intelligent workspace for sales and recruitment operations. 
                Streamline workflows, analyze data, and accelerate results.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="bg-[#2D3748] border border-[#4A5568] rounded-lg p-4">
                  <div className="text-[#34D399] font-semibold mb-1">Sales Managers</div>
                  <div className="text-gray-400">Team oversight & analytics</div>
                </div>
                <div className="bg-[#2D3748] border border-[#4A5568] rounded-lg p-4">
                  <div className="text-[#34D399] font-semibold mb-1">Recruiters</div>
                  <div className="text-gray-400">Candidate management</div>
                </div>
                <div className="bg-[#2D3748] border border-[#4A5568] rounded-lg p-4">
                  <div className="text-[#34D399] font-semibold mb-1">Administrators</div>
                  <div className="text-gray-400">System management</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="flex-1 w-full max-w-md">
            <LoginForm onSuccess={handleLoginSuccess} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-gray-500">
          © 2025 AI Agent Workspace. Secure business intelligence platform.
        </p>
      </div>
    </div>
  )
}