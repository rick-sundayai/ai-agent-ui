'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/lib/auth/auth-service'
import { UserInvitation } from '@/types'
import { getDefaultRedirectForRole } from '@/lib/auth/permissions'
import PasswordSetupForm, { PasswordSetupSkeleton } from '@/components/auth/PasswordSetupForm'
import Link from 'next/link'

export default function PasswordSetupPage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  
  const [invitation, setInvitation] = useState<UserInvitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  
  const token = params?.token as string

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user && profile) {
      const redirectTo = getDefaultRedirectForRole(profile.role)
      router.replace(redirectTo)
    }
  }, [user, profile, authLoading, router])

  // Validate invitation token
  useEffect(() => {
    const validateInvitation = async () => {
      if (!token) {
        setError('Invalid invitation link - no token provided')
        setLoading(false)
        return
      }

      try {
        const { invitation, error: inviteError } = await authService.getInvitationDetails(token)
        
        if (inviteError || !invitation) {
          setError(inviteError || 'Invalid or expired invitation')
          setLoading(false)
          return
        }

        setInvitation(invitation)
        setError('')
      } catch (error) {
        console.error('Invitation validation error:', error)
        setError(error instanceof Error ? error.message : 'Failed to validate invitation')
      } finally {
        setLoading(false)
      }
    }

    // Only validate if not already authenticated
    if (!authLoading && !user) {
      validateInvitation()
    }
  }, [token, authLoading, user])

  const handleSetupSuccess = () => {
    // Redirect to login page after successful setup
    router.push('/auth/login?message=account-created')
  }

  // Show loading while checking auth or validating invitation
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#191D24] flex items-center justify-center p-4">
        <PasswordSetupSkeleton />
      </div>
    )
  }

  // Don't render if user is already authenticated
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

  // Error state
  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-[#191D24] flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-[#2D3748] rounded-lg border border-red-500/20 p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#F5F5F5] mb-2">Invitation Invalid</h2>
              <p className="text-gray-400 mb-4">
                {error || 'This invitation link is invalid or has expired.'}
              </p>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <h3 className="text-red-400 font-semibold mb-2">Possible reasons:</h3>
              <ul className="text-gray-300 text-sm space-y-1 text-left">
                <li>• The invitation link has expired (valid for 7 days)</li>
                <li>• The invitation has already been accepted</li>
                <li>• The link was copied incorrectly</li>
                <li>• The invitation was cancelled by an administrator</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Link 
                href="/auth/register"
                className="
                  inline-flex items-center justify-center w-full bg-[#34D399] hover:bg-[#2DD889] 
                  text-[#191D24] font-semibold py-3 px-4 rounded-lg transition-colors duration-200
                "
              >
                Request New Access
              </Link>
              
              <Link 
                href="/auth/login"
                className="
                  inline-flex items-center justify-center w-full border border-[#4A5568] 
                  text-[#F5F5F5] hover:bg-[#4A5568] font-medium py-3 px-4 rounded-lg transition-colors duration-200
                "
              >
                Back to Login
              </Link>
            </div>
          </div>

          {/* Help section */}
          <div className="mt-6">
            <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-4 text-center">
              <h3 className="text-sm font-medium text-[#F5F5F5] mb-2">Need Help?</h3>
              <p className="text-xs text-gray-400 mb-3">
                If you believe this is an error, contact the person who invited you or your system administrator.
              </p>
              <p className="text-xs text-gray-500">
                They can send you a new invitation or help resolve any issues with your account setup.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Valid invitation - show password setup form
  return (
    <div className="min-h-screen bg-[#191D24] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex items-center justify-center">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">
          {/* Left side - Welcome message */}
          <div className="flex-1 max-w-lg text-center lg:text-left">
            <div className="mb-8">
              <h1 className="text-4xl lg:text-5xl font-bold text-[#F5F5F5] mb-4">
                You&apos;re
                <span className="block text-[#34D399]">Invited!</span>
              </h1>
              <p className="text-lg text-gray-400 mb-6">
                Welcome to the AI Agent Workspace. Complete your account setup 
                to start collaborating with your team.
              </p>
              
              <div className="space-y-4">
                <div className="bg-[#2D3748] border border-[#4A5568] rounded-lg p-4">
                  <h3 className="text-[#34D399] font-semibold mb-2">🎉 You&apos;ve been invited to join as:</h3>
                  <div className="text-[#F5F5F5] font-medium">
                    {invitation.first_name} {invitation.last_name}
                  </div>
                  <div className="text-gray-400 text-sm">{invitation.email}</div>
                  <div className="text-[#34D399] text-sm mt-1">
                    Role: {invitation.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                </div>

                <div className="bg-[#2D3748] border border-[#4A5568] rounded-lg p-4">
                  <h3 className="text-[#34D399] font-semibold mb-2">🔐 Security First:</h3>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Create a strong, unique password</li>
                    <li>• Your account will be immediately active</li>
                    <li>• You&apos;ll have access to role-appropriate features</li>
                    <li>• Your data is encrypted and secure</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Password Setup Form */}
          <div className="flex-1 w-full max-w-md">
            <PasswordSetupForm 
              token={token}
              invitation={invitation}
              onSuccess={handleSetupSuccess}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-gray-500">
          This invitation is valid for 7 days from the date it was sent.
        </p>
      </div>
    </div>
  )
}