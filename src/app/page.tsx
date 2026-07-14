import Image from "next/image";
import Link from "next/link";
import { Bookmark, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Full-bleed hero plane */}
      <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=2000&q=80"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/45 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25" />

        <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 animate-in fade-in duration-700">
          <Link href="/" className="flex items-center gap-2.5 text-white">
            <span className="flex size-9 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-md ring-1 ring-white/25">
              <Bookmark className="size-4" />
            </span>
            <span className="font-heading text-2xl tracking-tight">{APP_NAME}</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
            >
              Log in
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg bg-white px-3.5 py-2 text-sm font-medium text-neutral-900 transition hover:bg-white/90"
            >
              Open demo
            </Link>
          </nav>
        </header>

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end px-6 pb-20 pt-24 md:justify-center md:pb-28 md:pt-16">
          <div className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
            <p className="font-heading text-6xl tracking-tight text-white sm:text-7xl lg:text-8xl">
              {APP_NAME}
            </p>
            <h1 className="mt-5 text-xl leading-relaxed text-white/90 sm:text-2xl">
              {APP_TAGLINE}
            </h1>
            <p className="mt-4 max-w-md text-base text-white/70">
              Save products from anywhere. Organize them visually. Decide when
              you&apos;re ready.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "gap-2 bg-white text-neutral-900 hover:bg-white/90"
                )}
              >
                Explore the shelf
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-9 items-center rounded-lg border border-white/35 bg-white/10 px-4 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-background py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-3">
          {[
            {
              title: "Save from anywhere",
              body: "Paste a URL, add manually, or upload a screenshot. Stash pulls the details together.",
            },
            {
              title: "Organize visually",
              body: "Collections, tags, and statuses turn scattered bookmarks into a calm shelf.",
            },
            {
              title: "Decide with clarity",
              body: "Search, filter, and compare before you buy — without the noise of a storefront.",
            },
          ].map((item, i) => (
            <div
              key={item.title}
              className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
              style={{
                animationDelay: `${i * 80}ms`,
                animationDuration: "500ms",
              }}
            >
              <h2 className="font-heading text-2xl tracking-tight">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8 text-sm text-muted-foreground">
        <span className="font-heading text-lg text-foreground">{APP_NAME}</span>
        <span>Working title · MVP foundation</span>
      </footer>
    </div>
  );
}

