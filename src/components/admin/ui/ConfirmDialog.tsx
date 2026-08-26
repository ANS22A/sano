'use client'

import { useTransition, type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
  children?: ReactNode
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  const [isPending, startTransition] = useTransition()

  if (!open) return null

  function handleConfirm() {
    startTransition(async () => {
      await onConfirm()
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-border p-6" dir="auto">
        <h2 id="confirm-title" className="text-lg font-heading font-semibold text-foreground mb-2">
          {title}
        </h2>
        <p id="confirm-desc" className="text-sm font-sans text-muted-foreground mb-4">
          {description}
        </p>
        {children}
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2 rounded-xl text-sm font-medium text-foreground bg-surface-muted border border-border hover:bg-surface-elevated transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center min-w-[80px]',
              destructive
                ? 'bg-error text-error-foreground hover:bg-error/90'
                : 'bg-primary text-primary-foreground hover:bg-primary-hover'
            )}
          >
            {isPending ? (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
