# SANO LUNA — Content Inventory
# Reference: tamamspa.com (Business/content reference ONLY — no assets, copy, or code copied)
# Audit Date: 2026-08-19
# Status: Phase 4 audit complete

---

## 1. REFERENCE SITE ANALYSIS — tamamspa.com

### Business Model
- At-home / mobile spa service (Riyadh, Saudi Arabia)
- Female-focused market
- Online booking with location-based availability
- App + web platform

### Reference Site Pages
| Page | URL | Notes |
|------|-----|-------|
| Homepage | / | Hero, category rail, featured services, promo section, how it works |
| Services | /services | Full catalog with category filtering |
| Packages | /packages | Dynamic from catalog |
| Gift Cards | /gift-cards | 3-step flow: choose service → login → pay |
| About | /about-us | Brand story |
| Booking | /book | Location-based booking flow |
| My Bookings | /bookings | Authenticated |
| Account | /account | Authenticated |
| Privacy | /privacy | Legal |

---

## 2. COMPLETE SERVICE INVENTORY (from live API: api.tamamspa.com/api/mobile/published-catalog)

### Category: مساج (Massage) — 16 services

| # | Name (AR) | SANO LUNA Equivalent (EN) | Slug | Duration | Price (SAR) | Popular |
|---|-----------|--------------------------|------|----------|-------------|---------|
| 1 | مساج سويدي | Swedish Massage | swedish-massage | 60 min | 159 | No |
| 2 | مساج تايلندي | Thai Massage | thai-massage | 60 min | 159 | No |
| 3 | مساج ريلاكس | Relaxation Massage | relaxation-massage | 60 min | 169 | No |
| 4 | مساج زيت حار | Warm Oil Massage | warm-oil-massage | 60 min | 169 | No |
| 5 | مساج 4×1 | Four-Technique Fusion | four-technique-massage | 60 min | 169 | Yes |
| 6 | مساج لمفاوي | Lymphatic Drainage | lymphatic-massage | 60 min | 179 | No |
| 7 | كاسات الهواء | Cupping Therapy | cupping-therapy | 60 min | 179 | No |
| 8 | أحجار ساخنة | Hot Stone Massage | hot-stone-massage | 60 min | 179 | Yes |
| 9 | مساج 5×1 | Five-Technique Fusion | five-technique-massage | 60 min | 179 | No |
| 10 | مساج 4×1 (70 دقيقة) | Four-Technique Fusion (Extended) | four-technique-extended | 70 min | 189 | Yes |
| 11 | مساج علاجي مع الأحجار | Therapeutic Hot Stone | therapeutic-hot-stone | 60 min | 199 | Yes |
| 12 | لمفاوي + كاسات الهواء | Lymphatic + Cupping | lymphatic-cupping | 60 min | 199 | Yes |
| 13 | مساج 6x1 | Six-Technique Signature | six-technique-massage | 60 min | 199 | No |
| 14 | مساج حوامل | Prenatal Massage | prenatal-massage | 60 min | 179 | Yes |
| 15 | مساج حوامل و كاسات هواء | Prenatal + Cupping | prenatal-cupping | 60 min | 348 | No |

### Category: بدكير ومنكير (Hands & Feet) — 1 service

| # | Name (AR) | SANO LUNA Equivalent (EN) | Slug | Duration | Price (SAR) | Popular |
|---|-----------|--------------------------|------|----------|-------------|---------|
| 16 | بديكير + منيكير | Manicure & Pedicure | manicure-pedicure | 60 min | 179 | No |

### Category: حمام مغربي (Moroccan Bath) — 1 service

| # | Name (AR) | SANO LUNA Equivalent (EN) | Slug | Duration | Price (SAR) | Popular |
|---|-----------|--------------------------|------|----------|-------------|---------|
| 17 | حمام مغربي | Moroccan Bath Ritual | moroccan-bath | 60 min | 169 | No |

### Category: باقات (Packages / Combined Experiences) — 5 services

| # | Name (AR) | SANO LUNA Equivalent (EN) | Slug | Duration | Price (SAR) | Popular | Guests |
|---|-----------|--------------------------|------|----------|-------------|---------|--------|
| 18 | مساج لكِ ولمن تحبين | Duo Massage Experience | duo-massage | 120 min | 270 | Yes | 2 |
| 19 | بديكير منيكير + مساج | Hands, Feet & Massage | hands-feet-massage | 120 min | 319 | Yes | 1 |
| 20 | حمام مغربي + مساج | Moroccan Bath & Massage | moroccan-massage | 120 min | 319 | Yes | 1 |
| 21 | بديكير منكير + حمام مغربي | Hands, Feet & Moroccan Bath | hands-feet-moroccan | 150 min | 349 | No | 1 |
| 22 | بديكير منكير + حمام مغربي + مساج | The Complete SANO LUNA Ritual | complete-ritual | 180 min | 449 | Yes | 1 |

**Total: 22 services discovered**

---

## 3. GIFT CARDS — Feature Analysis

### Reference Feature (tamamspa.com/gift-cards)
- 3-step flow: (1) Choose service/package → (2) Login → (3) Billing + payment
- Custom card artwork with sender name, recipient name, personalized message
- All services from catalog are giftable

### SANO LUNA Gift Card Architecture
```
gift_cards table:
  id, code, sender_name, sender_email
  recipient_name, recipient_email, recipient_phone
  message, selected_service_id, selected_package_id
  amount_sar, delivery_method (email/whatsapp)
  redeemed_at, expires_at, created_at
  status (pending_payment | active | redeemed | expired)
```

---

