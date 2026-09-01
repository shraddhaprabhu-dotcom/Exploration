import type { BookingStatus, InsightKind, TripStatus } from "@/lib/types";

const bookingStyles: Record<BookingStatus, string> = {
  recommended: "bg-sand text-ink-soft",
  saved: "bg-[#ebe3c7] text-[#5c4d1f]",
  pending: "bg-[#f3dfc3] text-warn",
  booked: "bg-[#d7e6dc] text-forest",
  cancelled: "bg-[#f0e4e0] text-muted line-through",
};

const tripStyles: Record<TripStatus, string> = {
  idea: "bg-sand text-ink-soft",
  planning: "bg-[#e5ece7] text-forest",
  ready: "bg-[#ebe3c7] text-[#5c4d1f]",
  booked: "bg-[#d7e6dc] text-forest",
  traveling: "bg-[#dce7ea] text-sea",
  completed: "bg-sand text-muted",
};

export function BookingBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${bookingStyles[status]}`}>
      {status}
    </span>
  );
}

export function TripBadge({ status }: { status: TripStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${tripStyles[status]}`}>
      {status}
    </span>
  );
}

export function InsightMark({ kind }: { kind: InsightKind }) {
  const map: Record<InsightKind, string> = {
    warning: "⚠️",
    weather: "🌧️",
    opportunity: "💡",
    missing: "▢",
    info: "i",
  };
  return <span aria-hidden>{map[kind]}</span>;
}
