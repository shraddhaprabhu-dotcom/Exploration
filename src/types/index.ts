/**
 * Domain types for Stash.
 * Keep these aligned with supabase/migrations.
 */

export const PRODUCT_STATUSES = [
  "want",
  "maybe",
  "buy_soon",
  "purchased",
  "archived",
] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  want: "Want",
  maybe: "Maybe",
  buy_soon: "Buy Soon",
  purchased: "Purchased",
  archived: "Archived",
};

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  title: string;
  image_url: string | null;
  brand: string | null;
  price: number | null;
  currency: string;
  store: string | null;
  product_url: string | null;
  notes: string | null;
  status: ProductStatus;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  last_viewed_at: string | null;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface CollectionProduct {
  collection_id: string;
  product_id: string;
  added_at: string;
}

export interface ProductTag {
  product_id: string;
  tag_id: string;
}

/** Product with joined relations for UI cards and detail views */
export interface ProductWithRelations extends Product {
  tags: Tag[];
  collections: Pick<Collection, "id" | "name">[];
}

/** Collection with computed fields for grid cards */
export interface CollectionWithMeta extends Collection {
  item_count: number;
  /** Resolved cover: custom cover or first product image */
  resolved_cover_url: string | null;
}

export interface ProductFilters {
  query?: string;
  status?: ProductStatus[];
  brands?: string[];
  stores?: string[];
  collectionIds?: string[];
  tagIds?: string[];
  priceMin?: number;
  priceMax?: number;
  dateFrom?: string;
  dateTo?: string;
  favoritesOnly?: boolean;
}

