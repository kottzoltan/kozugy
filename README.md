# KÖZÜGY

Modern civic-tech platform for community issues — map-first, shareable, Hungarian UI.

**Brand:** KÖZÜGY · **Domain:** kozugy.info

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Geist font
- MapLibre GL (OpenFreeMap tiles)
- Netlify Database (Postgres) + Drizzle ORM
- Netlify Identity (`@netlify/identity`)

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database (local)

Requires Netlify CLI 26+ and a linked site:

```bash
npx netlify link
npx netlify database init --yes   # first time
npm run db:migrate                # apply migrations to local DB
npx netlify dev                   # app + local Postgres
```

Without a local DB the UI falls back to mock data; `ENGEM IS ÉRINT` still works via fejlesztői belépés.

### Identity

Identity **does not** run under plain `next dev` / `netlify dev`. On Netlify deploy:

1. Project configuration → Identity → enable
2. Optionally enable Google under External providers
3. Autoconfirm can be turned on for easier testing

Locally use **Fejlesztői belépés** in the login modal.

## Main routes

| Route | Page |
|-------|------|
| `/` | Homepage |
| `/terkep` | Full map + filters |
| `/ugy/[slug]` | Issue detail |
| `/uj-ugy` | New issue wizard |
| `/cikk/[slug]` | Article |
| `/admin` | Admin dashboard |
| `/api/issues` | Issue list JSON |
| `/api/issues/[slug]/support` | Persist support |

## Scripts

- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run db:generate` — Drizzle migration from `db/schema.ts`
- `npm run db:migrate` — apply migrations to **local** DB only
