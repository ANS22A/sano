'use server'

import { requireRole, writeAuditLog } from '@/lib/admin/auth'
import { createClient, createStaticClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const PAGE_SIZE = 12

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type BlogCategory =
  | 'massage'
  | 'prenatal'
  | 'moroccan-bath'
  | 'hands-feet'
  | 'wellness'
  | 'comparison'

export interface BlogPostRow {
  id: string
  slug: string
  title_ar: string
  title_en: string
  excerpt_ar: string | null
  excerpt_en: string | null
  content_ar: string | null
  content_en: string | null
  category: BlogCategory
  cover_image: string | null
  related_service_slugs: string[]
  seo_title_ar: string | null
  seo_title_en: string | null
  seo_description_ar: string | null
  seo_description_en: string | null
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

// ─────────────────────────────────────────────
// ZOD SCHEMA
// ─────────────────────────────────────────────

const VALID_CATEGORIES = [
  'massage', 'prenatal', 'moroccan-bath', 'hands-feet', 'wellness', 'comparison',
] as const

const BlogPostSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers and hyphens only')
    .min(3)
    .max(120),
  title_ar: z.string().min(3).max(300),
  title_en: z.string().min(3).max(300),
  excerpt_ar: z.string().max(600).optional(),
  excerpt_en: z.string().max(600).optional(),
  content_ar: z.string().max(50000).optional(),
  content_en: z.string().max(50000).optional(),
  category: z.enum(VALID_CATEGORIES),
  cover_image: z.string().url().optional().or(z.literal('')),
  related_service_slugs: z.string().optional(), // comma-separated slugs from form
  seo_title_ar: z.string().max(80).optional(),
  seo_title_en: z.string().max(80).optional(),
  seo_description_ar: z.string().max(200).optional(),
  seo_description_en: z.string().max(200).optional(),
  is_published: z.coerce.boolean().default(false),
})

// ─────────────────────────────────────────────
// PUBLIC READ ACTIONS (no auth required)
// ─────────────────────────────────────────────

const PUBLIC_BLOG_COLUMNS =
  'id, slug, title_ar, title_en, excerpt_ar, excerpt_en, content_ar, content_en, category, cover_image, related_service_slugs, seo_title_ar, seo_title_en, seo_description_ar, seo_description_en, is_published, published_at, created_at, updated_at, created_by'

/** Fetch published articles for public blog listing */
export async function getPublishedBlogPosts({
  page = 1,
  category,
}: {
  page?: number
  category?: string
}): Promise<{ posts: BlogPostRow[]; total: number }> {
  const supabase = await createClient()
  const from = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('blog_posts')
    .select(PUBLIC_BLOG_COLUMNS, { count: 'exact' })
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)

  if (category && VALID_CATEGORIES.includes(category as BlogCategory)) {
    query = query.eq('category', category)
  }

  const { data, count, error } = await query
  if (error) {
    console.error('[Blog] getPublishedBlogPosts error:', error.message)
    return { posts: [], total: 0 }
  }
  return { posts: (data ?? []) as BlogPostRow[], total: count ?? 0 }
}

/** Fetch a single published article by slug */
export async function getPublishedBlogPostBySlug(slug: string): Promise<BlogPostRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select(PUBLIC_BLOG_COLUMNS)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !data) return null
  return data as BlogPostRow
}

/** Fetch all published slugs — for generateStaticParams */
export async function getAllPublishedBlogSlugs(): Promise<string[]> {
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('is_published', true)
  return (data ?? []).map((r) => r.slug)
}

// ─────────────────────────────────────────────
// ADMIN READ ACTIONS
// ─────────────────────────────────────────────

export async function getAdminBlogPosts({
  page = 1,
  q,
  status,
}: {
  page?: number
  q?: string
  status?: string
}) {
  await requireRole('manager')
  const supabase = await createClient()
  const from = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('blog_posts')
    .select(
      'id, slug, title_ar, title_en, category, is_published, published_at, created_at, updated_at',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)

  if (q) {
    query = query.or(`title_en.ilike.%${q}%,title_ar.ilike.%${q}%,slug.ilike.%${q}%`)
  }
  if (status === 'published') query = query.eq('is_published', true)
  if (status === 'draft') query = query.eq('is_published', false)

  const { data, count, error } = await query
  if (error) return { posts: [], total: 0 }
  return { posts: data ?? [], total: count ?? 0 }
}

