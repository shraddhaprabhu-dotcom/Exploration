# Stash Architecture

Personal shopping inspiration manager — a visual library for products you love.
Not ecommerce. Not a marketplace. Think Notion + Pinterest for saved products.

## Tech Stack

| Layer | Choice |
| --- | --- |
| Frontend | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase (Auth, Postgres, Storage) |
| Data fetching | TanStack React Query |
| Forms | React Hook Form + Zod |
| Icons | Lucide |
| Deploy | Vercel |

## High-level Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Next.js App (Vercel)                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ Marketing   │  │ Auth routes  │  │ App shell      │  │
│  │ /           │  │ /login       │  │ /dashboard     │  │
│  │             │  │ /signup      │  │ /collections   │  │
│  └─────────────┘  └──────────────┘  │ /products/:id  │  │
│                                      │ /search        │  │
│  React Query ←→ Server Actions /     └────────────────┘  │
│                 Route Handlers                          │
└──────────────────────────┬──────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │        Supabase         │
              │  Auth · Postgres · S3   │
              └─────────────────────────┘
```

## Folder Structure

```
src/
  app/
    (auth)/                 # Public auth pages (no app chrome)
      login/
      signup/
    (app)/                  # Authenticated app shell
      layout.tsx            # Sidebar + top bar
      dashboard/
      collections/
      products/[id]/
      search/
      settings/
    page.tsx                # Marketing landing
    layout.tsx              # Root providers + fonts
  components/
    ui/                     # shadcn primitives only
    layout/                 # App shell pieces (sidebar, header)
    products/               # ProductCard, ProductGrid, StatusBadge
    collections/            # CollectionCard, CollectionGrid
    shared/                 # Cross-cutting UI (EmptyState, QuickAdd)
  features/                 # Feature modules (hooks, forms, views)
    auth/
    dashboard/
    products/
    collections/
    search/
  hooks/                    # Shared React hooks
  lib/
    supabase/               # Browser, server, middleware clients
    validations/            # Zod schemas
    utils.ts
    constants.ts
  providers/                # QueryClient, theme, toaster
  types/                    # Domain TypeScript types
supabase/
  migrations/               # SQL schema + RLS policies
docs/
  ARCHITECTURE.md
```

### Why this layout

- **Route groups** separate marketing, auth, and app chrome without URL noise.
- **`components/ui`** stays pure shadcn; product/collection UI lives beside features.
- **`features/`** holds domain logic (forms, queries, view compositions) so pages stay thin.
- **`lib/supabase`** isolates client creation for browser vs server vs middleware.
- **`supabase/migrations`** keeps schema versioned and reviewable before a live project is wired.

## Data Model (MVP)

```
profiles ──┐
           ├── collections ──┐
           │                 ├── collection_products ── products
           ├── products ─────┤
           │                 └── product_tags ── tags
           └── tags ─────────┘
```

- **products**: title, image, brand, price, currency, store, url, notes, status, is_favorite, user_id
- **collections**: name, description, cover_image_url, user_id
- **tags**: name, user_id (unique per user)
- **collection_products** / **product_tags**: many-to-many join tables
- **profiles**: extends `auth.users` (display name, avatar)

Statuses: `want` | `maybe` | `buy_soon` | `purchased` | `archived`

Storage buckets (planned): `product-images`, `collection-covers`, `screenshots`

## Auth Strategy

- Supabase Auth with Google OAuth + email/password
- Session via `@supabase/ssr` cookies
- Middleware protects `(app)` routes
- RLS on every table: `user_id = auth.uid()`

## State Strategy

- Server Components for initial page shells where possible
- React Query for client interactive lists/filters/search
- React Hook Form + Zod for create/edit forms
- URL search params for filter/search state (shareable, back-button friendly)

## Design System Direction

Calm gallery shelf: soft cool mist backgrounds, large imagery, rounded corners,
soft shadows, generous whitespace. Display serif for brand moments; clean sans for UI.

Light mode is the default product experience. Dark tokens exist for future use
but are not the primary surface.

## Incremental Build Order

1. **Foundation** (this PR) — scaffold, design tokens, types, schema, shell, mock UI
2. **Authentication** — Google + email login, protected routes
3. **Collections CRUD** — create/edit/browse collections
4. **Save Product** — manual add + URL paste (metadata extraction later)
5. **Product Detail** — full product page + status/tags
6. **Dashboard** — recent saves, favorites, recently viewed
7. **Search & Filters** — full-text + facet filters
8. **Images** — Supabase Storage uploads + screenshot save

## Future-proofing (do not build yet)

Schema and folder layout leave room for:

- Browser extension (API routes under `/api/v1`)
- AI auto-tagging (nullable `ai_tags` / enrichment jobs table)
- Price tracking (`price_history`)
- Shared collections (`collection_members`)
- Moodboards / outfit builder (new feature modules, same product entity)
