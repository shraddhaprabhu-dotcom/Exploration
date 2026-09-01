import type { DestinationPack, PackBuildInput, Place, Trip, TripDocument } from "./types";
import { dateOn, emptyTrip, item, line, stay, transport } from "./trip-utils";
import { uid } from "./ids";

function docs(tripName: string): TripDocument[] {
  return [
    {
      id: uid("doc"),
      title: "Passport validity",
      type: "info",
      notes: "Keep at least 3 months of validity beyond your return date.",
    },
    {
      id: uid("doc"),
      title: `${tripName} planning notes`,
      type: "info",
      notes: "Booking confirmations will appear here once you mark items as booked.",
    },
  ];
}

function places(list: Omit<Place, "id" | "reservationStatus">[]): Place[] {
  return list.map((p) => ({ ...p, id: uid("plc"), reservationStatus: "saved" as const }));
}

function clampNights(nights: number, min = 6, max = 16): number {
  return Math.min(max, Math.max(min, nights || 13));
}

function buildBavaria(input: PackBuildInput): Trip {
  const nights = clampNights(input.nights);
  const start = input.startDate;
  const end = dateOn(start, nights);
  const people = input.travelers.length;
  const munichNights = nights >= 12 ? 2 : 1;
  const garmischNights = nights >= 12 ? 4 : 3;
  const berchNights = nights >= 10 ? 3 : 2;
  const salzburgNights = nights - munichNights - garmischNights - berchNights;

  const d = (offset: number) => dateOn(start, offset);
  const munichOut = d(munichNights);
  const garmischOut = d(munichNights + garmischNights);
  const berchOut = d(munichNights + garmischNights + berchNights);

  const flightCost = input.origin ? 850 * people : 0;
  const stayMunich = 95 * munichNights;
  const stayGarmisch = 110 * garmischNights;
  const stayBerch = 105 * berchNights;
  const staySalz = 120 * Math.max(salzburgNights, 0);

  const itinerary = [
    item({
      date: start,
      startTime: "11:40",
      endTime: "14:10",
      title: input.origin ? `Arrive Munich (from ${input.origin})` : "Arrive Munich",
      location: "Munich Airport (MUC)",
      category: "transport",
      travelTimeMinutes: 45,
      notes: "S-Bahn or Lufthansa Express Bus to Hauptbahnhof. Do not book a tight same-day mountain transfer.",
    }),
    item({
      date: start,
      startTime: "16:30",
      endTime: "19:00",
      title: "Viktualienmarkt + old town walk",
      location: "Altstadt, Munich",
      category: "activity",
      estimatedCost: 0,
      notes: "Keep it light after the flight. Pretzel, mustard, early night.",
    }),
    item({
      date: start,
      startTime: "19:30",
      title: "Dinner at Augustiner-Keller",
      location: "Arnulfstraße 52, Munich",
      category: "meal",
      estimatedCost: 28 * people,
      notes: "Hearty Bavarian, no reservation required before 7pm on weeknights.",
    }),
    item({
      date: d(1),
      startTime: "10:00",
      endTime: "13:00",
      title: "Residenz or Pinakothek — pick one",
      location: "Munich",
      category: "activity",
      estimatedCost: 12 * people,
      alternatives: ["English Garden walk if the weather is kind"],
    }),
    item({
      date: munichOut,
      startTime: "09:32",
      endTime: "11:22",
      title: "Train Munich → Garmisch-Partenkirchen",
      location: "München Hbf",
      category: "transport",
      travelTimeMinutes: 80,
      estimatedCost: 48 * people,
      notes: "RB 6 / RB 60. Buy Bayern Ticket if 2+ travel after 9am on weekdays.",
    }),
    item({
      date: munichOut,
      startTime: "14:00",
      endTime: "16:30",
      title: "Partnach Gorge",
      location: "Partnachklamm, Garmisch",
      category: "activity",
      estimatedCost: 8 * people,
      notes: "Open most of November; ice/spray possible. Waterproof shoes.",
      alternatives: ["Olympic ski jump grounds if the gorge is closed"],
    }),
    item({
      date: d(munichNights + 1),
      startTime: "09:00",
      endTime: "15:00",
      title: "Eibsee loop (weather window)",
      location: "Grainau / Eibsee",
      category: "activity",
      estimatedCost: 10 * people,
      travelTimeMinutes: 25,
      notes: "7 km lakeside loop, little elevation. Skip if ice or heavy rain — swap to Zugspitze cable car or town cafés.",
      alternatives: ["Zugspitze (indoor + views)", "Mittenwald violin town"],
    }),
    item({
      date: d(munichNights + 2),
      startTime: "10:00",
      endTime: "16:00",
      title: "Mittenwald day — Leutasch Spirit Gorge or town + trail",
      location: "Mittenwald",
      category: "activity",
      estimatedCost: 6 * people,
      travelTimeMinutes: 25,
      notes: "Small painted town, easy valley walking. Good food density.",
    }),
    item({
      date: d(munichNights + 3),
      startTime: "10:00",
      title: "Rest morning + spa or Kramerplateau walk",
      location: "Garmisch-Partenkirchen",
      category: "free",
      notes: "Built-in recovery day. Alpenwarmbad if legs are tired.",
    }),
    item({
      date: garmischOut,
      startTime: "08:40",
      endTime: "12:50",
      title: "Transfer Garmisch → Berchtesgaden",
      location: "via München Hbf",
      category: "transport",
      travelTimeMinutes: 250,
      estimatedCost: 62 * people,
      notes: "One change in Munich. Pack a lunch — this is the longest transit day.",
    }),
    item({
      date: d(munichNights + garmischNights + 1),
      startTime: "09:30",
      endTime: "15:30",
      title: "Königssee boat + St. Bartholomä",
      location: "Schönau am Königssee",
      category: "activity",
      estimatedCost: 22 * people,
      notes: "Boats run in November on a reduced timetable. Buy tickets on site; first boats are quieter.",
    }),
    item({
      date: d(munichNights + garmischNights + 2),
      startTime: "10:00",
      endTime: "14:00",
      title: "Salt mines or Dokumentation Obersalzberg",
      location: "Berchtesgaden",
      category: "activity",
      estimatedCost: 19 * people,
      notes: "Indoor backup if the valley is socked in.",
      alternatives: ["Watzmann Thermal baths", "Easy lakeside walk at Hintersee"],
    }),
    item({
      date: berchOut,
      startTime: "10:10",
      endTime: "11:05",
      title: "Bus Berchtesgaden → Salzburg",
      location: "Berchtesgaden bus station",
      category: "transport",
      travelTimeMinutes: 55,
      estimatedCost: 14 * people,
      notes: "Line 840. Sit on the left for the river valley.",
    }),
    item({
      date: berchOut,
      startTime: "14:00",
      endTime: "17:30",
      title: "Salzburg old town + fortress funicular",
      location: "Getreidegasse / Hohensalzburg",
      category: "activity",
      estimatedCost: 14 * people,
    }),
    item({
      date: berchOut,
      startTime: "19:00",
      title: "Dinner at St. Peter Stiftskulinarium or a simpler Stiftskeller",
      location: "St. Peter Bezirk, Salzburg",
      category: "meal",
      estimatedCost: 55 * people,
      bookingStatus: "saved",
      notes: "Stiftskulinarium needs a reservation. I have not booked it.",
    }),
    item({
      date: d(munichNights + garmischNights + berchNights + 1),
      startTime: "09:00",
      endTime: "17:00",
      title: "Hallstatt day trip (or Wolfgangsee if Hallstatt feels too touristy)",
      location: "Hallstatt",
      category: "activity",
      estimatedCost: 54 * people,
      travelTimeMinutes: 150,
      notes: "November is quieter. Skip if rain + fog — the lake disappears. Wolfgangsee is closer and still beautiful.",
      alternatives: ["St. Wolfgang / Wolfgangsee", "Hellbrunn + walk"],
    }),
    item({
      date: d(nights - 2),
      startTime: "10:30",
      title: "Slow Salzburg — markets, cafés, riverside",
      location: "Salzburg",
      category: "free",
      notes: "Christmas markets typically open mid-to-late November. Confirm dates the week before you go.",
    }),
    item({
      date: d(nights - 1),
      startTime: "08:56",
      endTime: "10:26",
      title: "Railjet Salzburg → Munich",
      location: "Salzburg Hbf",
      category: "transport",
      travelTimeMinutes: 90,
      estimatedCost: 39 * people,
      notes: "Leave buffer before any evening flight. Do not cut this under 4 hours to MUC.",
    }),
    item({
      date: end,
      startTime: "11:00",
      title: input.origin ? `Depart Munich toward ${input.origin}` : "Depart Munich",
      location: "Munich Airport (MUC)",
      category: "transport",
      notes: "S8 from the city ~45–50 minutes. Be at the airport 2.5 hours before a transatlantic flight.",
    }),
  ];

  const trip = emptyTrip({
    name: "Bavarian Alps & Salzburg",
    destinations: [
      { id: uid("dest"), name: "Munich", region: "Germany", nights: munichNights },
      { id: uid("dest"), name: "Garmisch-Partenkirchen", region: "Bavaria", nights: garmischNights },
      { id: uid("dest"), name: "Berchtesgaden", region: "Bavaria", nights: berchNights },
      { id: uid("dest"), name: "Salzburg", region: "Austria", nights: salzburgNights },
    ],
    startDate: start,
    endDate: end,
    travelers: input.travelers,
    status: "planning",
    currency: input.currency,
    budgetCap: input.budgetCap,
    preferences: input.preferences,
    constraints: [
      "November hiking stays in valleys — no high-alpine routes",
      "Short daylight (~9 hours)",
      "One long transit day between Garmisch and Berchtesgaden",
    ],
    origin: input.origin,
    notes:
      "Built for hiking, small towns, and good food without luxury pricing. November means gorge walks, lakes, and towns — not summit days.",
    itinerary,
    transportation: [
      transport({
        type: "flight",
        provider: "To be chosen",
        route: input.origin ? `${input.origin} → Munich (MUC)` : "Home → Munich (MUC)",
        date: start,
        departureTime: input.origin ? "18:20" : undefined,
        arrivalTime: "11:40",
        duration: input.origin ? "~8h 20m + connection" : "TBD",
        cost: flightCost || undefined,
        notes: input.origin
          ? "Recommended routing only. I have not booked this."
          : "Share a departure city and I will attach a realistic routing.",
      }),
      transport({
        type: "train",
        provider: "DB Regio",
        route: "Munich Hbf → Garmisch-Partenkirchen",
        date: munichOut,
        departureTime: "09:32",
        arrivalTime: "11:22",
        duration: "1h 50m",
        cost: 48 * people,
        terminal: "München Hbf, platform TBD",
      }),
      transport({
        type: "train",
        provider: "DB / BRB",
        route: "Garmisch-Partenkirchen → Berchtesgaden via Munich",
        date: garmischOut,
        departureTime: "08:40",
        arrivalTime: "12:50",
        duration: "4h 10m",
        cost: 62 * people,
        notes: "Tightest connection is in Munich — I used a 35+ minute change. If a train runs late, take the next Berchtesgaden service.",
      }),
      transport({
        type: "bus",
        provider: "SVV / line 840",
        route: "Berchtesgaden → Salzburg Hbf",
        date: berchOut,
        departureTime: "10:10",
        arrivalTime: "11:05",
        duration: "55m",
        cost: 14 * people,
      }),
      transport({
        type: "train",
        provider: "ÖBB Railjet",
        route: "Salzburg Hbf → München Hbf",
        date: d(nights - 1),
        departureTime: "08:56",
        arrivalTime: "10:26",
        duration: "1h 30m",
        cost: 39 * people,
        notes: "Morning train so you are not racing an evening flight.",
      }),
      transport({
        type: "flight",
        provider: "To be chosen",
        route: input.origin ? `Munich (MUC) → ${input.origin}` : "Munich (MUC) → Home",
        date: end,
        departureTime: "13:15",
        cost: flightCost || undefined,
        notes: "Afternoon departure recommended after the Salzburg morning train.",
      }),
      transport({
        type: "transfer",
        provider: "MVV S-Bahn S8",
        route: "München Hbf → Munich Airport",
        date: end,
        duration: "45–50m",
        cost: 15 * people,
        status: "recommended",
        notes: "Still missing as a confirmed plan if you fly out. Buy a Tageskarte or single.",
      }),
    ],
    stays: [
      stay({
        property: "Hotel Huber or similar near Hauptbahnhof",
        location: "Munich",
        address: "Near München Hbf — easy first/last night",
        checkIn: start,
        checkOut: munichOut,
        price: stayMunich,
        notes: "Skip the old town premium. You only sleep here.",
        cancellationDeadline: dateOn(start, -3),
      }),
      stay({
        property: "Gästehaus or 3★ garni in Partenkirchen",
        location: "Garmisch-Partenkirchen",
        address: "Partenkirchen side is quieter and closer to the gorge bus",
        checkIn: munichOut,
        checkOut: garmischOut,
        price: stayGarmisch,
        notes: "Breakfast included is common and worth it in November.",
        cancellationDeadline: dateOn(munichOut, -5),
      }),
      stay({
        property: "Family-run hotel in Berchtesgaden town",
        location: "Berchtesgaden",
        checkIn: garmischOut,
        checkOut: berchOut,
        price: stayBerch,
        notes: "Stay in town, not on the mountain — buses thin out in November.",
      }),
      stay({
        property: "Pension or small hotel in the old town / Stein",
        location: "Salzburg",
        address: "Walkable to Getreidegasse; avoid the airport-side big boxes",
        checkIn: berchOut,
        checkOut: end,
        price: staySalz,
        notes: "Book refundable. Mozart weekenders can still fill Saturday nights.",
      }),
    ],
    places: places([
      { name: "Partnach Gorge", type: "hike", location: "Garmisch-Partenkirchen", notes: "Core November hike" },
      { name: "Eibsee", type: "hike", location: "Grainau", notes: "Swap out if ice" },
      { name: "Mittenwald", type: "attraction", location: "Mittenwald", notes: "Painted houses, valley walks" },
      { name: "Königssee", type: "experience", location: "Berchtesgaden", notes: "Boat required" },
      { name: "St. Peter Stiftskulinarium", type: "restaurant", location: "Salzburg", estimatedCost: 55 * people },
      { name: "Hallstatt", type: "attraction", location: "Salzkammergut", notes: "Optional day trip" },
      { name: "Augustiner-Keller", type: "restaurant", location: "Munich" },
    ]),
    documents: docs("Bavaria & Salzburg"),
  });

  trip.budget = [
    line("Flights", flightCost, trip.currency, input.origin ? "Round-trip estimate, not booked" : "Add origin city"),
    line("Stays", stayMunich + stayGarmisch + stayBerch + staySalz, trip.currency, "Recommended mid-range"),
    line("Local transport", (48 + 62 + 14 + 39 + 15) * people, trip.currency),
    line("Activities", (12 + 8 + 10 + 6 + 22 + 19 + 14 + 54) * people, trip.currency),
    line("Food", 42 * people * nights, trip.currency, "Sit-down lunches + one nicer dinner"),
    line("Buffer", Math.round(180 * people), trip.currency),
  ];

  return trip;
}

