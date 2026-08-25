'use client'

import { useState, useTransition } from 'react'
import {
  Gift,
  Plus,
  Search,
  Check,
  Copy,
  X,
  Loader2,
  DollarSign,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Eye,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import {
  createAdminComplimentaryGiftCard,
  confirmAndActivateGiftCard,
  updateGiftCardStatus,
} from '@/app/actions/adminGiftCards.actions'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState'

export interface AdminGiftCardItem {
  id: string
  order_reference: string
  code: string
  initial_amount: number
  remaining_balance: number
  currency: string
  theme: string
  sender_name: string
  sender_email: string
  sender_phone: string | null
  recipient_name: string
  recipient_email: string
  recipient_phone: string | null
  personal_message: string | null
  status: string
  payment_confirmed_at: string | null
  payment_confirmed_by: string | null
  expires_at: string
  created_at: string
  updated_at: string
}

interface Props {
  giftCards: AdminGiftCardItem[]
  total: number
  stats: {
    totalCards: number
    totalIssued: number
    activeBalance: number
    totalRedeemed: number
    activeCount: number
    pendingPaymentCount?: number
  }
  lang: 'en' | 'ar'
  q?: string
  status?: string
}

export function AdminGiftCardsClient({
  giftCards,
  total,
  stats,
  lang,
  q = '',
  status = 'all',
}: Props) {
  const isAr = lang === 'ar'
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<AdminGiftCardItem | null>(null)
  const [confirmActivationCard, setConfirmActivationCard] = useState<AdminGiftCardItem | null>(null)
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const t = {
    title: isAr ? 'إدارة كروت وبطاقات الإهداء' : 'Gift Cards & Vouchers',
    newBtn: isAr ? 'إصدار كرت إهداء يدوي' : 'Issue Manual Gift Card',
    searchPlaceholder: isAr ? 'بحث برقم الطلب، رمز الكرت، اسم المستلمة أو البريد...' : 'Search by order ref, code, recipient or email...',
    all: isAr ? 'الكل' : 'All',
    pendingPayment: isAr ? 'بانتظار الدفع' : 'Pending Payment',
    active: isAr ? 'مدفوع / نشط' : 'Paid / Active',
    redeemed: isAr ? 'مُستخدم' : 'Redeemed',
    expired: isAr ? 'منتهي الصلاحية' : 'Expired',
    cancelled: isAr ? 'ملغي' : 'Cancelled',
    statTotalIssued: isAr ? 'إجمالي القيمة المفعلة' : 'Total Active Issued Value',
    statActiveBalance: isAr ? 'الرصيد الفعال المتاح' : 'Active Balance Remaining',
    statPendingPayment: isAr ? 'طلبات بانتظار الدفع' : 'Pending Payment Orders',
    statRedeemed: isAr ? 'القيمة المستفاد منها' : 'Total Redeemed Value',
    orderRef: isAr ? 'رقم الطلب' : 'Order Ref',
    code: isAr ? 'رمز الكرت' : 'Code',
    recipient: isAr ? 'المستلمة' : 'Recipient',
    sender: isAr ? 'المرسلة' : 'Sender',
    amountBalance: isAr ? 'القيمة / المتبقي' : 'Amount / Balance',
    statusLabel: isAr ? 'حالة الطلب والدفع' : 'Payment & Status',
    dates: isAr ? 'تاريخ الطلب' : 'Order Date',
    actions: isAr ? 'الإجراءات' : 'Actions',
    sar: isAr ? 'ر.س' : 'SAR',
    noResults: isAr ? 'لا توجد كروت إهداء مطابقة' : 'No gift cards found',
    noResultsDesc: isAr ? 'جربي تعديل معايير البحث أو تصفية الحالة.' : 'Try changing search criteria or filter.',
    copyCode: isAr ? 'نسخ الرمز' : 'Copy Code',
    copied: isAr ? 'تم النسخ!' : 'Copied!',
    confirmPayment: isAr ? 'تأكيد الدفع والتفعيل' : 'Confirm Payment & Activate',
    deactivate: isAr ? 'إلغاء الطلب' : 'Cancel Order',
    reactivate: isAr ? 'إعادة تفعيل' : 'Reactivate',
    viewDetails: isAr ? 'تفاصيل الطلب' : 'View Details',
    modalTitle: isAr ? 'إصدار كرت إهداء مجاني / إداري' : 'Issue Complimentary Gift Card',
    modalAmount: isAr ? 'قيمة البطاقة (ر.س) *' : 'Card Amount (SAR) *',
    modalCode: isAr ? 'رمز مخصص (اختياري)' : 'Custom Code (Optional)',
    modalRecipientName: isAr ? 'اسم المستلمة *' : "Recipient's Name *",
    modalRecipientEmail: isAr ? 'بريد المستلمة *' : "Recipient's Email *",
    modalSenderName: isAr ? 'اسم المرسل (افتراضي: SANO LUNA)' : 'Sender Name (Default: SANO LUNA)',
    modalMessage: isAr ? 'رسالة الإهداء (اختياري)' : 'Gift Message (Optional)',
    modalNotes: isAr ? 'ملاحظات إدارية داخلية (اختياري)' : 'Internal Admin Notes (Optional)',
    cancel: isAr ? 'إلغاء' : 'Cancel',
    issue: isAr ? 'إصدار وتفعيل فوري' : 'Issue & Activate Immediately',
    confirmModalTitle: isAr ? 'تأكيد استلام الدفع وتفعيل الكرت' : 'Confirm Payment & Activate Card',
    confirmModalPrompt: isAr
      ? 'هل تم استلام الدفع بالفعل عبر واتساب؟ سيتم تفعيل كرت الإهداء وإرسال الرمز الرقمي الرسمي إلى بريد المستلمة فوراً.'
      : 'Has payment actually been received via WhatsApp? The Gift Card will be activated and delivered to the recipient immediately.',
    confirmActivateBtn: isAr ? 'نعم، تم استلام الدفع وتفعيل الكرت' : 'Yes, Payment Received — Activate',
  }

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  function handleStatusToggle(id: string, currentStatus: string) {
    const nextStatus = currentStatus === 'active' ? 'cancelled' : 'active'
    startTransition(async () => {
      await updateGiftCardStatus(id, nextStatus)
    })
  }

  function handleConfirmActivation() {
    if (!confirmActivationCard) return
    setErrorMsg(null)
    startTransition(async () => {
      const res = await confirmAndActivateGiftCard(confirmActivationCard.id, lang)
      if (res?.error) {
        setErrorMsg(res.error)
      } else {
        setConfirmActivationCard(null)
      }
    })
  }

  function handleCreateCard(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMsg(null)
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await createAdminComplimentaryGiftCard(fd)
      if (res?.error) {
        setErrorMsg(res.error)
      } else {
        setModalOpen(false)
      }
    })
  }

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2.5">
            <Gift className="w-6 h-6 text-accent" />
            <span>{t.title}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isAr
              ? `متابعة وتأكيد دفع كروت الإهداء (${total} كرت إجمالي)`
              : `Manage WhatsApp manual payments and gift cards (${total} total)`}
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 text-accent" />
          <span>{t.newBtn}</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2 text-xs font-semibold">
            <span>{t.statPendingPayment}</span>
            <Clock className="w-4 h-4 text-warning" />
          </div>
          <div className="text-2xl font-display font-bold text-warning">
            {stats.pendingPaymentCount ?? 0}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {isAr ? 'بانتظار تأكيد التحويل' : 'Awaiting payment confirmation'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2 text-xs font-semibold">
            <span>{t.statTotalIssued}</span>
            <DollarSign className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-display font-bold text-foreground">
            {stats.totalIssued.toLocaleString()} <span className="text-xs font-sans font-normal text-muted-foreground">{t.sar}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2 text-xs font-semibold">
            <span>{t.statActiveBalance}</span>
            <CreditCard className="w-4 h-4 text-success" />
          </div>
          <div className="text-2xl font-display font-bold text-success">
            {stats.activeBalance.toLocaleString()} <span className="text-xs font-sans font-normal text-muted-foreground">{t.sar}</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {stats.activeCount} {isAr ? 'كرت ساري ومتاح' : 'active available cards'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2 text-xs font-semibold">
            <span>{t.statRedeemed}</span>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-display font-bold text-foreground">
            {stats.totalRedeemed.toLocaleString()} <span className="text-xs font-sans font-normal text-muted-foreground">{t.sar}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <form method="GET" className="relative w-full md:w-80">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder={t.searchPlaceholder}
            className="w-full ps-9 pe-4 py-2 rounded-xl border border-border text-xs bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </form>

        {/* Status Filter Tabs */}
        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto">
          {['all', 'pending_payment', 'active', 'redeemed', 'expired', 'cancelled'].map((st) => {
            const isSelected = status === st
            const labelMap: Record<string, string> = {
              all: t.all,
              pending_payment: t.pendingPayment,
              active: t.active,
              redeemed: t.redeemed,
              expired: t.expired,
              cancelled: t.cancelled,
            }
            return (
              <a
                key={st}
                href={`/admin/gift-cards?status=${st}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-primary text-accent'
                    : 'bg-surface text-muted-foreground hover:bg-surface-muted'
                }`}
              >
                {labelMap[st]}
              </a>
            )
          })}
        </div>
      </div>

      {/* Cards Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        {giftCards.length === 0 ? (
          <AdminEmptyState
            icon={<Gift className="w-8 h-8 text-accent" />}
            title={t.noResults}
            description={t.noResultsDesc}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-surface border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3.5 px-4 text-start">{t.orderRef}</th>
                  <th className="py-3.5 px-4 text-start">{t.code}</th>
                  <th className="py-3.5 px-4 text-start">{t.recipient}</th>
                  <th className="py-3.5 px-4 text-start">{t.sender}</th>
                  <th className="py-3.5 px-4 text-start">{t.amountBalance}</th>
                  <th className="py-3.5 px-4 text-start">{t.statusLabel}</th>
                  <th className="py-3.5 px-4 text-start">{t.dates}</th>
                  <th className="py-3.5 px-4 text-end">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {giftCards.map((card) => {
                  const initial = Number(card.initial_amount) || 0
                  const remaining = Number(card.remaining_balance) || 0
                  const pct = initial > 0 ? (remaining / initial) * 100 : 0
                  const isCopied = copiedCode === card.code
                  const isPendingPayment = card.status === 'pending_payment'

                  return (
                    <tr key={card.id} className={`transition-colors ${isPendingPayment ? 'bg-warning-bg/40 hover:bg-warning-bg/70' : 'hover:bg-surface/60'}`}>
                      {/* Order Reference */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-semibold text-foreground dir-ltr" dir="ltr">
                          {card.order_reference}
                        </span>
                      </td>

                      {/* Code */}
                      <td className="py-3.5 px-4">
                        {isPendingPayment ? (
                          <span className="text-[11px] text-muted-foreground italic">
                            {isAr ? 'يُفعّل بعد الدفع' : 'Activates upon payment'}
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-primary text-accent px-2 py-0.5 rounded-md tracking-wider dir-ltr" dir="ltr">
                              {card.code}
                            </span>
                            <button
                              onClick={() => handleCopy(card.code)}
                              title={t.copyCode}
                              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Recipient */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground">{card.recipient_name}</div>
                        <div className="text-[11px] text-muted-foreground dir-ltr text-start" dir="ltr">{card.recipient_email}</div>
                      </td>

                      {/* Sender */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-foreground">{card.sender_name}</div>
                        <div className="text-[11px] text-muted-foreground dir-ltr text-start" dir="ltr">{card.sender_email}</div>
                      </td>

                      {/* Amount & Balance Progress */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-foreground mb-1">
                          {isPendingPayment ? `${initial} ${t.sar}` : `${remaining} / ${initial} ${t.sar}`}
                        </div>
                        {!isPendingPayment && (
                          <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full ${pct > 0 ? 'bg-success-bg0' : 'bg-muted-foreground'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <AdminBadge
                          status={card.status === 'pending_payment' ? 'pending' : card.status}
                          label={
                            card.status === 'pending_payment'
                              ? t.pendingPayment
                              : card.status === 'active'
                              ? t.active
                              : card.status === 'redeemed'
                              ? t.redeemed
                              : card.status === 'expired'
                              ? t.expired
                              : t.cancelled
                          }
                        />
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4 text-[11px] text-muted-foreground">
                        <div>{new Date(card.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-GB')}</div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPendingPayment && (
                            <button
                              onClick={() => setConfirmActivationCard(card)}
                              className="px-2.5 py-1 rounded-lg bg-success text-white text-[11px] font-bold hover:bg-success transition-colors shadow-sm"
                            >
                              {t.confirmPayment}
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedCard(card)}
                            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
                            title={t.viewDetails}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {card.status !== 'pending_payment' && card.status !== 'redeemed' && (
                            <button
                              onClick={() => handleStatusToggle(card.id, card.status)}
                              disabled={isPending}
                              className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                                card.status === 'active'
                                  ? 'border-error-border text-error hover:bg-error-bg'
                                  : 'border-success-border text-success hover:bg-success-bg'
                              }`}
                            >
                              {card.status === 'active' ? t.deactivate : t.reactivate}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Activation Modal */}
      {confirmActivationCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-border space-y-6">
            <div className="flex items-center gap-3 text-warning">
              <AlertTriangle className="w-7 h-7 shrink-0" />
              <h3 className="font-display text-lg font-bold text-foreground">
                {t.confirmModalTitle}
              </h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.confirmModalPrompt}
            </p>

            <div className="p-4 bg-surface rounded-2xl border border-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.orderRef}:</span>
                <span className="font-mono font-bold text-foreground dir-ltr" dir="ltr">{confirmActivationCard.order_reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.recipient}:</span>
                <span className="font-semibold text-foreground">{confirmActivationCard.recipient_name} ({confirmActivationCard.recipient_email})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.sender}:</span>
                <span className="font-semibold text-foreground">{confirmActivationCard.sender_name}</span>
              </div>
              <div className="flex justify-between font-bold text-success text-sm pt-2 border-t border-border">
                <span>{isAr ? 'المبلغ المستلم:' : 'Amount Received:'}</span>
                <span>{confirmActivationCard.initial_amount} {t.sar}</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-error-bg text-error text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmActivationCard(null)}
                className="flex-1 py-3 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-surface"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmActivation}
                disabled={isPending}
                className="flex-1 py-3 rounded-xl bg-success text-white text-xs font-bold hover:bg-success flex items-center justify-center gap-2 shadow-md"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{t.confirmActivateBtn}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-border space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <Gift className="w-5 h-5 text-accent" />
                <span>{t.viewDetails}</span>
              </h3>
              <button
                onClick={() => setSelectedCard(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-foreground">
              <div className="flex justify-between p-3 bg-primary text-accent rounded-xl font-mono text-sm font-bold">
                <span>{t.orderRef}</span>
                <span dir="ltr">{selectedCard.order_reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.code}:</span>
                <span className="font-mono font-bold" dir="ltr">{selectedCard.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isAr ? 'القيمة الأصلية:' : 'Initial Amount:'}</span>
                <span className="font-bold">{selectedCard.initial_amount} {t.sar}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isAr ? 'الرصيد المتبقي:' : 'Remaining Balance:'}</span>
                <span className="font-bold text-success">{selectedCard.remaining_balance} {t.sar}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.recipient}:</span>
                <span>{selectedCard.recipient_name} ({selectedCard.recipient_email})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.sender}:</span>
                <span>{selectedCard.sender_name} ({selectedCard.sender_email})</span>
              </div>
              {selectedCard.personal_message && (
                <div className="p-3 bg-surface rounded-xl border border-border italic text-muted-foreground">
                  &ldquo;{selectedCard.personal_message}&rdquo;
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedCard(null)}
              className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* New Gift Card Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-border space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <Plus className="w-5 h-5 text-accent" />
                <span>{t.modalTitle}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-error-bg text-error text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateCard} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t.modalAmount}
                  </label>
                  <input
                    type="number"
                    name="amount"
                    min="50"
                    max="10000"
                    required
                    defaultValue="500"
                    className="w-full px-3 py-2 rounded-xl border border-border text-xs bg-surface text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t.modalCode}
                  </label>
                  <input
                    type="text"
                    name="customCode"
                    placeholder="e.g. VIP-GIFT-100"
                    className="w-full px-3 py-2 rounded-xl border border-border text-xs bg-surface text-foreground uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t.modalRecipientName}
                  </label>
                  <input
                    type="text"
                    name="recipientName"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-border text-xs bg-surface text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t.modalRecipientEmail}
                  </label>
                  <input
                    type="email"
                    name="recipientEmail"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-border text-xs bg-surface text-foreground dir-ltr text-start"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {t.modalSenderName}
                </label>
                <input
                  type="text"
                  name="senderName"
                  defaultValue="SANO LUNA"
                  className="w-full px-3 py-2 rounded-xl border border-border text-xs bg-surface text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {t.modalMessage}
                </label>
                <textarea
                  name="personalMessage"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-border text-xs bg-surface text-foreground resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {t.modalNotes}
                </label>
                <input
                  type="text"
                  name="notes"
                  placeholder={isAr ? 'هدية عميل مميز / ترويجي' : 'VIP promotion / gift'}
                  className="w-full px-3 py-2 rounded-xl border border-border text-xs bg-surface text-foreground"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-surface"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover flex items-center justify-center gap-2"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-accent" />}
                  <span>{t.issue}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
