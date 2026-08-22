'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface Props {
  paramName: string
  options: { value: string; label: string }[]
  defaultValue: string
}

export function AdminFilterSelect({ paramName, options, defaultValue }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentValue = searchParams.get(paramName) ?? defaultValue

  function handleChange(val: string) {
    const sp = new URLSearchParams(searchParams.toString())
    if (val === defaultValue) {
      sp.delete(paramName)
    } else {
      sp.set(paramName, val)
    }
    router.push(`${pathname}?${sp.toString()}`)
  }

  return (
    <select
      className="appearance-none w-full sm:w-40 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-white text-[#7a6a57] hover:bg-[#f5ede0] transition-colors cursor-pointer outline-none focus:border-accent"
      value={currentValue}
      onChange={(e) => handleChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
