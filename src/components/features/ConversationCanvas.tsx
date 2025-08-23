import { ReactNode } from 'react'

interface ConversationCanvasProps {
  children: ReactNode
}

export default function ConversationCanvas({ children }: ConversationCanvasProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {children}
      </div>
    </div>
  )
}