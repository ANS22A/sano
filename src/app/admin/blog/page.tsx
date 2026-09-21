import type { Metadata } from 'next'
import Link from 'next/link'
import { getAdminBlogPosts } from '@/app/actions/adminBlog.actions'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState'
import { AdminPagination } from '@/components/admin/ui/AdminPagination'
import { AdminSearchBar } from '@/components/admin/ui/AdminSearchBar'
import { FileText, Plus } from 'lucide-react'
import { cookies } from 'next/headers'
import { adminT, type AdminLang } from '@/lib/admin/translations'

export const metadata: Metadata = { title: 'Blog' }

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const cookieStore = await cookies()
  const lang = (cookieStore.get('admin_lang')?.value ?? 'en') as AdminLang
  const t = adminT[lang]

  const { posts, total } = await getAdminBlogPosts({
    page: Number(sp.page ?? 1),
    q: sp.q,
    status: sp.status,
  })

  const tTitle = lang === 'ar' ? 'المقالات' : 'Blog'
  const tNew = lang === 'ar' ? 'مقال جديد' : 'New Article'
  const tTitleEnHeader = lang === 'ar' ? 'العنوان (EN)' : 'Title (EN)'
  const tTitleArHeader = lang === 'ar' ? 'العنوان (AR)' : 'Title (AR)'
  const tCategory = lang === 'ar' ? 'التصنيف' : 'Category'
  const tStatus = lang === 'ar' ? 'الحالة' : 'Status'

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-foreground">{tTitle}</h1>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-primary text-white text-xs sm:text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          {tNew}
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1">
          <AdminSearchBar placeholder={t.common.filters} paramName="q" />
        </div>
        {['all', 'published', 'draft'].map((a) => {
          const isActive = (sp.status ?? 'all') === a
          let label: string = t.common.all
          if (a === 'published') label = lang === 'ar' ? 'منشور' : 'Published'
          if (a === 'draft') label = lang === 'ar' ? 'مسودة' : 'Draft'
          
          return (
            <Link key={a} href={`/admin/blog?status=${a}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${
                isActive ? 'bg-primary text-white border-primary' : 'bg-surface text-muted-foreground border-border hover:bg-surface-muted'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </div>

      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        {posts.length === 0 ? (
          <AdminEmptyState icon={<FileText className="w-6 h-6" />} title={t.common.noData} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface border-b border-border">
                  {[tTitleEnHeader, tTitleArHeader, tCategory, tStatus, t.common.actions].map((h) => (
                    <th key={h} className="text-start px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {posts.map((p) => (
                  <tr key={p.id} className="hover:bg-surface transition-colors group">
                    <td className="px-4 py-3 font-medium text-foreground">{p.title_en}</td>
                    <td className="px-4 py-3 text-foreground">{p.title_ar}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs capitalize">
                      {p.category.replace('-', ' ')}
                    </td>
                    <td className="px-4 py-3">
                      <AdminBadge
                        status={p.is_published ? 'active' : 'inactive'}
                        label={p.is_published ? (lang === 'ar' ? 'منشور' : 'Published') : (lang === 'ar' ? 'مسودة' : 'Draft')}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/blog/${p.id}/edit`} className="text-xs font-medium text-accent hover:underline">
                        {t.common.edit}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <AdminPagination total={total} perPage={12} dir={lang === 'ar' ? 'rtl' : 'ltr'} />
    </div>
  )
}
