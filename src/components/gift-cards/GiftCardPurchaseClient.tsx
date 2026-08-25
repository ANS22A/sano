'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { purchaseGiftCard, type PurchaseGiftCardResult } from '@/app/actions/giftCards.actions'
import {
  Gift,
  Sparkles,
  CheckCircle2,
  Mail,
  User,
  Loader2,
  Calendar,
  ShieldCheck,
  MessageCircle,
  Clock,
} from 'lucide-react'

interface Props {
  locale: string
}

type CardTheme = 'classic-gold' | 'rose-plum' | 'sandstone' | 'emerald'

const THEMES: { id: CardTheme; nameAr: string; nameEn: string; bg: string; text: string; accent: string }[] = [
  {
    id: 'classic-gold',
    nameAr: 'الذهب الكلاسيكي',
    nameEn: 'Classic Gold',
    bg: 'linear-gradient(135deg, #3B1F4A 0%, #76547A 50%, #3B1F4A 100%)',
    text: '#ffffff',
    accent: '#C9A96E',
  },
  {
    id: 'rose-plum',
    nameAr: 'البرقوق والروز',
    nameEn: 'Rose Plum',
    bg: 'linear-gradient(135deg, #76547A 0%, #B9A5C8 50%, #76547A 100%)',
    text: '#ffffff',
    accent: '#C9A96E',
  },
  {
    id: 'sandstone',
    nameAr: 'الأرجواني الناعم',
    nameEn: 'Soft Purple',
    bg: 'linear-gradient(135deg, #D8B8C8 0%, #F6F1F7 50%, #D8B8C8 100%)',
    text: '#3B1F4A',
    accent: '#C9A96E',
  },
  {
    id: 'emerald',
    nameAr: 'الزمرد الملكي',
    nameEn: 'Royal Emerald',
    bg: 'linear-gradient(135deg, #1B3B36 0%, #132a26 50%, #1B3B36 100%)',
    text: '#ffffff',
    accent: '#C9A96E',
  },
]

const PRESET_AMOUNTS = [250, 500, 750, 1000, 1500]

