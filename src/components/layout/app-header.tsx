"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { QuickAddButton } from "@/components/shared/quick-add-button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export function AppHeader({ title }: { title?: string }) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/70 bg-background/80 px-4 backdrop-blur-md md:px-8">
      <div className="min-w-0 flex-1">
        {title ? (
          <h1 className="truncate font-heading text-xl tracking-tight md:text-2xl">
            {title}
          </h1>
        ) : (
          <div className="relative hidden max-w-md md:block">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              readOnly
              placeholder="Search products, brands, tags…"
              className="h-10 cursor-pointer rounded-xl border-border/80 bg-card pl-9 shadow-none"
              onClick={() => router.push("/search")}
            />
          </div>
        )}
      </div>

      <Link
        href="/search"
        aria-label="Search"
        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
      >
        <Search className="size-4" />
      </Link>

      <div className="hidden sm:block">
        <QuickAddButton />
      </div>
    </header>
  );
}

