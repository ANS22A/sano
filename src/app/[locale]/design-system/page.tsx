'use client'

/**
 * SANO LUNA — Design System Showcase
 *
 * Internal development page to validate the visual language.
 * Remove or add authentication before production deployment.
 *
 * Visit: /ar/design-system or /en/design-system
 */

import { useState } from 'react'
import { Loader2, ArrowRight, X, Check, AlertTriangle, Info, Sparkles, Star, Heart, Leaf } from 'lucide-react'
import { motion } from 'framer-motion'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { Grid } from '@/components/layout/Grid'
import {
  Heading,
  Text,
  Display,
  Overline,
  Caption,
  Price,
  SectionHeading,
} from '@/components/ui/Typography'
import { SLButton, ArrowLink, IconButton } from '@/components/ui/SLButton'
import { SLBadge } from '@/components/ui/SLBadge'
import { ServiceCard, TestimonialCard, FeatureCard } from '@/components/ui/SLCards'
import { staggerContainer, staggerItem, fadeUp } from '@/lib/motion/variants'

// ─────────────────────────────────────────────
// DESIGN SYSTEM SECTIONS
// ─────────────────────────────────────────────

function DSSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="border-b border-border pb-16 mb-16">
      <div className="flex items-center gap-4 mb-8">
        <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
        <h2 className="text-h3 text-muted-foreground font-sans uppercase tracking-widest text-sm font-medium">
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}