## 4. SANO LUNA SERVICE TAXONOMY

Original taxonomy (NOT copied from reference):

| SANO LUNA Category | Arabic Name | Description | Count |
|--------------------|-------------|-------------|-------|
| Massage Therapies | علاجات المساج | Core massage techniques from Swedish to therapeutic | 13 |
| Specialty Therapies | علاجات متخصصة | Cupping, lymphatic, hot stone | 3 |
| Moroccan Rituals | طقوس مغربية | Full body Moroccan bath rituals | 1 |
| Hands & Feet | العناية باليدين والقدمين | Manicure and pedicure services | 1 |
| Prenatal Care | رعاية الحامل | Specialized pregnancy-safe treatments | 2 |
| Combined Journeys | رحلات متكاملة | Multi-service curated packages | 5 (incl. duo) |

---

## 5. SUPABASE DATA ARCHITECTURE

### Tables Required
```sql
-- Core catalog
service_categories (id, name_ar, name_en, slug, description_ar, description_en, image_url, display_order, active)
services (id, category_id, name_ar, name_en, slug, description_ar, description_en, duration_minutes, price_sar, preparation_minutes, cleanup_minutes, image_url, is_featured, is_popular, is_active, sort_order)
service_benefits (id, service_id, benefit_ar, benefit_en, sort_order)
service_images (id, service_id, image_url, alt_ar, alt_en, is_primary, sort_order)

-- Packages
packages (id, name_ar, name_en, slug, description_ar, description_en, total_duration_minutes, price_sar, original_price_sar, discount_percentage, max_guests, image_url, is_featured, is_active, sort_order)
package_services (id, package_id, service_id, sort_order)

-- Gift Cards
gift_cards (id, code, sender_name, sender_email, recipient_name, recipient_email, recipient_phone, message, service_id, package_id, amount_sar, delivery_method, status, redeemed_at, expires_at, created_at)

-- Team
team_members (id, name_ar, name_en, title_ar, title_en, bio_ar, bio_en, image_url, specialties, years_experience, is_featured, sort_order, active)

-- Social proof
testimonials (id, author_name, author_initial, rating, review_ar, review_en, service_id, is_featured, is_published, verified, created_at)

-- Gallery
gallery_items (id, title_ar, title_en, image_url, category, tags, sort_order, active, created_at)

-- Content
faqs (id, question_ar, question_en, answer_ar, answer_en, category, sort_order, active)
```

---

## 6. SANO LUNA vs REFERENCE — Information Architecture

| Feature | Reference (tamamspa.com) | SANO LUNA | Status |
|---------|--------------------------|-----------|--------|
| Homepage hero | Image + Arabic headline + booking CTA | Premium visual hero + dual-language | Phase 4 |
| Service categories | Horizontal scroll rail | Editorial grid + category cards | Phase 4 |
| Featured services | API-driven carousel | Curated featured cards | Phase 4 |
| "Build your visit" | Combine services CTA | "Compose Your Experience" section | Phase 4 |
| How it works | 3 steps | 4 steps (expanded) | Phase 4 |
| Gift cards | 3-step flow + custom artwork | Gift card section + architecture | Phase 4 |
| About | Single page | About page | Phase 5 |
| Team | Not visible | Team preview | Phase 4 |
| Testimonials | Not visible | Testimonials section | Phase 4 |
| Gallery | Not visible | Atmosphere gallery | Phase 4 |
| FAQ | Not visible | FAQ preview | Phase 4 |
| Booking | Location-based flow | Appointment booking | Phase 5 |
| Reviews page | Not visible | /reviews | Phase 5 |
| Admin | Not visible | /admin (Phase 6+) | Future |

---

## 7. ROUTES — SANO LUNA

| Route | Description | Phase |
|-------|-------------|-------|
| / | Homepage | 4 |
| /services | All services catalog | 5 |
| /services/[slug] | Individual service detail | 5 |
| /packages | Packages catalog | 5 |
| /gift-cards | Gift card purchase | 5 |
| /team | Team page | 5 |
| /gallery | Gallery | 5 |
| /reviews | Testimonials | 5 |
| /about | About SANO LUNA | 5 |
| /contact | Contact | 5 |
| /faq | Full FAQ | 5 |
| /booking | Booking flow | 5 |
| /policies | Privacy & Terms | 5 |
| /admin | Admin panel | 6+ |

---

## 8. MISSING REAL BUSINESS INFORMATION (TBD)

The following MUST NOT be invented and require real business input:

- [ ] Actual phone number
- [ ] Actual WhatsApp number
- [ ] Actual email address
- [ ] Actual physical address / service area
- [ ] Actual opening hours
- [ ] Real team member names, photos, bios
- [ ] Real customer testimonials
- [ ] Real service images (photography)
- [ ] Real prices (if different from reference for SANO LUNA)
- [ ] Social media handles (@sanoluna - TBC)
- [ ] Business registration / certifications

---

## 9. IMPLEMENTATION STATUS

| Item | Status | File |
|------|--------|------|
| Content audit | ✅ Complete | docs/content-inventory.md |
| Service data structure | ✅ Complete | src/data/services.data.ts |
| Service categories | ✅ Complete | src/data/categories.data.ts |
| Packages data | ✅ Complete | src/data/packages.data.ts |
| Homepage | ✅ Complete | src/app/[locale]/page.tsx |
| Services catalog page | ⏳ Phase 5 | |
| Service detail page | ⏳ Phase 5 | |
| Packages page | ⏳ Phase 5 | |
| Gift cards page | ⏳ Phase 5 | |
| Supabase migrations | ⏳ Phase 5 | |
