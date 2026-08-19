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
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a8a7a] pointer-events-none" />
      <input
        type="search"
        defaultValue={searchParams.get(paramName) ?? ''}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#e8ddd0] bg-white text-sm text-[#2a2118]
          placeholder:text-[#b8a898] focus:outline-none focus:ring-2 focus:ring-[#c9a96e] focus:border-transparent"
      />
    </div>
  )
}
