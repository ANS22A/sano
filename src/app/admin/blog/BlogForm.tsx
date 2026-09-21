'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createBlogPost, updateBlogPost, toggleBlogPostPublished } from '@/app/actions/adminBlog.actions'
import { useAdmin } from '@/components/admin/shell/AdminShell'
import { cn } from '@/lib/utils/cn'

interface BlogFormProps {
  post?: {
    id: string
    slug: string
    title_ar: string
    title_en: string
    excerpt_ar: string | null
    excerpt_en: string | null
    content_ar: string | null
    content_en: string | null
    category: string
    cover_image: string | null
    related_service_slugs: string[]
    seo_title_ar: string | null
    seo_title_en: string | null
    seo_description_ar: string | null
    seo_description_en: string | null
    is_published: boolean
  }
  isEdit?: boolean
}

export function BlogForm({ post, isEdit }: BlogFormProps) {
  const { t, lang } = useAdmin()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = isEdit && post
        ? await updateBlogPost(post.id, fd)
        : await createBlogPost(fd)
      if (result?.error) {
        alert(result.error)
      } else {
        router.push('/admin/blog')
      }
    })
  }

  function handleTogglePublished() {
    if (!post) return
    startTransition(async () => {
      await toggleBlogPostPublished(post.id, !post.is_published)
      router.refresh()
    })
  }

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent'
  const labelCls = 'block text-xs font-medium text-muted-foreground mb-1.5'
  
  const tTitleEn = lang === 'ar' ? 'العنوان (EN)' : 'Title (EN)'
  const tTitleAr = lang === 'ar' ? 'العنوان (AR)' : 'Title (AR)'
  const tExcerptEn = lang === 'ar' ? 'مقتطف (EN)' : 'Excerpt (EN)'
  const tExcerptAr = lang === 'ar' ? 'مقتطف (AR)' : 'Excerpt (AR)'
  const tContentEn = lang === 'ar' ? 'المحتوى (EN) - يدعم Markdown' : 'Content (EN) - Markdown Supported'
  const tContentAr = lang === 'ar' ? 'المحتوى (AR) - يدعم Markdown' : 'Content (AR) - Markdown Supported'
  const tCategory = lang === 'ar' ? 'التصنيف' : 'Category'
  const tRelated = lang === 'ar' ? 'الخدمات ذات الصلة (مفصولة بفاصلة)' : 'Related Services (comma separated slugs)'

  const categories = [
    { value: 'massage', labelEn: 'Massage', labelAr: 'المساج' },
    { value: 'prenatal', labelEn: 'Prenatal', labelAr: 'مساج الحوامل' },
    { value: 'moroccan-bath', labelEn: 'Moroccan Bath', labelAr: 'الحمام المغربي' },
    { value: 'hands-feet', labelEn: 'Hands & Feet', labelAr: 'العناية باليدين والقدمين' },
    { value: 'wellness', labelEn: 'Wellness', labelAr: 'العناية بالنفس' },
    { value: 'comparison', labelEn: 'Comparison', labelAr: 'المقارنات' },
  ]

  return (
    <div className="max-w-4xl space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">
          {isEdit ? (lang === 'ar' ? 'تعديل المقال' : 'Edit Article') : (lang === 'ar' ? 'مقال جديد' : 'New Article')}
        </h1>
        {isEdit && post && (
          <button
            onClick={handleTogglePublished}
            disabled={isPending}
            type="button"
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
              post.is_published
                ? 'border-error-border text-error hover:bg-error-bg'
                : 'border-success-border text-success hover:bg-success-bg'
            }`}
          >
            {post.is_published ? (lang === 'ar' ? 'إلغاء النشر' : 'Unpublish') : (lang === 'ar' ? 'نشر' : 'Publish')}
          </button>
        )}
      </div>

      {isEdit && post && (
        <div className="bg-surface rounded-2xl border border-border p-6">
          <h2 className="text-sm font-bold text-foreground mb-4">{lang === 'ar' ? 'صورة الغلاف' : 'Cover Image'}</h2>
          <label className={labelCls}>{lang === 'ar' ? 'رابط الصورة (URL)' : 'Image URL'}</label>
          <input form="blog-form" name="cover_image" type="url" defaultValue={post.cover_image ?? ''} className={inputCls} placeholder="https://..." />
        </div>
      )}

      <form id="blog-form" onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-border p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>{tTitleEn} *</label>
            <input name="title_en" defaultValue={post?.title_en} required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{tTitleAr} *</label>
            <input name="title_ar" defaultValue={post?.title_ar} required dir="rtl" className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Slug *</label>
            <input name="slug" defaultValue={post?.slug} required pattern="[a-z0-9-]+" className={inputCls} placeholder="e.g. what-is-swedish-massage" />
            <p className="text-[10px] text-muted-foreground mt-1">Lowercase, numbers, hyphens only.</p>
          </div>
          <div>
            <label className={labelCls}>{tCategory} *</label>
            <select name="category" defaultValue={post?.category ?? ''} required className={inputCls}>
              <option value="" disabled>{lang === 'ar' ? '— اختر —' : '— Select —'}</option>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{lang === 'ar' ? c.labelAr : c.labelEn}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>{tExcerptEn}</label>
            <textarea name="excerpt_en" defaultValue={post?.excerpt_en ?? ''} rows={3} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{tExcerptAr}</label>
            <textarea name="excerpt_ar" defaultValue={post?.excerpt_ar ?? ''} rows={3} dir="rtl" className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className={labelCls}>{tContentEn}</label>
            <textarea name="content_en" defaultValue={post?.content_en ?? ''} rows={15} className={cn(inputCls, 'font-mono text-xs')} />
          </div>
          <div>
            <label className={labelCls}>{tContentAr}</label>
            <textarea name="content_ar" defaultValue={post?.content_ar ?? ''} rows={15} dir="rtl" className={cn(inputCls, 'font-mono text-xs')} />
          </div>
        </div>

        <div>
          <label className={labelCls}>{tRelated}</label>
          <input name="related_service_slugs" defaultValue={post?.related_service_slugs?.join(', ') ?? ''} className={inputCls} placeholder="e.g. swedish-massage, thai-massage" />
        </div>
        
        <hr className="border-border" />
        
        <h3 className="font-bold text-sm">SEO</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>SEO Title (EN)</label>
            <input name="seo_title_en" defaultValue={post?.seo_title_en ?? ''} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>SEO Title (AR)</label>
            <input name="seo_title_ar" defaultValue={post?.seo_title_ar ?? ''} dir="rtl" className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>SEO Description (EN)</label>
            <textarea name="seo_description_en" defaultValue={post?.seo_description_en ?? ''} rows={2} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>SEO Description (AR)</label>
            <textarea name="seo_description_ar" defaultValue={post?.seo_description_ar ?? ''} rows={2} dir="rtl" className={inputCls} />
          </div>
        </div>
        
        {!isEdit && (
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input name="is_published" type="checkbox" value="true" className="w-4 h-4 rounded accent-accent" />
              <span className="text-sm text-foreground">{lang === 'ar' ? 'نشر فوراً' : 'Publish Immediately'}</span>
            </label>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-60 transition-colors"
          >
            {isPending ? t.common.saving : t.common.save}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:bg-surface-muted transition-colors"
          >
            {t.common.cancel}
          </button>
        </div>
      </form>
    </div>
  )
}