function buildSlovenia(input: PackBuildInput): Trip {
  const nights = clampNights(input.nights);
  const start = input.startDate;
  const end = dateOn(start, nights);
  const people = input.travelers.length;
  const ljNights = 3;
  const bledNights = Math.min(4, Math.max(3, Math.floor((nights - 6) / 2)));
  const bohinjNights = Math.min(3, nights - ljNights - bledNights - 2);
  const piranNights = nights - ljNights - bledNights - bohinjNights;
  const d = (n: number) => dateOn(start, n);
  const flight = input.origin ? 620 * people : 0;

  const trip = emptyTrip({
    name: "Slovenia: lakes, towns & the coast",
    destinations: [
      { id: uid("dest"), name: "Ljubljana", region: "Slovenia", nights: ljNights },
      { id: uid("dest"), name: "Lake Bled", region: "Julian Alps", nights: bledNights },
      { id: uid("dest"), name: "Bohinj", region: "Julian Alps", nights: bohinjNights },
      { id: uid("dest"), name: "Piran", region: "Slovenian coast", nights: piranNights },
    ],
    startDate: start,
    endDate: end,
    travelers: input.travelers,
    status: "planning",
    currency: input.currency,
    budgetCap: input.budgetCap,
    preferences: input.preferences,
    origin: input.origin,
    constraints: [
      "November: valley walks and lakes, not Vršič Pass hiking",
      "A small rental car is cheaper than stitching buses after Bled",
    ],
    notes: "Usually the best-value match for hiking + small towns + food in Europe in November.",
    itinerary: [
      item({ date: start, startTime: "13:15", title: "Arrive Ljubljana", location: "LJU", category: "transport" }),
      item({
        date: start,
        startTime: "17:00",
        title: "Old town + river dinner",
        location: "Ljubljanica",
        category: "meal",
        estimatedCost: 32 * people,
      }),
      item({
        date: d(1),
        startTime: "10:00",
        title: "Castle funicular + Central Market",
        location: "Ljubljana",
        category: "activity",
        estimatedCost: 16 * people,
      }),
      item({
        date: d(ljNights),
        startTime: "10:00",
        title: "Bus or car to Lake Bled",
        location: "Bled",
        category: "transport",
        travelTimeMinutes: 50,
        estimatedCost: 10 * people,
      }),
      item({
        date: d(ljNights + 1),
        startTime: "09:00",
        title: "Bled lake loop + cream cake",
        location: "Lake Bled",
        category: "activity",
        estimatedCost: 8 * people,
        notes: "6 km flat loop. November fog is common before 11am.",
      }),
      item({
        date: d(ljNights + 2),
        startTime: "09:30",
        title: "Vintgar Gorge if open, else Ojstrica viewpoint",
        location: "near Bled",
        category: "activity",
        estimatedCost: 10 * people,
        alternatives: ["Ojstrica / Mala Osojnica", "Bled Castle museum"],
        notes: "Vintgar often closes or runs limited hours in late autumn — confirm the week of travel.",
      }),
      item({
        date: d(ljNights + bledNights),
        title: "Move to Bohinj — lakeside rest town",
        location: "Ribčev Laz",
        category: "transport",
      }),
      item({
        date: d(ljNights + bledNights + 1),
        startTime: "09:30",
        title: "Lake Bohinj shoreline + Savica approach (lower trail)",
        location: "Bohinj",
        category: "activity",
        notes: "Do not attempt Vogel ridge walks in November ice.",
      }),
      item({
        date: d(ljNights + bledNights + bohinjNights),
        title: "Cross to Piran via Postojna or Lipica",
        location: "Piran",
        category: "transport",
        notes: "Optional 90-minute stop at Škocjan or Postojna if rain follows you.",
      }),
      item({
        date: d(nights - 2),
        title: "Piran walls + seafood lunch",
        location: "Piran",
        category: "meal",
        estimatedCost: 36 * people,
      }),
      item({
        date: end,
        startTime: "09:00",
        title: "Return to LJU and fly out",
        location: "Ljubljana Airport",
        category: "transport",
        travelTimeMinutes: 80,
      }),
    ],
    transportation: [
      transport({
        type: "flight",
        route: input.origin ? `${input.origin} → Ljubljana (LJU)` : "Home → Ljubljana (LJU)",
        date: start,
        cost: flight || undefined,
      }),
      transport({
        type: "car_rental",
        provider: "Local / Europcar LJU",
        route: "Ljubljana airport pickup after city days",
        date: d(ljNights),
        cost: 38 * Math.max(nights - ljNights, 4),
        notes: "Pick up after the city so you skip paying for a parked car in Ljubljana.",
      }),
      transport({
        type: "flight",
        route: input.origin ? `Ljubljana (LJU) → ${input.origin}` : "Ljubljana (LJU) → Home",
        date: end,
        cost: flight || undefined,
      }),
    ],
    stays: [
      stay({
        property: "River-side pension in the old town",
        location: "Ljubljana",
        checkIn: start,
        checkOut: d(ljNights),
        price: 85 * ljNights,
      }),
      stay({
        property: "Guesthouse above the lake",
        location: "Bled",
        checkIn: d(ljNights),
        checkOut: d(ljNights + bledNights),
        price: 95 * bledNights,
      }),
      stay({
        property: "Lakeside apartment or pension",
        location: "Bohinj",
        checkIn: d(ljNights + bledNights),
        checkOut: d(ljNights + bledNights + bohinjNights),
        price: 80 * Math.max(bohinjNights, 0),
      }),
      stay({
        property: "Townhouse stay inside the walls",
        location: "Piran",
        checkIn: d(ljNights + bledNights + bohinjNights),
        checkOut: end,
        price: 90 * Math.max(piranNights, 0),
      }),
    ],
    places: places([
      { name: "Lake Bled loop", type: "hike", location: "Bled" },
      { name: "Vintgar Gorge", type: "hike", location: "near Bled" },
      { name: "Lake Bohinj", type: "hike", location: "Bohinj" },
      { name: "Piran old town", type: "attraction", location: "Piran" },
      { name: "Gostilna Lectar", type: "restaurant", location: "Radovljica", notes: "Detour for potica and stew" },
    ]),
    documents: docs("Slovenia"),
  });

  trip.budget = [
    line("Flights", flight, trip.currency, input.origin ? "Often cheaper than MUC" : "Add origin city"),
    line("Stays", trip.stays.reduce((s, x) => s + (x.price ?? 0), 0), trip.currency),
    line("Car / local transport", 38 * Math.max(nights - 3, 4) + 40 * people, trip.currency),
    line("Activities", 80 * people, trip.currency),
    line("Food", 38 * people * nights, trip.currency),
    line("Buffer", 140 * people, trip.currency),
  ];
  return trip;
}

