import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { ProductGrid } from "@/components/products/product-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { PRODUCT_IMAGE_FALLBACK } from "@/lib/constants";
import { MOCK_COLLECTIONS, MOCK_PRODUCTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return MOCK_COLLECTIONS.map((c) => ({ id: c.id }));
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = MOCK_COLLECTIONS.find((c) => c.id === id);
  if (!collection) notFound();

  const products = MOCK_PRODUCTS.filter((p) =>
    p.collections.some((c) => c.id === id)
  );
  const cover = collection.resolved_cover_url || PRODUCT_IMAGE_FALLBACK;

  return (
    <>
      <AppHeader title={collection.name} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-8">
        <section className="relative mb-10 overflow-hidden rounded-3xl">
          <div className="relative aspect-[21/9] min-h-48 w-full bg-muted md:aspect-[3/1]">
            <Image
              src={cover}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="100vw"
              unoptimized={cover.startsWith("data:")}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
              <p className="text-sm text-white/75">
                {collection.item_count}{" "}
                {collection.item_count === 1 ? "item" : "items"}
              </p>
              <h1 className="mt-1 font-heading text-4xl tracking-tight text-white md:text-5xl">
                {collection.name}
              </h1>
              {collection.description && (
                <p className="mt-2 max-w-xl text-sm text-white/85 md:text-base">
                  {collection.description}
                </p>
              )}
            </div>
          </div>
        </section>

        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <EmptyState
            title="Nothing on this shelf yet"
            description="Save a product and add it to this collection."
            action={
              <Link href="/dashboard" className={cn(buttonVariants())}>
                Go to dashboard
              </Link>
            }
          />
        )}
      </main>
    </>
  );
}

