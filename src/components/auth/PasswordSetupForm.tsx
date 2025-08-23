'use client'

import { useState } from 'react'
import Link from 'next/link'
import { authService } from '@/lib/auth/auth-service'
import { PasswordSetupForm as PasswordSetupFormType, UserInvitation } from '@/types'
import { ROLE_LABELS } from '@/lib/auth/permissions'

interface PasswordSetupFormProps {
  token: string
  invitation: UserInvitation
  onSuccess?: () => void
}

export default function PasswordSetupForm({ token, invitation, onSuccess }: PasswordSetupFormProps) {
  const [formData, setFormData] = useState<PasswordSetupFormType>({
    password: '',
    confirmPassword: ''
  })
  const [formErrors, setFormErrors] = useState<Partial<PasswordSetupFormType>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>('')
  const [isSuccess, setIsSuccess] = useState(false)

  const validateForm = (): boolean => {
    const errors: Partial<PasswordSetupFormType> = {}

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear field error when user starts typing
    if (formErrors[name as keyof PasswordSetupFormType]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }))
    }
    
    // Clear general error
    if (error) {
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    setError('')
    
    try {
      const { user, error: acceptError } = await authService.acceptInvitation(token, formData)
      
      if (acceptError) {
        setError(acceptError)
        return
      }
      
      if (user) {
        setIsSuccess(true)
        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (error) {
      console.error('Password setup error:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-[#34D399] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#191D24]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#F5F5F5] mb-2">Welcome Aboard!</h2>
            <p className="text-gray-400 mb-4">
              Your account has been successfully created and activated.
            </p>
          </div>

          <div className="bg-[#34D399]/10 border border-[#34D399]/20 rounded-lg p-4 mb-6">
            <p className="text-[#34D399] text-sm mb-2 font-semibold">Account Details:</p>
            <div className="text-gray-300 text-sm space-y-1 text-left">
              <p><span className="font-medium">Name:</span> {invitation.first_name} {invitation.last_name}</p>
              <p><span className="font-medium">Email:</span> {invitation.email}</p>
              <p><span className="font-medium">Role:</span> {ROLE_LABELS[invitation.role]}</p>
              {invitation.department && (
                <p><span className="font-medium">Department:</span> {invitation.department}</p>
              )}
            </div>
          </div>

          <Link 
            href="/auth/login"
            className="
              inline-flex items-center justify-center w-full bg-[#34D399] hover:bg-[#2DD889] 
              text-[#191D24] font-semibold py-3 px-4 rounded-lg transition-colors duration-200
            "
          >
            Continue to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#F5F5F5] mb-2">Set Up Your Password</h2>
          <p className="text-gray-400 mb-4">
            Welcome to AI Agent Workspace! Please create a secure password to complete your account setup.
          </p>
          
          {/* Invitation Details */}
          <div className="bg-[#191D24] border border-[#4A5568] rounded-lg p-4 text-left">
            <p className="text-sm text-gray-400 mb-2">Account Details:</p>
            <div className="space-y-1">
              <p className="text-[#F5F5F5] text-sm">
                <span className="font-medium">{invitation.first_name} {invitation.last_name}</span>
              </p>
              <p className="text-gray-300 text-sm">{invitation.email}</p>
              <p className="text-[#34D399] text-sm">{ROLE_LABELS[invitation.role]}</p>
              {invitation.department && (
                <p className="text-gray-300 text-sm">{invitation.department}</p>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#F5F5F5] mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`
                w-full px-4 py-3 bg-[#191D24] border rounded-lg text-[#F5F5F5] 
                placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34D399]
                ${formErrors.password ? 'border-red-500' : 'border-[#4A5568]'}
              `}
              placeholder="Create a secure password"
              disabled={isSubmitting}
            />
            {formErrors.password && (
              <p className="mt-1 text-sm text-red-400">{formErrors.password}</p>
            )}
            <div className="mt-2 text-xs text-gray-400">
              Password must be at least 8 characters with uppercase, lowercase, and number
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#F5F5F5] mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`
                w-full px-4 py-3 bg-[#191D24] border rounded-lg text-[#F5F5F5] 
                placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34D399]
                ${formErrors.confirmPassword ? 'border-red-500' : 'border-[#4A5568]'}
              `}
              placeholder="Confirm your password"
              disabled={isSubmitting}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="
              w-full bg-[#34D399] hover:bg-[#2DD889] disabled:opacity-50 
              disabled:cursor-not-allowed text-[#191D24] font-semibold py-3 px-4 
              rounded-lg transition-colors duration-200 flex items-center justify-center
            "
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#191D24]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </>
            ) : (
              'Create Account & Sign In'
            )}
          </button>

          {/* Security Note */}
          <div className="text-center">
            <p className="text-xs text-gray-400">
              By creating an account, you agree to our security policies and user guidelines.
            </p>
          </div>
        </form>
      </div>

      {/* Help */}
      <div className="mt-6 text-center">
        <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-4">
          <p className="text-sm text-gray-400 mb-2">
            Having trouble with your invitation?
          </p>
          <p className="text-xs text-gray-500">
            Contact your system administrator or the person who invited you for assistance.
          </p>
        </div>
      </div>
    </div>
  )
}

// Loading skeleton for invitation validation
export function PasswordSetupSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-8">
        <div className="text-center mb-8">
          <div className="h-8 bg-[#4A5568] rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-[#4A5568] rounded animate-pulse w-3/4 mx-auto mb-4"></div>
          <div className="bg-[#191D24] border border-[#4A5568] rounded-lg p-4">
            <div className="h-4 bg-[#4A5568] rounded animate-pulse mb-2"></div>
            <div className="space-y-2">
              <div className="h-3 bg-[#4A5568] rounded animate-pulse"></div>
              <div className="h-3 bg-[#4A5568] rounded animate-pulse w-2/3"></div>
              <div className="h-3 bg-[#4A5568] rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="h-4 bg-[#4A5568] rounded animate-pulse mb-2 w-1/4"></div>
            <div className="h-12 bg-[#191D24] border border-[#4A5568] rounded-lg animate-pulse"></div>
          </div>
          <div>
            <div className="h-4 bg-[#4A5568] rounded animate-pulse mb-2 w-1/4"></div>
            <div className="h-12 bg-[#191D24] border border-[#4A5568] rounded-lg animate-pulse"></div>
          </div>
          <div className="h-12 bg-[#34D399] rounded-lg animate-pulse opacity-50"></div>
        </div>
      </div>
    </div>
  )
}