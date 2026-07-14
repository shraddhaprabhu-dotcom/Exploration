# UX Decisions (MVP)

Suggested patterns before implementation. Open to revision.

## 1. Quick Add: Command palette + button

**Recommendation:** Global **⌘K / Ctrl+K** Quick Add dialog, plus a visible
“Quick Add” button in the header (and a mobile FAB).

Why: Power users paste URLs constantly. A palette is faster than navigating to a form.
The button keeps discovery obvious for new users.

## 2. Product grid: Uniform shelf, not masonry

**Recommendation:** Consistent aspect-ratio cards in a responsive grid
(2 / 3 / 4 columns). Image fills a fixed media area; text sits below.

Why: Feels like objects on a shelf — calmer and more premium than Pinterest masonry.
Masonry can come later for moodboards.

## 3. Collection covers: Auto-derive, allow override

**Recommendation:** Default cover = first (or most recent) product image in the
collection. Users can upload a custom cover anytime.

Why: Removes empty-state friction; collections look rich immediately.

## 4. Status: Quiet visual cue on cards

**Recommendation:** Small status pill + optional left-edge color accent.
Do not bury status only in the detail page.

Why: Status is a core decision signal (“Want” vs “Buy Soon”). It should be scannable
in the grid without cluttering the image.

## 5. Favorites: Star + virtual shelf

**Recommendation:** Toggle favorite on the card (optimistic). Dashboard shows a
“Favorites” rail; no separate favorites table needed beyond `is_favorite`.

## 6. Filters: URL-driven sidebar / sheet

**Recommendation:** Filters live in the URL (`?status=want&tag=minimal&max=200`).
Desktop: collapsible filter rail. Mobile: bottom sheet.

Why: Shareable views, proper back-button behavior, less React state.

## 7. Empty states: Action-first

Every empty grid should offer one clear action (“Save your first product”) rather
than decorative illustration alone.

## 8. Landing vs app

Marketing `/` is brand-forward. Authenticated users hitting `/` should redirect to
`/dashboard` once auth lands.
