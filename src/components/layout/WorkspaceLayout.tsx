'use client'

import { useState, ReactNode } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

interface WorkspaceLayoutProps {
  leftPaneContent: ReactNode
  rightPaneContent: ReactNode
  children: ReactNode
}

export default function WorkspaceLayout({ 
  leftPaneContent, 
  rightPaneContent, 
  children 
}: WorkspaceLayoutProps) {
  const [leftPaneOpen, setLeftPaneOpen] = useState(true)
  const [rightPaneOpen, setRightPaneOpen] = useState(true)

  return (
    <div className="flex h-screen bg-[#191D24] text-[#F5F5F5]">
      {/* Left Sidebar */}
      <Sidebar isOpen={leftPaneOpen} position="left">
        {leftPaneContent}
      </Sidebar>

      {/* Center Content */}
      <div className="flex-1 flex flex-col">
        <Header 
          onToggleLeftPane={() => setLeftPaneOpen(!leftPaneOpen)}
          onToggleRightPane={() => setRightPaneOpen(!rightPaneOpen)}
        />
        {children}
      </div>

      {/* Right Sidebar */}
      <Sidebar isOpen={rightPaneOpen} position="right">
        {rightPaneContent}
      </Sidebar>
    </div>
  )
}