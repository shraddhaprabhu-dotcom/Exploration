import { addDays, format, parseISO } from "date-fns";
import type { BudgetLine, ItineraryItem, Stay, Transportation, Traveler, Trip } from "./types";
import { uid } from "./ids";
import { nightCount } from "./format";

export function emptyTrip(partial?: Partial<Trip>): Trip {
  const now = new Date().toISOString();
  return {
    id: uid("trip"),
    name: "Untitled trip",
    destinations: [],
    travelers: [{ id: uid("trav"), name: "You", role: "adult" }],
    status: "idea",
    currency: "EUR",
    preferences: [],
    constraints: [],
    itinerary: [],
    transportation: [],
    stays: [],
    places: [],
    budget: [],
    documents: [],
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

export function dateOn(start: string, offset: number): string {
  return format(addDays(parseISO(start), offset), "yyyy-MM-dd");
}

export function item(partial: Omit<ItineraryItem, "id" | "bookingStatus"> & { bookingStatus?: ItineraryItem["bookingStatus"] }): ItineraryItem {
  return {
    id: uid("item"),
    bookingStatus: "recommended",
    ...partial,
  };
}

export function stay(partial: Omit<Stay, "id" | "status" | "nights"> & { status?: Stay["status"]; nights?: number }): Stay {
  return {
    id: uid("stay"),
    status: "recommended",
    nights: partial.nights ?? nightCount(partial.checkIn, partial.checkOut),
    ...partial,
  };
}

export function transport(
  partial: Omit<Transportation, "id" | "status"> & { status?: Transportation["status"] },
): Transportation {
  return {
    id: uid("trn"),
    status: "recommended",
    ...partial,
  };
}

export function line(
  category: string,
  estimated: number,
  currency: string,
  notes?: string,
  confirmed?: number,
): BudgetLine {
  return { id: uid("bud"), category, estimated, confirmed, currency, notes };
}

export function defaultTravelers(count = 2): Traveler[] {
  if (count <= 1) return [{ id: uid("trav"), name: "You", role: "adult" }];
  return [
    { id: uid("trav"), name: "You", role: "adult" },
    ...Array.from({ length: count - 1 }, (_, i) => ({
      id: uid("trav"),
      name: `Traveler ${i + 2}`,
      role: "adult" as const,
    })),
  ];
}

export function rebuildBudget(trip: Trip): BudgetLine[] {
  const currency = trip.currency;
  const flights = trip.transportation
    .filter((t) => t.type === "flight")
    .reduce((sum, t) => sum + (t.cost ?? 0), 0);
  const local = trip.transportation
    .filter((t) => t.type !== "flight")
    .reduce((sum, t) => sum + (t.cost ?? 0), 0);
  const stays = trip.stays.reduce((sum, s) => sum + (s.price ?? 0), 0);
  const activities = trip.itinerary
    .filter((i) => i.category === "activity")
    .reduce((sum, i) => sum + (i.estimatedCost ?? 0), 0);
  const meals = trip.itinerary
    .filter((i) => i.category === "meal")
    .reduce((sum, i) => sum + (i.estimatedCost ?? 0), 0);
  const extraMeals = Math.max(0, estimateMealGap(trip) - meals);

  return [
    line("Flights", flights, currency, flights ? "Recommended fares, not booked" : "Add a departure city to estimate"),
    line("Stays", stays, currency, "Recommended properties"),
    line("Local transport", local, currency, "Trains, buses, transfers"),
    line("Activities", activities, currency, "Tickets and paid experiences"),
    line("Food", meals + extraMeals, currency, extraMeals ? "Includes unscheduled meals" : "From planned meals"),
    line("Buffer", Math.round((flights + stays + local + activities + meals + extraMeals) * 0.08), currency, "8% contingency"),
  ];
}

function estimateMealGap(trip: Trip): number {
  const nights = nightCount(trip.startDate, trip.endDate);
  const people = Math.max(1, trip.travelers.length);
  const perPersonDay = trip.preferences.some((p) => /budget|cheap|fortune/i.test(p)) ? 35 : 45;
  return nights * people * perPersonDay;
}

export function applyMutation(trip: Trip, mutation: import("./types").TripMutation): Trip {
  const now = new Date().toISOString();
  switch (mutation.type) {
    case "replace_trip":
      return { ...mutation.trip, id: trip.id, createdAt: trip.createdAt, updatedAt: now };
    case "patch_trip":
      return { ...trip, ...mutation.patch, id: trip.id, updatedAt: now };
    case "set_itinerary":
      return { ...trip, itinerary: mutation.itinerary, updatedAt: now };
    case "upsert_item": {
      const exists = trip.itinerary.some((i) => i.id === mutation.item.id);
      return {
        ...trip,
        itinerary: exists
          ? trip.itinerary.map((i) => (i.id === mutation.item.id ? mutation.item : i))
          : [...trip.itinerary, mutation.item],
        updatedAt: now,
      };
    }
    case "remove_item":
      return { ...trip, itinerary: trip.itinerary.filter((i) => i.id !== mutation.itemId), updatedAt: now };
    case "move_item":
      return {
        ...trip,
        itinerary: trip.itinerary.map((i) =>
          i.id === mutation.itemId
            ? { ...i, date: mutation.date, startTime: mutation.startTime ?? i.startTime }
            : i,
        ),
        updatedAt: now,
      };
    case "upsert_stay": {
      const exists = trip.stays.some((s) => s.id === mutation.stay.id);
      return {
        ...trip,
        stays: exists
          ? trip.stays.map((s) => (s.id === mutation.stay.id ? mutation.stay : s))
          : [...trip.stays, mutation.stay],
        updatedAt: now,
      };
    }
    case "upsert_transport": {
      const exists = trip.transportation.some((t) => t.id === mutation.transport.id);
      return {
        ...trip,
        transportation: exists
          ? trip.transportation.map((t) => (t.id === mutation.transport.id ? mutation.transport : t))
          : [...trip.transportation, mutation.transport],
        updatedAt: now,
      };
    }
    case "upsert_place": {
      const exists = trip.places.some((p) => p.id === mutation.place.id);
      return {
        ...trip,
        places: exists
          ? trip.places.map((p) => (p.id === mutation.place.id ? mutation.place : p))
          : [...trip.places, mutation.place],
        updatedAt: now,
      };
    }
    case "set_budget":
      return { ...trip, budget: mutation.budget, updatedAt: now };
    case "mark_booked": {
      const ref = mutation.reference;
      if (mutation.kind === "item") {
        return {
          ...trip,
          itinerary: trip.itinerary.map((i) =>
            i.id === mutation.id ? { ...i, bookingStatus: "booked", bookingReference: ref } : i,
          ),
          updatedAt: now,
        };
      }
      if (mutation.kind === "stay") {
        return {
          ...trip,
          stays: trip.stays.map((s) =>
            s.id === mutation.id ? { ...s, status: "booked", bookingReference: ref } : s,
          ),
          updatedAt: now,
        };
      }
      if (mutation.kind === "transport") {
        return {
          ...trip,
          transportation: trip.transportation.map((t) =>
            t.id === mutation.id ? { ...t, status: "booked", bookingReference: ref } : t,
          ),
          updatedAt: now,
        };
      }
      return {
        ...trip,
        places: trip.places.map((p) =>
          p.id === mutation.id ? { ...p, reservationStatus: "booked" } : p,
        ),
        updatedAt: now,
      };
    }
    default:
      return trip;
  }
}

export function applyMutations(trip: Trip, mutations: import("./types").TripMutation[]): Trip {
  return mutations.reduce(applyMutation, trip);
}
