'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError('Email is required')
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { success, error } = await resetPassword({ email })
      
      if (success) {
        setIsSuccess(true)
      } else {
        setError(error || 'Failed to send reset email')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#191D24] flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-[#34D399] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#191D24]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#F5F5F5] mb-2">Check Your Email</h2>
              <p className="text-gray-400 mb-4">
                We&apos;ve sent a password reset link to <span className="text-[#34D399]">{email}</span>
              </p>
            </div>

            <div className="bg-[#34D399]/10 border border-[#34D399]/20 rounded-lg p-4 mb-6">
              <p className="text-[#34D399] text-sm mb-2 font-semibold">Next steps:</p>
              <ul className="text-gray-300 text-sm space-y-1 text-left">
                <li>• Check your inbox for the reset email</li>
                <li>• Click the reset link in the email</li>
                <li>• Create a new password</li>
                <li>• Sign in with your new password</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Link 
                href="/auth/login"
                className="inline-flex items-center justify-center w-full bg-[#34D399] hover:bg-[#2DD889] text-[#191D24] font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Back to Login
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-4">
              <p className="text-sm text-gray-400 mb-2">
                Didn&apos;t receive the email?
              </p>
              <div className="space-x-2">
                <button 
                  onClick={() => {
                    setIsSuccess(false)
                    setEmail('')
                  }}
                  className="text-[#34D399] hover:text-[#2DD889] text-sm font-medium"
                >
                  Try again
                </button>
                <span className="text-gray-400">•</span>
                <p className="text-xs text-gray-500 inline">
                  Check your spam folder or contact support
                </p>
              </div>
            </div>
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
                Reset Your
                <span className="block text-[#34D399]">Password</span>
              </h1>
              <p className="text-lg text-gray-400 mb-6">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
              
              <div className="bg-[#2D3748] border border-[#4A5568] rounded-lg p-4">
                <h3 className="text-[#34D399] font-semibold mb-2">🔐 Secure Process:</h3>
                <ul className="text-sm text-gray-400 space-y-1 text-left">
                  <li>• Reset links expire after 1 hour</li>
                  <li>• Links can only be used once</li>
                  <li>• Your account remains secure during the process</li>
                  <li>• No personal information is exposed</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right side - Reset Form */}
          <div className="flex-1 w-full max-w-md">
            <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#F5F5F5] mb-2">Forgot Password</h2>
                <p className="text-gray-400">Enter your email to receive a reset link</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#F5F5F5] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError('')
                    }}
                    className={`
                      w-full px-4 py-3 bg-[#191D24] border rounded-lg text-[#F5F5F5] 
                      placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34D399]
                      ${error ? 'border-red-500' : 'border-[#4A5568]'}
                    `}
                    placeholder="Enter your email address"
                    disabled={loading}
                  />
                  {error && (
                    <p className="mt-1 text-sm text-red-400">{error}</p>
                  )}
                </div>

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
                      Sending Reset Link...
                    </>
                  ) : (
                    'Send Reset Link'
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
                  Remember your password?
                </p>
                <Link 
                  href="/auth/login"
                  className="text-[#34D399] hover:text-[#2DD889] font-medium text-sm"
                >
                  Sign In Instead
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}