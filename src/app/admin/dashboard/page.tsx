'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/lib/auth/auth-service'
import Navigation from '@/components/shared/Navigation'
import { UserProfile } from '@/types'
import { ROLE_LABELS } from '@/lib/auth/permissions'

export default function AdminDashboard() {
  const { user, profile } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { users: allUsers, error } = await authService.getAllUsers()
        if (error) {
          setError(error)
        } else {
          setUsers(allUsers)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    if (profile?.role === 'admin') {
      loadUsers()
    }
  }, [profile])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200'
      case 'invited': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    pendingUsers: users.filter(u => u.status === 'pending').length,
    adminUsers: users.filter(u => u.role === 'admin').length,
    salesManagers: users.filter(u => u.role === 'sales_manager').length,
    recruiters: users.filter(u => u.role === 'recruiter').length
  }

  return (
    <Navigation>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#F5F5F5]">Admin Dashboard</h1>
            <p className="text-gray-400 mt-2">System overview and user management</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-[#F5F5F5]">{stats.totalUsers}</p>
                </div>
                <div className="text-2xl">👥</div>
              </div>
            </div>

            <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Users</p>
                  <p className="text-2xl font-bold text-[#34D399]">{stats.activeUsers}</p>
                </div>
                <div className="text-2xl">✅</div>
              </div>
            </div>

            <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pending Approval</p>
                  <p className="text-2xl font-bold text-orange-400">{stats.pendingUsers}</p>
                </div>
                <div className="text-2xl">⏳</div>
              </div>
            </div>

            <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Administrators</p>
                  <p className="text-2xl font-bold text-red-400">{stats.adminUsers}</p>
                </div>
                <div className="text-2xl">👑</div>
              </div>
            </div>

            <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Sales Managers</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.salesManagers}</p>
                </div>
                <div className="text-2xl">📊</div>
              </div>
            </div>

            <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Recruiters</p>
                  <p className="text-2xl font-bold text-[#34D399]">{stats.recruiters}</p>
                </div>
                <div className="text-2xl">🎯</div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#4A5568]">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#F5F5F5]">All Users</h2>
                <button className="bg-[#34D399] hover:bg-[#2DD889] text-[#191D24] px-4 py-2 rounded-lg font-medium transition-colors">
                  Invite User
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#34D399] mx-auto mb-2"></div>
                <p className="text-gray-400">Loading users...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <p className="text-red-400">{error}</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-400">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#191D24]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#4A5568]">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-[#191D24]">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-[#34D399] rounded-full flex items-center justify-center mr-3">
                              <span className="text-[#191D24] font-semibold">
                                {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-[#F5F5F5]">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-sm text-gray-400">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-[#F5F5F5]">
                            {ROLE_LABELS[user.role]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {user.department || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-[#34D399] hover:text-[#2DD889] mr-4">Edit</button>
                          <button className="text-red-400 hover:text-red-300">Deactivate</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Navigation>
  )
}