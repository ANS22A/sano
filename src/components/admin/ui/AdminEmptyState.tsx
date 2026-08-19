'use client'

import { type ReactNode } from 'react'

interface AdminEmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function AdminEmptyState({ icon, title, description, action }: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-[20px] bg-gradient-to-b from-[#faf7f4] to-[#f5ede0] flex items-center justify-center mb-5 text-[#c9a96e] shadow-sm border border-[#e8ddd0]">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-[#2a2118] mb-1.5 tracking-tight">{title}</h3>
      {description && (
        <p className="text-sm text-[#7a6a57] max-w-sm mb-6 leading-relaxed">{description}</p>
      )}
      {action}
    </div>
  )
}
