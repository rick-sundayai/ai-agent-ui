import { AIStatus } from '@/types'

interface StatusIndicatorProps {
  status: AIStatus
}

const statusConfig = {
  ready: { color: 'bg-[#34D399]', text: 'Ready', animate: false },
  thinking: { color: 'bg-[#34D399]', text: 'Thinking', animate: true },
  generating: { color: 'bg-blue-500', text: 'Generating', animate: true },
  analyzing: { color: 'bg-yellow-500', text: 'Analyzing', animate: true },
  idle: { color: 'bg-gray-500', text: 'Idle', animate: false },
  error: { color: 'bg-red-500', text: 'Error', animate: false }
}

export default function StatusIndicator({ status }: StatusIndicatorProps) {
  const config = statusConfig[status]
  
  return (
    <div className="flex items-center">
      <div 
        className={`w-2 h-2 ${config.color} rounded-full mr-2 ${
          config.animate ? 'animate-pulse' : ''
        }`} 
      />
      <span className="text-xs text-gray-400">{config.text}</span>
    </div>
  )
}