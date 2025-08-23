'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { ROLE_LABELS, getDefaultRedirectForRole } from '@/lib/auth/permissions'

interface NavigationProps {
  children: React.ReactNode
}

export default function Navigation({ children }: NavigationProps) {
  const { user, profile, signOut } = useAuth()
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setIsProfileMenuOpen(false)
  }

  const getNavigationItems = () => {
    if (!profile) return []

    const baseItems = [
      { name: 'Dashboard', href: getDefaultRedirectForRole(profile.role), icon: '🏠' }
    ]

    switch (profile.role) {
      case 'admin':
        return [
          ...baseItems,
          { name: 'User Management', href: '/admin/users', icon: '👥' },
          { name: 'System Settings', href: '/admin/settings', icon: '⚙️' },
          { name: 'Audit Logs', href: '/admin/audit', icon: '📋' }
        ]
      case 'sales_manager':
        return [
          ...baseItems,
          { name: 'Team Overview', href: '/dashboard/team', icon: '📊' },
          { name: 'Sales Reports', href: '/reports/sales', icon: '📈' },
          { name: 'Analytics', href: '/analytics', icon: '🎯' }
        ]
      case 'recruiter':
        return [
          ...baseItems,
          { name: 'My Candidates', href: '/candidates', icon: '👨‍💼' },
          { name: 'Pipeline', href: '/pipeline', icon: '🔄' },
          { name: 'Tasks', href: '/tasks', icon: '✅' }
        ]
      default:
        return baseItems
    }
  }

  if (!user || !profile) {
    return <div>{children}</div>
  }

  const navigationItems = getNavigationItems()

  return (
    <div className="min-h-screen bg-[#191D24]">
      {/* Header */}
      <header className="bg-[#2D3748] border-b border-[#4A5568] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-[#F5F5F5] hover:bg-[#4A5568]"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link href={getDefaultRedirectForRole(profile.role)} className="flex items-center ml-2 md:ml-0">
                <span className="text-xl font-bold text-[#F5F5F5]">AI Agent</span>
                <span className="text-xl font-bold text-[#34D399] ml-1">Workspace</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-1 text-gray-300 hover:text-[#34D399] transition-colors"
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-3 text-[#F5F5F5] hover:text-[#34D399] transition-colors"
              >
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium">{profile.first_name} {profile.last_name}</div>
                  <div className="text-xs text-gray-400">{ROLE_LABELS[profile.role]}</div>
                </div>
                <div className="h-8 w-8 bg-[#34D399] rounded-full flex items-center justify-center">
                  <span className="text-[#191D24] font-semibold">
                    {profile.first_name.charAt(0)}{profile.last_name.charAt(0)}
                  </span>
                </div>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#2D3748] rounded-md shadow-lg border border-[#4A5568] z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-[#4A5568]">
                      <div className="text-sm font-medium text-[#F5F5F5]">{profile.first_name} {profile.last_name}</div>
                      <div className="text-xs text-gray-400">{profile.email}</div>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#4A5568] hover:text-[#F5F5F5]"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#4A5568] hover:text-[#F5F5F5]"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Preferences
                    </Link>
                    <div className="border-t border-[#4A5568]">
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#4A5568] hover:text-red-300"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#4A5568] bg-[#2D3748]">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 text-gray-300 hover:text-[#34D399] hover:bg-[#4A5568] block px-3 py-2 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Click outside to close menus */}
      {(isProfileMenuOpen || isMobileMenuOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setIsProfileMenuOpen(false)
            setIsMobileMenuOpen(false)
          }}
        />
      )}
    </div>
  )
}