export function GiftCardPurchaseClient({ locale }: Props) {
  const isAr = locale === 'ar'
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>('classic-gold')
  const [amount, setAmount] = useState<number>(500)
  const [isCustomAmount, setIsCustomAmount] = useState(false)
  const [customAmountInput, setCustomAmountInput] = useState('')

  const [senderName, setSenderName] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [recipientPhone, setRecipientPhone] = useState('')
  const [personalMessage, setPersonalMessage] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [orderResult, setOrderResult] = useState<PurchaseGiftCardResult['order'] | null>(null)
  const [isPending, startTransition] = useTransition()

  const currentThemeConfig = THEMES.find((t) => t.id === selectedTheme) || THEMES[0]

  const t = {
    title: isAr ? 'كروت الإهداء الفاخرة' : 'Luxury Gift Vouchers',
    subtitle: isAr
      ? 'أهدي من تحبين لحظات من السكينة والرفاهية مع باقات وجلسات سانو لونا المنزلية الفاخرة.'
      : 'Gift your loved ones moments of pure tranquility and wellness with SANO LUNA home spa experiences.',
    previewTitle: isAr ? 'معاينة كرت الإهداء' : 'Gift Card Preview',
    chooseTheme: isAr ? 'اختاري تصميم الكرت' : 'Select Card Theme',
    chooseAmount: isAr ? 'اختاري قيمة الإهداء' : 'Select Gift Amount',
    customAmount: isAr ? 'مبلغ مخصص' : 'Custom Amount',
    minMaxHint: isAr ? 'الحد الأدنى 100 ر.س — الحد الأقصى 5,000 ر.س' : 'Min 100 SAR — Max 5,000 SAR',
    detailsTitle: isAr ? 'بيانات الإهداء والمستلمة' : 'Gift & Recipient Details',
    recipientNameLabel: isAr ? 'اسم المستلمة *' : "Recipient's Name *",
    recipientEmailLabel: isAr ? 'البريد الإلكتروني للمستلمة *' : "Recipient's Email *",
    recipientEmailHint: isAr ? 'سنرسل الكرت الرقمي إلى بريدها بعد تأكيد الدفع' : 'Digital card will be sent to her email after payment confirmation',
    recipientPhoneLabel: isAr ? 'رقم جوال المستلمة (اختياري)' : "Recipient's Phone (Optional)",
    senderNameLabel: isAr ? 'اسمكِ الكريم (المرسلة) *' : 'Your Name (Sender) *',
    senderEmailLabel: isAr ? 'بريدكِ الإلكتروني *' : 'Your Email *',
    senderEmailHint: isAr ? 'لتلقي إشعار وفاتورة الطلب' : 'To receive your order receipt',
    personalMessageLabel: isAr ? 'رسالة شخصية رقيقة (اختياري)' : 'Personal Message (Optional)',
    personalMessagePlaceholder: isAr ? 'مثال: أهديكِ لحظات هدوء واستجمام تليق بجمال روحكِ...' : 'e.g. Wishing you pure bliss and calm moments...',
    purchaseBtn: isAr ? 'متابعة وتأكيد طلب الإهداء' : 'Proceed to Payment Confirmation',
    purchasingBtn: isAr ? 'جارٍ تسجيل الطلب...' : 'Submitting Request...',
    sar: isAr ? 'ريال' : 'SAR',
    successTitle: isAr ? 'تم استلام طلب كرت الإهداء' : 'Your Gift Card Request Has Been Received',
    successSubtitle: isAr
      ? 'لإتمام شراء كرت الإهداء وتفعيله، يرجى التواصل مع خدمة العملاء عبر واتساب لإتمام الدفع وتأكيد الطلب.'
      : 'To complete payment and activate your Gift Card, please contact our customer service team via WhatsApp.',
    secondaryNotice: isAr
      ? 'سيتم تفعيل كرت الإهداء وإرساله إلى المستلمة مباشرة بعد تأكيد استلام الدفع.'
      : 'Your Gift Card will be activated and delivered to the recipient after payment has been confirmed.',
    orderRefLabel: isAr ? 'رقم الطلب' : 'Order Reference',
    whatsappBtn: isAr ? 'التواصل عبر واتساب لإتمام الدفع' : 'Complete Payment via WhatsApp',
    whatsappNumberLabel: isAr ? 'خدمة العملاء واتساب:' : 'Customer Service WhatsApp:',
    newGiftCard: isAr ? 'طلب كرت إهداء آخر' : 'Request Another Gift Card',
    digitalInstant: isAr ? 'إرسال رقمي فوري بعد الدفع' : 'Instant Digital Delivery after payment',
    validityYear: isAr ? 'صلاحية لمدة سنة كاملة' : 'Valid for 1 Full Year',
    redeemAny: isAr ? 'تسري على كافة الجلسات والباقات' : 'Redeemable on all services & packages',
  }

  function handleAmountSelect(val: number) {
    setIsCustomAmount(false)
    setAmount(val)
  }

  function handleCustomAmountChange(val: string) {
    const clean = val.replace(/\D/g, '')
    setCustomAmountInput(clean)
    const num = Number(clean)
    if (num > 0) {
      setAmount(num)
    }
  }

  function generateWhatsAppUrl(order: NonNullable<PurchaseGiftCardResult['order']>): string {
    const phone = '966551854617'
    const message = isAr
      ? `مرحباً سانو لونا، أرغب في إتمام دفع طلب كرت إهداء.

اسم المستلمة: ${order.recipientName}
قيمة الكرت: ${order.amount} ريال
اسم المرسلة: ${order.senderName}
رقم الطلب: ${order.orderReference}

أرغب في إتمام الدفع وتأكيد الطلب.`
      : `Hello SANO LUNA, I would like to complete the payment for my Gift Card order.

Recipient: ${order.recipientName}
Gift Card Amount: ${order.amount} SAR
Sender: ${order.senderName}
Order Reference: ${order.orderReference}

I would like to complete the payment and confirm my order.`

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (amount < 100 || amount > 5000) {
      setError(
        isAr
          ? 'يرجى اختيار مبلغ بين 100 و 5,000 ريال سعودي.'
          : 'Please select an amount between 100 and 5,000 SAR.'
      )
      return
    }

    const fd = new FormData()
    fd.append('amount', String(amount))
    fd.append('theme', selectedTheme)
    fd.append('senderName', senderName)
    fd.append('senderEmail', senderEmail)
    fd.append('recipientName', recipientName)
    fd.append('recipientEmail', recipientEmail)
    fd.append('recipientPhone', recipientPhone)
    fd.append('personalMessage', personalMessage)
    fd.append('locale', locale)

    startTransition(async () => {
      const res = await purchaseGiftCard(fd)
      if (!res.success || !res.order) {
        setError(res.error || (isAr ? 'تعذر إتمام الطلب. يرجى التحقق من البيانات.' : 'Failed to submit gift card request.'))
      } else {
        setOrderResult(res.order)
      }
    })
  }

  return (
    <div className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-accent/30 text-accent text-xs font-semibold uppercase tracking-widest mb-4">
            <Gift className="w-3.5 h-3.5" />
            <span>{isAr ? 'كروت الإهداء — سانو لونا' : 'SANO LUNA Gifting'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display text-foreground font-light leading-tight mb-4">
            {t.title}
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Success / WhatsApp Payment Instructions Screen */}
        <AnimatePresence mode="wait">
          {orderResult ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-border text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-foreground mb-6 shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-accent" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-display font-semibold text-foreground mb-3">
                {t.successTitle}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {t.successSubtitle}
              </p>

              {/* Order Reference & Summary Card */}
              <div className="bg-surface border border-border rounded-2xl p-5 mb-6 text-start">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-xs text-muted-foreground font-medium">{t.orderRefLabel}</span>
                  <span className="font-mono text-sm font-bold text-foreground dir-ltr" dir="ltr">
                    {orderResult.orderReference}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block">{isAr ? 'المستلمة:' : 'Recipient:'}</span>
                    <span className="font-semibold text-foreground">{orderResult.recipientName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">{isAr ? 'القيمة:' : 'Amount:'}</span>
                    <span className="font-bold text-foreground">{orderResult.amount} {t.sar}</span>
                  </div>
                </div>
              </div>

              {/* Status Note */}
              <div className="flex items-start gap-2.5 p-3.5 bg-warning-bg rounded-xl border border-warning-border text-warning text-xs text-start mb-8">
                <Clock className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                <span>{t.secondaryNotice}</span>
              </div>

              {/* WhatsApp Button */}
              <div className="space-y-4">
                <a
                  href={generateWhatsAppUrl(orderResult)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 rounded-2xl bg-[#25D366] text-white text-base font-bold tracking-wide
                    hover:bg-[#20bd5a] active:scale-[0.99] transition-all duration-200 shadow-lg flex items-center justify-center gap-3"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{t.whatsappBtn}</span>
                </a>

                <div className="text-xs text-muted-foreground">
                  <span>{t.whatsappNumberLabel} </span>
                  <span className="font-semibold text-foreground dir-ltr" dir="ltr">0551854617</span>
                </div>

                <div className="pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setOrderResult(null)
                      setRecipientName('')
                      setRecipientEmail('')
                      setRecipientPhone('')
                      setPersonalMessage('')
                    }}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t.newGiftCard}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Purchase Request Form */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form Controls (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-border">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* 1. Theme Selector */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                      1. {t.chooseTheme}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {THEMES.map((theme) => {
                        const isSelected = selectedTheme === theme.id
                        return (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => setSelectedTheme(theme.id)}
                            style={{ background: theme.bg }}
                            className={`p-3 rounded-2xl text-start transition-all duration-200 border-2 relative overflow-hidden h-20 flex flex-col justify-end ${
                              isSelected
                                ? 'border-accent scale-[1.02] shadow-md ring-2 ring-accent/30'
                                : 'border-transparent opacity-75 hover:opacity-100'
                            }`}
                          >
                            <span className="text-xs font-bold text-white block">
                              {isAr ? theme.nameAr : theme.nameEn}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* 2. Amount Selector */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                      2. {t.chooseAmount}
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                      {PRESET_AMOUNTS.map((val) => {
                        const isSelected = !isCustomAmount && amount === val
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleAmountSelect(val)}
                            className={`py-3 px-2 rounded-xl text-sm font-bold border transition-all ${
                              isSelected
                                ? 'bg-primary text-accent border-primary shadow-sm'
                                : 'bg-surface text-foreground border-border hover:bg-white'
                            }`}
                          >
                            {val} <span className="text-[10px] font-normal">{t.sar}</span>
                          </button>
                        )
                      })}
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomAmount(true)
                          if (!customAmountInput) {
                            setCustomAmountInput('600')
                            setAmount(600)
                          }
                        }}
                        className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all ${
                          isCustomAmount
                            ? 'bg-primary text-accent border-primary shadow-sm'
                            : 'bg-surface text-muted-foreground border-border hover:bg-white'
                        }`}
                      >
                        {t.customAmount}
                      </button>
                    </div>

                    {isCustomAmount && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-3.5 bg-surface rounded-2xl border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={customAmountInput}
                            onChange={(e) => handleCustomAmountChange(e.target.value)}
                            placeholder="600"
                            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-white text-base font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                          <span className="font-bold text-sm text-muted-foreground">{t.sar}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1.5">{t.minMaxHint}</p>
                      </motion.div>
                    )}
                  </div>

                  {/* 3. Recipient & Sender Details */}
                  <div className="space-y-4 pt-2 border-t border-border">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground pt-2">
                      3. {t.detailsTitle}
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1.5">
                          {t.recipientNameLabel}
                        </label>
                        <div className="relative">
                          <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="text"
                            required
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            placeholder={isAr ? 'نورة العبدالله' : 'Noura Al-Abdullah'}
                            className="w-full ps-9 pe-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-all text-start"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1.5">
                          {t.recipientEmailLabel}
                        </label>
                        <div className="relative">
                          <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="email"
                            required
                            value={recipientEmail}
                            onChange={(e) => setRecipientEmail(e.target.value)}
                            placeholder="noura@example.com"
                            className="w-full ps-9 pe-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-all text-start dir-ltr"
                            dir="ltr"
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">{t.recipientEmailHint}</p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1.5">
                          {t.recipientPhoneLabel}
                        </label>
                        <input
                          type="tel"
                          value={recipientPhone}
                          onChange={(e) => setRecipientPhone(e.target.value)}
                          placeholder="05xxxxxxxx"
                          className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-all text-start dir-ltr"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1.5">
                          {t.senderNameLabel}
                        </label>
                        <input
                          type="text"
                          required
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          placeholder={isAr ? 'سارة محمد' : 'Sarah Mohammed'}
                          className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-all text-start"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1.5">
                          {t.senderEmailLabel}
                        </label>
                        <input
                          type="email"
                          required
                          value={senderEmail}
                          onChange={(e) => setSenderEmail(e.target.value)}
                          placeholder="sarah@example.com"
                          className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-all text-start dir-ltr"
                          dir="ltr"
                        />
                        <p className="text-[11px] text-muted-foreground mt-1">{t.senderEmailHint}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        {t.personalMessageLabel}
                      </label>
                      <textarea
                        rows={3}
                        maxLength={300}
                        value={personalMessage}
                        onChange={(e) => setPersonalMessage(e.target.value)}
                        placeholder={t.personalMessagePlaceholder}
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-all text-start resize-none"
                      />
                      <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                        <span>{isAr ? 'رسالة تظهر مباشرة على كرت الإهداء' : 'Will appear directly on the gift voucher'}</span>
                        <span>{personalMessage.length}/300</span>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3.5 rounded-xl bg-error-bg border border-error-border text-sm text-error font-medium text-center">
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-4 px-6 rounded-2xl bg-primary text-white text-base font-bold tracking-wide
                      hover:bg-primary-hover active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed
                      transition-all duration-200 shadow-xl flex items-center justify-center gap-3 border border-accent/30"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{t.purchasingBtn}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 text-accent" />
                        <span>{t.purchaseBtn} • {amount} {t.sar}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Right Column: Live Interactive Card Preview (5 cols) */}
              <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    {t.previewTitle}
                  </h3>

                  {/* Luxury Digital Card Component */}
                  <motion.div
                    style={{ background: currentThemeConfig.bg }}
                    className="rounded-3xl p-7 text-white relative overflow-hidden shadow-2xl border border-white/15 min-h-[300px] flex flex-col justify-between"
                    animate={{ scale: [0.99, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Background luxury watermark */}
                    <div className="absolute top-0 end-0 -translate-y-6 translate-x-6 w-48 h-48 rounded-full border border-white/5 pointer-events-none" />
                    <div className="absolute bottom-0 start-0 translate-y-6 -translate-x-6 w-36 h-36 rounded-full border border-white/5 pointer-events-none" />

                    {/* Card Header */}
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-1">
                          SANO LUNA
                        </div>
                        <div className="text-xs text-white/60 font-display tracking-wider">
                          Home Spa & Wellness
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-display text-accent font-bold text-lg shadow-inner">
                        SL
                      </div>
                    </div>

                    {/* Card Body / Personal Message */}
                    <div className="my-6 relative z-10">
                      {personalMessage ? (
                        <p className="text-sm font-display italic text-white/90 line-clamp-3 leading-relaxed">
                          &ldquo;{personalMessage}&rdquo;
                        </p>
                      ) : (
                        <div className="text-xs text-white/40 italic">
                          {isAr ? '«رسالتكِ الشخصية ستظهر هنا...»' : '"Your personalized message will appear here..."'}
                        </div>
                      )}
                    </div>

                    {/* Card Footer: Names & Amount */}
                    <div className="relative z-10 pt-4 border-t border-white/15 flex justify-between items-end">
                      <div className="space-y-1 text-xs">
                        <div>
                          <span className="text-white/50">{isAr ? 'إلى: ' : 'To: '}</span>
                          <span className="font-semibold text-white">
                            {recipientName || (isAr ? 'اسم المستلمة' : "Recipient's Name")}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/50">{isAr ? 'من: ' : 'From: '}</span>
                          <span className="font-semibold text-white/90">
                            {senderName || (isAr ? 'اسم المرسلة' : "Sender's Name")}
                          </span>
                        </div>
                      </div>

                      <div className="text-end">
                        <span className="text-2xl sm:text-3xl font-display font-bold text-white block leading-none">
                          {amount} <span className="text-xs font-sans text-accent font-normal">{t.sar}</span>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Feature Callouts */}
                <div className="bg-white rounded-2xl p-5 border border-border space-y-3.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center text-accent shrink-0">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <span>{t.digitalInstant}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center text-accent shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <span>{t.validityYear}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center text-accent shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <span>{t.redeemAny}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
