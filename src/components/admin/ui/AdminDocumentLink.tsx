'use client'

import { useState } from 'react'
import { FileText, Loader2, ExternalLink } from 'lucide-react'

interface Props {
  path: string | null
  label?: string
  getSignedUrlAction: (path: string) => Promise<string | null>
}

export function AdminDocumentLink({ path, label = 'View Document', getSignedUrlAction }: Props) {
  const [loading, setLoading] = useState(false)

  if (!path) return null

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      const url = await getSignedUrlAction(path!)
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer')
      } else {
        alert('Could not generate secure document link.')
      }
    } catch {
      alert('Failed to open document.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-muted text-muted-foreground hover:text-foreground hover:bg-surface-muted transition-colors border border-border"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <FileText className="w-3.5 h-3.5 text-accent" />
      )}
      <span>{label}</span>
      <ExternalLink className="w-3 h-3 ms-0.5 opacity-60" />
    </button>
  )
}
