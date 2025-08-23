'use client'

import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ROLE_LABELS } from '@/lib/auth/permissions'
import { Suspense } from 'react'

function PendingPageContent() {
  const searchParams = useSearchParams()
  const { profile, signOut } = useAuth()
  
  const status = searchParams?.get('status') || profile?.status || 'pending'

  const handleSignOut = async () => {
    await signOut()
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          title: 'Account Pending Approval',
          description: 'Your account is awaiting administrator approval.',
          icon: '⏳',
          color: 'orange',
          actions: [
            'Your account will be reviewed by an administrator',
            'You will receive an email when your account is approved',
            'This process typically takes 1-2 business days',
            'Contact your administrator if you need urgent access'
          ]
        }
      case 'inactive':
        return {
          title: 'Account Inactive',
          description: 'Your account has been temporarily deactivated.',
          icon: '🔒',
          color: 'red',
          actions: [
            'Your account access has been temporarily suspended',
            'Contact your administrator to reactivate your account',
            'You may need to complete additional requirements',
            'This may be due to security or policy reasons'
          ]
        }
      case 'invited':
        return {
          title: 'Invitation Not Completed',
          description: 'You have an invitation but haven\'t completed setup.',
          icon: '📧',
          color: 'blue',
          actions: [
            'Check your email for the invitation link',
            'Complete the account setup process',
            'Contact the person who invited you if needed',
            'Invitation links expire after 7 days'
          ]
        }
      default:
        return {
          title: 'Account Status Unknown',
          description: 'There\'s an issue with your account status.',
          icon: '❓',
          color: 'gray',
          actions: [
            'Contact your system administrator',
            'Provide them with your account details',
            'This may be a technical issue',
            'Try signing out and back in'
          ]
        }
    }
  }

  const statusInfo = getStatusInfo(status)
  const colorClasses = {
    orange: 'border-orange-500/20 bg-orange-500/20 text-orange-400',
    red: 'border-red-500/20 bg-red-500/20 text-red-400',
    blue: 'border-blue-500/20 bg-blue-500/20 text-blue-400',
    gray: 'border-gray-500/20 bg-gray-500/20 text-gray-400'
  }

  return (
    <div className="min-h-screen bg-[#191D24] flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className={`bg-[#2D3748] rounded-lg border p-8 text-center ${colorClasses[statusInfo.color as keyof typeof colorClasses]?.split(' ')[0] || 'border-[#4A5568]'}`}>
          <div className="mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${colorClasses[statusInfo.color as keyof typeof colorClasses]?.split(' ')[1] || 'bg-[#4A5568]'}`}>
              <span className="text-2xl">{statusInfo.icon}</span>
            </div>
            <h2 className="text-2xl font-bold text-[#F5F5F5] mb-2">{statusInfo.title}</h2>
            <p className="text-gray-400 mb-4">
              {statusInfo.description}
            </p>
          </div>

          {profile && (
            <div className={`border rounded-lg p-4 mb-6 ${colorClasses[statusInfo.color as keyof typeof colorClasses] || 'border-[#4A5568] bg-[#191D24]'}`}>
              <h3 className={`font-semibold mb-2 ${colorClasses[statusInfo.color as keyof typeof colorClasses]?.split(' ')[2] || 'text-[#F5F5F5]'}`}>
                Your Account:
              </h3>
              <div className="text-gray-300 text-sm space-y-1 text-left">
                <p><span className="font-medium">Name:</span> {profile.first_name} {profile.last_name}</p>
                <p><span className="font-medium">Email:</span> {profile.email}</p>
                <p><span className="font-medium">Role:</span> {ROLE_LABELS[profile.role]}</p>
                <p><span className="font-medium">Status:</span> {profile.status}</p>
                {profile.department && (
                  <p><span className="font-medium">Department:</span> {profile.department}</p>
                )}
              </div>
            </div>
          )}

          <div className="bg-[#191D24] border border-[#4A5568] rounded-lg p-4 mb-6">
            <h3 className="text-[#F5F5F5] font-semibold mb-2">Next Steps:</h3>
            <ul className="text-gray-400 text-sm space-y-1 text-left">
              {statusInfo.actions.map((action, index) => (
                <li key={index}>• {action}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="
                w-full bg-[#34D399] hover:bg-[#2DD889] text-[#191D24] 
                font-semibold py-3 px-4 rounded-lg transition-colors duration-200
              "
            >
              Check Status Again
            </button>
            
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

        {/* Contact information */}
        <div className="mt-6">
          <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-4 text-center">
            <h3 className="text-sm font-medium text-[#F5F5F5] mb-2">Need Help?</h3>
            <p className="text-xs text-gray-400 mb-3">
              If you need immediate access or have questions about your account status:
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Contact your system administrator</li>
              <li>• Email your IT department</li>
              <li>• Reach out to the person who invited you</li>
              <li>• Check your email for updates</li>
            </ul>
          </div>
        </div>

        {/* Status-specific additional info */}
        {status === 'pending' && (
          <div className="mt-4">
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 text-center">
              <p className="text-xs text-orange-300">
                ⚡ <strong>Pro Tip:</strong> Make sure to check your spam folder for approval notifications. 
                Some email providers may filter administrative emails.
              </p>
            </div>
          </div>
        )}

        {status === 'invited' && (
          <div className="mt-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
              <p className="text-xs text-blue-300">
                💌 <strong>Missing your invitation?</strong> Ask your administrator to resend the invitation 
                or check if it ended up in your spam folder.
              </p>
            </div>
          </div>
        )}

        {status === 'inactive' && (
          <div className="mt-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
              <p className="text-xs text-red-300">
                🔒 <strong>Account Suspended:</strong> This is usually temporary. Contact your administrator 
                to understand the reason and steps to reactivate.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#191D24] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#34D399] mx-auto mb-4"></div>
          <p className="text-[#F5F5F5]">Loading...</p>
        </div>
      </div>
    }>
      <PendingPageContent />
    </Suspense>
  )
}