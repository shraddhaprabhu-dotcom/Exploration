import { format, parseISO, differenceInCalendarDays, isValid } from "date-fns";
import type { BookingStatus, TransportType, Trip } from "./types";

export function money(amount: number | undefined, currency = "EUR"): string {
  if (amount === undefined || Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: amount >= 100 ? 0 : 2,
  }).format(amount);
}

export function formatDate(iso?: string, pattern = "EEE, MMM d"): string {
  if (!iso) return "Dates TBD";
  const d = parseISO(iso);
  return isValid(d) ? format(d, pattern) : iso;
}

export function formatRange(start?: string, end?: string): string {
  if (!start && !end) return "Dates TBD";
  if (start && end) return `${formatDate(start, "MMM d")} – ${formatDate(end, "MMM d, yyyy")}`;
  return formatDate(start ?? end, "MMM d, yyyy");
}

export function nightCount(start?: string, end?: string): number {
  if (!start || !end) return 0;
  return Math.max(0, differenceInCalendarDays(parseISO(end), parseISO(start)));
}

export function tripLengthLabel(trip: Trip): string {
  const nights = nightCount(trip.startDate, trip.endDate);
  if (!nights) return "Length TBD";
  return `${nights + 1} days · ${nights} nights`;
}

export function statusLabel(status: BookingStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function transportLabel(type: TransportType): string {
  const labels: Record<TransportType, string> = {
    flight: "Flight",
    train: "Train",
    bus: "Bus",
    ferry: "Ferry",
    car_rental: "Car rental",
    transfer: "Transfer",
    local: "Local transit",
  };
  return labels[type];
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function bookedCount(trip: Trip): { booked: number; open: number } {
  const items = [
    ...trip.transportation.map((t) => t.status),
    ...trip.stays.map((s) => s.status),
    ...trip.itinerary.filter((i) => i.bookingStatus !== "recommended" || i.estimatedCost).map((i) => i.bookingStatus),
  ];
  const bookable = [
    ...trip.transportation,
    ...trip.stays,
    ...trip.itinerary.filter((i) => ["pending", "booked", "saved"].includes(i.bookingStatus) || Boolean(i.estimatedCost && i.category !== "free")),
  ];
  const booked = bookable.filter((entry) => {
    if ("status" in entry) return entry.status === "booked";
    return entry.bookingStatus === "booked";
  }).length;
  return { booked, open: Math.max(0, bookable.length - booked) };
}

export function budgetTotals(trip: Trip) {
  const estimated = trip.budget.reduce((sum, line) => sum + line.estimated, 0);
  const confirmed = trip.budget.reduce((sum, line) => sum + (line.confirmed ?? 0), 0);
  const actual = trip.budget.reduce((sum, line) => sum + (line.actual ?? 0), 0);
  const spend = confirmed || estimated;
  const remaining = trip.budgetCap !== undefined ? trip.budgetCap - spend : undefined;
  return { estimated, confirmed, actual, spend, remaining };
}

export function todayIso(now = new Date()): string {
  return format(now, "yyyy-MM-dd");
}
