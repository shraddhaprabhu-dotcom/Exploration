# Stash

Personal shopping inspiration manager — a visual library for products you love.

> Working title. Not ecommerce. Not a marketplace.

## Stack

- **Next.js** (App Router) + TypeScript
- **Tailwind CSS** + **shadcn/ui**
- **Supabase** (Auth, Postgres, Storage) — schema ready, credentials optional for UI demo
- **TanStack React Query**
- **React Hook Form** + **Zod**
- **Lucide** icons

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in when wiring Supabase
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app currently runs on **mock data** so you can explore the shelf UI without a Supabase project. Auth and persistence land in the next increments.

## Docs

- [Architecture](./docs/ARCHITECTURE.md)
- [UX decisions](./docs/UX_DECISIONS.md)
- Database migration: `supabase/migrations/20260326000000_init.sql`

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |

## Build order

1. Foundation ← you are here
2. Authentication (Google + email)
3. Collections CRUD
4. Save product
5. Product detail (live data)
6. Dashboard (live data)
7. Search & filters
8. Image uploads
