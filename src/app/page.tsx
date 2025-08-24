'use client'

import { useState } from 'react'
import { 
  WorkspaceLayout, 
  SessionHistory, 
  ConversationCanvas, 
  Omnibox, 
  ScratchpadInspector,
  MessageBlock 
} from '@/components'
import DatabaseExplorer from '@/components/dev/DatabaseExplorer'
import { Session, Message, SuggestionChip, AIStatus } from '@/types'

const mockSessions: Session[] = [
  {
    id: '1',
    title: 'Analysis of Q3 Sales Data',
    timestamp: '2 hours ago',
    isActive: true
  },
  {
    id: '2', 
    title: 'Budget Planning Discussion',
    timestamp: 'Yesterday'
  }
]

const welcomeMessage: Message = {
  id: 'welcome',
  type: 'ai',
  content: 'Welcome to your AI Agent Workspace!',
  timestamp: new Date().toISOString(),
  status: 'complete'
}

const welcomeSuggestions: SuggestionChip[] = [
  {
    id: '1',
    label: 'Analyze a file',
    action: () => console.log('Analyze file clicked')
  },
  {
    id: '2', 
    label: 'Create a report',
    action: () => console.log('Create report clicked')
  },
  {
    id: '3',
    label: 'Schedule a meeting', 
    action: () => console.log('Schedule meeting clicked')
  }
]

export default function Home() {
  console.log('🏠 Home page rendering...')
  
  const [currentSessionId, setCurrentSessionId] = useState('1')
  const [aiStatus, setAiStatus] = useState<AIStatus>('ready')
  const [selectedComponent] = useState(null)

  const handleSendMessage = (message: string) => {
    console.log('Sending message:', message)
    setAiStatus('generating')
    // Simulate AI response
    setTimeout(() => setAiStatus('ready'), 2000)
  }

  const handleFileUpload = (file: File) => {
    console.log('File uploaded:', file.name)
    setAiStatus('analyzing')
    setTimeout(() => setAiStatus('ready'), 3000)
  }

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId)
  }

  const handleCopy = () => {
    console.log('Copy clicked')
  }

  const handleRegenerate = () => {
    console.log('Regenerate clicked')
    setAiStatus('generating')
    setTimeout(() => setAiStatus('ready'), 2000)
  }

  const handleFeedback = (positive: boolean) => {
    console.log('Feedback:', positive ? 'positive' : 'negative')
  }

  return (
    <WorkspaceLayout
      leftPaneContent={
        <SessionHistory
          sessions={mockSessions}
          currentSessionId={currentSessionId}
          onSessionSelect={handleSessionSelect}
        />
      }
      rightPaneContent={
        <ScratchpadInspector
          selectedComponent={selectedComponent}
        />
      }
    >
      <ConversationCanvas>
        <DatabaseExplorer />
        <MessageBlock
          message={welcomeMessage}
          suggestionChips={welcomeSuggestions}
          onCopy={handleCopy}
          onRegenerate={handleRegenerate}
          onFeedback={handleFeedback}
        >
          <div className="prose prose-invert max-w-none">
            <p>Welcome to your AI Agent Workspace! I&apos;m ready to help you with analysis, automation, and any tasks you need assistance with.</p>
            <p>You can:</p>
            <ul>
              <li>Ask me questions and get structured, interactive responses</li>
              <li>Upload files for analysis</li>
              <li>Export data in various formats</li>
              <li>Manage your conversation history</li>
            </ul>
          </div>
        </MessageBlock>
      </ConversationCanvas>
      
      <Omnibox
        status={aiStatus}
        onSendMessage={handleSendMessage}
        onFileUpload={handleFileUpload}
      />
    </WorkspaceLayout>
  )
}
