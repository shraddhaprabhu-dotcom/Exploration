import type { ItineraryItem, Stay, Trip } from "./types";

export interface GeoPoint {
  lat: number;
  lng: number;
  label: string;
}

export interface MapStop {
  id: string;
  kind: "itinerary" | "stay";
  title: string;
  place: string;
  date?: string;
  category?: string;
  notes?: string;
  lat: number;
  lng: number;
  sequence: number;
  dayIndex: number;
}

const PLACES: Record<string, { lat: number; lng: number; label: string }> = {
  ljubljana: { lat: 46.0569, lng: 14.5058, label: "Ljubljana" },
  ljubljanica: { lat: 46.0499, lng: 14.5055, label: "Ljubljanica" },
  "ljubljana airport": { lat: 46.2237, lng: 14.4576, label: "Ljubljana Airport" },
  lju: { lat: 46.2237, lng: 14.4576, label: "Ljubljana Airport" },
  bled: { lat: 46.3683, lng: 14.1146, label: "Bled" },
  "lake bled": { lat: 46.3636, lng: 14.0936, label: "Lake Bled" },
  "near bled": { lat: 46.3917, lng: 14.0848, label: "Vintgar / near Bled" },
  vintgar: { lat: 46.3942, lng: 14.0844, label: "Vintgar Gorge" },
  radovljica: { lat: 46.3444, lng: 14.1744, label: "Radovljica" },
  bohinj: { lat: 46.2769, lng: 13.8303, label: "Bohinj" },
  "lake bohinj": { lat: 46.2769, lng: 13.859, label: "Lake Bohinj" },
  "ribcev laz": { lat: 46.275, lng: 13.8878, label: "Ribčev Laz" },
  piran: { lat: 45.5285, lng: 13.5684, label: "Piran" },
  postojna: { lat: 45.7753, lng: 14.2135, label: "Postojna" },
  munich: { lat: 48.1351, lng: 11.582, label: "Munich" },
  munchen: { lat: 48.1351, lng: 11.582, label: "Munich" },
  "altstadt munich": { lat: 48.1374, lng: 11.5755, label: "Munich Altstadt" },
  "munich airport": { lat: 48.3538, lng: 11.7861, label: "Munich Airport" },
  muc: { lat: 48.3538, lng: 11.7861, label: "Munich Airport" },
  "munchen hbf": { lat: 48.1402, lng: 11.5581, label: "München Hbf" },
  "munich hbf": { lat: 48.1402, lng: 11.5581, label: "München Hbf" },
  "garmisch partenkirchen": { lat: 47.4917, lng: 11.0956, label: "Garmisch-Partenkirchen" },
  garmisch: { lat: 47.4917, lng: 11.0956, label: "Garmisch-Partenkirchen" },
  partnachklamm: { lat: 47.4683, lng: 11.117, label: "Partnach Gorge" },
  "partnach gorge": { lat: 47.4683, lng: 11.117, label: "Partnach Gorge" },
  eibsee: { lat: 47.4575, lng: 10.9728, label: "Eibsee" },
  grainau: { lat: 47.4761, lng: 11.0247, label: "Grainau" },
  mittenwald: { lat: 47.4414, lng: 11.2619, label: "Mittenwald" },
  berchtesgaden: { lat: 47.6303, lng: 13.0009, label: "Berchtesgaden" },
  konigssee: { lat: 47.591, lng: 12.9878, label: "Königssee" },
  "schonau am konigssee": { lat: 47.6018, lng: 12.987, label: "Schönau am Königssee" },
  salzburg: { lat: 47.8095, lng: 13.055, label: "Salzburg" },
  "salzburg hbf": { lat: 47.8129, lng: 13.0458, label: "Salzburg Hbf" },
  getreidegasse: { lat: 47.8, lng: 13.044, label: "Getreidegasse" },
  "st peter": { lat: 47.7969, lng: 13.0447, label: "St. Peter, Salzburg" },
  hallstatt: { lat: 47.5622, lng: 13.6493, label: "Hallstatt" },
  salzkammergut: { lat: 47.56, lng: 13.65, label: "Salzkammergut" },
  lisbon: { lat: 38.7223, lng: -9.1393, label: "Lisbon" },
  alfama: { lat: 38.711, lng: -9.1307, label: "Alfama" },
  belem: { lat: 38.697, lng: -9.206, label: "Belém" },
  "lx factory": { lat: 38.7035, lng: -9.1785, label: "LX Factory" },
  "time out market": { lat: 38.7071, lng: -9.1456, label: "Time Out Market" },
  sintra: { lat: 38.8029, lng: -9.3817, label: "Sintra" },
  "pena palace": { lat: 38.7876, lng: -9.3906, label: "Pena Palace" },
  porto: { lat: 41.1579, lng: -8.6291, label: "Porto" },
  gaia: { lat: 41.1335, lng: -8.616, label: "Vila Nova de Gaia" },
  "dom luis": { lat: 41.1406, lng: -8.6094, label: "Dom Luís Bridge" },
  pinhao: { lat: 41.191, lng: -7.546, label: "Pinhão" },
  "douro valley": { lat: 41.17, lng: -7.55, label: "Douro Valley" },
  lis: { lat: 38.7742, lng: -9.1342, label: "Lisbon Airport" },
  opo: { lat: 41.2481, lng: -8.6814, label: "Porto Airport" },
};

