"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * Placeholder Quick Add — full dialog + ⌘K lands in the Save Product feature.
 */
export function QuickAddButton({
  variant = "default",
  className,
}: {
  variant?: "default" | "fab";
  className?: string;
}) {
  const onClick = () => {
    toast.message("Quick Add coming next", {
      description: "Paste a URL or add manually — wired in the next feature.",
    });
  };

  if (variant === "fab") {
    return (
      <Button
        size="icon"
        onClick={onClick}
        className={
          className ??
          "fixed bottom-6 right-6 z-40 size-14 rounded-full shadow-lg md:hidden"
        }
        aria-label="Quick add product"
      >
        <Plus className="size-6" />
      </Button>
    );
  }

  return (
    <Button onClick={onClick} className={className}>
      <Plus className="size-4" />
      Quick Add
    </Button>
  );
}

