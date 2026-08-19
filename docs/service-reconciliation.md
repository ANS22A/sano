# SANO LUNA — Service Catalog Reconciliation
**Phase 5.1 — Final Audit · 2026-08-19**

---

## Summary

| Count | Item |
|-------|------|
| 22 | Reference items discovered |
| 17 | Standalone services (individual, bookable) |
| 5 | Packages (multi-service combinations) |
| 0 | Missing items |
| 17 | Supabase `services` table records |
| 5 | `content.data.ts` package records |
| 34 | SSG detail pages (17 slugs × 2 locales) |

---

## Complete Reference → SANO LUNA Mapping

| # | Reference (AR) | SANO LUNA Name | Slug | Type | DB | Route |
|---|---|---|---|---|---|---|
| 1 | مساج سويدي | Swedish Massage | `swedish-massage` | SERVICE | `services` | `/services/swedish-massage` |
| 2 | مساج تايلندي | Thai Massage | `thai-massage` | SERVICE | `services` | `/services/thai-massage` |
| 3 | مساج ريلاكس | Relaxation Massage | `relaxation-massage` | SERVICE | `services` | `/services/relaxation-massage` |
| 4 | مساج زيت دافئ | Warm Oil Massage | `warm-oil-massage` | SERVICE | `services` | `/services/warm-oil-massage` |
| 5 | مساج 4 تقنيات (60د) | Four-Technique Fusion | `four-technique-fusion` | SERVICE | `services` | `/services/four-technique-fusion` |
| 6 | مساج 4 تقنيات (70د) | Four-Technique Fusion Extended | `four-technique-fusion-extended` | VARIANT | `services` | `/services/four-technique-fusion-extended` |
| 7 | مساج 5 تقنيات | Five-Technique Fusion | `five-technique-fusion` | SERVICE | `services` | `/services/five-technique-fusion` |
| 8 | مساج 6 تقنيات | Six-Technique Signature | `six-technique-signature` | SERVICE | `services` | `/services/six-technique-signature` |
| 9 | مساج لمفاوي | Lymphatic Drainage | `lymphatic-drainage` | SERVICE | `services` | `/services/lymphatic-drainage` |
| 10 | كاسات الهواء | Cupping Therapy | `cupping-therapy` | SERVICE | `services` | `/services/cupping-therapy` |
| 11 | أحجار ساخنة (ريلاكس، 179 ريال) | Hot Stone Massage | `hot-stone-massage` | SERVICE | `services` | `/services/hot-stone-massage` |
| 12 | أحجار ساخنة (علاجي، 199 ريال) | Therapeutic Hot Stone | `hot-stone-therapeutic` | SERVICE | `services` | `/services/hot-stone-therapeutic` |
| 13 | لمفاوي + كاسات | Lymphatic & Cupping | `lymphatic-and-cupping` | COMBINATION | `services` | `/services/lymphatic-and-cupping` |
| 14 | الحمام المغربي | Moroccan Bath Ritual | `moroccan-bath` | SERVICE | `services` | `/services/moroccan-bath` |
| 15 | مانيكير وبديكير | Manicure & Pedicure | `manicure-pedicure` | SERVICE | `services` | `/services/manicure-pedicure` |
| 16 | مساج الحوامل | Prenatal Massage | `prenatal-massage` | SERVICE | `services` | `/services/prenatal-massage` |
| 17 | مساج حوامل + كاسات | Prenatal Massage & Cupping | `prenatal-massage-and-cupping` | COMBINATION | `services` | `/services/prenatal-massage-and-cupping` |
| 18 | لكِ ولمن تحبين | Duo Experience | `duo-massage` | PACKAGE | `content.data` | `/packages` |
| 19 | من الأطراف إلى الأعماق | From Fingertips to Soul | `hands-feet-massage` | PACKAGE | `content.data` | `/packages` |
| 20 | طقس المغرب والسكينة | Moroccan & Serenity Ritual | `moroccan-massage` | PACKAGE | `content.data` | `/packages` |
| 21 | الأناقة الكاملة | Complete Elegance | `hands-feet-moroccan` | PACKAGE | `content.data` | `/packages` |
| 22 | طقس سانو لونا الكامل | The SANO LUNA Ritual | `complete-ritual` | PACKAGE | `content.data` | `/packages` |

---

## Classification Key

| Type | Count | Definition |
|------|-------|------------|
| SERVICE | 13 | Single standalone bookable treatment |
| VARIANT | 1 | Same technique, different duration/price (#6) |
| COMBINATION | 2 | Two techniques in one session, one booking unit (#13, #17) |
| PACKAGE | 5 | Multi-service bundle, combines 2-3 services, 120–180 min (#18–22) |

**Combinations (#13, #17) are correctly in the `services` table** — each is a single-session booking.
**Packages (#18–22) belong in a separate `packages` table** — they bundle multiple services together.

---

## The 22 → 17 Difference

Items #18–22 are packages, not services. They are correctly NOT in the `services` table.

Items #1–17 are standalone services. They are all in the `services` table.

### The Previously Missing 17th Service

Phase 5 shipped with only 16 slugs despite the header comment saying 17.
The missing entry was **item #12: Therapeutic Hot Stone** (199 SAR, distinct from
item #11: Hot Stone Massage at 179 SAR which is relaxation-focused).

**Distinction:**
- `hot-stone-massage` — 179 SAR, relaxation + warmth, gentle technique
- `hot-stone-therapeutic` — 199 SAR, chronic tension treatment, deep tissue + heat

Added in Phase 5.1 to `services.data.ts` and seeded to Supabase on 2026-08-19.

---

## Supabase Final State

```
service_categories:  6 rows
services:           17 rows  ← corrected from 16
service_benefits:    0 rows (served from services.data.ts locally)
service_options:     0 rows
packages:            0 rows  (Phase 6 deliverable)
```

| Category | DB Records |
|----------|-----------|
| massage-therapies | 8 |
| specialty-therapies | 5 |
| moroccan-rituals | 1 |
| hands-feet | 1 |
| prenatal-care | 2 |
| combined-journeys | 0 (packages in content.data.ts) |
| **Total** | **17** |

---

## Final Architecture: OPTION B

```
17 standalone services
  → 17 DB records (services table)
  → 34 SSG pages (17 slugs × ar + en)
  → Sitemap: 17 slugs × 2 = 34 entries

5 packages
  → 5 records (content.data.ts packages[])
  → Displayed on /packages catalog
  → Phase 6: /packages/[slug] detail pages (10 SSG pages)

Total bookable items:  22
Missing:                0
Unaccounted:            0
```

---

## Build Validation

| Check | Result |
|-------|--------|
| `npm run lint` | 0 errors, 0 warnings |
| `npm run build` | Successful |
| SSG route | `/[locale]/services/[slug]` — 17 slugs |
| Sitemap | /sitemap.xml — all 17 service slugs included |
| TypeScript | Clean |

---

## Phase 6 Package Requirements

- [ ] `packages` Supabase migration + 5 seed records
- [ ] `/packages/[slug]` detail pages with generateStaticParams
- [ ] Package SEO metadata
- [ ] Package booking flow (`/booking?package=[slug]`)
- [ ] Package → included services relationship

