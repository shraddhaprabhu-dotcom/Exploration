import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { StatusBadge } from "@/components/products/status-badge";
import { PRODUCT_IMAGE_FALLBACK, STATUS_ACCENT } from "@/lib/constants";
import { formatPrice, formatRelativeDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProductWithRelations } from "@/types";

interface ProductCardProps {
  product: ProductWithRelations;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const imageSrc = product.image_url || PRODUCT_IMAGE_FALLBACK;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.08)]",
        className
      )}
    >
      <div
        className={cn("absolute inset-y-0 left-0 z-10 w-1", STATUS_ACCENT[product.status])}
        aria-hidden
      />

      <Link href={`/products/${product.id}`} className="relative block aspect-[4/5] overflow-hidden bg-muted">
        <Image
          src={imageSrc}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          unoptimized={imageSrc.startsWith("data:")}
        />
        {product.is_favorite && (
          <span className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow-sm backdrop-blur">
            <Heart className="size-3.5 fill-current" />
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4 pl-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {product.brand && (
              <p className="truncate text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {product.brand}
              </p>
            )}
            <Link
              href={`/products/${product.id}`}
              className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors hover:text-primary"
            >
              {product.title}
            </Link>
          </div>
          <p className="shrink-0 text-sm font-semibold tabular-nums">
            {formatPrice(product.price, product.currency)}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          <StatusBadge status={product.status} />
          {product.store && (
            <span className="truncate text-xs text-muted-foreground">
              {product.store}
            </span>
          )}
        </div>

        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] text-secondary-foreground"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
          <span className="truncate">
            {product.collections.map((c) => c.name).join(", ") || "Unsorted"}
          </span>
          <time dateTime={product.created_at}>
            {formatRelativeDate(product.created_at)}
          </time>
        </div>
      </div>
    </article>
  );
}

