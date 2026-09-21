import { getPublishedBlogPostBySlug, getRelatedBlogPosts, getAllPublishedBlogSlugs } from '@/app/actions/adminBlog.actions'
import { ArticleBody } from '@/components/blog/ArticleBody'
import { ArticleCard } from '@/components/blog/ArticleCard'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  const slugs = await getAllPublishedBlogSlugs()
  const params: { locale: string; slug: string }[] = []
  
  for (const slug of slugs) {
    params.push({ locale: 'ar', slug })
    params.push({ locale: 'en', slug })
  }
  
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const post = await getPublishedBlogPostBySlug(slug)
  
  if (!post) return {}
  
  const isAr = locale === 'ar'
  const title = isAr ? (post.seo_title_ar || post.title_ar) : (post.seo_title_en || post.title_en)
  const description = isAr ? (post.seo_description_ar || post.excerpt_ar) : (post.seo_description_en || post.excerpt_en)
  
  return {
    title: `${title} | SANO LUNA`,
    description,
    openGraph: {
      title,
      description: description || undefined,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
    alternates: {
      canonical: `https://sanoluna.com/${locale}/blog/${slug}`,
      languages: {
        'ar': `https://sanoluna.com/ar/blog/${slug}`,
        'en': `https://sanoluna.com/en/blog/${slug}`,
      }
    }
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const post = await getPublishedBlogPostBySlug(slug)
  
  if (!post) {
    notFound()
  }

  const isAr = locale === 'ar'
  const title = isAr ? post.title_ar : post.title_en
  const content = isAr ? post.content_ar : post.content_en
  const excerpt = isAr ? post.excerpt_ar : post.excerpt_en
  const relatedPosts = await getRelatedBlogPosts(slug, post.category, 3)

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: excerpt,
    image: post.cover_image ? [post.cover_image] : [],
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Organization',
      name: 'SANO LUNA',
      url: 'https://sanoluna.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'SANO LUNA',
      logo: {
        '@type': 'ImageObject',
        url: 'https://sanoluna.com/images/logo.png',
      },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="min-h-screen bg-surface">
        {/* Hero Section */}
        <div className="relative pt-32 pb-16 lg:pt-48 lg:pb-32 overflow-hidden">
          {post.cover_image && (
            <div className="absolute inset-0 z-0">
              <Image
                src={post.cover_image}
                alt={title}
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
            </div>
          )}
          
          <div className="container relative z-10 mx-auto px-4 max-w-4xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm font-medium mb-8 text-white/80">
              <Link href={`/${locale}`} className="hover:text-white transition-colors">
                {isAr ? 'الرئيسية' : 'Home'}
              </Link>
              <span className="rtl:rotate-180">/</span>
              <Link href={`/${locale}/blog`} className="hover:text-white transition-colors">
                {isAr ? 'المدونة' : 'Blog'}
              </Link>
              <span className="rtl:rotate-180">/</span>
              <span className="text-white capitalize">{post.category.replace('-', ' ')}</span>
            </div>

            <div className="max-w-3xl">
              <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest rounded-full mb-6">
                {post.category.replace('-', ' ')}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white leading-[1.1] mb-6">
                {title}
              </h1>
              {excerpt && (
                <p className="text-lg sm:text-xl text-white/90 leading-relaxed max-w-2xl">
                  {excerpt}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 py-16 lg:py-24 max-w-4xl">
          <ArticleBody content={content} className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-heading prose-a:text-accent hover:prose-a:text-accent-hover" />
          
          {/* Related Services CTA block */}
          {post.related_service_slugs && post.related_service_slugs.length > 0 && (
            <div className="mt-16 p-8 bg-surface-warm rounded-3xl border border-border/50 text-center">
              <h3 className="text-2xl font-heading font-bold text-foreground mb-4">
                {isAr ? 'هل أنتِ مستعدة للتجربة؟' : 'Ready to experience this?'}
              </h3>
              <p className="text-muted-foreground mb-8">
                {isAr ? 'اكتشفي خدماتنا المرتبطة بهذا المقال واحجزي جلستك اليوم.' : 'Discover our services related to this article and book your session today.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {post.related_service_slugs.map(slug => (
                  <Link 
                    key={slug} 
                    href={`/${locale}/services/${slug}`}
                    className="px-6 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
                  >
                    {isAr ? `عرض الخدمة` : `View Service`}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <div className="bg-surface-warm border-t border-border/50 py-16 lg:py-24">
            <div className="container mx-auto px-4 max-w-7xl">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-heading font-bold text-foreground">
                  {isAr ? 'مقالات ذات صلة' : 'Related Articles'}
                </h2>
                <Link 
                  href={`/${locale}/blog?category=${post.category}`}
                  className="text-sm font-medium text-accent hover:underline flex items-center gap-1"
                >
                  {isAr ? 'عرض الكل' : 'View All'}
                  <span className="rtl:rotate-180">→</span>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((rp) => (
                  <ArticleCard key={rp.id} post={rp} locale={locale} />
                ))}
              </div>
            </div>
          </div>
        )}
      </article>
    </>
  )
}
