export type BookingStatus =
  | "recommended"
  | "saved"
  | "pending"
  | "booked"
  | "cancelled";

export type TripStatus =
  | "idea"
  | "planning"
  | "ready"
  | "booked"
  | "traveling"
  | "completed";

export type TransportType =
  | "flight"
  | "train"
  | "bus"
  | "ferry"
  | "car_rental"
  | "transfer"
  | "local";

export type ItemCategory =
  | "activity"
  | "meal"
  | "transport"
  | "stay"
  | "free"
  | "other";

export type PlaceType =
  | "restaurant"
  | "attraction"
  | "experience"
  | "hike"
  | "event"
  | "other";

export type DocumentType = "booking" | "ticket" | "reservation" | "info";

export type InsightKind =
  | "warning"
  | "opportunity"
  | "missing"
  | "weather"
  | "info";

export type CostKind = "estimated" | "confirmed" | "actual";

export interface Traveler {
  id: string;
  name: string;
  role?: "adult" | "child";
}

export interface Destination {
  id: string;
  name: string;
  region?: string;
  nights?: number;
}

export interface ItineraryItem {
  id: string;
  date: string;
  startTime?: string;
  endTime?: string;
  title: string;
  location?: string;
  category: ItemCategory;
  travelTimeMinutes?: number;
  estimatedCost?: number;
  bookingStatus: BookingStatus;
  bookingReference?: string;
  notes?: string;
  relatedReservationId?: string;
  relatedTransportationId?: string;
  alternatives?: string[];
}

export interface Transportation {
  id: string;
  type: TransportType;
  provider?: string;
  route: string;
  date: string;
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
  bookingReference?: string;
  terminal?: string;
  cost?: number;
  status: BookingStatus;
  notes?: string;
}

export interface Stay {
  id: string;
  property: string;
  location: string;
  address?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  price?: number;
  bookingReference?: string;
  cancellationDeadline?: string;
  notes?: string;
  status: BookingStatus;
}

export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  location?: string;
  notes?: string;
  reservationStatus: BookingStatus;
  estimatedCost?: number;
  date?: string;
}

export interface BudgetLine {
  id: string;
  category: string;
  estimated: number;
  confirmed?: number;
  actual?: number;
  currency: string;
  notes?: string;
}

export interface TripDocument {
  id: string;
  title: string;
  type: DocumentType;
  relatedTo?: string;
  notes?: string;
  reference?: string;
}

export interface Insight {
  id: string;
  kind: InsightKind;
  title: string;
  message: string;
  action?: string;
}

export interface ChangeAction {
  summary: string;
  apply: TripMutation;
}

export interface ChangeProposal {
  id: string;
  title: string;
  rationale: string;
  actions: ChangeAction[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  createdAt: string;
  proposalId?: string;
}

export interface Trip {
  id: string;
  name: string;
  destinations: Destination[];
  startDate?: string;
  endDate?: string;
  travelers: Traveler[];
  status: TripStatus;
  currency: string;
  budgetCap?: number;
  preferences: string[];
  constraints: string[];
  notes?: string;
  origin?: string;
  itinerary: ItineraryItem[];
  transportation: Transportation[];
  stays: Stay[];
  places: Place[];
  budget: BudgetLine[];
  documents: TripDocument[];
  createdAt: string;
  updatedAt: string;
}

export type TripMutation =
  | { type: "replace_trip"; trip: Trip }
  | { type: "patch_trip"; patch: Partial<Trip> }
  | { type: "set_itinerary"; itinerary: ItineraryItem[] }
  | { type: "upsert_item"; item: ItineraryItem }
  | { type: "remove_item"; itemId: string }
  | { type: "move_item"; itemId: string; date: string; startTime?: string }
  | { type: "upsert_stay"; stay: Stay }
  | { type: "upsert_transport"; transport: Transportation }
  | { type: "upsert_place"; place: Place }
  | { type: "set_budget"; budget: BudgetLine[] }
  | { type: "mark_booked"; kind: "item" | "stay" | "transport" | "place"; id: string; reference?: string };

export interface AgentResponse {
  message: string;
  mutations: TripMutation[];
  proposal?: ChangeProposal;
  suggestedReplies?: string[];
}

export interface DestinationPack {
  id: string;
  name: string;
  tagline: string;
  region: string;
  matchTags: string[];
  whyItFits: string;
  pace: "relaxed" | "moderate" | "full";
  currency: string;
  dailyBudget: { low: number; mid: number; high: number };
  cities: { name: string; nights: number; vibe: string }[];
  visaNote: string;
  weatherByMonth: Record<string, string>;
  constraints: string[];
  build: (input: PackBuildInput) => Trip;
}

export interface PackBuildInput {
  startDate: string;
  nights: number;
  travelers: Traveler[];
  origin?: string;
  budgetCap?: number;
  currency: string;
  preferences: string[];
}
