import type { CollectionWithMeta } from "@/types";
import { CollectionCard } from "@/components/collections/collection-card";
import { cn } from "@/lib/utils";

export function CollectionGrid({
  collections,
  className,
}: {
  collections: CollectionWithMeta[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3",
        className
      )}
    >
      {collections.map((collection, index) => (
        <div
          key={collection.id}
          className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
          style={{
            animationDelay: `${Math.min(index, 6) * 50}ms`,
            animationDuration: "450ms",
          }}
        >
          <CollectionCard collection={collection} />
        </div>
      ))}
    </div>
  );
}

