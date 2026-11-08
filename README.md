# KÖZÜGY

Modern civic-tech platform for community issues — map-first, shareable, Hungarian UI.

**Brand:** KÖZÜGY · **Domain:** kozugy.info

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Geist font
- MapLibre GL (OpenFreeMap tiles)
- Netlify Database (Postgres) + Drizzle ORM
- Auth.js (email + Google + Facebook, roles in Netlify DB)

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

### Auth (Auth.js)

Email/password, Google and Facebook via Auth.js. Roles live in Netlify DB (`users.roles`: `user` | `moderator` | `admin`).

Set these on Netlify (and locally in `.env.local`):

```bash
AUTH_SECRET=              # openssl rand -base64 32
AUTH_URL=https://kozugy.info
ADMIN_EMAILS=you@example.com   # bootstrap admin role on signup/OAuth

# Google Cloud OAuth client (Web)
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
NEXT_PUBLIC_AUTH_GOOGLE=1

# Meta Facebook Login app
AUTH_FACEBOOK_ID=
AUTH_FACEBOOK_SECRET=
NEXT_PUBLIC_AUTH_FACEBOOK=1
```

OAuth redirect URIs:

- Google / Facebook: `https://kozugy.info/api/auth/callback/google` and `…/facebook`
- Local: `http://localhost:3000/api/auth/callback/google` (etc.)

`/admin` and `/api/admin/*` require `admin` or `moderator` role. Locally, **Fejlesztői belépés** still grants admin for UI testing.

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
