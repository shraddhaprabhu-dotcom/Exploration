import type {
  CollectionWithMeta,
  ProductWithRelations,
} from "@/types";

const now = Date.now();
const daysAgo = (n: number) => new Date(now - n * 86_400_000).toISOString();

/** Demo data for foundation UI — replaced by Supabase queries in later features */
export const MOCK_PRODUCTS: ProductWithRelations[] = [
  {
    id: "p1",
    user_id: "demo",
    title: "Ceramic Pour-Over Set",
    image_url:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
    brand: "Kinto",
    price: 68,
    currency: "USD",
    store: "Kinto US",
    product_url: "https://example.com/kinto",
    notes: "For the morning ritual corner.",
    status: "want",
    is_favorite: true,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    last_viewed_at: daysAgo(0),
    tags: [
      { id: "t1", user_id: "demo", name: "Kitchen", created_at: daysAgo(30) },
      { id: "t2", user_id: "demo", name: "Minimal", created_at: daysAgo(30) },
    ],
    collections: [{ id: "c1", name: "Apartment" }],
  },
  {
    id: "p2",
    user_id: "demo",
    title: "Linen Wide-Leg Trousers",
    image_url:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
    brand: "Everlane",
    price: 98,
    currency: "USD",
    store: "Everlane",
    product_url: "https://example.com/trousers",
    notes: "Natural flax — summer travel.",
    status: "buy_soon",
    is_favorite: true,
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
    last_viewed_at: daysAgo(1),
    tags: [
      { id: "t3", user_id: "demo", name: "Summer", created_at: daysAgo(30) },
      { id: "t4", user_id: "demo", name: "Travel", created_at: daysAgo(30) },
    ],
    collections: [{ id: "c2", name: "Summer Wardrobe" }],
  },
  {
    id: "p3",
    user_id: "demo",
    title: "Oak Desk Lamp",
    image_url:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
    brand: "HAY",
    price: 145,
    currency: "USD",
    store: "HAY",
    product_url: "https://example.com/lamp",
    notes: "Warm light for evening reading.",
    status: "maybe",
    is_favorite: false,
    created_at: daysAgo(4),
    updated_at: daysAgo(4),
    last_viewed_at: daysAgo(3),
    tags: [
      { id: "t5", user_id: "demo", name: "Scandinavian", created_at: daysAgo(30) },
    ],
    collections: [
      { id: "c1", name: "Apartment" },
      { id: "c4", name: "Office Setup" },
    ],
  },
  {
    id: "p4",
    user_id: "demo",
    title: "Packable Daypack 20L",
    image_url:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
    brand: "Bellroy",
    price: 129,
    currency: "USD",
    store: "Bellroy",
    product_url: "https://example.com/daypack",
    notes: "Carry-on friendly for Japan.",
    status: "want",
    is_favorite: false,
    created_at: daysAgo(5),
    updated_at: daysAgo(5),
    last_viewed_at: null,
    tags: [
      { id: "t4", user_id: "demo", name: "Travel", created_at: daysAgo(30) },
    ],
    collections: [{ id: "c5", name: "Japan Trip" }],
  },
  {
    id: "p5",
    user_id: "demo",
    title: "Wool Throw Blanket",
    image_url:
      "https://images.unsplash.com/photo-1584100936595-4f809e1280c4?w=800&q=80",
    brand: "H&M Home",
    price: 49,
    currency: "USD",
    store: "H&M",
    product_url: "https://example.com/throw",
    notes: null,
    status: "purchased",
    is_favorite: false,
    created_at: daysAgo(12),
    updated_at: daysAgo(8),
    last_viewed_at: daysAgo(8),
    tags: [
      { id: "t2", user_id: "demo", name: "Minimal", created_at: daysAgo(30) },
    ],
    collections: [{ id: "c1", name: "Apartment" }],
  },
  {
    id: "p6",
    user_id: "demo",
    title: "Ceramic Dinner Plates (Set of 4)",
    image_url:
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&q=80",
    brand: "East Fork",
    price: 160,
    currency: "USD",
    store: "East Fork",
    product_url: "https://example.com/plates",
    notes: "Birthday wishlist — Eggshell glaze.",
    status: "want",
    is_favorite: true,
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
    last_viewed_at: daysAgo(2),
    tags: [
      { id: "t1", user_id: "demo", name: "Kitchen", created_at: daysAgo(30) },
      { id: "t6", user_id: "demo", name: "White", created_at: daysAgo(30) },
    ],
    collections: [{ id: "c3", name: "Birthday Wishlist" }],
  },
];

export const MOCK_COLLECTIONS: CollectionWithMeta[] = [
  {
    id: "c1",
    user_id: "demo",
    name: "Apartment",
    description: "Quiet pieces for home.",
    cover_image_url: null,
    created_at: daysAgo(40),
    updated_at: daysAgo(1),
    item_count: 3,
    resolved_cover_url:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
  },
  {
    id: "c2",
    user_id: "demo",
    name: "Summer Wardrobe",
    description: "Light layers and linen.",
    cover_image_url: null,
    created_at: daysAgo(20),
    updated_at: daysAgo(2),
    item_count: 1,
    resolved_cover_url:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
  },
  {
    id: "c3",
    user_id: "demo",
    name: "Birthday Wishlist",
    description: "Things worth waiting for.",
    cover_image_url: null,
    created_at: daysAgo(15),
    updated_at: daysAgo(3),
    item_count: 1,
    resolved_cover_url:
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&q=80",
  },
  {
    id: "c4",
    user_id: "demo",
    name: "Office Setup",
    description: "Desk, light, focus.",
    cover_image_url: null,
    created_at: daysAgo(25),
    updated_at: daysAgo(4),
    item_count: 1,
    resolved_cover_url:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
  },
  {
    id: "c5",
    user_id: "demo",
    name: "Japan Trip",
    description: "Gear and gifts for the trip.",
    cover_image_url: null,
    created_at: daysAgo(10),
    updated_at: daysAgo(5),
    item_count: 1,
    resolved_cover_url:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
  },
];

