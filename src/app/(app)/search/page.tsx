"use client";

import { useMemo, useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { ProductGrid } from "@/components/products/product-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import {
  PRODUCT_STATUSES,
  PRODUCT_STATUS_LABELS,
  type ProductStatus,
} from "@/types";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ProductStatus | "all">("all");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_PRODUCTS.filter((product) => {
      if (status !== "all" && product.status !== status) return false;
      if (!q) return true;
      const haystack = [
        product.title,
        product.brand,
        product.store,
        product.notes,
        ...product.tags.map((t) => t.name),
        ...product.collections.map((c) => c.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, status]);

  return (
    <>
      <AppHeader title="Search" />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, brand, store, tag, collection, notes…"
            className="h-11 flex-1 rounded-xl bg-card"
            autoFocus
          />
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as ProductStatus | "all")
            }
            className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm shadow-none outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-44"
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            {PRODUCT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {PRODUCT_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        {results.length > 0 ? (
          <ProductGrid products={results} />
        ) : (
          <EmptyState
            title="No matches"
            description="Try another keyword or clear the status filter."
          />
        )}
      </main>
    </>
  );
}

