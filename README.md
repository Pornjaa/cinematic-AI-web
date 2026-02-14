# Cinematic AI (Next.js + Prisma + Netlify)

Bilingual (TH/EN) full-stack platform with:
- Public SEO pages: Home, Showreel, Articles, Courses, Free Tutorials
- Member area: My Courses + Learn player + lesson progress
- Admin CMS: hero/FAQ, showreel, articles, courses/curriculum, free tutorials, settings, order review
- Payment abstraction: Omise/Stripe gateway + manual slip verification
- Direct upload architecture for media/slips via signed S3-compatible URL

## 1) Tech Stack
- Next.js App Router + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma
- Auth.js / NextAuth (Credentials + optional Google)
- Storage adapter: S3-compatible signed upload
- Video adapter: Mux (ingest module)
- Notification: Telegram bot (+ email fallback log hook)

## 2) Repo Structure

```text
app/
  admin/
    articles/ courses/ free-tutorials/ home/ orders/ settings/ showreel/
  api/
    admin/{mux/ingest,order-review,reorder}
    auth/[...nextauth]
    comments locale payments/{initiate,slip-submit,webhook} progress register upload/signed-url
  articles/ courses/ free-tutorials/ learn/ login/ my-courses/ register/ showreel/
  layout.tsx page.tsx robots.ts sitemap.ts template.tsx
components/
  admin/ blocks/ jsonld/ layout/ shared/ ui/
lib/
  adapters/ payments/ validators/
  db.ts i18n.ts rbac.ts rate-limit.ts seo.ts services.ts
prisma/
  schema.prisma
  migrations/20260204000000_init/migration.sql
  seed.ts
```

## 3) Local Setup

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

Seed admin:
- Email: `admin@cinematic.ai`
- Password: `Admin1234!`

## 4) Environment Variables
Set these in local `.env` and Netlify UI:

### Core
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID` (optional)
- `GOOGLE_CLIENT_SECRET` (optional)

### Storage (S3 compatible)
- `AWS_REGION`
- `AWS_S3_BUCKET`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_ENDPOINT` (optional, for R2/MinIO)
- `AWS_S3_PUBLIC_BASE_URL`

### Video (Mux)
- `MUX_TOKEN_ID`
- `MUX_TOKEN_SECRET`

### Payments
- `PAYMENT_PROVIDER` (`omise` or `stripe`)
- `OMISE_PUBLIC_KEY`
- `OMISE_SECRET_KEY`
- `OMISE_WEBHOOK_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### Notification
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_ADMIN_CHAT_ID`
- `ADMIN_FALLBACK_EMAIL`

## 5) Payment Flow (Abstraction)

Provider factory: `lib/payments/factory.ts`
- Default: Omise provider
- Switch to Stripe by `PAYMENT_PROVIDER=stripe`

### Gateway mode
1. User clicks buy
2. `POST /api/payments/initiate`
3. Create order `PENDING_PAYMENT`
4. Provider checkout URL returned
5. Webhook `POST /api/payments/webhook` marks paid + enrollment

### Manual slip mode
1. User clicks manual mode
2. Create order `PENDING_VERIFICATION`
3. Client requests signed URL `POST /api/upload/signed-url`
4. Direct PUT upload to object storage
5. Submit slip metadata to `POST /api/payments/slip-submit`
6. Telegram notify admin + admin review page
7. Admin approve/reject at `/admin/orders`
8. Approve => enrollment created immediately

## 6) SEO / AEO
- Canonical + metadata per public route (`lib/seo.ts`)
- JSON-LD components:
  - FAQPage: home
  - Article: article detail
  - Course: course detail
- `app/sitemap.ts` dynamic URLs from DB
- `app/robots.ts` disallow protected routes (`/admin`, `/my-courses`, `/learn`)

## 7) Netlify Deployment

Already included:
- `netlify.toml`
- `@netlify/plugin-nextjs`

Deploy steps:
1. Push to git provider connected to Netlify
2. In Netlify UI set env vars from section 4
3. Build command: `npm run build`
4. Publish dir: `.next` (plugin handles Next runtime)

## 8) Netlify Constraints + Design Choices
- **Function payload/limits**: avoid large uploads through functions
- **Implemented**: direct upload via signed URL to object storage
- Backend only receives metadata/URL (small payload)
- Webhook + payment initiation endpoints are small/fast
- Heavy video handling delegated to Mux

## 9) Security Checklist
- RBAC guard (`ADMIN` vs `STUDENT`) on protected routes
- Server-side auth checks in admin/member pages
- Zod validation on API payloads
- Basic rate limit on register/comment/payment/webhook
- Secrets remain server-side only
- Sanitized logger helper for sensitive keys

## 10) QA / Test Checklist
- [ ] Register/login (credentials)
- [ ] Optional Google OAuth login
- [ ] Create home slides + FAQ from admin and verify on `/`
- [ ] Add showreel/article/course/free tutorial and verify public pages
- [ ] Buy course via gateway mock flow
- [ ] Buy course via manual slip flow (direct upload + admin approve)
- [ ] Verify `/my-courses` and `/learn/[slug]` access guard
- [ ] Verify progress toggle persists
- [ ] Verify sitemap + robots output
- [ ] Verify metadata/JSON-LD in page source

## 11) Milestones Plan (Safe Build Order)
1. Foundation: project scaffold, Prisma schema, auth/RBAC, env + adapters
2. Public content: home/showreel/articles/courses/free tutorials + SEO/AEO
3. Admin CMS: create/manage content + curriculum with reorder
4. Payments: provider abstraction, webhook, manual slip review flow + notifications
5. Learning area: enrollments, guarded lesson delivery, progress tracking
6. Hardening: validation/rate limits/logging, noindex rules, deployment docs

