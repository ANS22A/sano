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
        <div className="w-16 h-16 rounded-[20px] bg-gradient-to-b from-surface to-surface-muted flex items-center justify-center mb-5 text-accent shadow-sm border border-border">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-1.5 tracking-tight">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">{description}</p>
      )}
      {action}
    </div>
  )
}
