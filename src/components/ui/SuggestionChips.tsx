import { SuggestionChip } from '@/types'

interface SuggestionChipsProps {
  chips: SuggestionChip[]
}

export default function SuggestionChips({ chips }: SuggestionChipsProps) {
  if (!chips.length) return null

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip.id}
          onClick={chip.action}
          className="px-3 py-1 bg-[#34D399]/20 text-[#34D399] text-sm rounded-full hover:bg-[#34D399]/30 transition-colors"
        >
          {chip.label}
        </button>
      ))}
    </div>
  )
}