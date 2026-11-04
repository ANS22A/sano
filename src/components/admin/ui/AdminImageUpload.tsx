'use client'

import { useState, useRef, useTransition } from 'react'
import Image from 'next/image'
import { Loader2, Upload, Trash2, RefreshCw } from 'lucide-react'
import type { AdminTranslations } from '@/lib/admin/translations'

interface AdminImageUploadProps {
  entityId: string
  imageUrl: string | null
  onUpload: (id: string, formData: FormData) => Promise<{ success?: boolean; url?: string; error?: string }>
  onRemove: (id: string) => Promise<{ success?: boolean; error?: string }>
  onChange?: (url: string | null) => void
  t: AdminTranslations
}

export function AdminImageUpload({ entityId, imageUrl, onUpload, onRemove, onChange, t }: AdminImageUploadProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  // previewUrl is managed locally; it starts at imageUrl and gets updated after
  // successful upload/remove. We do NOT use useEffect to sync with imageUrl prop
  // to avoid the react-hooks/set-state-in-effect lint error. Instead we rely on
  // the parent's key prop or remount to reflect external changes.
  const [previewUrl, setPreviewUrl] = useState<string | null>(imageUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size === 0) {
      setError(t.media.emptyState)
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(t.media.fileTooLarge)
      return
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!allowed.includes(file.type)) {
      setError(t.media.invalidFileType)
      return
    }

    setError(null)
    setSuccess(null)

    // Show an instant local preview via object URL
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    const fd = new FormData()
    fd.append('file', file)

    startTransition(async () => {
      try {
        const result = await onUpload(entityId, fd)
        if (result.error) {
          setError(result.error)
          setPreviewUrl(imageUrl) // revert on failure
        } else if (result.url) {
          setPreviewUrl(result.url)
          setSuccess(t.media.uploadSuccessful)
          onChange?.(result.url)
        }
      } catch {
        setError(t.media.uploadFailed)
        setPreviewUrl(imageUrl)
      } finally {
        URL.revokeObjectURL(objectUrl)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    })
  }

  function handleRemove() {
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      try {
        const result = await onRemove(entityId)
        if (result.error) {
          setError(result.error)
        } else {
          setPreviewUrl(null)
          setSuccess(t.media.removeSuccessful ?? 'Image removed')
          onChange?.(null)
        }
      } catch {
        setError(t.media.removeFailed)
      }
    })
  }

  return (
    <div className="space-y-4">
      {success && (
        <div className="p-3 bg-success-bg text-success rounded-xl text-sm border border-success-border flex items-center justify-between">
          <span className="font-medium">✓ {success}</span>
          <button type="button" onClick={() => setSuccess(null)} className="text-xs opacity-70 hover:opacity-100 ms-2">
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-error-bg text-error rounded-xl text-sm border border-error-border flex items-center justify-between">
          <span className="font-medium">⚠️ {error}</span>
          <button type="button" onClick={() => setError(null)} className="text-xs opacity-70 hover:opacity-100 ms-2">
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        {/* Preview area */}
        <div className="relative w-full sm:w-48 aspect-square bg-surface rounded-2xl border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Package preview"
              fill
              unoptimized={previewUrl.startsWith('blob:')}
              className="object-cover transition-opacity duration-300"
              sizes="(max-width: 640px) 100vw, 192px"
            />
          ) : (
            <div className="text-center p-4">
              <span className="block text-2xl mb-2 text-muted-foreground/60">🖼️</span>
              <span className="text-xs text-muted-foreground">{t.media.emptyState}</span>
            </div>
          )}

          {isPending && (
            <div className="absolute inset-0 bg-primary/70 flex flex-col items-center justify-center gap-2 backdrop-blur-sm z-10">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
              <span className="text-white text-xs font-medium tracking-wide">{t.media.uploading}</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 w-full sm:w-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,image/jpg"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-60 transition-colors w-full sm:w-auto shadow-sm"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : previewUrl ? (
              <RefreshCw className="w-4 h-4" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {previewUrl ? t.media.replaceImage : t.media.uploadImage}
          </button>

          {previewUrl && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-error-border text-error text-sm font-medium hover:bg-error-bg disabled:opacity-60 transition-colors w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4" />
              {t.media.removeImage}
            </button>
          )}

          <p className="text-xs text-muted-foreground mt-1" dir="ltr">
            Max 5MB · JPG, JPEG, PNG, or WebP
          </p>
        </div>
      </div>
    </div>
  )
}
