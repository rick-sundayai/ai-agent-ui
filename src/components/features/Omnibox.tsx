import { useState } from 'react'
import { StatusIndicator } from '@/components'
import { AIStatus } from '@/types'

interface OmniboxProps {
  status: AIStatus
  onSendMessage: (message: string) => void
  onFileUpload: (file: File) => void
}

export default function Omnibox({ status, onSendMessage, onFileUpload }: OmniboxProps) {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message)
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="p-4 bg-[#2D3748] border-t border-[#4A5568]">
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            className="w-full p-4 pr-20 bg-[#191D24] border border-[#4A5568] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#34D399] focus:border-transparent"
            rows={3}
          />
          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <button 
              className="p-2 hover:bg-[#4A5568] rounded-lg transition-colors" 
              title="Upload file"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <button 
              onClick={handleSend}
              disabled={!message.trim() || status === 'generating'}
              className="px-4 py-2 bg-[#34D399] text-[#191D24] rounded-lg hover:bg-[#34D399]/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
          <div className="absolute left-3 bottom-3 flex items-center">
            <StatusIndicator status={status} />
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onFileUpload(file)
            }}
          />
        </div>
      </div>
    </div>
  )
}