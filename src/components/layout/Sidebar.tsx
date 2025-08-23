import { ReactNode } from 'react'

interface SidebarProps {
  isOpen: boolean
  position: 'left' | 'right'
  children: ReactNode
}

export default function Sidebar({ isOpen, position, children }: SidebarProps) {
  const borderClass = position === 'left' ? 'border-r' : 'border-l'
  
  return (
    <div className={`transition-all duration-300 ${isOpen ? 'w-80' : 'w-0'} bg-[#2D3748] ${borderClass} border-[#4A5568] overflow-hidden`}>
      {children}
    </div>
  )
}