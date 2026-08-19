/**
 * SANO LUNA — Service Categories (Development Seed Data)
 *
 * IMPORTANT: This is DEVELOPMENT SEED DATA.
 * When Supabase is connected, replace this with a DB query.
 * All service names/descriptions are original SANO LUNA copy.
 * NOT copied from any reference website.
 *
 * Taxonomy: Original SANO LUNA categorization.
 */

import type { ServiceCategory } from './types'

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'massage-therapies',
    slug: 'massage-therapies',
    name_ar: 'علاجات المساج',
    name_en: 'Massage Therapies',
    description_ar: 'تقنيات مساج مختارة بعناية لإعادة التوازن والهدوء لجسمك وذهنك',
    description_en: 'Carefully chosen massage techniques to restore balance and calm to body and mind',
    icon: '✦',
    image_url: '/images/categories/massage-therapies.jpg',
    service_count: 13,
    display_order: 1,
    active: true,
  },
  {
    id: 'specialty-therapies',
    slug: 'specialty-therapies',
    name_ar: 'علاجات متخصصة',
    name_en: 'Specialty Therapies',
    description_ar: 'كاسات الهواء، المساج اللمفاوي، والأحجار الساخنة — عناية أعمق لاحتياجات خاصة',
    description_en: 'Cupping, lymphatic drainage, and hot stone — deeper care for specific needs',
    icon: '◌',
    image_url: '/images/categories/specialty-therapies.jpg',
    service_count: 3,
    display_order: 2,
    active: true,
  },
  {
    id: 'moroccan-rituals',
    slug: 'moroccan-rituals',
    name_ar: 'طقوس مغربية',
    name_en: 'Moroccan Rituals',
    description_ar: 'الحمام المغربي الأصيل — طقوس تنقية وعناية بالبشرة مستوحاة من التراث',
    description_en: 'Authentic Moroccan bath rituals — traditional cleansing and skin care heritage',
    icon: '⌘',
    image_url: '/images/categories/moroccan-rituals.jpg',
    service_count: 1,
    display_order: 3,
    active: true,
  },
  {
    id: 'hands-feet',
    slug: 'hands-feet',
    name_ar: 'العناية باليدين والقدمين',
    name_en: 'Hands & Feet',
    description_ar: 'مناكير وبديكير احترافي — اهتمام دقيق بكل تفصيل',
    description_en: 'Professional manicure and pedicure — meticulous attention to every detail',
    icon: '◇',
    image_url: '/images/categories/hands-feet.jpg',
    service_count: 1,
    display_order: 4,
    active: true,
  },
  {
    id: 'prenatal-care',
    slug: 'prenatal-care',
    name_ar: 'رعاية الحامل',
    name_en: 'Prenatal Care',
    description_ar: 'علاجات مصممة خصيصاً لراحة وسلامة الحامل في كل مرحلة',
    description_en: 'Treatments designed exclusively for the comfort and safety of expectant mothers',
    icon: '♡',
    image_url: '/images/categories/prenatal-care.jpg',
    service_count: 2,
    display_order: 5,
    active: true,
  },
  {
    id: 'combined-journeys',
    slug: 'combined-journeys',
    name_ar: 'رحلات متكاملة',
    name_en: 'Combined Journeys',
    description_ar: 'باقات مصممة بعناية تجمع أكثر من خدمة في تجربة واحدة متكاملة',
    description_en: 'Thoughtfully designed packages combining multiple services into one complete journey',
    icon: '✧',
    image_url: '/images/categories/combined-journeys.jpg',
    service_count: 5,
    display_order: 6,
    active: true,
  },
]

// Featured categories for homepage (top 4)
export const featuredCategories = serviceCategories.filter(
  (c) => c.display_order <= 4
)
