'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { LoginForm as LoginFormType } from '@/types'

interface LoginFormProps {
  onSuccess?: () => void
  redirectTo?: string
}

export default function LoginForm({ onSuccess, redirectTo }: LoginFormProps) {
  const { signIn, loading, error } = useAuth()
  const [formData, setFormData] = useState<LoginFormType>({
    email: '',
    password: ''
  })
  const [formErrors, setFormErrors] = useState<Partial<LoginFormType>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const errors: Partial<LoginFormType> = {}

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear field error when user starts typing
    if (formErrors[name as keyof LoginFormType]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      const result = await signIn(formData)
      
      if (result.success) {
        if (onSuccess) {
          onSuccess()
        } else if (redirectTo) {
          window.location.href = redirectTo
        } else {
          // Default redirect will be handled by auth context
          window.location.href = '/dashboard'
        }
      }
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#F5F5F5] mb-2">Welcome Back</h2>
          <p className="text-gray-400">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#F5F5F5] mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`
                w-full px-4 py-3 bg-[#191D24] border rounded-lg text-[#F5F5F5] 
                placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34D399]
                ${formErrors.email ? 'border-red-500' : 'border-[#4A5568]'}
              `}
              placeholder="Enter your email address"
              disabled={isSubmitting || loading}
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-400">{formErrors.email}</p>
            )}
          </div>

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
              placeholder="Enter your password"
              disabled={isSubmitting || loading}
            />
            {formErrors.password && (
              <p className="mt-1 text-sm text-red-400">{formErrors.password}</p>
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
            disabled={isSubmitting || loading}
            className="
              w-full bg-[#34D399] hover:bg-[#2DD889] disabled:opacity-50 
              disabled:cursor-not-allowed text-[#191D24] font-semibold py-3 px-4 
              rounded-lg transition-colors duration-200 flex items-center justify-center
            "
          >
            {isSubmitting || loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#191D24]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Links */}
          <div className="space-y-4 text-center">
            <Link 
              href="/auth/forgot-password"
              className="text-[#34D399] hover:text-[#2DD889] text-sm font-medium transition-colors"
            >
              Forgot your password?
            </Link>
            
            <div className="text-gray-400 text-sm">
              Don&apos;t have an account?{' '}
              <Link 
                href="/auth/register"
                className="text-[#34D399] hover:text-[#2DD889] font-medium transition-colors"
              >
                Request Access
              </Link>
            </div>
          </div>
        </form>
      </div>

      {/* Additional Information */}
      <div className="mt-6 text-center">
        <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-4">
          <p className="text-sm text-gray-400 mb-2">
            Need access to the system?
          </p>
          <p className="text-xs text-gray-500">
            Contact your administrator or submit a request for account creation.
          </p>
        </div>
      </div>
    </div>
  )
}

// Loading skeleton component
export function LoginFormSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-8">
        <div className="text-center mb-8">
          <div className="h-8 bg-[#4A5568] rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-[#4A5568] rounded animate-pulse w-3/4 mx-auto"></div>
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