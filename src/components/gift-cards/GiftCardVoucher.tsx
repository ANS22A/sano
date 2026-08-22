import React from 'react'

type GiftCardVoucherProps = {
  code: string
  initialAmount: number
  remainingBalance: number
  theme: string
  senderName: string
  recipientName: string
  personalMessage: string | null
  expiresAt: string
  locale: string
}

export const GiftCardVoucher = React.forwardRef<HTMLDivElement, GiftCardVoucherProps>(
  (
    {
      code,
      initialAmount,
      remainingBalance,
      theme,
      senderName,
      recipientName,
      personalMessage,
      expiresAt,
      locale,
    },
    ref
  ) => {
    const isAr = locale === 'ar'
    
    // Theme mapping - fallback to classic-gold
    const themeStyles: Record<string, { bg: string; text: string; accent: string }> = {
      'classic-gold': { bg: 'bg-[#2E1F38]', text: 'text-white', accent: 'text-[#D4AF37]' },
      'rose-plum': { bg: 'bg-[#6F4E7C]', text: 'text-white', accent: 'text-[#E7DBEC]' },
      'sandstone': { bg: 'bg-[#FAF7F4]', text: 'text-[#2E1F38]', accent: 'text-[#D4AF37]' },
      'emerald': { bg: 'bg-[#1a2f24]', text: 'text-white', accent: 'text-[#D4AF37]' },
    }
    
    const currentTheme = themeStyles[theme] || themeStyles['classic-gold']
    
    const formattedDate = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(expiresAt))
    
    const isRedeemed = remainingBalance === 0

    return (
      <div 
        ref={ref}
        dir={isAr ? 'rtl' : 'ltr'}
        className={`relative w-full max-w-[600px] aspect-[4/3] rounded-2xl overflow-hidden shadow-luxury ${currentTheme.bg} ${currentTheme.text} p-8 flex flex-col justify-between mx-auto`}
        style={{
          // Use specific inline fonts for canvas rendering safety
          fontFamily: isAr ? "'Cairo', 'Tajawal', sans-serif" : "'Cinzel', 'Montserrat', sans-serif"
        }}
      >
        {/* Decorative corner accents */}
        <div className="absolute top-0 start-0 w-24 h-24 border-t-2 border-s-2 rounded-tl-2xl opacity-20 m-4" style={{ borderColor: 'currentColor' }} />
        <div className="absolute bottom-0 end-0 w-24 h-24 border-b-2 border-e-2 rounded-br-2xl opacity-20 m-4" style={{ borderColor: 'currentColor' }} />
        
        {/* Header */}
        <div className="flex justify-between items-start z-10 relative">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold tracking-wide uppercase" style={{ fontFamily: isAr ? 'Cairo' : 'Cinzel' }}>
              SANO LUNA
            </h2>
            <p className="text-xs uppercase tracking-widest mt-1 opacity-80" style={{ fontFamily: isAr ? 'Tajawal' : 'Montserrat' }}>
              {isAr ? 'كرت إهداء' : 'GIFT CARD'}
            </p>
          </div>
          <div className="text-end">
            <div className={`text-3xl md:text-4xl font-bold ${currentTheme.accent}`} style={{ fontFamily: isAr ? 'Cairo' : 'Cinzel' }}>
              {initialAmount} <span className="text-lg md:text-xl font-normal">SAR</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col justify-center my-6 z-10 relative">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider opacity-70 mb-1" style={{ fontFamily: isAr ? 'Tajawal' : 'Montserrat' }}>
                {isAr ? 'إلى' : 'TO'}
              </p>
              <p className="text-lg md:text-xl font-medium" style={{ fontFamily: isAr ? 'Cairo' : 'Cinzel' }}>{recipientName}</p>
            </div>
            
            {personalMessage && (
              <div className="py-2 border-y border-white/10 my-4">
                <p className="text-sm italic opacity-90 leading-relaxed" style={{ fontFamily: isAr ? 'Tajawal' : 'Montserrat' }}>
                  &quot;{personalMessage}&quot;
                </p>
              </div>
            )}
            
            <div>
              <p className="text-[10px] uppercase tracking-wider opacity-70 mb-1" style={{ fontFamily: isAr ? 'Tajawal' : 'Montserrat' }}>
                {isAr ? 'من' : 'FROM'}
              </p>
              <p className="text-md font-medium" style={{ fontFamily: isAr ? 'Cairo' : 'Cinzel' }}>{senderName}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 z-10 relative mt-auto border-t border-white/10 pt-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider opacity-70 mb-1" style={{ fontFamily: isAr ? 'Tajawal' : 'Montserrat' }}>
              {isAr ? 'رمز الكرت' : 'GIFT CARD CODE'}
            </p>
            <p className={`text-lg md:text-xl font-bold tracking-[0.2em] ${currentTheme.accent}`} style={{ fontFamily: 'monospace' }}>
              {code}
            </p>
          </div>
          
          <div className="flex flex-row sm:flex-col justify-between sm:text-end gap-2 sm:gap-1">
            <div>
              <p className="text-[10px] uppercase tracking-wider opacity-70" style={{ fontFamily: isAr ? 'Tajawal' : 'Montserrat' }}>
                {isAr ? 'صالح حتى' : 'VALID UNTIL'}
              </p>
              <p className="text-xs font-medium">{formattedDate}</p>
            </div>
            {isRedeemed ? (
              <div className="mt-1">
                <span className="inline-block px-2 py-0.5 bg-black/20 rounded text-xs text-white/80 uppercase">
                  {isAr ? 'مُستخدم بالكامل' : 'FULLY REDEEMED'}
                </span>
              </div>
            ) : remainingBalance < initialAmount ? (
              <div className="mt-1">
                 <p className="text-[10px] uppercase tracking-wider opacity-70" style={{ fontFamily: isAr ? 'Tajawal' : 'Montserrat' }}>
                  {isAr ? 'الرصيد المتبقي' : 'REMAINING'}
                </p>
                <p className="text-xs font-medium">{remainingBalance} SAR</p>
              </div>
            ) : null}
          </div>
        </div>
        
        {/* Background Texture Overlay (subtle noise) */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" 
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
        />
      </div>
    )
  }
)

GiftCardVoucher.displayName = 'GiftCardVoucher'