function buildPortugal(input: PackBuildInput): Trip {
  const nights = clampNights(input.nights);
  const start = input.startDate;
  const end = dateOn(start, nights);
  const people = input.travelers.length;
  const lisbon = 4;
  const sintra = 2;
  const porto = Math.min(4, nights - lisbon - sintra - 3);
  const douro = nights - lisbon - sintra - porto;
  const d = (n: number) => dateOn(start, n);
  const flight = input.origin ? 720 * people : 0;

  const trip = emptyTrip({
    name: "Portugal: Lisbon, Sintra, Douro",
    destinations: [
      { id: uid("dest"), name: "Lisbon", region: "Portugal", nights: lisbon },
      { id: uid("dest"), name: "Sintra", region: "Portugal", nights: sintra },
      { id: uid("dest"), name: "Porto", region: "Portugal", nights: porto },
      { id: uid("dest"), name: "Douro Valley", region: "Portugal", nights: douro },
    ],
    startDate: start,
    endDate: end,
    travelers: input.travelers,
    status: "planning",
    currency: input.currency,
    budgetCap: input.budgetCap,
    preferences: input.preferences,
    origin: input.origin,
    constraints: [
      "November is wetter than summer — pack a real rain jacket",
      "Hills in Lisbon/Porto, not mountain hiking",
    ],
    notes: "Best food-and-towns option. Hiking is coastal and vineyard walking, not alpine.",
    itinerary: [
      item({ date: start, title: "Arrive Lisbon, neighborhood walk in Alfama", location: "Lisbon", category: "activity" }),
      item({
        date: d(1),
        startTime: "10:00",
        title: "Time Out Market + Belém afternoon",
        location: "Lisbon",
        category: "meal",
        estimatedCost: 24 * people,
      }),
      item({
        date: d(2),
        title: "LX Factory + riverside sunset",
        location: "Lisbon",
        category: "activity",
      }),
      item({
        date: d(lisbon),
        title: "Train to Sintra, stay overnight to beat day-trip crowds",
        location: "Sintra",
        category: "transport",
        travelTimeMinutes: 40,
      }),
      item({
        date: d(lisbon + 1),
        startTime: "09:00",
        title: "Pena + Moorish castle — one palace, not three",
        location: "Sintra",
        category: "activity",
        estimatedCost: 20 * people,
        notes: "Do not stack Quinta da Regaleira the same morning.",
      }),
      item({
        date: d(lisbon + sintra),
        title: "Return to Lisbon and take the afternoon train to Porto",
        location: "Porto",
        category: "transport",
        travelTimeMinutes: 180,
        estimatedCost: 35 * people,
      }),
      item({
        date: d(lisbon + sintra + 1),
        title: "Ribeira, Dom Luís bridge, one port lodge",
        location: "Porto / Gaia",
        category: "activity",
        estimatedCost: 18 * people,
      }),
      item({
        date: d(lisbon + sintra + porto),
        title: "Train or driver to a Douro village",
        location: "Pinhão",
        category: "transport",
      }),
      item({
        date: d(lisbon + sintra + porto + 1),
        title: "Vineyard walk + quinta lunch",
        location: "Douro Valley",
        category: "meal",
        estimatedCost: 40 * people,
      }),
      item({
        date: end,
        title: "Return via Porto and depart",
        location: "OPO",
        category: "transport",
      }),
    ],
    transportation: [
      transport({
        type: "flight",
        route: input.origin ? `${input.origin} → Lisbon (LIS)` : "Home → Lisbon (LIS)",
        date: start,
        cost: flight || undefined,
      }),
      transport({
        type: "train",
        provider: "CP",
        route: "Lisbon Oriente → Porto Campanhã",
        date: d(lisbon + sintra),
        duration: "3h",
        cost: 35 * people,
      }),
      transport({
        type: "train",
        provider: "CP Douro line",
        route: "Porto São Bento → Pinhão",
        date: d(lisbon + sintra + porto),
        duration: "2h 20m",
        cost: 18 * people,
      }),
      transport({
        type: "flight",
        route: input.origin ? `Porto (OPO) → ${input.origin}` : "Porto (OPO) → Home",
        date: end,
        cost: flight || undefined,
        notes: "Open-jaw LIS in / OPO out avoids a backtrack.",
      }),
    ],
    stays: [
      stay({
        property: "Alfama or Graça guesthouse",
        location: "Lisbon",
        checkIn: start,
        checkOut: d(lisbon),
        price: 100 * lisbon,
      }),
      stay({
        property: "Sintra village inn",
        location: "Sintra",
        checkIn: d(lisbon),
        checkOut: d(lisbon + sintra),
        price: 95 * sintra,
      }),
      stay({
        property: "Ribeira or Cedofeita apartment",
        location: "Porto",
        checkIn: d(lisbon + sintra),
        checkOut: d(lisbon + sintra + porto),
        price: 105 * porto,
      }),
      stay({
        property: "Small quinta near Pinhão",
        location: "Douro Valley",
        checkIn: d(lisbon + sintra + porto),
        checkOut: end,
        price: 130 * Math.max(douro, 0),
      }),
    ],
    places: places([
      { name: "Time Out Market", type: "restaurant", location: "Lisbon" },
      { name: "Pena Palace", type: "attraction", location: "Sintra" },
      { name: "Dom Luís Bridge", type: "attraction", location: "Porto" },
      { name: "Douro vineyard walk", type: "hike", location: "Pinhão" },
    ]),
    documents: docs("Portugal"),
  });

  trip.budget = [
    line("Flights", flight, trip.currency, "Open-jaw LIS/OPO"),
    line("Stays", trip.stays.reduce((s, x) => s + (x.price ?? 0), 0), trip.currency),
    line("Trains", 70 * people, trip.currency),
    line("Activities", 90 * people, trip.currency),
    line("Food", 40 * people * nights, trip.currency, "This is the splurge category — worth it"),
    line("Buffer", 150 * people, trip.currency),
  ];
  return trip;
}

