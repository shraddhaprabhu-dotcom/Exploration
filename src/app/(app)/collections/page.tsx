import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { CollectionGrid } from "@/components/collections/collection-grid";
import { SectionHeader } from "@/components/shared/section-header";
import { buttonVariants } from "@/components/ui/button";
import { MOCK_COLLECTIONS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Collections",
};

export default function CollectionsPage() {
  return (
    <>
      <AppHeader title="Collections" />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-8">
        <SectionHeader
          title="Your collections"
          description="Rooms, trips, wishlists — shelves for every mood"
          action={
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              New collection
            </Link>
          }
        />
        <CollectionGrid collections={MOCK_COLLECTIONS} />
      </main>
    </>
  );
}

