'use client'

import { useAuth } from '@/hooks/useAuth'
import Navigation from '@/components/shared/Navigation'

export default function RecruiterDashboard() {
  const { profile } = useAuth()

  // Mock data for demonstration
  const personalStats = {
    totalCandidates: 24,
    activeCandidates: 18,
    interviewsScheduled: 5,
    offersExtended: 3,
    thisWeekAdded: 4,
    responseRate: '92%'
  }

  const candidates = [
    { 
      name: 'Alex Thompson', 
      position: 'Senior React Developer', 
      status: 'Interview Scheduled', 
      statusColor: 'bg-blue-100 text-blue-800 border-blue-200',
      company: 'TechCorp',
      added: '2 days ago',
      avatar: 'AT'
    },
    { 
      name: 'Maria Garcia', 
      position: 'UX Designer', 
      status: 'Offer Extended', 
      statusColor: 'bg-green-100 text-green-800 border-green-200',
      company: 'DesignStudio',
      added: '1 week ago',
      avatar: 'MG'
    },
    { 
      name: 'James Wilson', 
      position: 'DevOps Engineer', 
      status: 'In Review', 
      statusColor: 'bg-orange-100 text-orange-800 border-orange-200',
      company: 'CloudTech',
      added: '3 days ago',
      avatar: 'JW'
    },
    { 
      name: 'Sophie Chen', 
      position: 'Product Manager', 
      status: 'First Contact', 
      statusColor: 'bg-purple-100 text-purple-800 border-purple-200',
      company: 'StartupXYZ',
      added: '1 day ago',
      avatar: 'SC'
    }
  ]

  const tasks = [
    { task: 'Follow up with Alex Thompson', priority: 'High', due: 'Today', type: 'follow-up' },
    { task: 'Schedule interview for Maria Garcia', priority: 'High', due: 'Tomorrow', type: 'schedule' },
    { task: 'Update candidate profiles', priority: 'Medium', due: 'This week', type: 'admin' },
    { task: 'Prepare interview questions for DevOps role', priority: 'Medium', due: 'Friday', type: 'preparation' },
    { task: 'Send weekly report to manager', priority: 'Low', due: 'End of week', type: 'reporting' }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-400'
      case 'Medium': return 'text-orange-400'
      case 'Low': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'follow-up': return '📞'
      case 'schedule': return '📅'
      case 'admin': return '📝'
      case 'preparation': return '📋'
      case 'reporting': return '📊'
      default: return '✅'
    }
  }

  return (
    <Navigation>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#F5F5F5]">My Dashboard</h1>
            <p className="text-gray-400 mt-2">Your personal candidate pipeline and tasks</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">My Candidates</p>
                  <p className="text-2xl font-bold text-[#F5F5F5]">{personalStats.totalCandidates}</p>
                  <p className="text-xs text-[#34D399]">{personalStats.activeCandidates} active</p>
                </div>
                <div className="text-2xl">👨‍💼</div>
              </div>
            </div>

            <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Interviews</p>
                  <p className="text-2xl font-bold text-blue-400">{personalStats.interviewsScheduled}</p>
                  <p className="text-xs text-gray-400">scheduled</p>
                </div>
                <div className="text-2xl">📅</div>
              </div>
            </div>

            <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Offers Extended</p>
                  <p className="text-2xl font-bold text-[#34D399]">{personalStats.offersExtended}</p>
                  <p className="text-xs text-gray-400">pending response</p>
                </div>
                <div className="text-2xl">✅</div>
              </div>
            </div>

            <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Response Rate</p>
                  <p className="text-2xl font-bold text-[#34D399]">{personalStats.responseRate}</p>
                  <p className="text-xs text-orange-400">+{personalStats.thisWeekAdded} this week</p>
                </div>
                <div className="text-2xl">📈</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Candidates */}
            <div className="lg:col-span-2 bg-[#2D3748] rounded-lg border border-[#4A5568] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#4A5568]">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-[#F5F5F5]">Recent Candidates</h2>
                    <p className="text-gray-400 text-sm">Your latest candidate interactions</p>
                  </div>
                  <button className="bg-[#34D399] hover:bg-[#2DD889] text-[#191D24] px-4 py-2 rounded-lg font-medium transition-colors">
                    Add Candidate
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {candidates.map((candidate) => (
                    <div key={candidate.name} className="flex items-center justify-between p-4 bg-[#191D24] rounded-lg hover:bg-[#4A5568] transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-[#34D399] rounded-full flex items-center justify-center">
                          <span className="text-[#191D24] font-semibold">{candidate.avatar}</span>
                        </div>
                        <div>
                          <div className="text-[#F5F5F5] font-medium">{candidate.name}</div>
                          <div className="text-gray-300 text-sm">{candidate.position}</div>
                          <div className="text-gray-400 text-xs">{candidate.company} • Added {candidate.added}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${candidate.statusColor}`}>
                          {candidate.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <button className="text-[#34D399] hover:text-[#2DD889] font-medium">
                    View All Candidates
                  </button>
                </div>
              </div>
            </div>

            {/* Tasks & To-Do */}
            <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#4A5568]">
                <h2 className="text-xl font-semibold text-[#F5F5F5]">Tasks & To-Do</h2>
                <p className="text-gray-400 text-sm">Your upcoming activities</p>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {tasks.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-[#191D24] rounded-lg">
                      <div className="flex-shrink-0 mt-0.5">
                        <span className="text-lg">{getTaskIcon(item.type)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[#F5F5F5] text-sm font-medium">{item.task}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs font-medium ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                          <span className="text-gray-400 text-xs">•</span>
                          <span className="text-gray-400 text-xs">{item.due}</span>
                        </div>
                      </div>
                      <input type="checkbox" className="mt-1 h-4 w-4 text-[#34D399] rounded border-[#4A5568] bg-[#2D3748]" />
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <button className="w-full text-[#34D399] hover:text-[#2DD889] font-medium text-sm">
                    + Add New Task
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-[#2D3748] rounded-lg border border-[#4A5568] p-6">
            <h2 className="text-xl font-semibold text-[#F5F5F5] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex items-center justify-center space-x-2 bg-[#34D399] hover:bg-[#2DD889] text-[#191D24] p-4 rounded-lg font-medium transition-colors">
                <span>👨‍💼</span>
                <span>Add Candidate</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-[#191D24] hover:bg-[#4A5568] text-[#F5F5F5] border border-[#4A5568] p-4 rounded-lg font-medium transition-colors">
                <span>📅</span>
                <span>Schedule Interview</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-[#191D24] hover:bg-[#4A5568] text-[#F5F5F5] border border-[#4A5568] p-4 rounded-lg font-medium transition-colors">
                <span>📊</span>
                <span>View Reports</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-[#191D24] hover:bg-[#4A5568] text-[#F5F5F5] border border-[#4A5568] p-4 rounded-lg font-medium transition-colors">
                <span>⚙️</span>
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Navigation>
  )
}