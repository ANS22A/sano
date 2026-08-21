import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils/cn'
import {
  footerExploreLinks,
  footerExperienceLinks,
  contactConfig,
  socialLinks,
} from '@/config/site.config'
import { Logo } from './Logo'
import type { NavItem } from '@/types/ui.types'

// ─────────────────────────────────────────────
// FOOTER — Server Component
//
// 4-column editorial layout.
// Column 1: Brand + tagline
// Column 2: Explore links
// Column 3: Experience links
// Column 4: Contact info
// Bottom: Social + Legal
// ─────────────────────────────────────────────

// ── Social Icons ──────────────────────────────

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
    </svg>
  )
}

// ── Footer Nav Link ───────────────────────────

function FooterLink({ item }: { item: NavItem }) {
  const t = useTranslations('nav')
  return (
    <li>
      <Link
        href={item.href as '/'}
        className={cn(
          'text-body-sm text-muted-foreground',
          'hover:text-foreground transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm'
        )}
      >
        {t(item.key as 'home')}
      </Link>
    </li>
  )
}

// ── Social Icon Link ──────────────────────────

interface SocialLinkProps {
  href: string
  ariaLabel: string
  icon: React.ReactNode
}

function SocialLink({ href, ariaLabel, icon }: SocialLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={cn(
        'w-9 h-9 flex items-center justify-center rounded-sm',
        'text-muted-foreground hover:text-foreground',
        'border border-border hover:border-border-strong',
        'transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-ring focus-visible:ring-offset-2'
      )}
    >
      {icon}
    </a>
  )
}

// ── Main Footer ───────────────────────────────

export function Footer() {
  const t = useTranslations('footer')
  const tAria = useTranslations('aria')
  const locale = useLocale() as 'ar' | 'en'
  const year = new Date().getFullYear()

  const address = contactConfig.address[locale]
  const hours = contactConfig.hours[locale]

  return (
    <footer
      className="bg-surface border-t border-border"
      role="contentinfo"
    >
      {/* ── Main Footer Grid ── */}
      <div className="container-sl section-py-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 xl:gap-16">

          {/* Column 1 — Brand */}
          <div className="md:col-span-2 lg:col-span-1">
            <Logo variant="dark" size="md" asDiv className="mb-5" />
            <p className="text-body-sm text-muted-foreground leading-relaxed max-w-xs">
              {t('tagline')}
            </p>

            {/* Brand accent line — signature */}
            <span className="divider-sl mt-6 block" aria-hidden="true" />
          </div>

          {/* Column 2 — Explore */}
          <div>
            <h3 className="text-overline text-foreground mb-5">
              {t('exploreTitle')}
            </h3>
            <ul className="space-y-3" role="list">
              {footerExploreLinks.map((item) => (
                <FooterLink key={item.key} item={item} />
              ))}
            </ul>
          </div>

          {/* Column 3 — Experience */}
          <div>
            <h3 className="text-overline text-foreground mb-5">
              {t('experienceTitle')}
            </h3>
            <ul className="space-y-3" role="list">
              {footerExperienceLinks.map((item) => (
                <FooterLink key={item.key} item={item} />
              ))}
            </ul>
          </div>

          {/* Column 4 — Contact */}
          <div>
            <h3 className="text-overline text-foreground mb-5">
              {t('contactTitle')}
            </h3>
            <address className="not-italic space-y-3">
              {/* Phone */}
              {contactConfig.phone && (
                <a
                  href={`tel:${contactConfig.phone.replace(/\s/g, '')}`}
                  className="flex items-start gap-2.5 text-body-sm text-muted-foreground hover:text-foreground transition-colors duration-150 group"
                  dir="ltr"
                >
                  <svg
                    width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                    strokeLinejoin="round" aria-hidden="true"
                    className="flex-shrink-0 mt-0.5 text-accent"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.13 6.13l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <span>{contactConfig.phone}</span>
                </a>
              )}

              {/* Email */}
              {contactConfig.email && (
                <a
                  href={`mailto:${contactConfig.email}`}
                  className="flex items-start gap-2.5 text-body-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
                >
                  <svg
                    width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                    strokeLinejoin="round" aria-hidden="true"
                    className="flex-shrink-0 mt-0.5 text-accent"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <span>{contactConfig.email}</span>
                </a>
              )}

              {/* Address */}
              {address && (
                <div className="flex items-start gap-2.5 text-body-sm text-muted-foreground">
                  <svg
                    width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                    strokeLinejoin="round" aria-hidden="true"
                    className="flex-shrink-0 mt-0.5 text-accent"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>{address}</span>
                </div>
              )}

              {/* Hours */}
              {hours && (
                <div className="flex items-start gap-2.5 text-body-sm text-muted-foreground">
                  <svg
                    width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                    strokeLinejoin="round" aria-hidden="true"
                    className="flex-shrink-0 mt-0.5 text-accent"
                  >
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>{hours}</span>
                </div>
              )}
            </address>
          </div>
        </div>
      </div>

      {/* ── Footer Bottom Bar ── */}
      <div className="border-t border-border-subtle">
        <div className="container-sl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-5">

            {/* Copyright */}
            <p className="text-caption text-muted-foreground order-2 sm:order-1">
              {t('copyright', { year })}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2 order-1 sm:order-2">
              {socialLinks.instagram && (
                <SocialLink
                  href={socialLinks.instagram}
                  ariaLabel={tAria('socialInstagram')}
                  icon={<InstagramIcon />}
                />
              )}
              {socialLinks.whatsapp && (
                <SocialLink
                  href={socialLinks.whatsapp}
                  ariaLabel={tAria('socialWhatsapp')}
                  icon={<WhatsAppIcon />}
                />
              )}
              {socialLinks.facebook && (
                <SocialLink
                  href={socialLinks.facebook}
                  ariaLabel={tAria('socialFacebook')}
                  icon={<FacebookIcon />}
                />
              )}
              {socialLinks.tiktok && (
                <SocialLink
                  href={socialLinks.tiktok}
                  ariaLabel={tAria('socialTiktok')}
                  icon={<TikTokIcon />}
                />
              )}
            </div>

            {/* Legal */}
            <div className="flex items-center gap-3 order-3 text-caption text-muted-foreground">
              <span>{t('privacyPolicy')}</span>
              <span aria-hidden="true">·</span>
              <span>{t('termsOfService')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
