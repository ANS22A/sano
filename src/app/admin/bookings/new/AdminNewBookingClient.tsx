'use client'

import { useState, useTransition, useCallback, useEffect, useMemo } from 'react'
import { useAdmin } from '@/components/admin/shell/AdminShell'
import {
  createAdminBooking,
  searchCustomersForBooking,
  getServicesForBooking,
  getAdminBookingSlots,
  type BookingSource,
  type AdminBookingInput,
} from '@/app/actions/adminManualBooking.actions'
import type { AvailableSlot } from '@/data/booking.types'
import {
  ArrowLeft, Search, User, Phone, Mail, MapPin,
  CalendarDays, Clock, FileText, CheckCircle, Loader2,
  Plus, MessageCircle,
} from 'lucide-react'
import Link from 'next/link'

// â”€â”€â”€ Translations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const t9b = {
  en: {
    title: 'New Booking',
    subtitle: 'Create a manual booking',
    // Steps
    stepCustomer: 'Customer',
    stepService: 'Service',
    stepSchedule: 'Date & Time',
    stepReview: 'Review & Confirm',
    // Customer
    searchCustomer: 'Search existing customerâ€¦',
    orCreateNew: 'Or create a new customer',
    customerName: 'Full Name',
    customerPhone: 'Phone',
    customerEmail: 'Email (optional)',
    customerAddress: 'Service Address',
    customerAddressHint: 'Where the service will be provided',
    selectExisting: 'Select',
    newCustomer: 'New Customer',
    existingCustomer: 'Existing Customer',
    noCustomersFound: 'No customers found',
    // Source
    bookingSource: 'Booking Source',
    sourceWebsite: 'Website',
    sourceWhatsapp: 'WhatsApp',
    sourcePhone: 'Phone',
    sourceAdmin: 'Admin',
    sourceOther: 'Other',
    // Service
    selectService: 'Select a service',
    price: 'Price',
    duration: 'Duration',
    minUnit: 'min',
    // Schedule
    selectDate: 'Select Date',
    selectTime: 'Select Time',
    noSlots: 'No available slots for this date',
    loadingSlots: 'Loading available timesâ€¦',
    // Notes
    notes: 'Internal Notes',
    notesHint: 'Admin-only notes (not visible to customer)',
    // Review
    reviewTitle: 'Review Booking',
    customer: 'Customer',
    service: 'Service',
    date: 'Date',
    time: 'Time',
    source: 'Source',
    address: 'Address',
    // Actions
    back: 'Back',
    next: 'Next',
    createBooking: 'Create Booking',
    creating: 'Creatingâ€¦',
    // Success
    bookingCreated: 'Booking Created!',
    bookingNumber: 'Booking Number',
    viewBookings: 'View All Bookings',
    createAnother: 'Create Another',
    // Errors
    errorRequired: 'This field is required',
    errorPhone: 'Invalid phone number',
  },
  ar: {
    title: 'ط­ط¬ط² ط¬ط¯ظٹط¯',
    subtitle: 'ط¥ظ†ط´ط§ط، ط­ط¬ط² ظٹط¯ظˆظٹ',
    stepCustomer: 'ط§ظ„ط¹ظ…ظٹظ„ط©',
    stepService: 'ط§ظ„ط®ط¯ظ…ط©',
    stepSchedule: 'ط§ظ„طھط§ط±ظٹط® ظˆط§ظ„ظˆظ‚طھ',
    stepReview: 'ط§ظ„ظ…ط±ط§ط¬ط¹ط© ظˆط§ظ„طھط£ظƒظٹط¯',
    searchCustomer: 'ط§ظ„ط¨ط­ط« ط¹ظ† ط¹ظ…ظٹظ„ط©â€¦',
    orCreateNew: 'ط£ظˆ ط¥ظ†ط´ط§ط، ط¹ظ…ظٹظ„ط© ط¬ط¯ظٹط¯ط©',
    customerName: 'ط§ظ„ط§ط³ظ… ط§ظ„ظƒط§ظ…ظ„',
    customerPhone: 'ط±ظ‚ظ… ط§ظ„ط¬ظˆط§ظ„',
    customerEmail: 'ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ (ط§ط®طھظٹط§ط±ظٹ)',
    customerAddress: 'ط¹ظ†ظˆط§ظ† ط§ظ„ط®ط¯ظ…ط©',
    customerAddressHint: 'ظ…ظƒط§ظ† طھظ‚ط¯ظٹظ… ط§ظ„ط®ط¯ظ…ط©',
    selectExisting: 'ط§ط®طھظٹط§ط±',
    newCustomer: 'ط¹ظ…ظٹظ„ط© ط¬ط¯ظٹط¯ط©',
    existingCustomer: 'ط¹ظ…ظٹظ„ط© ظ…ط³ط¬ظ„ط©',
    noCustomersFound: 'ظ„ط§ طھظˆط¬ط¯ ط¹ظ…ظٹظ„ط§طھ',
    bookingSource: 'ظ…طµط¯ط± ط§ظ„ط­ط¬ط²',
    sourceWebsite: 'ط§ظ„ظ…ظˆظ‚ط¹',
    sourceWhatsapp: 'ظˆط§طھط³ط§ط¨',
    sourcePhone: 'ظ‡ط§طھظپ',
    sourceAdmin: 'ط¥ط¯ط§ط±ط©',
    sourceOther: 'ط£ط®ط±ظ‰',
    selectService: 'ط§ط®طھظٹط§ط± ط§ظ„ط®ط¯ظ…ط©',
    price: 'ط§ظ„ط³ط¹ط±',
    duration: 'ط§ظ„ظ…ط¯ط©',
    minUnit: 'ط¯',
    selectDate: 'ط§ط®طھظٹط§ط± ط§ظ„طھط§ط±ظٹط®',
    selectTime: 'ط§ط®طھظٹط§ط± ط§ظ„ظˆظ‚طھ',
    noSlots: 'ظ„ط§ طھظˆط¬ط¯ ظ…ظˆط§ط¹ظٹط¯ ظ…طھط§ط­ط© ظ„ظ‡ط°ط§ ط§ظ„طھط§ط±ظٹط®',
    loadingSlots: 'ط¬ط§ط±ظچ طھط­ظ…ظٹظ„ ط§ظ„ظ…ظˆط§ط¹ظٹط¯â€¦',
    notes: 'ظ…ظ„ط§ط­ط¸ط§طھ ط¯ط§ط®ظ„ظٹط©',
    notesHint: 'ظ…ظ„ط§ط­ط¸ط§طھ ظ„ظ„ط¥ط¯ط§ط±ط© ظپظ‚ط· (ط؛ظٹط± ظ…ط±ط¦ظٹط© ظ„ظ„ط¹ظ…ظٹظ„ط©)',
    reviewTitle: 'ظ…ط±ط§ط¬ط¹ط© ط§ظ„ط­ط¬ط²',
    customer: 'ط§ظ„ط¹ظ…ظٹظ„ط©',
    service: 'ط§ظ„ط®ط¯ظ…ط©',
    date: 'ط§ظ„طھط§ط±ظٹط®',
    time: 'ط§ظ„ظˆظ‚طھ',
    source: 'ط§ظ„ظ…طµط¯ط±',
    address: 'ط§ظ„ط¹ظ†ظˆط§ظ†',
    back: 'ط±ط¬ظˆط¹',
    next: 'ط§ظ„طھط§ظ„ظٹ',
    createBooking: 'ط¥ظ†ط´ط§ط، ط§ظ„ط­ط¬ط²',
    creating: 'ط¬ط§ط±ظچ ط§ظ„ط¥ظ†ط´ط§ط،â€¦',
    bookingCreated: 'طھظ… ط¥ظ†ط´ط§ط، ط§ظ„ط­ط¬ط²!',
    bookingNumber: 'ط±ظ‚ظ… ط§ظ„ط­ط¬ط²',
    viewBookings: 'ط¹ط±ط¶ ط§ظ„ط­ط¬ظˆط²ط§طھ',
    createAnother: 'ط¥ظ†ط´ط§ط، ط­ط¬ط² ط¢ط®ط±',
    errorRequired: 'ظ‡ط°ط§ ط§ظ„ط­ظ‚ظ„ ظ…ط·ظ„ظˆط¨',
    errorPhone: 'ط±ظ‚ظ… ط§ظ„ط¬ظˆط§ظ„ ط؛ظٹط± طµط­ظٹط­',
  },
} as const

