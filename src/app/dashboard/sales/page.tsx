'use client'

import { useAuth } from '@/hooks/useAuth'
import Navigation from '@/components/shared/Navigation'

export default function SalesManagerDashboard() {
  const { profile } = useAuth()

  // Mock data for demonstration
  const teamStats = {
    totalRecruiters: 12,
    activeRecruiters: 10,
    totalCandidates: 245,
    candidatesThisWeek: 18,
    averageResponseTime: '2.3 hours',
    successRate: '78%'
  }

  const topPerformers = [
    { name: 'Sarah Chen', candidates: 34, success: '85%', avatar: 'SC' },
    { name: 'Mike Rodriguez', candidates: 28, success: '82%', avatar: 'MR' },
    { name: 'Emily Johnson', candidates: 25, success: '80%', avatar: 'EJ' },
    { name: 'David Kim', candidates: 23, success: '77%', avatar: 'DK' }
  ]

  const recentActivity = [
    { type: 'candidate_added', user: 'Sarah Chen', details: 'Added new candidate for Senior Developer role', time: '2 hours ago' },
    { type: 'interview_scheduled', user: 'Mike Rodriguez', details: 'Scheduled interview with TechCorp', time: '4 hours ago' },
    { type: 'offer_accepted', user: 'Emily Johnson', details: 'Candidate accepted offer at StartupXYZ', time: '1 day ago' },
    { type: 'pipeline_updated', user: 'David Kim', details: 'Moved 3 candidates to final round', time: '1 day ago' }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'candidate_added': return '👨‍💼'
      case 'interview_scheduled': return '📅'
      case 'offer_accepted': return '✅'
      case 'pipeline_updated': return '🔄'
      default: return '📋'
    }
  }

  return (
    <Navigation>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#F5F5F5]">Sales Manager Dashboard</h1>
            <p className="text-gray-400 mt-2">Team oversight and performance analytics</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Team Size</p>
                  <p className="text-2xl font-bold text-[#F5F5F5]">{teamStats.totalRecruiters}</p>
                  <p className="text-xs text-[#34D399]">{teamStats.activeRecruiters} active</p>
                </div>
                <div className="text-2xl">👥</div>
              </div>
            </div>

            <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Candidates</p>
                  <p className="text-2xl font-bold text-[#34D399]">{teamStats.totalCandidates}</p>
                  <p className="text-xs text-orange-400">+{teamStats.candidatesThisWeek} this week</p>
                </div>
                <div className="text-2xl">🎯</div>
              </div>
            </div>

            <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Success Rate</p>
                  <p className="text-2xl font-bold text-[#34D399]">{teamStats.successRate}</p>
                  <p className="text-xs text-gray-400">Avg response: {teamStats.averageResponseTime}</p>
                </div>
                <div className="text-2xl">📈</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Performers */}
            <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#4A5568]">
                <h2 className="text-xl font-semibold text-[#F5F5F5]">Top Performers</h2>
                <p className="text-gray-400 text-sm">This month&apos;s leading recruiters</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {topPerformers.map((performer, index) => (
                    <div key={performer.name} className="flex items-center justify-between p-4 bg-[#191D24] rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-[#34D399] font-bold">#{index + 1}</span>
                          <div className="h-10 w-10 bg-[#34D399] rounded-full flex items-center justify-center">
                            <span className="text-[#191D24] font-semibold text-sm">{performer.avatar}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-[#F5F5F5] font-medium">{performer.name}</div>
                          <div className="text-gray-400 text-sm">{performer.candidates} candidates</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#34D399] font-semibold">{performer.success}</div>
                        <div className="text-gray-400 text-sm">success rate</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#4A5568]">
                <h2 className="text-xl font-semibold text-[#F5F5F5]">Recent Team Activity</h2>
                <p className="text-gray-400 text-sm">Latest updates from your team</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-[#191D24] rounded-lg">
                      <div className="flex-shrink-0">
                        <span className="text-xl">{getActivityIcon(activity.type)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[#F5F5F5] font-medium">{activity.user}</div>
                        <div className="text-gray-300 text-sm">{activity.details}</div>
                        <div className="text-gray-400 text-xs mt-1">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-[#2D3748] rounded-lg border border-[#4A5568] p-6">
            <h2 className="text-xl font-semibold text-[#F5F5F5] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex items-center justify-center space-x-2 bg-[#34D399] hover:bg-[#2DD889] text-[#191D24] p-4 rounded-lg font-medium transition-colors">
                <span>📊</span>
                <span>View Reports</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-[#191D24] hover:bg-[#4A5568] text-[#F5F5F5] border border-[#4A5568] p-4 rounded-lg font-medium transition-colors">
                <span>👥</span>
                <span>Manage Team</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-[#191D24] hover:bg-[#4A5568] text-[#F5F5F5] border border-[#4A5568] p-4 rounded-lg font-medium transition-colors">
                <span>🎯</span>
                <span>Set Goals</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-[#191D24] hover:bg-[#4A5568] text-[#F5F5F5] border border-[#4A5568] p-4 rounded-lg font-medium transition-colors">
                <span>📈</span>
                <span>Analytics</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Navigation>
  )
}