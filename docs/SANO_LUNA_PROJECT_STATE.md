# SANO LUNA Project State

## Google Search Console Verification

- **Verification File Added:** `public/googlec1cf07970a09aaec.html`
- **File Content:** `google-site-verification: googlec1cf07970a09aaec.html`
- **Exact Public Verification URL:** `https://sano-ashy.vercel.app/googlec1cf07970a09aaec.html`
- **Integrity Rule:** The verification file must NOT be renamed, transformed, or have its content modified.
- **Middleware Exemption:** `src/proxy.ts` matcher excludes `google[a-z0-9]+\.html` and static extensions (`.*\\..*`), ensuring direct HTTP 200 static file serving without authentication or locale redirects.
- **SEO & Indexing:**
  - `robots.txt`: Managed via App Router `src/app/robots.ts` (Allows public crawling `/`, disallows `/admin` and `/api`, points to `https://sano-ashy.vercel.app/sitemap.xml`).
  - `sitemap.xml`: Managed via App Router `src/app/sitemap.ts` (Provides localized alternate URLs across `ar` and `en` for all static and catalog routes).
- **Build Verification:** `npm run build` passed with exit code 0 (47/47 routes generated).
- **Runtime Verification:** `GET /googlec1cf07970a09aaec.html` returned HTTP 200 with exact verification token.
