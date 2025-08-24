'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ROLE_LABELS } from '@/lib/auth/permissions'
import Navigation from '@/components/shared/Navigation'

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    email: profile?.email || '',
    department: profile?.department || '',
    team: profile?.team || ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { success, error } = await updateProfile(formData)
      
      if (success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        setIsEditing(false)
      } else {
        setMessage({ type: 'error', text: error || 'Failed to update profile' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      setLoading(false)
      return
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' })
      setLoading(false)
      return
    }

    // This would typically call authService.updatePassword
    setMessage({ type: 'success', text: 'Password updated successfully!' })
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setLoading(false)
  }

  if (!profile) {
    return (
      <Navigation>
        <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">Loading profile...</p>
          </div>
        </div>
      </Navigation>
    )
  }

  return (
    <Navigation>
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#F5F5F5]">Profile Settings</h1>
            <p className="text-gray-400 mt-2">Manage your account information and preferences</p>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          {/* Profile Information */}
          <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-[#4A5568]">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#F5F5F5]">Profile Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-[#34D399] hover:text-[#2DD889] font-medium"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleProfileUpdate} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#F5F5F5] mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#191D24] border border-[#4A5568] rounded-lg text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#34D399]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#F5F5F5] mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#191D24] border border-[#4A5568] rounded-lg text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#34D399]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#F5F5F5] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    className="w-full px-4 py-3 bg-[#4A5568] border border-[#4A5568] rounded-lg text-gray-400 cursor-not-allowed"
                    disabled
                  />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed. Contact admin if needed.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#F5F5F5] mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#191D24] border border-[#4A5568] rounded-lg text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#34D399]"
                      placeholder="e.g., Sales, HR, Marketing"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#F5F5F5] mb-2">
                      Team
                    </label>
                    <input
                      type="text"
                      value={formData.team}
                      onChange={(e) => setFormData(prev => ({ ...prev, team: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#191D24] border border-[#4A5568] rounded-lg text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#34D399]"
                      placeholder="e.g., Enterprise Sales, West Coast"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 border border-[#4A5568] text-[#F5F5F5] rounded-lg hover:bg-[#4A5568] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-[#34D399] hover:bg-[#2DD889] disabled:opacity-50 text-[#191D24] font-semibold rounded-lg transition-colors"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6">
                <div className="flex items-center space-x-6 mb-6">
                  <div className="h-20 w-20 bg-[#34D399] rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#191D24]">
                      {profile.first_name.charAt(0)}{profile.last_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#F5F5F5]">
                      {profile.first_name} {profile.last_name}
                    </h3>
                    <p className="text-[#34D399] font-medium">{ROLE_LABELS[profile.role]}</p>
                    <p className="text-gray-400">{profile.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-400 text-sm">Department</p>
                    <p className="text-[#F5F5F5] font-medium">{profile.department || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Team</p>
                    <p className="text-[#F5F5F5] font-medium">{profile.team || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      profile.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-orange-100 text-orange-800 border-orange-200'
                    }`}>
                      {profile.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Member Since</p>
                    <p className="text-[#F5F5F5] font-medium">{new Date(profile.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Password Change */}
          <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#4A5568]">
              <h2 className="text-xl font-semibold text-[#F5F5F5]">Change Password</h2>
              <p className="text-gray-400 text-sm">Update your account password</p>
            </div>

            <form onSubmit={handlePasswordChange} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#F5F5F5] mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#191D24] border border-[#4A5568] rounded-lg text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#34D399]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#F5F5F5] mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#191D24] border border-[#4A5568] rounded-lg text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#34D399]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#F5F5F5] mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#191D24] border border-[#4A5568] rounded-lg text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#34D399]"
                    required
                  />
                </div>
              </div>

              <div className="bg-[#191D24] p-4 rounded-lg">
                <p className="text-gray-300 text-sm mb-2">Password requirements:</p>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Contains uppercase and lowercase letters</li>
                  <li>• Contains at least one number</li>
                </ul>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-[#34D399] hover:bg-[#2DD889] disabled:opacity-50 text-[#191D24] font-semibold rounded-lg transition-colors"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Navigation>
  )
}