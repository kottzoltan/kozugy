# KÖZÜGY

Modern civic-tech platform for community issues — map-first, shareable, Hungarian UI.

**Brand:** KÖZÜGY · **Domain:** kozosugyunk.hu

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Geist font
- Mock data only (no backend yet)

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Main routes

| Route | Page |
|-------|------|
| `/` | Homepage |
| `/terkep` | Full map + filters |
| `/ugy/[slug]` | Issue detail |
| `/uj-ugy` | New issue wizard |
| `/cikk/[slug]` | Article |
| `/admin` | Admin dashboard |

## Scripts

- `npm run build` — production build
- `npm run lint` — ESLint
