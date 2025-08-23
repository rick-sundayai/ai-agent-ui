import { useState } from 'react'

interface SelectedComponent {
  type: string
  data?: Record<string, unknown>
}

interface ScratchpadInspectorProps {
  selectedComponent?: SelectedComponent | null
}

export default function ScratchpadInspector({ selectedComponent }: ScratchpadInspectorProps) {
  const [notes, setNotes] = useState('')

  const clearNotes = () => {
    setNotes('')
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Scratchpad</h2>
        <button 
          onClick={clearNotes}
          className="text-xs text-[#34D399] hover:text-[#34D399]/80 transition-colors"
        >
          Clear
        </button>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Jot down notes, draft prompts, or stage data..."
        className="w-full h-40 p-3 bg-[#191D24] border border-[#4A5568] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#34D399] focus:border-transparent text-sm"
      />
      
      <div className="mt-6">
        <h3 className="text-sm font-semibold mb-3">Inspector</h3>
        <div className="text-sm text-gray-400">
          {selectedComponent 
            ? 'Component selected - showing details and export options.'
            : 'Select a data component to view details and export options.'
          }
        </div>
        {selectedComponent && (
          <div className="mt-3 p-3 bg-[#191D24] rounded-lg border border-[#4A5568]">
            <div className="text-xs text-gray-500 mb-2">Selected Component</div>
            <div className="text-sm">{selectedComponent.type}</div>
          </div>
        )}
      </div>
    </div>
  )
}