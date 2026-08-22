'use client'

import { useRef, useState } from 'react'
import { GiftCardVoucher } from './GiftCardVoucher'
import html2canvas from 'html2canvas'

type PublicGiftCardClientProps = {
  giftCard: {
    code: string
    initialAmount: number
    remainingBalance: number
    theme: string
    senderName: string
    recipientName: string
    personalMessage: string | null
    expiresAt: string
    status: string
  }
  locale: string
}

export function PublicGiftCardClient({ giftCard, locale }: PublicGiftCardClientProps) {
  const isAr = locale === 'ar'
  const voucherRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const handleDownload = async () => {
    if (!voucherRef.current || isDownloading) return

    try {
      setIsDownloading(true)
      // Small delay to ensure any fonts/styles are fully rendered if they were lazy
      await new Promise(res => setTimeout(res, 100))
      
      const canvas = await html2canvas(voucherRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: null,
      })
      
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `SanoLuna-GiftCard-${giftCard.code}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Failed to download gift card', error)
      alert(isAr ? 'حدث خطأ أثناء تحميل الكرت' : 'Failed to download the gift card')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    const shareData = {
      title: isAr ? 'كرت إهداء من SANO LUNA' : 'SANO LUNA Gift Card',
      text: isAr 
        ? `لديك كرت إهداء من SANO LUNA ✨\nلعرض الكرت يرجى زيارة الرابط:` 
        : `You received a SANO LUNA Gift Card ✨\nView it here:`,
      url,
    }

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled or failed
      }
    } else {
      // Fallback to copy link if share not supported
      handleCopyLink()
    }
  }

  const handleWhatsAppShare = () => {
    const url = window.location.href
    const text = isAr 
      ? `لديك كرت إهداء من SANO LUNA ✨\nيمكنك عرض كرت الإهداء الخاص بك من هنا:\n${url}`
      : `You have received a SANO LUNA Gift Card ✨\nView your gift card here:\n${url}`
    
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const handleCopyLink = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 3000)
    } catch (error) {
      console.error('Failed to copy', error)
    }
  }

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto">
      {/* Action Bar (Top) */}
      <div className="w-full flex flex-wrap justify-between items-center mb-8 gap-4 px-4 sm:px-0">
        <h1 className="text-h3" style={{ fontFamily: isAr ? 'Cairo' : 'Cinzel' }}>
          {isAr ? 'كرت الإهداء' : 'Gift Card'}
        </h1>
        <div className="flex gap-2">
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="btn btn-outline btn-sm bg-white"
          >
            {isDownloading ? (
              <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            )}
            <span className="hidden sm:inline">{isAr ? 'تحميل الكرت' : 'Download'}</span>
          </button>
          <button 
            onClick={handleShare}
            className="btn btn-primary btn-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            <span className="hidden sm:inline">{isAr ? 'مشاركة' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* The Visual Voucher (Used for both display and html2canvas download) */}
      <div className="w-full px-4 sm:px-0">
        <GiftCardVoucher
          ref={voucherRef}
          code={giftCard.code}
          initialAmount={giftCard.initialAmount}
          remainingBalance={giftCard.remainingBalance}
          theme={giftCard.theme}
          senderName={giftCard.senderName}
          recipientName={giftCard.recipientName}
          personalMessage={giftCard.personalMessage}
          expiresAt={giftCard.expiresAt}
          locale={locale}
        />
      </div>

      {/* Action Bar (Bottom specific shares) */}
      <div className="w-full mt-10 p-6 bg-white border border-border rounded-xl shadow-subtle mx-4 sm:mx-0">
        <h3 className="text-label mb-4">{isAr ? 'خيارات المشاركة' : 'Sharing Options'}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={handleWhatsAppShare}
            className="flex items-center justify-center gap-3 p-3 rounded-lg border border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
            <span className="font-medium">{isAr ? 'مشاركة عبر واتساب' : 'Share via WhatsApp'}</span>
          </button>
          
          <button 
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-3 p-3 rounded-lg border border-border text-foreground hover:bg-surface-muted transition-colors"
          >
            {copySuccess ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span className="font-medium text-success">{isAr ? 'تم نسخ الرابط!' : 'Link Copied!'}</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span className="font-medium">{isAr ? 'نسخ رابط الكرت' : 'Copy Gift Card Link'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