export function normalizePlace(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function resolvePoint(query?: string | null): GeoPoint | null {
  if (!query) return null;
  const hay = normalizePlace(query);
  if (!hay) return null;
  if (PLACES[hay]) return PLACES[hay];

  let best: { score: number; point: GeoPoint } | null = null;
  for (const [key, point] of Object.entries(PLACES)) {
    if (hay.includes(key) || key.includes(hay)) {
      const score = key.length + (hay.includes(key) ? 10 : 0);
      if (!best || score > best.score) best = { score, point };
    }
  }
  return best?.point ?? null;
}

function uniqueDays(trip: Trip): string[] {
  const dates = new Set<string>();
  for (const item of trip.itinerary) dates.add(item.date);
  for (const stay of trip.stays) dates.add(stay.checkIn);
  return [...dates].sort();
}

function dayIndex(days: string[], date?: string): number {
  if (!date) return 0;
  const index = days.indexOf(date);
  return index >= 0 ? index : 0;
}

export function itineraryStops(trip: Trip): MapStop[] {
  const days = uniqueDays(trip);
  const stops: MapStop[] = [];
  const sorted = [...trip.itinerary].sort((a, b) => `${a.date}${a.startTime ?? ""}`.localeCompare(`${b.date}${b.startTime ?? ""}`));
  sorted.forEach((item, sequence) => {
    const point = pointForItem(item);
    if (!point) return;
    stops.push({
      id: item.id,
      kind: "itinerary",
      title: item.title,
      place: point.label,
      date: item.date,
      category: item.category,
      notes: item.notes,
      lat: point.lat,
      lng: point.lng,
      sequence: sequence + 1,
      dayIndex: dayIndex(days, item.date),
    });
  });
  return stops;
}

export function stayStops(trip: Trip): MapStop[] {
  const days = uniqueDays(trip);
  const stops: MapStop[] = [];
  trip.stays.forEach((stay, sequence) => {
    const point = resolvePoint(stay.location) ?? resolvePoint(stay.address) ?? resolvePoint(stay.property);
    if (!point) return;
    stops.push({
      id: stay.id,
      kind: "stay",
      title: stay.property,
      place: stay.location,
      date: stay.checkIn,
      category: "stay",
      notes: stay.notes,
      lat: point.lat,
      lng: point.lng,
      sequence: sequence + 1,
      dayIndex: dayIndex(days, stay.checkIn),
    });
  });
  return stops.sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
}

export function routeLine(trip: Trip): [number, number][] {
  const line: [number, number][] = [];
  const seen = new Set<string>();
  for (const stay of stayStops(trip)) {
    const key = `${stay.lat.toFixed(3)},${stay.lng.toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    line.push([stay.lat, stay.lng]);
  }
  if (line.length >= 2) return line;
  for (const stop of itineraryStops(trip)) {
    const key = `${stop.lat.toFixed(3)},${stop.lng.toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    line.push([stop.lat, stop.lng]);
  }
  return line;
}

function pointForItem(item: ItineraryItem): GeoPoint | null {
  return resolvePoint(item.location) ?? resolvePoint(item.title);
}

export function mapDays(trip: Trip): string[] {
  return [...new Set(itineraryStops(trip).map((stop) => stop.date).filter(Boolean) as string[])].sort();
}

export function unmappedCount(trip: Trip): number {
  return trip.itinerary.filter((item) => !pointForItem(item)).length;
}

export const DAY_COLORS = ["#2f4a3c", "#b8431f", "#2c5f6e", "#8d6b1f", "#5c7a62", "#8d3014", "#4a4338"];

export function dayColor(index: number): string {
  return DAY_COLORS[index % DAY_COLORS.length];
}

export function stayHasPoint(stay: Stay): boolean {
  return Boolean(resolvePoint(stay.location) ?? resolvePoint(stay.address) ?? resolvePoint(stay.property));
}