export async function getAdminBlogPostById(id: string): Promise<BlogPostRow | null> {
  await requireRole('manager')
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as BlogPostRow
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function parseRelatedSlugs(raw?: string): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

// ─────────────────────────────────────────────
// ADMIN WRITE ACTIONS
// ─────────────────────────────────────────────

export async function createBlogPost(formData: FormData): Promise<{ error?: string; id?: string }> {
  const session = await requireRole('manager')
  const raw = Object.fromEntries(formData)
  const parsed = BlogPostSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Validation failed' }
  }

  const { related_service_slugs, is_published, cover_image, ...rest } = parsed.data
  const supabase = await createClient()

  const insertData = {
    ...rest,
    cover_image: cover_image || null,
    related_service_slugs: parseRelatedSlugs(related_service_slugs),
    is_published,
    published_at: is_published ? new Date().toISOString() : null,
    created_by: session.userId,
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .insert(insertData)
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') return { error: 'An article with this slug already exists.' }
    return { error: error.message }
  }

  await writeAuditLog({
    adminUserId: session.userId,
    action: 'create',
    entityType: 'blog_post',
    entityId: data.id,
    metadata: { slug: rest.slug, title_en: rest.title_en },
  })

  revalidatePath('/admin/blog')
  revalidatePath('/ar/blog')
  revalidatePath('/en/blog')
  return { id: data.id }
}

export async function updateBlogPost(
  id: string,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await requireRole('manager')
  const raw = Object.fromEntries(formData)
  const parsed = BlogPostSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Validation failed' }
  }

  const { related_service_slugs, is_published, cover_image, slug, ...rest } = parsed.data
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('blog_posts')
    .select('is_published, published_at, slug')
    .eq('id', id)
    .single()

  const wasUnpublished = !existing?.is_published
  const nowPublishing = is_published

  const updateData = {
    ...rest,
    slug,
    cover_image: cover_image || null,
    related_service_slugs: parseRelatedSlugs(related_service_slugs),
    is_published,
    published_at:
      nowPublishing && wasUnpublished
        ? new Date().toISOString()
        : (existing?.published_at ?? null),
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('blog_posts').update(updateData).eq('id', id)
  if (error) {
    if (error.code === '23505') return { error: 'An article with this slug already exists.' }
    return { error: error.message }
  }

  await writeAuditLog({
    adminUserId: session.userId,
    action: 'update',
    entityType: 'blog_post',
    entityId: id,
    metadata: { slug, title_en: rest.title_en, is_published },
  })

  revalidatePath('/admin/blog')
  revalidatePath(`/ar/blog/${existing?.slug ?? slug}`)
  revalidatePath(`/en/blog/${existing?.slug ?? slug}`)
  return { success: true }
}

export async function toggleBlogPostPublished(
  id: string,
  publish: boolean
): Promise<{ error?: string; success?: boolean }> {
  const session = await requireRole('manager')
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('blog_posts')
    .select('published_at, slug')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('blog_posts')
    .update({
      is_published: publish,
      published_at:
        publish && !existing?.published_at ? new Date().toISOString() : existing?.published_at,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: error.message }

  await writeAuditLog({
    adminUserId: session.userId,
    action: publish ? 'publish' : 'unpublish',
    entityType: 'blog_post',
    entityId: id,
  })

  revalidatePath('/admin/blog')
  revalidatePath(`/ar/blog/${existing?.slug}`)
  revalidatePath(`/en/blog/${existing?.slug}`)
  return { success: true }
}

export async function deleteBlogPost(id: string): Promise<void> {
  const session = await requireRole('manager')
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('blog_posts')
    .select('slug, title_en')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('blog_posts').delete().eq('id', id)
  if (error) throw new Error(error.message)

  await writeAuditLog({
    adminUserId: session.userId,
    action: 'delete',
    entityType: 'blog_post',
    entityId: id,
    metadata: { slug: existing?.slug, title_en: existing?.title_en },
  })

  revalidatePath('/admin/blog')
  revalidatePath('/ar/blog')
  revalidatePath('/en/blog')
  redirect('/admin/blog')
}

// ─────────────────────────────────────────────
// RELATED ARTICLES (for public article page)
// ─────────────────────────────────────────────

export async function getRelatedBlogPosts(
  currentSlug: string,
  category: string,
  limit = 3
): Promise<BlogPostRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select(PUBLIC_BLOG_COLUMNS)
    .eq('is_published', true)
    .eq('category', category)
    .neq('slug', currentSlug)
    .order('published_at', { ascending: false })
    .limit(limit)

  return (data || []) as BlogPostRow[]
}

// ─────────────────────────────────────────────
// FETCH FOR SPECIFIC SERVICE (Public)
// ─────────────────────────────────────────────
export async function getBlogPostsForService(serviceSlug: string, limit: number = 3) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('blog_posts')
    .select(PUBLIC_BLOG_COLUMNS)
    .eq('is_published', true)
    .contains('related_service_slugs', [serviceSlug])
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching blog posts for service:', error)
    return []
  }

  return (data || []) as BlogPostRow[]
}
