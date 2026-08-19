/**
 * SANO LUNA — SEO & Metadata Utilities
 *
 * Helpers for generating locale-aware metadata for all pages.
 * Based on Next.js 16 Metadata API.
 */

import type { Metadata } from 'next'
import type { Locale } from '@/types/ui.types'
import { siteConfig } from '@/config/site.config'

interface GenerateMetadataOptions {
  locale: Locale
  title?: string
  description?: string
  path?: string
  image?: string
  noIndex?: boolean
}

/**
 * Generate locale-aware metadata for any page.
 */
export function generateSiteMetadata({
  locale,
  title,
  description,
  path = '/',
  image,
  noIndex = false,
}: GenerateMetadataOptions): Metadata {
  const siteTitle = title
    ? `${title} | ${siteConfig.name}`
    : siteConfig.name

  const siteDescription = description ?? siteConfig.description

  const canonicalUrl = `${siteConfig.url}/${locale}${path === '/' ? '' : path}`

  const ogImage = image ?? siteConfig.ogImage

  return {
    title: siteTitle,
    description: siteDescription,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ar: `${siteConfig.url}/ar${path === '/' ? '' : path}`,
        en: `${siteConfig.url}/en${path === '/' ? '' : path}`,
      },
    },
    openGraph: {
      title: siteTitle,
      description: siteDescription,
      url: canonicalUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: siteTitle,
      description: siteDescription,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}
