import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAdminStaffById } from '@/app/actions/adminStaff.actions'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = { title: 'Staff Availability' }

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default async function StaffAvailabilityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { staff, availability } = await getAdminStaffById(id)
  if (!staff) notFound()

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/admin/staff" className="inline-flex items-center gap-2 text-sm text-[#9a8a7a] hover:text-[#2a2118]">
        <ArrowLeft className="w-4 h-4" /> Back to Staff
      </Link>

      <h1 className="text-xl font-bold text-[#2a2118]">{staff.name_en} — Availability</h1>

      <div className="bg-white rounded-2xl border border-[#e8ddd0] overflow-hidden">
        {availability.length === 0 ? (
          <p className="text-center text-sm text-[#9a8a7a] py-8">No availability configured for this staff member.</p>
        ) : (
          <div className="divide-y divide-[#f0e8de]">
            {availability.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-6 py-4">
                <span className="text-sm font-medium text-[#2a2118]">{DAYS[a.day_of_week ?? 0]}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#7a6a57]">
                    {a.start_time?.slice(0, 5)} — {a.end_time?.slice(0, 5)}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${a.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {a.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
