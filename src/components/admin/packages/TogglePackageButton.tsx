'use client'

import { useTransition } from 'react'
import { togglePackageActive } from '@/app/actions/adminPackages.actions'
import { useAdmin } from '@/components/admin/shell/AdminShell'

interface Props {
  id: string
  isActive: boolean
}

export function TogglePackageButton({ id, isActive }: Props) {
  const { t } = useAdmin()
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      await togglePackageActive(id, !isActive)
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`text-xs font-medium px-2 py-1 rounded-md transition-colors disabled:opacity-50 ${
        isActive
          ? 'text-destructive hover:bg-destructive/10'
          : 'text-emerald-600 hover:bg-emerald-50'
      }`}
    >
      {isPending
        ? '…'
        : isActive
          ? t.services.deactivate
          : t.services.activate}
    </button>
  )
}
