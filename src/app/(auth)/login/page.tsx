import Link from "next/link";
import { Bookmark } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-3 duration-500">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Bookmark className="size-4" />
          </span>
          <span className="font-heading text-3xl tracking-tight">{APP_NAME}</span>
        </Link>

        <div className="rounded-3xl border border-border/80 bg-card p-8 shadow-[0_8px_40px_rgba(15,23,42,0.06)]">
          <h1 className="font-heading text-3xl tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">{APP_TAGLINE}</p>

          <div className="mt-8 space-y-3">
            <button
              type="button"
              disabled
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full opacity-70"
              )}
            >
              Continue with Google
            </button>
            <button
              type="button"
              disabled
              className={cn(buttonVariants({ size: "lg" }), "w-full opacity-70")}
            >
              Continue with email
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Auth wiring is next. Explore the{" "}
            <Link href="/dashboard" className="underline underline-offset-2">
              demo dashboard
            </Link>{" "}
            for now.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link href="/signup" className="font-medium text-foreground underline-offset-2 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

