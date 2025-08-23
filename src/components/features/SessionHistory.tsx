import { Session } from '@/types'

interface SessionHistoryProps {
  sessions: Session[]
  currentSessionId?: string
  onSessionSelect: (sessionId: string) => void
}

export default function SessionHistory({ 
  sessions, 
  currentSessionId, 
  onSessionSelect 
}: SessionHistoryProps) {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Session History</h2>
      <div className="space-y-2">
        {sessions.map((session) => (
          <div 
            key={session.id}
            onClick={() => onSessionSelect(session.id)}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              session.id === currentSessionId 
                ? 'bg-[#191D24]' 
                : 'hover:bg-[#34D399]/10'
            }`}
          >
            <h3 className="text-sm font-medium">{session.title}</h3>
            <p className="text-xs text-gray-400 mt-1">{session.timestamp}</p>
          </div>
        ))}
      </div>
    </div>
  )
}