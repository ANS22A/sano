import Link from 'next/link'
import Image from 'next/image'
import { BlogPostRow } from '@/app/actions/adminBlog.actions'

interface ArticleCardProps {
  post: BlogPostRow
  locale: string
}

export async function ArticleCard({ post, locale }: ArticleCardProps) {
  const isAr = locale === 'ar'
  
  const title = isAr ? post.title_ar : post.title_en
  const excerpt = isAr ? post.excerpt_ar : post.excerpt_en
  const coverImage = post.cover_image || `/images/blog/${post.slug}.jpg`
  
  return (
    <Link 
      href={`/${locale}/blog/${post.slug}`}
      className="group flex flex-col bg-surface-warm border border-border/50 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] bg-muted w-full overflow-hidden">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-accent/5 flex items-center justify-center">
            <span className="text-accent/40 font-heading text-xl">SANO LUNA</span>
          </div>
        )}
        <div className="absolute top-4 start-4">
          <span className="px-3 py-1 bg-surface-warm/90 backdrop-blur-md text-foreground text-[10px] font-bold uppercase tracking-widest rounded-full">
            {post.category.replace('-', ' ')}
          </span>
        </div>
      </div>
      
      <div className="flex flex-col flex-1 p-6">
        <h3 className="font-heading text-lg font-bold text-foreground mb-3 line-clamp-2 group-hover:text-accent transition-colors">
          {title}
        </h3>
        {excerpt && (
          <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">
            {excerpt}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between text-xs font-medium text-accent">
          <span>{isAr ? 'اقرأ المزيد' : 'Read More'}</span>
          <span className="rtl:rotate-180">→</span>
        </div>
      </div>
    </Link>
  )
}
