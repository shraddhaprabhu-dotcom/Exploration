import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { StatusBadge } from "@/components/products/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PRODUCT_IMAGE_FALLBACK } from "@/lib/constants";
import { formatPrice, formatRelativeDate } from "@/lib/format";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return MOCK_PRODUCTS.map((p) => ({ id: p.id }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = MOCK_PRODUCTS.find((p) => p.id === id);
  if (!product) notFound();

  const imageSrc = product.image_url || PRODUCT_IMAGE_FALLBACK;

  return (
    <>
      <AppHeader title="Product" />
      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-10 px-4 py-8 md:grid-cols-2 md:px-8 lg:gap-16">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted shadow-[0_8px_40px_rgba(15,23,42,0.08)]">
          <Image
            src={imageSrc}
            alt={product.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized={imageSrc.startsWith("data:")}
          />
        </div>

        <div className="flex flex-col animate-in fade-in slide-in-from-right-2 duration-500">
          {product.brand && (
            <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
              {product.brand}
            </p>
          )}
          <h1 className="mt-2 font-heading text-4xl tracking-tight md:text-5xl">
            {product.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="text-2xl font-semibold tabular-nums">
              {formatPrice(product.price, product.currency)}
            </p>
            <StatusBadge status={product.status} />
          </div>

          <dl className="mt-8 space-y-4 text-sm">
            {product.store && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Store</dt>
                <dd className="font-medium">{product.store}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Saved</dt>
              <dd className="font-medium">
                {formatRelativeDate(product.created_at)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Collections</dt>
              <dd className="text-right font-medium">
                {product.collections.map((c) => (
                  <Link
                    key={c.id}
                    href={`/collections/${c.id}`}
                    className="ml-2 first:ml-0 hover:underline"
                  >
                    {c.name}
                  </Link>
                )) || "—"}
              </dd>
            </div>
          </dl>

          <Separator className="my-6" />

          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {product.notes && (
            <div className="mt-6">
              <h2 className="text-sm font-medium text-muted-foreground">Notes</h2>
              <p className="mt-2 text-base leading-relaxed">{product.notes}</p>
            </div>
          )}

          <div className="mt-auto flex flex-wrap gap-3 pt-10">
            {product.product_url && (
              <a
                href={product.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ size: "lg" }), "gap-2")}
              >
                View original
                <ExternalLink className="size-4" />
              </a>
            )}
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Back to shelf
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

