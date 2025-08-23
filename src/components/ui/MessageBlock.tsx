import { ReactNode } from 'react'
import { Message, SuggestionChip } from '@/types'
import StatusIndicator from './StatusIndicator'
import SuggestionChips from './SuggestionChips'

interface MessageBlockProps {
  message: Message
  children?: ReactNode
  suggestionChips?: SuggestionChip[]
  onCopy?: () => void
  onRegenerate?: () => void
  onFeedback?: (positive: boolean) => void
}

export default function MessageBlock({ 
  message, 
  children,
  suggestionChips = [],
  onCopy,
  onRegenerate,
  onFeedback
}: MessageBlockProps) {
  if (message.type === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-3xl bg-[#34D399]/10 border border-[#34D399]/20 rounded-lg p-4">
          <p className="text-[#F5F5F5]">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#2D3748] rounded-lg p-6 border border-[#4A5568] group">
      {/* AI Response Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-[#34D399] rounded-full flex items-center justify-center text-sm font-bold text-[#191D24] mr-3">
            AI
          </div>
          <StatusIndicator status={message.status === 'generating' ? 'generating' : 'ready'} />
        </div>
        
        {/* Action Toolbar */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onCopy && (
            <button
              onClick={onCopy}
              className="p-2 hover:bg-[#4A5568] rounded-lg transition-colors"
              title="Copy response"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          )}
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="p-2 hover:bg-[#4A5568] rounded-lg transition-colors"
              title="Regenerate response"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
          {onFeedback && (
            <div className="flex gap-1">
              <button
                onClick={() => onFeedback(true)}
                className="p-2 hover:bg-[#4A5568] rounded-lg transition-colors"
                title="Helpful"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </button>
              <button
                onClick={() => onFeedback(false)}
                className="p-2 hover:bg-[#4A5568] rounded-lg transition-colors"
                title="Not helpful"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2M5 4H3a2 2 0 00-2 2v6a2 2 0 002 2h2.5" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Message Content */}
      <div className="prose prose-invert max-w-none">
        {children || <p>{message.content}</p>}
      </div>

      {/* Suggestion Chips */}
      <SuggestionChips chips={suggestionChips} />
    </div>
  )
}