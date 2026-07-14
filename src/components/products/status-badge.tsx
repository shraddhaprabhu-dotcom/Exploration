import { Badge } from "@/components/ui/badge";
import { STATUS_BADGE_CLASS } from "@/lib/constants";
import {
  PRODUCT_STATUS_LABELS,
  type ProductStatus,
} from "@/types";
import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  className,
}: {
  status: ProductStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide",
        STATUS_BADGE_CLASS[status],
        className
      )}
    >
      {PRODUCT_STATUS_LABELS[status]}
    </Badge>
  );
}

