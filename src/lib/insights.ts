import { differenceInMinutes, parseISO } from "date-fns";
import type { Insight, Trip } from "./types";
import { budgetTotals } from "./format";
import { uid } from "./ids";

function minutesBetween(date: string, timeA?: string, timeB?: string): number | null {
  if (!timeA || !timeB) return null;
  const a = parseISO(`${date}T${timeA}`);
  const b = parseISO(`${date}T${timeB}`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
  return differenceInMinutes(b, a);
}

export function detectInsights(trip: Trip): Insight[] {
  const insights: Insight[] = [];

  const flights = trip.transportation.filter((t) => t.type === "flight");
  const unbookedFlights = flights.filter((t) => t.status !== "booked" && t.status !== "cancelled");
  if (unbookedFlights.length) {
    insights.push({
      id: uid("ins"),
      kind: "missing",
      title: "Flights are not booked",
      message: trip.origin
        ? `I have a recommended routing via your origin (${trip.origin}), but nothing is reserved.`
        : "Share a departure city and I will attach a realistic routing. I will not pretend seats are held.",
      action: "Tell me your departure airport",
    });
  }

  const unbookedStays = trip.stays.filter((s) => s.status !== "booked" && s.status !== "cancelled");
  if (unbookedStays.length) {
    insights.push({
      id: uid("ins"),
      kind: "missing",
      title: `${unbookedStays.length} stay${unbookedStays.length === 1 ? "" : "s"} still open`,
      message: unbookedStays.map((s) => `${s.property} in ${s.location}`).join(" · "),
      action: "Ask me to lock refundable options",
    });
  }

  const transfer = trip.transportation.find((t) => t.type === "transfer" && t.status !== "booked");
  if (flights.some((f) => /airport|muc|opo|lju|lis/i.test(f.route)) && transfer) {
    insights.push({
      id: uid("ins"),
      kind: "missing",
      title: "Airport transfer is still a gap",
      message: `${transfer.route} is recommended, not booked. This is usually the last piece people forget.`,
      action: "Confirm the airport transfer",
    });
  }

  const sameDayPairs = trip.transportation.filter((t) => t.type === "train" || t.type === "flight");
  for (const incoming of sameDayPairs) {
    const outgoing = sameDayPairs.find(
      (other) =>
        other.id !== incoming.id &&
        other.date === incoming.date &&
        other.type === "flight" &&
        incoming.arrivalTime &&
        other.departureTime,
    );
    if (!outgoing) continue;
    const gap = minutesBetween(incoming.date, incoming.arrivalTime, outgoing.departureTime);
    if (gap !== null && gap < 180) {
      insights.push({
        id: uid("ins"),
        kind: "warning",
        title: "Tight connection before a flight",
        message: `Your ${incoming.route} arrives only ${gap} minutes before ${outgoing.route}. I recommend an earlier train or a later flight.`,
        action: "Move the train earlier",
      });
    }
  }

  const hikeDays = trip.itinerary.filter((i) => /hike|gorge|eibsee|loop|trail|viewpoint/i.test(i.title));
  const november = trip.startDate?.slice(5, 7) === "11";
  if (november && hikeDays.length) {
    insights.push({
      id: uid("ins"),
      kind: "weather",
      title: "November hiking is valley-only",
      message:
        "I kept walks on gorges, lakes, and towns. If rain hits a hike day, swap to the indoor alternative already attached to that item.",
      action: "If it rains, fix that day",
    });
  }

  const totals = budgetTotals(trip);
  if (trip.budgetCap !== undefined && totals.remaining !== undefined) {
    if (totals.remaining < 0) {
      insights.push({
        id: uid("ins"),
        kind: "warning",
        title: "Over the planned budget",
        message: `The current plan is ${Math.abs(Math.round(totals.remaining))} ${trip.currency} above your cap. Stays and the Hallstatt/day-trip line are the first levers.`,
        action: "Find a cheaper hotel",
      });
    } else if (totals.remaining > 400) {
      const stayLine = trip.budget.find((b) => /stay/i.test(b.category));
      insights.push({
        id: uid("ins"),
        kind: "opportunity",
        title: "Unused budget",
        message: stayLine
          ? `You are about ${Math.round(totals.remaining)} ${trip.currency} under the trip cap. A better-located stay is the most useful upgrade.`
          : `You still have ${Math.round(totals.remaining)} ${trip.currency} of unused budget.`,
        action: "Upgrade one stay",
      });
    }
  }

  const ambitiousDay = groupByDate(trip.itinerary).find(([, items]) => {
    const activities = items.filter((i) => i.category === "activity");
    const travel = items.reduce((sum, i) => sum + (i.travelTimeMinutes ?? 0), 0);
    return activities.length >= 3 || travel > 240;
  });
  if (ambitiousDay) {
    insights.push({
      id: uid("ins"),
      kind: "warning",
      title: "One day is too full",
      message: `${ambitiousDay[0]} stacks too much moving around. I would rather drop a stop than have you skip lunch.`,
      action: "Make this trip more relaxed",
    });
  }

  if (!trip.startDate || !trip.endDate) {
    insights.push({
      id: uid("ins"),
      kind: "info",
      title: "Dates are still open",
      message: "I can hold a destination idea, but stays and trains get real once we have dates.",
    });
  }

  if (trip.status === "idea" && trip.destinations.length === 0) {
    insights.push({
      id: uid("ins"),
      kind: "info",
      title: "This is still an idea",
      message: "Tell me where, when, and what you care about. I will turn it into a workspace, not a list of attractions.",
    });
  }

  return insights.slice(0, 6);
}

function groupByDate(items: Trip["itinerary"]): [string, Trip["itinerary"]][] {
  const map = new Map<string, Trip["itinerary"]>();
  for (const item of items) {
    map.set(item.date, [...(map.get(item.date) ?? []), item]);
  }
  return [...map.entries()];
}

export function nextActions(trip: Trip): string[] {
  const actions: string[] = [];
  if (!trip.destinations.length) actions.push("Choose a destination so I can build the days");
  if (!trip.origin && trip.destinations.length) actions.push("Add your departure city for flight routing");
  if (trip.stays.some((s) => s.status === "recommended")) actions.push("Book refundable stays first — they disappear before trains");
  if (trip.transportation.some((t) => t.type === "flight" && t.status !== "booked")) {
    actions.push("Hold flights only after stays can still be cancelled");
  }
  if (trip.itinerary.some((i) => /reserv/i.test(i.notes ?? "") && i.bookingStatus !== "booked")) {
    actions.push("Reserve the one special dinner");
  }
  if (trip.transportation.some((t) => t.type === "transfer" && t.status !== "booked")) {
    actions.push("Confirm the airport transfer");
  }
  if (!actions.length) actions.push("Review the day-by-day and tell me what feels too tight");
  return actions.slice(0, 4);
}