export const destinationPacks: DestinationPack[] = [
  {
    id: "slovenia",
    name: "Slovenia",
    tagline: "Lakes, compact towns, and the best November value",
    region: "Central Europe",
    matchTags: [
      "europe",
      "november",
      "hiking",
      "hike",
      "small town",
      "small towns",
      "food",
      "budget",
      "fortune",
      "cheap",
      "alps",
      "lakes",
      "two weeks",
    ],
    whyItFits:
      "Shorter drives, lower prices than Bavaria, and a natural loop: capital → lakes → coast. November hiking stays on lakeshores and gorges.",
    pace: "moderate",
    currency: "EUR",
    dailyBudget: { low: 95, mid: 140, high: 210 },
    cities: [
      { name: "Ljubljana", nights: 3, vibe: "Walkable capital, markets, river dinners" },
      { name: "Bled", nights: 4, vibe: "Lake loop, viewpoints, cream cake" },
      { name: "Bohinj", nights: 3, vibe: "Quieter, more hiking, fewer crowds" },
      { name: "Piran", nights: 3, vibe: "Venetian-scale town and seafood" },
    ],
    visaNote: "Schengen. US/UK/EU travelers typically do not need a visa for short stays — confirm against your passport.",
    weatherByMonth: {
      "11": "4–10°C, fog on the lakes in the morning, rain possible. Daylight ~9.5 hours. High passes are not a hiking plan.",
    },
    constraints: ["No high-alpine November hiking", "Car useful after Ljubljana"],
    build: buildSlovenia,
  },
  {
    id: "bavaria",
    name: "Bavarian Alps & Salzburg",
    tagline: "Gorges, lake boats, and Alpine towns without a luxury budget",
    region: "Germany / Austria",
    matchTags: [
      "europe",
      "november",
      "hiking",
      "hike",
      "small town",
      "small towns",
      "food",
      "alps",
      "germany",
      "austria",
      "salzburg",
      "bavaria",
      "christmas",
      "two weeks",
    ],
    whyItFits:
      "Classic small-town Alps with serious food. November is gorge and lake season, not summit season. Trains make a car optional.",
    pace: "moderate",
    currency: "EUR",
    dailyBudget: { low: 120, mid: 170, high: 260 },
    cities: [
      { name: "Munich", nights: 2, vibe: "Arrival buffer and one market dinner" },
      { name: "Garmisch-Partenkirchen", nights: 4, vibe: "Partnach, Eibsee, Mittenwald" },
      { name: "Berchtesgaden", nights: 3, vibe: "Königssee and indoor rain backups" },
      { name: "Salzburg", nights: 4, vibe: "Old town, food, optional Hallstatt" },
    ],
    visaNote: "Schengen. Same short-stay rules as the rest of the zone.",
    weatherByMonth: {
      "11": "0–8°C in the valleys, possible snow above 1,200 m. Eibsee and Partnach usually remain walkable. Christmas markets often open in the second half of the month.",
    },
    constraints: ["One 4-hour transfer day", "Valley hiking only"],
    build: buildBavaria,
  },
  {
    id: "portugal",
    name: "Portugal",
    tagline: "The food-first option — milder, wetter, fewer mountains",
    region: "Iberia",
    matchTags: [
      "europe",
      "november",
      "food",
      "small town",
      "small towns",
      "budget",
      "wine",
      "coast",
      "mild",
      "portugal",
      "two weeks",
    ],
    whyItFits:
      "Warmest of the three, outstanding everyday food, and small towns in Sintra and the Douro. Hiking is coastal and vineyard walks.",
    pace: "relaxed",
    currency: "EUR",
    dailyBudget: { low: 110, mid: 160, high: 240 },
    cities: [
      { name: "Lisbon", nights: 4, vibe: "Neighborhoods and markets" },
      { name: "Sintra", nights: 2, vibe: "Palaces without a rushed day trip" },
      { name: "Porto", nights: 4, vibe: "River city and one lodge" },
      { name: "Douro", nights: 3, vibe: "Villages and vineyard walking" },
    ],
    visaNote: "Schengen short stay for most visa-exempt passports.",
    weatherByMonth: {
      "11": "12–18°C, frequent rain, still pleasant for towns. Douro can be misty and beautiful.",
    },
    constraints: ["Not a mountain-hiking trip", "Rain jacket required"],
    build: buildPortugal,
  },
];

