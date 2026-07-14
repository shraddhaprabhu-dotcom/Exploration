import Image from "next/image";
import Link from "next/link";
import { PRODUCT_IMAGE_FALLBACK } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { CollectionWithMeta } from "@/types";

export function CollectionCard({
  collection,
  className,
}: {
  collection: CollectionWithMeta;
  className?: string;
}) {
  const cover = collection.resolved_cover_url || PRODUCT_IMAGE_FALLBACK;

  return (
    <Link
      href={`/collections/${collection.id}`}
      className={cn(
        "group block overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.08)]",
        className
      )}
    >
      <div className="relative aspect-[5/4] overflow-hidden bg-muted">
        <Image
          src={cover}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          unoptimized={cover.startsWith("data:")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <h3 className="font-heading text-xl tracking-tight">{collection.name}</h3>
          <p className="mt-0.5 text-xs text-white/80">
            {collection.item_count} {collection.item_count === 1 ? "item" : "items"}
          </p>
        </div>
      </div>
      {collection.description && (
        <p className="line-clamp-2 px-4 py-3 text-sm text-muted-foreground">
          {collection.description}
        </p>
      )}
    </Link>
  );
}

