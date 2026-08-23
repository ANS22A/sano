/**
 * SANO LUNA — Admin Auth Helpers
 * Server-only. Used in server actions and server components.
 */
import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/database.types'

export type AdminProfile = Tables<'profiles'>
export type AdminRole = 'super_admin' | 'admin' | 'manager' | 'staff'

export interface AdminSession {
  userId: string
  email: string
  profile: AdminProfile
}

/**
 * Get the current authenticated admin session + profile.
 * Returns null if unauthenticated or no profile found.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (!profile || !profile.is_active) return null

  return {
    userId: session.user.id,
    email: session.user.email ?? '',
    profile,
  }
}

/**
 * Require auth — throws redirect response if not authenticated.
 * Use in server actions/components that need auth.
 */
export async function requireAuth(): Promise<AdminSession> {
  const session = await getAdminSession()
  if (!session) {
    const { redirect } = await import('next/navigation')
    redirect('/admin/login')
  }
  return session!
}

/**
 * Require a specific minimum role.
 * Role hierarchy: super_admin > admin > manager > staff
 */
export async function requireRole(minRole: AdminRole): Promise<AdminSession> {
  const session = await requireAuth()
  const hierarchy: AdminRole[] = ['staff', 'manager', 'admin', 'super_admin']
  const userLevel = hierarchy.indexOf(session.profile.role as AdminRole)
  const requiredLevel = hierarchy.indexOf(minRole)

  if (userLevel < requiredLevel) {
    const { redirect } = await import('next/navigation')
    redirect('/admin?error=insufficient_permissions')
  }

  return session
}

/**
 * Write an audit log entry for an admin action.
 * Non-blocking — errors are logged but don't fail the operation.
 */
export async function writeAuditLog({
  adminUserId,
  action,
  entityType,
  entityId,
  metadata,
}: {
  adminUserId: string
  action: string
  entityType: string
  entityId?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any
}): Promise<void> {
  try {
    const supabase = await createClient()
    await supabase.from('admin_audit_logs').insert({
      admin_user_id: adminUserId,
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      metadata: metadata ?? {},
    })
  } catch (err) {
    console.error('[AuditLog] Failed to write:', err)
  }
}
