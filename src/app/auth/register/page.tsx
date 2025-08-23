'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getDefaultRedirectForRole } from '@/lib/auth/permissions'
import RegistrationRequestForm from '@/components/auth/RegistrationRequestForm'

export default function RegisterPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user && profile) {
      const redirectTo = getDefaultRedirectForRole(profile.role)
      router.replace(redirectTo)
    }
  }, [user, profile, loading, router])

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#191D24] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#34D399] mx-auto mb-4"></div>
          <p className="text-[#F5F5F5]">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render registration form if user is already authenticated
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
          {/* Left side - Information */}
          <div className="flex-1 max-w-lg text-center lg:text-left">
            <div className="mb-8">
              <h1 className="text-4xl lg:text-5xl font-bold text-[#F5F5F5] mb-4">
                Join Our
                <span className="block text-[#34D399]">Workspace</span>
              </h1>
              <p className="text-lg text-gray-400 mb-6">
                Get access to our AI-powered workspace designed for sales teams, 
                recruiters, and business professionals.
              </p>
              
              <div className="space-y-4">
                <div className="bg-[#2D3748] border border-[#4A5568] rounded-lg p-4">
                  <h3 className="text-[#34D399] font-semibold mb-2">🚀 What you&apos;ll get:</h3>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• AI-powered data analysis and insights</li>
                    <li>• Streamlined workflow automation</li>
                    <li>• Real-time collaboration tools</li>
                    <li>• Advanced reporting and analytics</li>
                    <li>• Role-based access and permissions</li>
                  </ul>
                </div>

                <div className="bg-[#2D3748] border border-[#4A5568] rounded-lg p-4">
                  <h3 className="text-[#34D399] font-semibold mb-2">⚡ Quick Setup:</h3>
                  <ol className="text-sm text-gray-400 space-y-1">
                    <li>1. Submit your access request</li>
                    <li>2. Wait for administrator approval</li>
                    <li>3. Receive your login credentials</li>
                    <li>4. Start using the workspace!</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Registration Form */}
          <div className="flex-1 w-full max-w-md">
            <RegistrationRequestForm />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-gray-500">
          All access requests are reviewed by system administrators for security purposes.
        </p>
      </div>
    </div>
  )
}