# Architecture

One Next.js app (one process to deploy), split into three layers under `src/`.

```
app/                      ← Next.js routing only (thin files, no logic)
├─ (site)/…/page.tsx      → re-exports a page from src/frontend/modules/site/pages
├─ admin/…/page.tsx       → guard + backend query + frontend screen
└─ api/…/route.ts         → re-exports handlers from src/backend/modules/*/controllers

src/
├─ frontend/              ← UI only (React). Never imports backend runtime code.
│  ├─ modules/
│  │  ├─ site/            public pages, sections, SEO helpers
│  │  ├─ reservation/     booking flow (calendar, Stripe step, confirmation)
│  │  └─ admin/
│  │     ├─ screens/      one server component per admin page (pure rendering)
│  │     ├─ components/   interactive client components
│  │     └─ lib/          fetch helper for /api/admin, labels
│  ├─ shared/components/  Navbar, Footer, PageHero, CTABand…
│  └─ styles/             globals.css (site), admin.css
│
├─ backend/               ← server only (database, Stripe, e-mails, auth)
│  ├─ core/               db (Prisma client), http helpers, phone normalisation
│  ├─ modules/
│  │  ├─ appointments/    creation calendar: booking, move, cancel, reminders
│  │  ├─ schedule/        opening days, single/double slots, availability
│  │  ├─ alterations/     private alterations calendar
│  │  ├─ customers/       CRM, CSV export
│  │  ├─ mailing/         Resend e-mails, templates, campaigns
│  │  ├─ payments/        Stripe (SetupIntent, €20 charge)
│  │  └─ auth/            admin session, page guards, login/logout
│  │     each module:  *.service.ts   business logic
│  │                   *.queries.ts   data for admin pages
│  │                   controllers/   HTTP handlers (Request → Response)
│  └─ scripts/            seed, admin accounts, Amelia SQL import
│
└─ shared/                ← used by both sides (no server-only code)
   ├─ reservation/        service catalogue, types, form validation
   ├─ admin/types.ts      admin data shapes (DTOs)
   ├─ siteData.ts         atelier name, address, phone
   └─ tz.ts               Europe/Paris date helpers

prisma/                   schema + migrations (kept at the root, Prisma convention)
docs/                     deployment, staff guide, this file
```

## Import aliases

| Alias | Folder |
| --- | --- |
| `@frontend/*` | `src/frontend/*` |
| `@backend/*` | `src/backend/*` |
| `@shared/*` | `src/shared/*` |

## Rules

- `frontend` may import `shared`, and **types only** from `backend` (`import type`).
- `backend` may import `shared`, never `frontend`.
- `app/` files stay thin: routing, guards and wiring only.
- New feature = new folder in `src/backend/modules/` and/or `src/frontend/modules/`.
