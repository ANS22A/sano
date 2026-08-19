import type { MetadataRoute } from 'next'
import { getAllServiceSlugs } from '@/services/catalog.service'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sanoluna.com'
const LOCALES = ['ar', 'en'] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const serviceSlugs = await getAllServiceSlugs()

  // Static routes
  const staticRoutes = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/services', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/packages', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/about', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/team', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/gallery', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/faq', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/booking', priority: 0.8, changeFrequency: 'weekly' as const },
  ]

  const staticEntries: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    staticRoutes.map(({ path, priority, changeFrequency }) => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${BASE_URL}/${l}${path}`])
        ),
      },
    }))
  )

  // Dynamic service pages
  const serviceEntries: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    serviceSlugs.map((slug) => ({
      url: `${BASE_URL}/${locale}/services/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.75,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${BASE_URL}/${l}/services/${slug}`])
        ),
      },
    }))
  )

  return [...staticEntries, ...serviceEntries]
}
