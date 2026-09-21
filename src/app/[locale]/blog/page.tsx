import { getPublishedBlogPosts } from '@/app/actions/adminBlog.actions'
import { ArticleCard } from '@/components/blog/ArticleCard'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog | SANO LUNA',
  description: 'Explore our latest articles, wellness guides, and tips.',
}

export default async function BlogListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string; category?: string }>
}) {
  const { locale } = await params
  const sp = await searchParams
  const isAr = locale === 'ar'

  const page = Number(sp.page ?? 1)
  const { posts, total } = await getPublishedBlogPosts({
    page,
    category: sp.category,
  })

  const totalPages = Math.ceil(total / 12)

  const categories = [
    { value: '', label: isAr ? 'الكل' : 'All' },
    { value: 'massage', label: isAr ? 'المساج' : 'Massage' },
    { value: 'prenatal', label: isAr ? 'مساج الحوامل' : 'Prenatal' },
    { value: 'moroccan-bath', label: isAr ? 'الحمام المغربي' : 'Moroccan Bath' },
    { value: 'hands-feet', label: isAr ? 'العناية باليدين والقدمين' : 'Hands & Feet' },
    { value: 'wellness', label: isAr ? 'العناية بالنفس' : 'Wellness' },
    { value: 'comparison', label: isAr ? 'المقارنات' : 'Comparison' },
  ]

  return (
    <div className="min-h-screen bg-surface">
      <div className="container mx-auto px-4 py-16 sm:py-24 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl sm:text-5xl font-heading font-bold text-foreground mb-6">
            {isAr ? 'مدونة سانو لونا' : 'The SANO LUNA Blog'}
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl">
            {isAr 
              ? 'اكتشفي أدلة العناية بالنفس، ونصائح العافية، وكل ما يخص عالم المساج والاسترخاء.'
              : 'Discover self-care guides, wellness tips, and everything you need to know about the world of massage and relaxation.'}
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {categories.map((c) => {
            const isActive = (sp.category ?? '') === c.value
            return (
              <Link
                key={c.value}
                href={`/${locale}/blog${c.value ? `?category=${c.value}` : ''}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'bg-surface-warm text-muted-foreground hover:text-foreground hover:bg-surface-muted'
                }`}
              >
                {c.label}
              </Link>
            )
          })}
        </div>

        {/* Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <ArticleCard key={post.id} post={post} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-surface-warm rounded-3xl border border-border/50">
            <h3 className="text-xl font-bold text-foreground mb-2">
              {isAr ? 'لا توجد مقالات' : 'No articles found'}
            </h3>
            <p className="text-muted-foreground">
              {isAr ? 'لم نجد أي مقالات بهذا التصنيف.' : 'We could not find any articles in this category.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-16">
            {page > 1 && (
              <Link
                href={`/${locale}/blog?page=${page - 1}${sp.category ? `&category=${sp.category}` : ''}`}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-warm hover:bg-surface-muted text-foreground transition-colors border border-border"
              >
                <span className="rtl:rotate-180">←</span>
              </Link>
            )}
            
            <span className="text-sm font-medium text-muted-foreground px-4">
              {isAr ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
            </span>

            {page < totalPages && (
              <Link
                href={`/${locale}/blog?page=${page + 1}${sp.category ? `&category=${sp.category}` : ''}`}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-warm hover:bg-surface-muted text-foreground transition-colors border border-border"
              >
                <span className="rtl:rotate-180">→</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
