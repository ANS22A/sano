# SANO LUNA

Premium luxury wellness and spa website foundation.

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Database**: Supabase
- **Internationalization**: next-intl (Arabic & English, RTL/LTR)
- **Animations**: Framer Motion & GSAP
- **Forms**: React Hook Form + Zod

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env.local` and fill in the required variables:
   ```bash
   cp .env.example .env.local
   ```
   *Note: Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are provided from your Supabase project.*

3. **Supabase Initialization**
   The project is prepared for Supabase. Database types are generated in `src/types/database.types.ts` based on the initial schema planning. Make sure your local or remote Supabase instance matches these types before production.

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Folder Structure

- `src/app/[locale]` - Next.js App Router root with localized pages
- `src/components/ui` - Reusable shadcn/ui components
- `src/components/layout` - Layout components (Header, Footer, etc.)
- `src/components/shared` - Shared UI logic (Locale switcher, RTL provider)
- `src/lib/supabase` - Supabase clients (Browser, Server, Admin)
- `src/services` - Data access layer for backend interactions
- `messages` - Translation files (`ar.json`, `en.json`)

## UI/UX Pro Max Skill
This project uses the `ui-ux-pro-max` skill for design intelligence. It is configured in the `.agents/skills` directory.

## 21st.dev Setup
To discover and use high-quality React components, ensure you have the CLI installed globally:
```bash
npm i -g @21st-dev/cli
21st login
```

## Localization
The default locale is Arabic (`ar`), and English (`en`) is supported. Navigation and routing should exclusively use the wrappers from `src/i18n/navigation.ts`. 

RTL direction is automatically applied based on the selected language in the root layout.
