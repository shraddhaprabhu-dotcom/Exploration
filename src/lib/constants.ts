import type { ProductStatus } from "@/types";

export const APP_NAME = "Stash";
export const APP_TAGLINE = "Your shelf for everything you love.";

export const STATUS_ACCENT: Record<ProductStatus, string> = {
  want: "bg-teal-600",
  maybe: "bg-amber-500",
  buy_soon: "bg-sky-600",
  purchased: "bg-emerald-600",
  archived: "bg-stone-400",
};

export const STATUS_BADGE_CLASS: Record<ProductStatus, string> = {
  want: "bg-teal-50 text-teal-800 border-teal-200",
  maybe: "bg-amber-50 text-amber-800 border-amber-200",
  buy_soon: "bg-sky-50 text-sky-800 border-sky-200",
  purchased: "bg-emerald-50 text-emerald-800 border-emerald-200",
  archived: "bg-stone-100 text-stone-600 border-stone-200",
};

/** Placeholder image when a product has no photo */
export const PRODUCT_IMAGE_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='1000' viewBox='0 0 800 1000'%3E%3Crect fill='%23e7e5e4' width='800' height='1000'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23a8a29e' font-family='system-ui' font-size='28'%3ENo image%3C/text%3E%3C/svg%3E";
