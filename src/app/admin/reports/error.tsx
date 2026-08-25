'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

export default function ReportsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Reports module error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white border border-error-border rounded-2xl min-h-[400px]">
      <AlertCircle className="w-12 h-12 text-error mb-4" />
      <h2 className="text-lg font-bold text-foreground mb-2">Report Data Unavailable</h2>
      <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
        There was a problem generating this report. The underlying data might be missing or there is a temporary issue.
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors text-sm font-medium"
      >
        Try again
      </button>
    </div>
  )
}