export function scorePack(pack: DestinationPack, text: string): number {
  const hay = text.toLowerCase();
  let score = 0;
  for (const tag of pack.matchTags) {
    if (hay.includes(tag)) score += tag.length > 8 ? 3 : 2;
  }
  if (hay.includes(pack.name.toLowerCase())) score += 8;
  if (hay.includes(pack.id)) score += 8;
  return score;
}

export function rankPacks(text: string, limit = 3): DestinationPack[] {
  return [...destinationPacks]
    .map((pack) => ({ pack, score: scorePack(pack, text) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.pack);
}

export function findPack(nameOrId: string): DestinationPack | undefined {
  const q = nameOrId.toLowerCase();
  return destinationPacks.find(
    (p) =>
      p.id === q ||
      p.name.toLowerCase() === q ||
      p.name.toLowerCase().includes(q) ||
      q.includes(p.id) ||
      q.includes(p.name.toLowerCase().split(" ")[0] ?? ""),
  );
}

export function nextNovemberStart(from = new Date()): string {
  const year = from.getMonth() >= 10 ? from.getFullYear() + 1 : from.getFullYear();
  return `${year}-11-08`;
}

export function inferNightsFromText(text: string, fallback = 13): number {
  const week = text.match(/(\d+)\s*weeks?/i);
  if (week) return Number(week[1]) * 7 - 1;
  const day = text.match(/(\d+)\s*days?/i);
  if (day) return Math.max(2, Number(day[1]) - 1);
  return fallback;
}
