'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { Search } from 'lucide-react'

interface Props {
  placeholder?: string
  paramName?: string
}

export function AdminSearchBar({ placeholder = 'Search…', paramName = 'q' }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const params = new URLSearchParams(searchParams.toString())
    const value = e.target.value
    if (value) {
      params.set(paramName, value)
    } else {
      params.delete(paramName)
    }
    params.delete('page') // reset page on new search
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <div className="relative">
      <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a8a7a] pointer-events-none" />
      <input
        type="search"
        defaultValue={searchParams.get(paramName) ?? ''}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full ps-9 pe-4 py-2 rounded-xl border border-border bg-white text-sm text-foreground
          placeholder:text-[#b8a898] focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
      />
    </div>
  )
}
