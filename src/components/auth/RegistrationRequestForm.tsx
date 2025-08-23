'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { RegistrationRequest } from '@/types'
import { ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/lib/auth/permissions'

interface RegistrationRequestFormProps {
  onSuccess?: () => void
}

export default function RegistrationRequestForm({ onSuccess }: RegistrationRequestFormProps) {
  const { submitRegistrationRequest, loading } = useAuth()
  const [formData, setFormData] = useState<RegistrationRequest>({
    email: '',
    first_name: '',
    last_name: '',
    role: ROLES.RECRUITER,
    department: '',
    reason: ''
  })
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof RegistrationRequest, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof RegistrationRequest, string>> = {}

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required'
    }

    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required'
    }

    if (!formData.role) {
      errors.role = 'Role is required'
    }

    if (!formData.reason?.trim()) {
      errors.reason = 'Please explain why you need access to this system'
    } else if (formData.reason.length < 20) {
      errors.reason = 'Please provide a more detailed explanation (at least 20 characters)'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear field error when user starts typing
    if (formErrors[name as keyof RegistrationRequest]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name as keyof RegistrationRequest]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      const result = await submitRegistrationRequest(formData)
      
      if (result.success) {
        setIsSuccess(true)
        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (error) {
      console.error('Registration request error:', error)
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
            <h2 className="text-2xl font-bold text-[#F5F5F5] mb-2">Request Submitted!</h2>
            <p className="text-gray-400 mb-4">
              Your access request has been submitted successfully.
            </p>
          </div>

          <div className="bg-[#34D399]/10 border border-[#34D399]/20 rounded-lg p-4 mb-6">
            <p className="text-[#34D399] text-sm mb-2 font-semibold">What happens next?</p>
            <ul className="text-gray-300 text-sm space-y-1 text-left">
              <li>• Your request will be reviewed by an administrator</li>
              <li>• You&apos;ll receive an email notification about the status</li>
              <li>• If approved, you&apos;ll get login credentials</li>
              <li>• The review process typically takes 1-2 business days</li>
            </ul>
          </div>

          <Link 
            href="/auth/login"
            className="inline-flex items-center text-[#34D399] hover:text-[#2DD889] text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#F5F5F5] mb-2">Request Access</h2>
          <p className="text-gray-400">Submit a request to join the AI Agent Workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-[#F5F5F5] mb-2">
                First Name
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className={`
                  w-full px-4 py-3 bg-[#191D24] border rounded-lg text-[#F5F5F5] 
                  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34D399]
                  ${formErrors.first_name ? 'border-red-500' : 'border-[#4A5568]'}
                `}
                placeholder="John"
                disabled={isSubmitting || loading}
              />
              {formErrors.first_name && (
                <p className="mt-1 text-sm text-red-400">{formErrors.first_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-[#F5F5F5] mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className={`
                  w-full px-4 py-3 bg-[#191D24] border rounded-lg text-[#F5F5F5] 
                  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34D399]
                  ${formErrors.last_name ? 'border-red-500' : 'border-[#4A5568]'}
                `}
                placeholder="Doe"
                disabled={isSubmitting || loading}
              />
              {formErrors.last_name && (
                <p className="mt-1 text-sm text-red-400">{formErrors.last_name}</p>
              )}
            </div>
          </div>

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
              placeholder="john.doe@company.com"
              disabled={isSubmitting || loading}
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-400">{formErrors.email}</p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-[#F5F5F5] mb-2">
              Requested Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className={`
                w-full px-4 py-3 bg-[#191D24] border rounded-lg text-[#F5F5F5] 
                focus:outline-none focus:ring-2 focus:ring-[#34D399]
                ${formErrors.role ? 'border-red-500' : 'border-[#4A5568]'}
              `}
              disabled={isSubmitting || loading}
            >
              {Object.entries(ROLE_LABELS).map(([value, label]) => {
                // Don't allow admin role selection in self-registration
                if (value === ROLES.ADMIN) return null
                
                return (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              })}
            </select>
            <p className="mt-1 text-xs text-gray-400">
              {ROLE_DESCRIPTIONS[formData.role]}
            </p>
            {formErrors.role && (
              <p className="mt-1 text-sm text-red-400">{formErrors.role}</p>
            )}
          </div>

          {/* Department Field */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-[#F5F5F5] mb-2">
              Department <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="
                w-full px-4 py-3 bg-[#191D24] border border-[#4A5568] rounded-lg text-[#F5F5F5] 
                placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34D399]
              "
              placeholder="e.g., Sales, HR, Marketing"
              disabled={isSubmitting || loading}
            />
          </div>

          {/* Reason Field */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-[#F5F5F5] mb-2">
              Reason for Access
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              rows={4}
              className={`
                w-full px-4 py-3 bg-[#191D24] border rounded-lg text-[#F5F5F5] 
                placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34D399] resize-none
                ${formErrors.reason ? 'border-red-500' : 'border-[#4A5568]'}
              `}
              placeholder="Please explain why you need access to this system and how you plan to use it..."
              disabled={isSubmitting || loading}
            />
            {formErrors.reason && (
              <p className="mt-1 text-sm text-red-400">{formErrors.reason}</p>
            )}
          </div>

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
                Submitting Request...
              </>
            ) : (
              'Submit Access Request'
            )}
          </button>

          {/* Link back to login */}
          <div className="text-center">
            <Link 
              href="/auth/login"
              className="text-[#34D399] hover:text-[#2DD889] text-sm font-medium transition-colors"
            >
              Already have an account? Sign In
            </Link>
          </div>
        </form>
      </div>

      {/* Information Box */}
      <div className="mt-6">
        <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-4">
          <h3 className="text-sm font-medium text-[#F5F5F5] mb-2">Request Process</h3>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• All access requests require administrator approval</li>
            <li>• You will receive an email notification about your request status</li>
            <li>• Approved users will receive login credentials via email</li>
            <li>• For urgent requests, contact your IT administrator directly</li>
          </ul>
        </div>
      </div>
    </div>
  )
}