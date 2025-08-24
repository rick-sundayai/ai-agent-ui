'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/lib/auth/auth-service'
import { getDefaultRedirectForRole } from '@/lib/auth/permissions'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile, loading: authLoading } = useAuth()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [formErrors, setFormErrors] = useState<{password?: string, confirmPassword?: string}>({})

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user && profile) {
      const redirectTo = getDefaultRedirectForRole(profile.role)
      router.replace(redirectTo)
    }
  }, [user, profile, authLoading, router])

  const validateForm = (): boolean => {
    const errors: {password?: string, confirmPassword?: string} = {}

    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      const { success, error: resetError } = await authService.updatePassword({ password })
      
      if (success) {
        setIsSuccess(true)
      } else {
        setError(resetError || 'Failed to reset password')
      }
    } catch (error) {
      console.error('Password reset error:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#191D24] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#34D399] mx-auto mb-4"></div>
          <p className="text-[#F5F5F5]">Loading...</p>
        </div>
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

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#191D24] flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-[#34D399] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#191D24]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#F5F5F5] mb-2">Password Reset!</h2>
              <p className="text-gray-400 mb-4">
                Your password has been successfully updated.
              </p>
            </div>

            <div className="bg-[#34D399]/10 border border-[#34D399]/20 rounded-lg p-4 mb-6">
              <p className="text-[#34D399] text-sm mb-2 font-semibold">What's next?</p>
              <ul className="text-gray-300 text-sm space-y-1 text-left">
                <li>• Your new password is now active</li>
                <li>• You can sign in with your new credentials</li>
                <li>• Make sure to store it securely</li>
                <li>• Consider enabling two-factor authentication</li>
              </ul>
            </div>

            <Link 
              href="/auth/login"
              className="inline-flex items-center justify-center w-full bg-[#34D399] hover:bg-[#2DD889] text-[#191D24] font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Continue to Login
            </Link>
          </div>
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
                Create New
                <span className="block text-[#34D399]">Password</span>
              </h1>
              <p className="text-lg text-gray-400 mb-6">
                Choose a strong password to secure your account and protect your data.
              </p>
              
              <div className="bg-[#2D3748] border border-[#4A5568] rounded-lg p-4">
                <h3 className="text-[#34D399] font-semibold mb-2">🔐 Password Requirements:</h3>
                <ul className="text-sm text-gray-400 space-y-1 text-left">
                  <li>• At least 8 characters long</li>
                  <li>• Contains uppercase and lowercase letters</li>
                  <li>• Includes at least one number</li>
                  <li>• Avoid common passwords</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right side - Reset Form */}
          <div className="flex-1 w-full max-w-md">
            <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#F5F5F5] mb-2">Reset Password</h2>
                <p className="text-gray-400">Enter your new password below</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[#F5F5F5] mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (formErrors.password) {
                        setFormErrors(prev => ({ ...prev, password: undefined }))
                      }
                      if (error) setError('')
                    }}
                    className={`
                      w-full px-4 py-3 bg-[#191D24] border rounded-lg text-[#F5F5F5] 
                      placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34D399]
                      ${formErrors.password ? 'border-red-500' : 'border-[#4A5568]'}
                    `}
                    placeholder="Create a secure password"
                    disabled={loading}
                  />
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-400">{formErrors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#F5F5F5] mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (formErrors.confirmPassword) {
                        setFormErrors(prev => ({ ...prev, confirmPassword: undefined }))
                      }
                      if (error) setError('')
                    }}
                    className={`
                      w-full px-4 py-3 bg-[#191D24] border rounded-lg text-[#F5F5F5] 
                      placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34D399]
                      ${formErrors.confirmPassword ? 'border-red-500' : 'border-[#4A5568]'}
                    `}
                    placeholder="Confirm your password"
                    disabled={loading}
                  />
                  {formErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-400">{formErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full bg-[#34D399] hover:bg-[#2DD889] disabled:opacity-50 
                    disabled:cursor-not-allowed text-[#191D24] font-semibold py-3 px-4 
                    rounded-lg transition-colors duration-200 flex items-center justify-center
                  "
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#191D24]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating Password...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>

                <div className="text-center">
                  <Link 
                    href="/auth/login"
                    className="text-[#34D399] hover:text-[#2DD889] text-sm font-medium transition-colors"
                  >
                    Back to Login
                  </Link>
                </div>
              </form>
            </div>

            <div className="mt-6 text-center">
              <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-4">
                <p className="text-sm text-gray-400 mb-2">
                  Having trouble?
                </p>
                <p className="text-xs text-gray-500">
                  Contact your system administrator if you continue to experience issues.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}