const SOURCE_OPTIONS: { value: BookingSource; iconKey: string }[] = [
  { value: 'whatsapp', iconKey: 'whatsapp' },
  { value: 'phone', iconKey: 'phone' },
  { value: 'admin', iconKey: 'admin' },
  { value: 'website', iconKey: 'website' },
  { value: 'other', iconKey: 'other' },
]

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface ServiceOption {
  id: string
  name_en: string
  name_ar: string
  price_sar: number
  duration_minutes: number
}

interface CustomerResult {
  id: string
  full_name: string
  phone: string
  email: string | null
}

type Step = 'customer' | 'service' | 'schedule' | 'review' | 'success'

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function AdminNewBookingClient({ locationId }: { locationId: string }) {
  const { lang } = useAdmin()
  const labels = t9b[lang]
  const [isPending, startTransition] = useTransition()

  // Step state
  const [step, setStep] = useState<Step>('customer')

  // Customer state
  const [customerSearch, setCustomerSearch] = useState('')
  const [searchResults, setSearchResults] = useState<CustomerResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [customerMode, setCustomerMode] = useState<'search' | 'new'>('search')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerResult | null>(null)

  // Source state
  const [source, setSource] = useState<BookingSource>('whatsapp')

  // Service state
  const [services, setServices] = useState<ServiceOption[]>([])
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(null)
  const [servicesLoaded, setServicesLoaded] = useState(false)

  // Schedule state
  const [date, setDate] = useState('')
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState('')
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  // Notes
  const [notes, setNotes] = useState('')

  // Payment Recording
  const [recordPaymentNow, setRecordPaymentNow] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit_card' | 'mada' | 'bank_transfer' | 'apple_pay' | 'stc_pay' | 'other'>('mada')

  // Success
  const [bookingNumber, setBookingNumber] = useState('')

  // Error
  const [error, setError] = useState('')

  // â”€â”€ Customer search â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setSearchResults([]); return }
    setIsSearching(true)
    try {
      const results = await searchCustomersForBooking(q)
      setSearchResults(results as CustomerResult[])
    } catch { setSearchResults([]) }
    setIsSearching(false)
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => doSearch(customerSearch), 300)
    return () => clearTimeout(timeout)
  }, [customerSearch, doSearch])

  // â”€â”€ Load services â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (servicesLoaded) return
    getServicesForBooking().then((s) => {
      setServices(s as ServiceOption[])
      setServicesLoaded(true)
    })
  }, [servicesLoaded])

  // â”€â”€ Load slots when date changes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!date || !selectedService) return
    let active = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoadingSlots(true)
    setSelectedSlot('')
    getAdminBookingSlots(selectedService.id, null, locationId, date).then((res) => {
      if (active) {
        setSlots(res.slots)
        setIsLoadingSlots(false)
      }
    })
    return () => { active = false }
  }, [date, selectedService, locationId])

  // â”€â”€ Select existing customer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function selectCustomer(c: CustomerResult) {
    setSelectedCustomer(c)
    setCustomerName(c.full_name)
    setCustomerPhone(c.phone)
    setCustomerEmail(c.email ?? '')
    setCustomerMode('search')
  }

  // â”€â”€ Validation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function canAdvance(): boolean {
    switch (step) {
      case 'customer':
        return customerName.trim().length >= 2 && customerPhone.trim().length >= 9
      case 'service':
        return selectedService !== null
      case 'schedule':
        return date !== '' && selectedSlot !== ''
      case 'review':
        return true
      default:
        return false
    }
  }

  function advanceStep() {
    setError('')
    switch (step) {
      case 'customer': setStep('service'); break
      case 'service': setStep('schedule'); break
      case 'schedule': setStep('review'); break
      case 'review': submitBooking(); break
    }
  }

  function goBack() {
    setError('')
    switch (step) {
      case 'service': setStep('customer'); break
      case 'schedule': setStep('service'); break
      case 'review': setStep('schedule'); break
    }
  }

  // â”€â”€ Submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function submitBooking() {
    setError('')
    startTransition(async () => {
      const input: AdminBookingInput = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        customerAddress: customerAddress.trim() || undefined,
        serviceId: selectedService!.id,
        packageSlug: null,
        locationId,
        date,
        startTime: selectedSlot,
        source,
        notes: notes.trim() || undefined,
        recordPaymentNow,
        paymentMethod: recordPaymentNow ? paymentMethod : undefined,
      }

      const result = await createAdminBooking(input)
      if (result.success && result.bookingNumber) {
        setBookingNumber(result.bookingNumber)
        setStep('success')
      } else {
        setError(result.error ?? 'Unknown error')
      }
    })
  }

  // â”€â”€ Reset â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function resetForm() {
    setStep('customer')
    setCustomerSearch('')
    setSearchResults([])
    setCustomerMode('search')
    setCustomerName('')
    setCustomerPhone('')
    setCustomerEmail('')
    setCustomerAddress('')
    setSelectedCustomer(null)
    setSource('whatsapp')
    setSelectedService(null)
    setDate('')
    setSlots([])
    setSelectedSlot('')
    setNotes('')
    setBookingNumber('')
    setError('')
  }

  // â”€â”€ Source label â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function sourceLabel(s: BookingSource): string {
    const map = {
      website: labels.sourceWebsite,
      whatsapp: labels.sourceWhatsapp,
      phone: labels.sourcePhone,
      admin: labels.sourceAdmin,
      other: labels.sourceOther,
    }
    return map[s]
  }

  // â”€â”€ Today string â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // eslint-disable-next-line react-hooks/purity
  const today = useMemo(() => new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString().slice(0, 10), [])

  // â”€â”€ Steps indicator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const steps: { key: Step; label: string }[] = [
    { key: 'customer', label: labels.stepCustomer },
    { key: 'service', label: labels.stepService },
    { key: 'schedule', label: labels.stepSchedule },
    { key: 'review', label: labels.stepReview },
  ]
  const stepIndex = steps.findIndex((s) => s.key === step)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/bookings" className="p-2 rounded-xl hover:bg-surface-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">{labels.title}</h1>
          <p className="text-sm text-muted-foreground">{labels.subtitle}</p>
        </div>
      </div>

      {/* Steps indicator */}
      {step !== 'success' && (
        <div className="flex gap-1">
          {steps.map((s, i) => (
            <div key={s.key} className="flex-1">
              <div className={`h-1.5 rounded-full transition-colors ${
                i <= stepIndex ? 'bg-secondary' : 'bg-surface-muted'
              }`} />
              <p className={`text-xs mt-1 ${
                i <= stepIndex ? 'text-secondary font-medium' : 'text-muted-foreground'
              }`}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-error-bg text-error text-sm p-3 rounded-xl border border-error-border">
          {error}
        </div>
      )}

      {/* â”€â”€â”€ STEP: Customer â”€â”€â”€ */}
      {step === 'customer' && (
        <div className="bg-surface rounded-2xl border border-border p-5 space-y-5">
          {/* Booking Source */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{labels.bookingSource}</label>
            <div className="flex flex-wrap gap-2">
              {SOURCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSource(opt.value)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    source === opt.value
                      ? 'bg-secondary text-white border-secondary'
                      : 'bg-surface text-muted-foreground border-border hover:bg-surface-muted'
                  }`}
                >
                  {opt.value === 'whatsapp' && <MessageCircle className="w-3.5 h-3.5" />}
                  {opt.value === 'phone' && <Phone className="w-3.5 h-3.5" />}
                  {opt.value === 'admin' && <User className="w-3.5 h-3.5" />}
                  {sourceLabel(opt.value)}
                </button>
              ))}
            </div>
          </div>

          {/* Customer mode toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setCustomerMode('search'); setSelectedCustomer(null) }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                customerMode === 'search'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface text-muted-foreground border-border hover:bg-surface-muted'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              {labels.existingCustomer}
            </button>
            <button
              type="button"
              onClick={() => {
                setCustomerMode('new')
                setSelectedCustomer(null)
                setCustomerName('')
                setCustomerPhone('')
                setCustomerEmail('')
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                customerMode === 'new'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface text-muted-foreground border-border hover:bg-surface-muted'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              {labels.newCustomer}
            </button>
          </div>

          {/* Search existing */}
          {customerMode === 'search' && !selectedCustomer && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder={labels.searchCustomer}
                  className="w-full ps-10 pe-3 py-2.5 rounded-xl text-sm border border-border bg-surface text-foreground focus:border-secondary focus:ring-1 focus:ring-ring outline-none transition-all text-start"
                />
              </div>
              {isSearching && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              )}
              {searchResults.length > 0 && (
                <div className="border border-border rounded-xl overflow-hidden divide-y divide-border-subtle">
                  {searchResults.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selectCustomer(c)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface transition-colors text-start"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{c.full_name}</p>
                        <p className="text-xs text-muted-foreground">{c.phone}</p>
                      </div>
                      <span className="text-xs text-secondary font-medium">{labels.selectExisting}</span>
                    </button>
                  ))}
                </div>
              )}
              {customerSearch.length >= 2 && !isSearching && searchResults.length === 0 && (
                <p className="text-sm text-muted-foreground">{labels.noCustomersFound}</p>
              )}
            </div>
          )}

          {/* Selected customer banner */}
          {selectedCustomer && (
            <div className="flex items-center justify-between bg-surface-muted p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-foreground">{selectedCustomer.full_name}</span>
                <span className="text-xs text-secondary">{selectedCustomer.phone}</span>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedCustomer(null); setCustomerName(''); setCustomerPhone(''); setCustomerEmail('') }}
                className="text-xs text-secondary hover:underline"
              >
                {labels.back}
              </button>
            </div>
          )}

          {/* Customer form (new or editing selected) */}
          {(customerMode === 'new' || selectedCustomer) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{labels.customerName}</label>
                <div className="relative">
                  <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full ps-10 pe-3 py-2.5 rounded-xl text-sm border border-border bg-surface text-foreground focus:border-secondary focus:ring-1 focus:ring-ring outline-none transition-all text-start"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{labels.customerPhone}</label>
                <div className="relative">
                  <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="05X XXX XXXX"
                    className="w-full ps-10 pe-3 py-2.5 rounded-xl text-sm border border-border bg-surface text-foreground focus:border-secondary focus:ring-1 focus:ring-ring outline-none transition-all text-start"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{labels.customerEmail}</label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full ps-10 pe-3 py-2.5 rounded-xl text-sm border border-border bg-surface text-foreground focus:border-secondary focus:ring-1 focus:ring-ring outline-none transition-all text-start"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{labels.customerAddress}</label>
                <div className="relative">
                  <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder={labels.customerAddressHint}
                    className="w-full ps-10 pe-3 py-2.5 rounded-xl text-sm border border-border bg-surface text-foreground focus:border-secondary focus:ring-1 focus:ring-ring outline-none transition-all text-start"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* â”€â”€â”€ STEP: Service â”€â”€â”€ */}
      {step === 'service' && (
        <div className="bg-surface rounded-2xl border border-border p-5 space-y-4">
          <h2 className="text-sm font-bold text-foreground">{labels.selectService}</h2>
          {services.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedService(s)}
                  className={`text-start p-4 rounded-xl border transition-all ${
                    selectedService?.id === s.id
                      ? 'border-secondary bg-surface-muted ring-1 ring-ring'
                      : 'border-border hover:border-border-strong hover:bg-surface'
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">
                    {lang === 'ar' ? s.name_ar : s.name_en}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-secondary font-medium">
                      {s.price_sar} {lang === 'ar' ? 'ط±ظٹط§ظ„' : 'SAR'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {s.duration_minutes} {labels.minUnit}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* â”€â”€â”€ STEP: Schedule â”€â”€â”€ */}
      {step === 'schedule' && (
        <div className="bg-surface rounded-2xl border border-border p-5 space-y-5">
          {/* Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-secondary" />
              {labels.selectDate}
            </label>
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              className="w-full sm:w-64 px-3 py-2.5 rounded-xl text-sm border border-border bg-surface text-foreground focus:border-secondary focus:ring-1 focus:ring-ring outline-none transition-all"
            />
          </div>

          {/* Time slots */}
          {date && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-secondary" />
                {labels.selectTime}
              </label>
              {isLoadingSlots ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {labels.loadingSlots}
                </div>
              ) : slots.filter(s => s.available).length === 0 ? (
                <p className="text-sm text-muted-foreground">{labels.noSlots}</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
                  {slots.filter(s => s.available).map((s) => (
                    <button
                      key={s.startTime}
                      type="button"
                      onClick={() => setSelectedSlot(s.startTime)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                        selectedSlot === s.startTime
                          ? 'bg-secondary text-white border-secondary'
                          : 'bg-surface text-foreground border-border hover:border-border-strong'
                      }`}
                    >
                      {s.startTime}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-secondary" />
              {labels.notes}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder={labels.notesHint}
              className="w-full px-3 py-2.5 rounded-xl text-sm border border-border bg-surface text-foreground focus:border-secondary focus:ring-1 focus:ring-ring outline-none transition-all resize-none text-start"
            />
          </div>
        </div>
      )}

      {/* â”€â”€â”€ STEP: Review â”€â”€â”€ */}
      {step === 'review' && (
        <div className="bg-surface rounded-2xl border border-border p-5 space-y-4">
          <h2 className="text-sm font-bold text-foreground">{labels.reviewTitle}</h2>
          <div className="divide-y divide-border-subtle">
            <ReviewRow icon={<User className="w-4 h-4" />} label={labels.customer} value={`${customerName} â€” ${customerPhone}`} />
            <ReviewRow icon={<FileText className="w-4 h-4" />} label={labels.service} value={selectedService ? (lang === 'ar' ? selectedService.name_ar : selectedService.name_en) : ''} />
            <ReviewRow icon={<CalendarDays className="w-4 h-4" />} label={labels.date} value={date} />
            <ReviewRow icon={<Clock className="w-4 h-4" />} label={labels.time} value={selectedSlot} />
            <ReviewRow icon={<MessageCircle className="w-4 h-4" />} label={labels.source} value={sourceLabel(source)} />
            {selectedService && (
              <ReviewRow icon={<FileText className="w-4 h-4" />} label={labels.price} value={`${selectedService.price_sar} ${lang === 'ar' ? 'ط±ظٹط§ظ„' : 'SAR'}`} />
            )}
            {customerAddress && (
              <ReviewRow icon={<MapPin className="w-4 h-4" />} label={labels.address} value={customerAddress} />
            )}
          </div>

          {/* Optional: Record Payment Now */}
          <div className="pt-4 border-t border-border space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={recordPaymentNow}
                onChange={(e) => setRecordPaymentNow(e.target.checked)}
                className="w-4 h-4 rounded border-border text-secondary focus:ring-ring"
              />
              <span>{lang === 'ar' ? 'طھط³ط¬ظٹظ„ ط§ط³طھظ„ط§ظ… ط§ظ„ط¯ظپط¹ط© ط§ظ„ط¢ظ† ظپظٹ ط³ط¬ظ„ ط§ظ„ظ…ط¨ظٹط¹ط§طھ' : 'Record payment now into sales ledger'}</span>
            </label>

            {recordPaymentNow && (
              <div className="p-3.5 bg-surface rounded-xl border border-border space-y-2">
                <label className="block text-xs font-semibold text-muted-foreground">
                  {lang === 'ar' ? 'ط·ط±ظٹظ‚ط© ط§ظ„ط¯ظپط¹' : 'Payment Method'}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
                  className="w-full text-sm rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-none focus:border-secondary"
                >
                  <option value="mada">{lang === 'ar' ? 'ظ…ط¯ظ‰' : 'Mada'}</option>
                  <option value="credit_card">{lang === 'ar' ? 'ط¨ط·ط§ظ‚ط© ط§ط¦طھظ…ط§ظ†ظٹط©' : 'Credit Card'}</option>
                  <option value="apple_pay">Apple Pay</option>
                  <option value="stc_pay">STC Pay</option>
                  <option value="cash">{lang === 'ar' ? 'ظ†ظ‚ط¯ظٹ' : 'Cash'}</option>
                  <option value="bank_transfer">{lang === 'ar' ? 'طھط­ظˆظٹظ„ ط¨ظ†ظƒظٹ' : 'Bank Transfer'}</option>
                  <option value="other">{lang === 'ar' ? 'ط£ط®ط±ظ‰' : 'Other'}</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  {lang === 'ar'
                    ? `ط³ظٹطھظ… طھط³ط¬ظٹظ„ ط¹ظ…ظ„ظٹط© ظ‚ط¨ط¶ ط¨ظ‚ظٹظ…ط© ${selectedService?.price_sar ?? 0} ط±ظٹط§ظ„ ظˆط¥ط¶ط§ظپطھظ‡ط§ ظ„ط³ط¬ظ„ ط§ظ„ظ…ط¨ظٹط¹ط§طھ.`
                    : `Will record a payment transaction of ${selectedService?.price_sar ?? 0} SAR into the sales ledger.`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* â”€â”€â”€ STEP: Success â”€â”€â”€ */}
      {step === 'success' && (
        <div className="bg-surface rounded-2xl border border-border p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-bg">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-lg font-bold text-foreground">{labels.bookingCreated}</h2>
          <p className="text-sm text-muted-foreground">
            {labels.bookingNumber}: <span className="font-mono text-secondary font-bold">{bookingNumber}</span>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/admin/bookings"
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-secondary text-white hover:bg-primary-hover transition-colors"
            >
              {labels.viewBookings}
            </Link>
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:bg-surface-muted transition-colors"
            >
              {labels.createAnother}
            </button>
          </div>
        </div>
      )}

      {/* â”€â”€â”€ Navigation â”€â”€â”€ */}
      {step !== 'success' && (
        <div className="flex items-center justify-between">
          {step !== 'customer' ? (
            <button
              type="button"
              onClick={goBack}
              className="px-5 py-2.5 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:bg-surface-muted transition-colors"
            >
              {labels.back}
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={advanceStep}
            disabled={!canAdvance() || isPending}
            className="px-6 py-2.5 rounded-xl text-sm font-medium bg-secondary text-white hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {step === 'review'
              ? (isPending ? labels.creating : labels.createBooking)
              : labels.next
            }
          </button>
        </div>
      )}
    </div>
  )
}

// â”€â”€â”€ Review Row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ReviewRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="text-secondary">{icon}</div>
      <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
      <span className="text-sm text-foreground font-medium">{value}</span>
    </div>
  )
}
