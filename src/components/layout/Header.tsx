import { DatabaseStatus } from '@/components'

interface HeaderProps {
  onToggleLeftPane: () => void
  onToggleRightPane: () => void
}

export default function Header({ onToggleLeftPane, onToggleRightPane }: HeaderProps) {
  return (
    <div className="h-16 bg-[#2D3748] border-b border-[#4A5568] flex items-center px-4">
      <button 
        onClick={onToggleLeftPane}
        className="p-2 hover:bg-[#4A5568] rounded-lg transition-colors mr-3"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h1 className="text-lg font-semibold">AI Agent Workspace</h1>
      <div className="flex items-center gap-4 ml-auto">
        <DatabaseStatus showDetails />
        <button 
          onClick={onToggleRightPane}
          className="p-2 hover:bg-[#4A5568] rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      </div>
    </div>
  )
}