import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { ProductGrid } from "@/components/products/product-grid";
import { CollectionGrid } from "@/components/collections/collection-grid";
import { SectionHeader } from "@/components/shared/section-header";
import { buttonVariants } from "@/components/ui/button";
import { MOCK_COLLECTIONS, MOCK_PRODUCTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  const recent = MOCK_PRODUCTS.slice(0, 4);
  const favorites = MOCK_PRODUCTS.filter((p) => p.is_favorite);
  const recentlyViewed = MOCK_PRODUCTS.filter((p) => p.last_viewed_at).slice(
    0,
    4
  );
  const collections = MOCK_COLLECTIONS.slice(0, 3);

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-12 px-4 py-8 md:px-8">
        <section className="animate-in fade-in duration-500">
          <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Welcome back
          </p>
          <h1 className="mt-1 font-heading text-4xl tracking-tight text-foreground md:text-5xl">
            Your shelf
          </h1>
          <p className="mt-2 max-w-lg text-muted-foreground">
            Recent saves, favorites, and collections — everything you love in one
            calm place.
          </p>
        </section>

        <section>
          <SectionHeader
            title="Recent saves"
            description="Latest products added to your library"
            action={
              <Link
                href="/search"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                View all
              </Link>
            }
          />
          <ProductGrid products={recent} />
        </section>

        <section>
          <SectionHeader
            title="Collections"
            description="Organize inspiration by mood, trip, or room"
            action={
              <Link
                href="/collections"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Browse all
              </Link>
            }
          />
          <CollectionGrid collections={collections} />
        </section>

        <section>
          <SectionHeader
            title="Favorites"
            description="Starred items you keep coming back to"
          />
          <ProductGrid products={favorites} />
        </section>

        <section>
          <SectionHeader
            title="Recently viewed"
            description="Pick up where you left off"
          />
          <ProductGrid products={recentlyViewed} />
        </section>
      </main>
    </>
  );
}