function ColorSwatch({ name, cssVar, textDark = false }: { name: string; cssVar: string; textDark?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-16 rounded-md border border-border-subtle w-full"
        style={{ backgroundColor: `var(${cssVar})` }}
      />
      <Caption className={textDark ? 'text-foreground' : ''}>{name}</Caption>
      <code className="text-[10px] text-muted-foreground font-mono">{cssVar}</code>
    </div>
  )
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export default function DesignSystemPage() {
  const [inputValue, setInputValue] = useState('')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 border-b border-border backdrop-blur-sm">
        <Container>
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-overline">SANO LUNA</span>
              <span className="w-1 h-1 rounded-full bg-accent" />
              <span className="text-overline text-muted-foreground">Design System</span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
              {['Colors', 'Typography', 'Buttons', 'Forms', 'Cards', 'Badges', 'Motion', 'Spacing'].map(s => (
                <a key={s} href={`#${s.toLowerCase()}`} className="hover:text-foreground transition-colors">
                  {s}
                </a>
              ))}
            </nav>
          </div>
        </Container>
      </header>

      <main>
        {/* Hero */}
        <Section spacing="large" background="default">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Overline withLine className="mb-6">Design System v1.0</Overline>
              <Display className="mb-6">
                SANO LUNA
                <br />
                <span className="italic">Visual Language</span>
              </Display>
              <Text size="lg" muted className="max-w-xl">
                A complete design system built on Quiet Luxury principles.
                Warm stone tones, editorial typography, refined motion.
              </Text>
            </motion.div>
          </Container>
        </Section>

        <Container>
          {/* ═══════════════════════════════════════ */}
          {/* COLORS */}
          {/* ═══════════════════════════════════════ */}
          <DSSection id="colors" title="Color System">
            <div className="space-y-8">
              <div>
                <Text size="sm" muted className="mb-4 uppercase tracking-wider font-medium">Brand</Text>
                <Grid cols={4} gap="default">
                  <ColorSwatch name="Primary" cssVar="--primary" />
                  <ColorSwatch name="Primary Hover" cssVar="--primary-hover" />
                  <ColorSwatch name="Accent" cssVar="--accent" />
                  <ColorSwatch name="Accent Subtle" cssVar="--accent-subtle" />
                </Grid>
              </div>
              <div>
                <Text size="sm" muted className="mb-4 uppercase tracking-wider font-medium">Backgrounds</Text>
                <Grid cols={4} gap="default">
                  <ColorSwatch name="Background" cssVar="--background" />
                  <ColorSwatch name="Surface" cssVar="--surface" />
                  <ColorSwatch name="Surface Elevated" cssVar="--surface-elevated" />
                  <ColorSwatch name="Surface Muted" cssVar="--surface-muted" />
                </Grid>
              </div>
              <div>
                <Text size="sm" muted className="mb-4 uppercase tracking-wider font-medium">Text</Text>
                <Grid cols={4} gap="default">
                  <ColorSwatch name="Foreground" cssVar="--foreground" />
                  <ColorSwatch name="Muted Foreground" cssVar="--muted-foreground" />
                  <ColorSwatch name="Muted" cssVar="--muted" />
                  <ColorSwatch name="Border" cssVar="--border" />
                </Grid>
              </div>
              <div>
                <Text size="sm" muted className="mb-4 uppercase tracking-wider font-medium">Semantic</Text>
                <Grid cols={4} gap="default">
                  <ColorSwatch name="Success" cssVar="--success" />
                  <ColorSwatch name="Warning" cssVar="--warning" />
                  <ColorSwatch name="Error" cssVar="--error" />
                  <ColorSwatch name="Info" cssVar="--info" />
                </Grid>
              </div>
            </div>
          </DSSection>

          {/* ═══════════════════════════════════════ */}
          {/* TYPOGRAPHY */}
          {/* ═══════════════════════════════════════ */}
          <DSSection id="typography" title="Typography">
            <div className="space-y-6">
              <div className="flex items-start gap-6 border-b border-border-subtle pb-6">
                <Caption className="w-28 flex-shrink-0 pt-1">Display XL</Caption>
                <Display xl className="leading-none">
                  Sano Luna
                </Display>
              </div>
              <div className="flex items-start gap-6 border-b border-border-subtle pb-6">
                <Caption className="w-28 flex-shrink-0 pt-1">Display</Caption>
                <Display>Quiet Luxury</Display>
              </div>
              <div className="flex items-start gap-6 border-b border-border-subtle pb-6">
                <Caption className="w-28 flex-shrink-0 pt-1">Display Italic</Caption>
                <Display italic>Wellness & Calm</Display>
              </div>
              <div className="flex items-start gap-6 border-b border-border-subtle pb-6">
                <Caption className="w-28 flex-shrink-0 pt-1">H1</Caption>
                <Heading level="h1">The Art of Wellbeing</Heading>
              </div>
              <div className="flex items-start gap-6 border-b border-border-subtle pb-6">
                <Caption className="w-28 flex-shrink-0 pt-1">H2</Caption>
                <Heading level="h2">Our Signature Services</Heading>
              </div>
              <div className="flex items-start gap-6 border-b border-border-subtle pb-6">
                <Caption className="w-28 flex-shrink-0 pt-1">H3</Caption>
                <Heading level="h3">Premium Treatments</Heading>
              </div>
              <div className="flex items-start gap-6 border-b border-border-subtle pb-6">
                <Caption className="w-28 flex-shrink-0 pt-1">H4</Caption>
                <Heading level="h4">Deep Tissue Massage</Heading>
              </div>
              <div className="flex items-start gap-6 border-b border-border-subtle pb-6">
                <Caption className="w-28 flex-shrink-0 pt-1">Body Large</Caption>
                <Text size="lg" className="max-w-xl">
                  An experience of profound relaxation and renewal, crafted by our expert therapists using the finest natural ingredients.
                </Text>
              </div>
              <div className="flex items-start gap-6 border-b border-border-subtle pb-6">
                <Caption className="w-28 flex-shrink-0 pt-1">Body</Caption>
                <Text className="max-w-xl">
                  Each session is thoughtfully personalized to your unique needs, ensuring the highest standard of care in a serene, private environment.
                </Text>
              </div>
              <div className="flex items-start gap-6 border-b border-border-subtle pb-6">
                <Caption className="w-28 flex-shrink-0 pt-1">Body Small</Caption>
                <Text size="sm" className="max-w-xl">
                  Available Monday through Saturday, 9am to 9pm. Book your appointment online or contact our concierge team.
                </Text>
              </div>
              <div className="flex items-start gap-6 border-b border-border-subtle pb-6">
                <Caption className="w-28 flex-shrink-0 pt-1">Overline</Caption>
                <Overline withLine>Signature Collection</Overline>
              </div>
              <div className="flex items-start gap-6 border-b border-border-subtle pb-6">
                <Caption className="w-28 flex-shrink-0 pt-1">Price</Caption>
                <Price amount={580} currency="SAR" period="session" />
              </div>
              <div className="flex items-start gap-6">
                <Caption className="w-28 flex-shrink-0 pt-1">Nav Link</Caption>
                <span className="text-nav">Services</span>
              </div>

              {/* Arabic Typography */}
              <div className="border-t border-border pt-8 mt-8">
                <Text size="sm" muted className="mb-6 uppercase tracking-wider font-medium">Arabic Typography (RTL)</Text>
                <div dir="rtl" className="space-y-6 text-right">
                  <div className="flex items-start gap-6 border-b border-border-subtle pb-6 flex-row-reverse">
                    <Caption className="w-28 flex-shrink-0 pt-1 text-start">عرض XL</Caption>
                    <h1 className="text-display-xl font-display" dir="rtl">سانو لونا</h1>
                  </div>
                  <div className="flex items-start gap-6 border-b border-border-subtle pb-6 flex-row-reverse">
                    <Caption className="w-28 flex-shrink-0 pt-1 text-start">H1 عربي</Caption>
                    <h1 className="text-h1" dir="rtl" lang="ar">فن العافية والجمال</h1>
                  </div>
                  <div className="flex items-start gap-6 border-b border-border-subtle pb-6 flex-row-reverse">
                    <Caption className="w-28 flex-shrink-0 pt-1 text-start">جسم كبير</Caption>
                    <p className="text-body-lg max-w-xl" dir="rtl" lang="ar">
                      تجربة عميقة من الاسترخاء والتجديد، مصممة بعناية من قبل خبرائنا باستخدام أجود المكونات الطبيعية.
                    </p>
                  </div>
                  <div className="flex items-start gap-6 flex-row-reverse">
                    <Caption className="w-28 flex-shrink-0 pt-1 text-start">سعر</Caption>
                    <span className="text-price" dir="rtl" lang="ar">٥٨٠ ريال / جلسة</span>
                  </div>
                </div>
              </div>
            </div>
          </DSSection>

          {/* ═══════════════════════════════════════ */}
          {/* BUTTONS */}
          {/* ═══════════════════════════════════════ */}
          <DSSection id="buttons" title="Button System">
            <div className="space-y-10">
              {/* Variants */}
              <div>
                <Text size="sm" muted className="mb-4 uppercase tracking-wider font-medium">Variants</Text>
                <div className="flex flex-wrap gap-4 items-center">
                  <SLButton variant="primary">Book Now</SLButton>
                  <SLButton variant="secondary">Learn More</SLButton>
                  <SLButton variant="outline">View Services</SLButton>
                  <SLButton variant="ghost">Cancel</SLButton>
                  <SLButton variant="accent">Reserve Your Session</SLButton>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <Text size="sm" muted className="mb-4 uppercase tracking-wider font-medium">Sizes</Text>
                <div className="flex flex-wrap gap-4 items-center">
                  <SLButton size="sm">Small</SLButton>
                  <SLButton size="md">Medium</SLButton>
                  <SLButton size="lg">Large</SLButton>
                </div>
              </div>

              {/* States */}
              <div>
                <Text size="sm" muted className="mb-4 uppercase tracking-wider font-medium">States</Text>
                <div className="flex flex-wrap gap-4 items-center">
                  <SLButton>Default</SLButton>
                  <SLButton loading>Loading</SLButton>
                  <SLButton disabled>Disabled</SLButton>
                  <IconButton label="Favorite" variant="ghost">
                    <Heart size={18} />
                  </IconButton>
                  <IconButton label="Add" variant="outline">
                    <Leaf size={18} />
                  </IconButton>
                </div>
              </div>

              {/* Arrow links */}
              <div>
                <Text size="sm" muted className="mb-4 uppercase tracking-wider font-medium">Arrow Links</Text>
                <div className="flex flex-wrap gap-8 items-center">
                  <ArrowLink>Discover Our Services</ArrowLink>
                  <ArrowLink>View Full Gallery</ArrowLink>
                  <ArrowLink>Meet Our Team</ArrowLink>
                </div>
              </div>

              {/* Arabic Buttons */}
              <div dir="rtl" className="border-t border-border pt-8">
                <Text size="sm" muted className="mb-4 uppercase tracking-wider font-medium" dir="ltr">Arabic RTL</Text>
                <div className="flex flex-wrap gap-4 items-center">
                  <SLButton variant="primary">احجز الآن</SLButton>
                  <SLButton variant="outline">اكتشف خدماتنا</SLButton>
                  <SLButton variant="accent">احجز جلستك</SLButton>
                  <ArrowLink dir="rtl">اعرف المزيد</ArrowLink>
                </div>
              </div>
            </div>
          </DSSection>

          {/* ═══════════════════════════════════════ */}
          {/* BADGES */}
          {/* ═══════════════════════════════════════ */}
          <DSSection id="badges" title="Badge System">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3 items-center">
                <SLBadge variant="default">Default</SLBadge>
                <SLBadge variant="primary">Primary</SLBadge>
                <SLBadge variant="accent">Signature</SLBadge>
                <SLBadge variant="featured">New</SLBadge>
                <SLBadge variant="success" dot>Available</SLBadge>
                <SLBadge variant="warning" dot>Limited</SLBadge>
                <SLBadge variant="error" dot>Unavailable</SLBadge>
              </div>
              <div dir="rtl" className="flex flex-wrap gap-3 items-center border-t border-border pt-6">
                <SLBadge variant="accent">مميز</SLBadge>
                <SLBadge variant="featured">جديد</SLBadge>
                <SLBadge variant="success" dot>متاح</SLBadge>
              </div>
            </div>
          </DSSection>

          {/* ═══════════════════════════════════════ */}
          {/* FORMS */}
          {/* ═══════════════════════════════════════ */}
          <DSSection id="forms" title="Form System">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* English LTR */}
              <div>
                <Text size="sm" muted className="mb-6 uppercase tracking-wider font-medium">LTR Form</Text>
                <div className="space-y-5">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      placeholder="Your full name"
                      className="form-input"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" placeholder="your@email.com" className="form-input" />
                    <p className="form-helper">We&apos;ll send booking confirmation here</p>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input type="tel" placeholder="+966 5x xxx xxxx" className="form-input error" />
                    <p className="form-error">
                      <X size={12} />
                      Please enter a valid phone number
                    </p>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Special Requests</label>
                    <textarea
                      placeholder="Any preferences or notes..."
                      className="form-input form-textarea"
                    />
                  </div>
                  <SLButton variant="primary" className="w-full">Book Appointment</SLButton>
                </div>
              </div>

              {/* Arabic RTL */}
              <div dir="rtl">
                <Text size="sm" muted className="mb-6 uppercase tracking-wider font-medium" dir="ltr">RTL Form (Arabic)</Text>
                <div className="space-y-5">
                  <div className="form-group">
                    <label className="form-label" lang="ar">الاسم الكامل *</label>
                    <input
                      type="text"
                      placeholder="أدخل اسمك الكامل"
                      className="form-input"
                      lang="ar"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" lang="ar">البريد الإلكتروني</label>
                    <input
                      type="email"
                      placeholder="بريدك@الإلكتروني.com"
                      className="form-input"
                    />
                    <p className="form-helper" lang="ar">سنرسل تأكيد الحجز على هذا البريد</p>
                  </div>
                  <div className="form-group">
                    <label className="form-label" lang="ar">رقم الهاتف</label>
                    <input
                      type="tel"
                      placeholder="+966 5x xxx xxxx"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" lang="ar">ملاحظات خاصة</label>
                    <textarea
                      placeholder="أي تفضيلات أو ملاحظات..."
                      className="form-input form-textarea"
                      lang="ar"
                    />
                  </div>
                  <SLButton variant="primary" className="w-full">احجز موعدك</SLButton>
                </div>
              </div>
            </div>
          </DSSection>

          {/* ═══════════════════════════════════════ */}
          {/* CARDS */}
          {/* ═══════════════════════════════════════ */}
          <DSSection id="cards" title="Card System">
            <div className="space-y-12">
              {/* Service Cards */}
              <div>
                <Text size="sm" muted className="mb-6 uppercase tracking-wider font-medium">Service Cards</Text>
                <Grid cols={3} gap="default">
                  <ServiceCard
                    title="Deep Tissue Massage"
                    description="Therapeutic pressure targeting deep muscle tissue to release chronic tension and restore mobility."
                    price={580}
                    duration={90}
                    badge="Popular"
                    imageUrl="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop"
                  />
                  <ServiceCard
                    title="Signature Facial"
                    description="A personalized facial using premium botanicals tailored to your skin's unique needs."
                    price={420}
                    duration={60}
                    imageUrl="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=300&fit=crop"
                  />
                  <ServiceCard
                    title="Hot Stone Therapy"
                    description="Ancient healing with warmed volcanic stones to ease tension and invite deep relaxation."
                    price={650}
                    duration={75}
                    badge="New"
                    imageUrl="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400&h=300&fit=crop"
                  />
                </Grid>
              </div>

              {/* Testimonials */}
              <div>
                <Text size="sm" muted className="mb-6 uppercase tracking-wider font-medium">Testimonial Cards</Text>
                <Grid cols={3} gap="default">
                  <TestimonialCard
                    name="Sarah Al-Rashid"
                    review="An extraordinary experience. The attention to detail and the warmth of the team made me feel completely at ease from the moment I arrived."
                    rating={5}
                  />
                  <TestimonialCard
                    name="Noura K."
                    review="The signature facial was transformative. My skin has never felt so nourished. I've found my sanctuary in the city."
                    rating={5}
                  />
                  <TestimonialCard
                    name="Layla M."
                    review="Every visit feels like coming home. The therapists are true artists and the atmosphere is simply unmatched in the region."
                    rating={5}
                  />
                </Grid>
              </div>

              {/* Feature Cards */}
              <div>
                <Text size="sm" muted className="mb-6 uppercase tracking-wider font-medium">Feature Cards (Editorial)</Text>
                <Grid cols={3} gap="default">
                  <FeatureCard number={1} title="Expert Therapists" description="Every member of our team undergoes rigorous training and holds international certifications." />
                  <FeatureCard number={2} title="Premium Ingredients" description="We source only the finest botanical and natural ingredients from around the world." />
                  <FeatureCard number={3} title="Private Environment" description="Each suite is designed to be a sanctuary of complete privacy and absolute calm." />
                </Grid>
              </div>
            </div>
          </DSSection>

          {/* ═══════════════════════════════════════ */}
          {/* MOTION */}
          {/* ═══════════════════════════════════════ */}
          <DSSection id="motion" title="Motion & Animation">
            <div className="space-y-12">
              <div>
                <Text size="sm" muted className="mb-6 uppercase tracking-wider font-medium">Stagger Reveal</Text>
                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.3 }}
                  variants={staggerContainer}
                >
                  {['Calm', 'Luxury', 'Wellness', 'Private'].map(word => (
                    <motion.div
                      key={word}
                      variants={staggerItem}
                      className="h-24 bg-surface border border-border rounded-md flex items-center justify-center"
                    >
                      <Overline>{word}</Overline>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              <div>
                <Text size="sm" muted className="mb-6 uppercase tracking-wider font-medium">Fade Up (Scroll to reveal)</Text>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.5 }}
                  variants={fadeUp}
                  className="p-8 bg-surface border border-border rounded-lg"
                >
                  <Heading level="h3" className="mb-2">The Art of Quiet Luxury</Heading>
                  <Text muted>This element fades up as you scroll into view. Scroll away and back to replay.</Text>
                </motion.div>
              </div>

              <div>
                <Text size="sm" muted className="mb-6 uppercase tracking-wider font-medium">Motion Tokens</Text>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'Fast', duration: '150ms', easing: 'ease-smooth' },
                    { name: 'Normal', duration: '300ms', easing: 'ease-luxury' },
                    { name: 'Slow', duration: '500ms', easing: 'power2.out' },
                    { name: 'Reveal', duration: '600ms', easing: 'power2.out' },
                  ].map(t => (
                    <div key={t.name} className="p-4 bg-surface border border-border rounded-md">
                      <Caption className="block mb-1">{t.name}</Caption>
                      <Text size="sm" className="font-mono">{t.duration}</Text>
                      <Text size="sm" muted className="text-[11px] mt-1">{t.easing}</Text>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DSSection>

          {/* ═══════════════════════════════════════ */}
          {/* SPACING */}
          {/* ═══════════════════════════════════════ */}
          <DSSection id="spacing" title="Spacing System">
            <div className="space-y-3">
              {[
                { name: 'space-1', px: 4 },
                { name: 'space-2', px: 8 },
                { name: 'space-3', px: 12 },
                { name: 'space-4', px: 16 },
                { name: 'space-6', px: 24 },
                { name: 'space-8', px: 32 },
                { name: 'space-10', px: 40 },
                { name: 'space-12', px: 48 },
                { name: 'space-16', px: 64 },
                { name: 'space-20', px: 80 },
                { name: 'space-24', px: 96 },
                { name: 'space-30', px: 120 },
                { name: 'space-40', px: 160 },
              ].map(s => (
                <div key={s.name} className="flex items-center gap-4">
                  <Caption className="w-20 flex-shrink-0">{s.name}</Caption>
                  <div
                    className="h-5 bg-accent/40 rounded-sm flex-shrink-0"
                    style={{ width: `${s.px}px` }}
                  />
                  <Caption className="text-muted-foreground">{s.px}px</Caption>
                </div>
              ))}
            </div>
          </DSSection>

          {/* ═══════════════════════════════════════ */}
          {/* ICONS */}
          {/* ═══════════════════════════════════════ */}
          <DSSection id="icons" title="Icon System (Lucide)">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-6 items-center">
                {[
                  { icon: <Star size={20} strokeWidth={1.5} />, name: 'Star' },
                  { icon: <Heart size={20} strokeWidth={1.5} />, name: 'Heart' },
                  { icon: <Leaf size={20} strokeWidth={1.5} />, name: 'Leaf' },
                  { icon: <Sparkles size={20} strokeWidth={1.5} />, name: 'Sparkles' },
                  { icon: <ArrowRight size={20} strokeWidth={1.5} />, name: 'ArrowRight' },
                  { icon: <Check size={20} strokeWidth={1.5} />, name: 'Check' },
                  { icon: <X size={20} strokeWidth={1.5} />, name: 'X' },
                  { icon: <Info size={20} strokeWidth={1.5} />, name: 'Info' },
                  { icon: <AlertTriangle size={20} strokeWidth={1.5} />, name: 'Alert' },
                  { icon: <Loader2 size={20} strokeWidth={1.5} />, name: 'Loader' },
                ].map(({ icon, name }) => (
                  <div key={name} className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 flex items-center justify-center text-foreground">
                      {icon}
                    </div>
                    <Caption>{name}</Caption>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-6 border-t border-border pt-6">
                <div className="flex items-center gap-2">
                  <Star size={12} strokeWidth={1.5} />
                  <Caption>xs — 12px</Caption>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={16} strokeWidth={1.5} />
                  <Caption>sm — 16px</Caption>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={20} strokeWidth={1.5} />
                  <Caption>md — 20px</Caption>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={24} strokeWidth={1.5} />
                  <Caption>lg — 24px</Caption>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={32} strokeWidth={1.5} />
                  <Caption>xl — 32px</Caption>
                </div>
              </div>
            </div>
          </DSSection>

          {/* ═══════════════════════════════════════ */}
          {/* BRAND SIGNATURES */}
          {/* ═══════════════════════════════════════ */}
          <DSSection id="brand" title="Brand Signatures">
            <div className="space-y-12">
              {/* Signature 1: Divider Line */}
              <div>
                <Text size="sm" muted className="mb-6 uppercase tracking-wider font-medium">Signature 1 — Accent Divider Line</Text>
                <div className="space-y-1">
                  <span className="divider-sl" aria-hidden="true" />
                  <Overline>Signature Collection</Overline>
                </div>
              </div>

              {/* Signature 2: Opening Quote Mark */}
              <div>
                <Text size="sm" muted className="mb-6 uppercase tracking-wider font-medium">Signature 2 — Testimonial Quote Mark</Text>
                <div className="flex gap-6 items-start">
                  <div className="text-[6rem] text-accent/25 leading-none font-display select-none flex-shrink-0">
                    &ldquo;
                  </div>
                  <Text size="lg" className="mt-8 italic">
                    An extraordinary experience that transformed my perspective on wellness.
                  </Text>
                </div>
              </div>

              {/* Signature 3: Number Treatment */}
              <div>
                <Text size="sm" muted className="mb-6 uppercase tracking-wider font-medium">Signature 3 — Editorial Number Sequence</Text>
                <div className="flex gap-12">
                  {['01', '02', '03'].map(n => (
                    <div key={n}>
                      <span className="text-overline text-accent block mb-2">{n}</span>
                      <Heading level="h4">Feature Name</Heading>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signature 4: Section Heading Pattern */}
              <div>
                <Text size="sm" muted className="mb-6 uppercase tracking-wider font-medium">Signature 4 — Section Heading Pattern</Text>
                <SectionHeading
                  overline="Our Services"
                  title="Crafted for Your Wellbeing"
                  subtitle="Each treatment is designed to restore harmony between body, mind, and spirit — guided by our master therapists."
                />
              </div>

              {/* Signature 5: Centered Editorial Section */}
              <div>
                <Text size="sm" muted className="mb-6 uppercase tracking-wider font-medium">Signature 5 — Centered Editorial Section</Text>
                <div className="text-center py-16 border border-border rounded-lg bg-surface">
                  <span className="divider-sl divider-sl-center mb-6 block" aria-hidden="true" />
                  <Overline centered className="mb-6">Quiet Luxury</Overline>
                  <Display className="mb-6 max-w-xl mx-auto">
                    Where Wellness
                    <br />
                    <em>Meets Elegance</em>
                  </Display>
                  <Text size="lg" muted className="max-w-md mx-auto mb-8">
                    An experience that transcends the ordinary, delivered with discretion and care.
                  </Text>
                  <SLButton variant="accent" size="lg">Reserve Your Visit</SLButton>
                </div>
              </div>
            </div>
          </DSSection>

          {/* ═══════════════════════════════════════ */}
          {/* LOADING STATES */}
          {/* ═══════════════════════════════════════ */}
          <DSSection id="states" title="Loading & Empty States">
            <div className="space-y-10">
              <div>
                <Text size="sm" muted className="mb-4 uppercase tracking-wider font-medium">Skeleton Loaders</Text>
                <div className="space-y-3 max-w-sm">
                  <div className="skeleton h-6 w-3/4 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-4 w-5/6 rounded" />
                  <div className="skeleton h-4 w-4/6 rounded" />
                </div>
              </div>
              <div>
                <Text size="sm" muted className="mb-4 uppercase tracking-wider font-medium">Spinner</Text>
                <div className="spinner" />
              </div>
              <div>
                <Text size="sm" muted className="mb-4 uppercase tracking-wider font-medium">Empty State</Text>
                <div className="text-center py-16 border border-dashed border-border rounded-lg">
                  <Leaf size={32} strokeWidth={1} className="mx-auto mb-4 text-muted-foreground" />
                  <Heading level="h4" className="mb-2">No services available</Heading>
                  <Text size="sm" muted>Check back soon — new treatments are added regularly.</Text>
                </div>
              </div>
            </div>
          </DSSection>

          {/* ═══════════════════════════════════════ */}
          {/* SHADOWS & BORDERS */}
          {/* ═══════════════════════════════════════ */}
          <DSSection id="shadows" title="Shadows & Borders">
            <div className="space-y-8">
              <div>
                <Text size="sm" muted className="mb-4 uppercase tracking-wider font-medium">Shadow Scale</Text>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { name: 'Subtle', shadow: 'var(--shadow-subtle)' },
                    { name: 'Medium', shadow: 'var(--shadow-medium)' },
                    { name: 'Elevated', shadow: 'var(--shadow-elevated)' },
                    { name: 'Luxury', shadow: 'var(--shadow-luxury)' },
                  ].map(s => (
                    <div
                      key={s.name}
                      className="h-24 bg-surface-elevated rounded-lg flex items-center justify-center"
                      style={{ boxShadow: s.shadow }}
                    >
                      <Caption>{s.name}</Caption>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Text size="sm" muted className="mb-4 uppercase tracking-wider font-medium">Border Scale</Text>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-16 rounded-md border border-border-subtle bg-surface flex items-center justify-center">
                    <Caption>Subtle</Caption>
                  </div>
                  <div className="h-16 rounded-md border border-border bg-surface flex items-center justify-center">
                    <Caption>Standard</Caption>
                  </div>
                  <div className="h-16 rounded-md border border-border-strong bg-surface flex items-center justify-center">
                    <Caption>Strong</Caption>
                  </div>
                </div>
              </div>

              <div>
                <Text size="sm" muted className="mb-4 uppercase tracking-wider font-medium">Border Radius Scale</Text>
                <div className="flex flex-wrap gap-4 items-end">
                  {[
                    { name: 'xs', r: '2px' },
                    { name: 'sm', r: '4px' },
                    { name: 'md', r: '6px' },
                    { name: 'lg', r: '8px' },
                    { name: 'xl', r: '12px' },
                    { name: '2xl', r: '16px' },
                    { name: '3xl', r: '24px' },
                    { name: 'pill', r: '9999px' },
                  ].map(r => (
                    <div key={r.name} className="flex flex-col items-center gap-2">
                      <div
                        className="w-16 h-16 bg-muted border border-border flex items-center justify-center"
                        style={{ borderRadius: r.r }}
                      />
                      <Caption>{r.name}</Caption>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DSSection>

          {/* Footer */}
          <footer className="border-t border-border py-12 text-center">
            <Overline centered className="mb-4">SANO LUNA Design System v1.0</Overline>
            <Caption>Internal use only. Built with Quiet Luxury principles.</Caption>
          </footer>
        </Container>
      </main>
    </div>
  )
}
