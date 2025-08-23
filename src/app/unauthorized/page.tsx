'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { getDefaultRedirectForRole, ROLE_LABELS } from '@/lib/auth/permissions'

export default function UnauthorizedPage() {
  const { profile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  const userDashboard = profile ? getDefaultRedirectForRole(profile.role) : '/dashboard'

  return (
    <div className="min-h-screen bg-[#191D24] flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-[#2D3748] rounded-lg border border-orange-500/20 p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0h-2m9-5a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#F5F5F5] mb-2">Access Denied</h2>
            <p className="text-gray-400 mb-4">
              You don&apos;t have permission to access this page.
            </p>
          </div>

          {profile && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-6">
              <h3 className="text-orange-400 font-semibold mb-2">Your Account Details:</h3>
              <div className="text-gray-300 text-sm space-y-1 text-left">
                <p><span className="font-medium">Role:</span> {ROLE_LABELS[profile.role]}</p>
                <p><span className="font-medium">Status:</span> {profile.status}</p>
                <p><span className="font-medium">Email:</span> {profile.email}</p>
              </div>
            </div>
          )}

          <div className="bg-[#191D24] border border-[#4A5568] rounded-lg p-4 mb-6">
            <h3 className="text-[#F5F5F5] font-semibold mb-2">What you can do:</h3>
            <ul className="text-gray-400 text-sm space-y-1 text-left">
              <li>• Go back to your dashboard</li>
              <li>• Contact your administrator for access</li>
              <li>• Check if you need a different role</li>
              <li>• Sign out and use a different account</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link 
              href={userDashboard}
              className="
                inline-flex items-center justify-center w-full bg-[#34D399] hover:bg-[#2DD889] 
                text-[#191D24] font-semibold py-3 px-4 rounded-lg transition-colors duration-200
              "
            >
              Go to Dashboard
            </Link>
            
            <button 
              onClick={handleSignOut}
              className="
                w-full border border-[#4A5568] text-[#F5F5F5] hover:bg-[#4A5568] 
                font-medium py-3 px-4 rounded-lg transition-colors duration-200
              "
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Help section */}
        <div className="mt-6">
          <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-4 text-center">
            <h3 className="text-sm font-medium text-[#F5F5F5] mb-2">Need Access?</h3>
            <p className="text-xs text-gray-400 mb-3">
              If you believe you should have access to this page, contact your system administrator.
            </p>
            <p className="text-xs text-gray-500">
              They can update your role permissions or provide access to the resources you need.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}