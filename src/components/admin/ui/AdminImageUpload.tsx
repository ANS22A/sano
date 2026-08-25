'use client'

import { useState, useRef, useTransition } from 'react'
import Image from 'next/image'
import type { AdminTranslations } from '@/lib/admin/translations'

interface AdminImageUploadProps {
  entityId: string
  imageUrl: string | null
  onUpload: (id: string, formData: FormData) => Promise<{ success?: boolean; url?: string; error?: string }>
  onRemove: (id: string) => Promise<{ success?: boolean; error?: string }>
  t: AdminTranslations
}

export function AdminImageUpload({ entityId, imageUrl, onUpload, onRemove, t }: AdminImageUploadProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError(t.media.fileTooLarge)
      return
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setError(t.media.invalidFileType)
      return
    }

    setError(null)
    const fd = new FormData()
    fd.append('file', file)

    startTransition(async () => {
      const result = await onUpload(entityId, fd)
      if (result.error) {
        setError(result.error)
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    })
  }

  function handleRemove() {
    setError(null)
    startTransition(async () => {
      const result = await onRemove(entityId)
      if (result.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-error-bg text-error rounded-lg text-sm border border-error-border">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="relative w-full sm:w-48 aspect-square bg-surface rounded-2xl border border-border flex items-center justify-center overflow-hidden shrink-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="Media"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 192px"
            />
          ) : (
            <div className="text-center p-4">
              <span className="block text-2xl mb-2 text-muted-foreground">🖼️</span>
              <span className="text-sm text-muted-foreground">{t.media.emptyState}</span>
            </div>
          )}
          {isPending && (
            <div className="absolute inset-0 bg-primary/50 flex items-center justify-center backdrop-blur-sm">
              <span className="text-white text-sm font-medium">{t.media.uploading}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 w-full sm:w-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-60 transition-colors w-full sm:w-auto"
          >
            {imageUrl ? t.media.replaceImage : t.media.uploadImage}
          </button>

          {imageUrl && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isPending}
              className="px-6 py-2.5 rounded-xl border border-error-border text-error text-sm font-medium hover:bg-error-bg disabled:opacity-60 transition-colors w-full sm:w-auto"
            >
              {t.media.removeImage}
            </button>
          )}

          <p className="text-xs text-muted-foreground mt-2" dir="ltr">
            Max 5MB. JPG, PNG, or WebP.
          </p>
        </div>
      </div>
    </div>
  )
}
