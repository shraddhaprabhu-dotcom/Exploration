import type { ProductWithRelations } from "@/types";
import { ProductCard } from "@/components/products/product-card";
import { cn } from "@/lib/utils";

export function ProductGrid({
  products,
  className,
}: {
  products: ProductWithRelations[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4",
        className
      )}
    >
      {products.map((product, index) => (
        <div
          key={product.id}
          className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
          style={{
            animationDelay: `${Math.min(index, 8) * 40}ms`,
            animationDuration: "400ms",
          }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}

