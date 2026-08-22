import type { Metadata } from 'next'
import { getAdminLocations } from '@/app/actions/adminLocations.actions'
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { LocationFormWrapper } from '@/components/admin/ui/LocationFormWrapper'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { cookies } from 'next/headers'
import { adminT, type AdminLang, ADMIN_DIR } from '@/lib/admin/translations'

export const metadata: Metadata = { title: 'Locations' }

export default async function AdminLocationsPage() {
  const cookieStore = await cookies()
  const lang = (cookieStore.get('admin_lang')?.value ?? 'en') as AdminLang
  const dir = ADMIN_DIR[lang]
  const t = adminT[lang]
  const locations = await getAdminLocations()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-foreground">{t.locations.title}</h1>
        <LocationFormWrapper t={t} dir={dir} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {locations.length === 0 ? (
          <div className="sm:col-span-2">
            <AdminEmptyState icon={<MapPin className="w-6 h-6" />} title={t.locations.noResults} />
          </div>
        ) : (
          locations.map((loc) => (
            <div key={loc.id} className="bg-white rounded-2xl border border-border p-5 hover:border-accent/30 hover:shadow-[0_4px_20px_-4px_rgba(42,33,24,0.04)] transition-all duration-300 relative group">
              
              <div className="absolute top-4 end-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <LocationFormWrapper 
                  t={t} 
                  dir={dir} 
                  location={{
                    id: loc.id,
                    name_en: loc.name_en,
                    name_ar: loc.name_ar,
                    address_en: loc.address_en,
                    address_ar: loc.address_ar,
                    phone: loc.phone,
                    slug: loc.slug,
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    is_active: loc.is_active
                  }} 
                  variant="icon" 
                />
              </div>

              <div className="flex items-start justify-between gap-3 mb-3 pe-10">
                <div>
                  <h2 className="font-semibold text-foreground">{loc.name_en}</h2>
                  <p className="text-sm text-muted-foreground" dir="rtl">{loc.name_ar}</p>
                </div>
                <AdminBadge
                  status={loc.is_active ? 'active' : 'inactive'}
                  label={loc.is_active ? t.common.active : t.common.inactive}
                />
              </div>
              <p className="text-xs text-muted-foreground mb-4">{loc.address_en ?? '—'}</p>
              <div className="flex gap-3">
                <Link
                  href={`/admin/settings/business-hours?location=${loc.id}`}
                  className="text-xs font-medium text-accent hover:underline"
                >
                  {t.locations.businessHours}
                </Link>
                <Link
                  href={`/admin/settings/blackout-dates?location=${loc.id}`}
                  className="text-xs font-medium text-accent hover:underline"
                >
                  {t.locations.blackoutDates}
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
