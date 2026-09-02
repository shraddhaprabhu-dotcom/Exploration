import { addDays, format, parseISO, getISODay } from "date-fns";
import type { AgentResponse, ChangeProposal, DestinationPack, Trip, TripMutation } from "./types";
import { destinationPacks, findPack, inferNightsFromText, nextNovemberStart, rankPacks } from "./destinations";
import { detectInsights, nextActions } from "./insights";
import { applyMutations, dateOn, defaultTravelers, item, rebuildBudget } from "./trip-utils";
import { budgetTotals, formatDate, money, nightCount } from "./format";
import { uid } from "./ids";

const WEEKDAYS: Record<string, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
};

export function handleAgentMessage(trip: Trip | null, text: string, now = new Date()): AgentResponse {
  const message = text.trim();
  const lower = message.toLowerCase();

  if (!message) {
    return {
      message: "Tell me where you want to go, or what to change.",
      mutations: [],
    };
  }

  if (isDiscovery(lower) || !trip || trip.destinations.length === 0) {
    const chosen = matchChosenPack(lower);
    if (chosen) return buildFromPack(trip, chosen, message, now);
    return discover(trip, message, now);
  }

  if (matchChosenPack(lower) && /let's|lets|choose|go with|do |pick|build|book this|love that/i.test(lower)) {
    return buildFromPack(trip, matchChosenPack(lower)!, message, now);
  }

  if (/more relaxed|slow(er)? (it )?down|less packed|too ambitious/i.test(lower)) {
    return relaxTrip(trip);
  }

  if (/rain|weather|forecast/i.test(lower) && /fix|swap|change|tomorrow|hike/i.test(lower)) {
    return rainFix(trip, lower);
  }

  if (/cheaper hotel|cheaper stay|save on (the )?hotel|budget stay/i.test(lower)) {
    return cheaperStay(trip);
  }

  if (/upgrade (one )?stay|better(-| )rated|unused budget/i.test(lower)) {
    return upgradeStay(trip);
  }

  if (/add .*day|extra day|two days|another day/i.test(lower)) {
    return addDaysInPlace(trip, message);
  }

  if (/remove|drop|skip|cancel the/i.test(lower) && /hike|hiking|day|museum|hallstatt/i.test(lower)) {
    return removeMatching(trip, message);
  }

  if (/move |shift /i.test(lower)) {
    return moveItem(trip, message);
  }

  if (/another city|add (a )?city|fit .*city/i.test(lower)) {
    return addCity(trip, message);
  }

  if (/depart|origin|fly from|leaving from|we are in /i.test(lower)) {
    return setOrigin(trip, message);
  }

  if (/mark .*booked|we booked|booking ref|confirmation/i.test(lower)) {
    return markBooked(trip, message);
  }

  if (/budget|cost|how much/i.test(lower)) {
    return budgetAnswer(trip);
  }

  if (/what.*(booked|missing|next)|status|on track/i.test(lower)) {
    return statusAnswer(trip);
  }

  if (/rebuild|start over|new plan|build the trip/i.test(lower)) {
    const pack = findPack(trip.name) ?? rankPacks(trip.name + trip.preferences.join(" "))[0];
    if (pack) return buildFromPack(trip, pack, message, now);
  }

  return followUp(trip, message);
}

function isDiscovery(lower: string): boolean {
  return (
    /weeks? in|days? in|want to go|thinking of|planning a|i have |trip to|like hiking|recommend|where should|suggest/i.test(
      lower,
    ) && !/move |remove |cheaper|relaxed|rain/i.test(lower)
  );
}

function matchChosenPack(lower: string): DestinationPack | undefined {
  return destinationPacks.find((pack) => {
    const tokens = [pack.id, ...pack.name.toLowerCase().split(/[^a-z]+/).filter((t) => t.length > 3)];
    return tokens.some((token) => lower.includes(token));
  });
}

function travelerCount(text: string): number {
  const duo = /(?:two of us|my partner|wife|husband|girlfriend|boyfriend|couple)/i.test(text);
  const n = text.match(/(\d+)\s*(?:people|travelers|adults|of us)/i);
  if (n) return Number(n[1]);
  if (duo) return 2;
  if (/solo|just me|by myself/i.test(text)) return 1;
  return 2;
}

function parseBudgetCap(text: string): number | undefined {
  const m = text.match(/(?:budget|under|max|cap)\s*(?:of\s*)?(?:€|eur|\$)?\s*(\d[\d,]*)/i);
  if (m) return Number(m[1].replace(/,/g, ""));
  if (/don't want to spend a fortune|not (a )?fortune|budget|cheap|keep costs/i.test(text)) return 5600;
  return undefined;
}

function parseOrigin(text: string): string | undefined {
  const from = text.match(
    /(?:from|leaving|departing|fly out of|out of)\s+([A-Z]{3}|[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
  );
  if (from) return from[1];
  const city = text.match(
    /\b(New York|NYC|Boston|Chicago|London|Berlin|Paris|San Francisco|Seattle|Toronto|Los Angeles|LA|Mumbai|Delhi|Bangalore|Singapore)\b/i,
  );
  return city?.[1];
}

function parseStartDate(text: string, now: Date): string | undefined {
  const iso = text.match(/(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  if (/november/i.test(text)) return nextNovemberStart(now);
  if (/next week/i.test(text)) return format(addDays(now, 7), "yyyy-MM-dd");
  return undefined;
}

function discover(trip: Trip | null, text: string, now: Date): AgentResponse {
  const packs = rankPacks(text);
  const nights = inferNightsFromText(text);
  const start = parseStartDate(text, now) ?? trip?.startDate;
  const origin = parseOrigin(text) ?? trip?.origin;
  const people = travelerCount(text);
  const cap = parseBudgetCap(text);

  const mutations: TripMutation[] = [];
  if (trip) {
    mutations.push({
      type: "patch_trip",
      patch: {
        status: "idea",
        preferences: extractPreferences(text),
        constraints: extractConstraints(text),
        travelers: defaultTravelers(people),
        origin,
        budgetCap: cap ?? trip.budgetCap,
        startDate: start ?? trip.startDate,
        endDate: start ? dateOn(start, nights) : trip.endDate,
        notes: text,
      },
    });
  }

  const lines = packs.map((pack, i) => {
    const mid = pack.dailyBudget.mid * (nights + 1) * people;
    return `${i + 1}. **${pack.name}** — ${pack.tagline}
   ${pack.whyItFits}
   Pace: ${pack.pace} · Mid-range ballpark ${money(mid, pack.currency)} for ${people} traveler${people === 1 ? "" : "s"}, excluding or including flights depending on origin.
   ${start ? pack.weatherByMonth[start.slice(5, 7)] ?? "" : ""}`;
  });

  return {
    message: `I will not dump a list of countries. From what you said, these three actually fit.

${lines.join("\n\n")}

**Assumptions I am using:** ${people} traveler${people === 1 ? "" : "s"}${start ? `, starting ${formatDate(start, "MMM d, yyyy")}` : ", dates still open"}${origin ? `, flying from ${origin}` : ", origin city not set yet"}${cap ? `, cap around ${money(cap, "EUR")}` : ""}. I have not booked anything.

Pick one and I will build the workspace — days, stays, trains, budget, and what is still open.`,
    mutations,
    suggestedReplies: packs.map((p) => `Let’s do ${p.name.split("&")[0].trim()}`),
  };
}

function buildFromPack(trip: Trip | null, pack: DestinationPack, text: string, now: Date): AgentResponse {
  const nights = inferNightsFromText(text, trip?.startDate && trip.endDate ? nightCount(trip.startDate, trip.endDate) : 13);
  const start = parseStartDate(text, now) ?? trip?.startDate ?? nextNovemberStart(now);
  const people = Math.max(trip?.travelers.length ?? 0, travelerCount(text));
  const built = pack.build({
    startDate: start,
    nights,
    travelers: trip?.travelers.length ? trip.travelers : defaultTravelers(people),
    origin: parseOrigin(text) ?? trip?.origin,
    budgetCap: parseBudgetCap(text) ?? trip?.budgetCap,
    currency: pack.currency,
    preferences: unique([...(trip?.preferences ?? []), ...extractPreferences(text)]),
  });

  const preview = applyMutations(trip ?? built, [{ type: "replace_trip", trip: built }]);
  const insights = detectInsights(preview);
  const actions = nextActions(preview);
  const totals = budgetTotals(preview);

  return {
    message: `Built **${built.name}** into your workspace.

${formatDate(built.startDate, "MMM d")} – ${formatDate(built.endDate, "MMM d, yyyy")} · ${built.travelers.length} traveler${built.travelers.length === 1 ? "" : "s"} · ${built.destinations.map((d) => d.name).join(" → ")}

I kept the days geographically tight: no ping-ponging across the Alps. November hiking stays in valleys and gorges. Food is planned; summit days are not.

**Budget (estimated, not booked):** ${money(totals.estimated, built.currency)}${built.budgetCap ? ` against a ${money(built.budgetCap, built.currency)} cap` : ""}.

**Still open:** ${insights
      .filter((i) => i.kind === "missing")
      .map((i) => i.title)
      .join(" · ") || "nothing structural — bookings still need your confirmation."}

**Do next**
${actions.map((a) => `• ${a}`).join("\n")}

${pack.visaNote}

Nothing in this plan is booked. Recommended stays and trains are placeholders you can mark booked when you have a reference.`,
    mutations: [{ type: "replace_trip", trip: built }],
    suggestedReplies: [
      "Make this trip more relaxed",
      "Find a cheaper hotel",
      "We fly from New York",
      "What’s still missing?",
    ],
  };
}

function isEssential(item: Trip["itinerary"][number]): boolean {
  return (
    item.category === "transport" ||
    /arrive|depart|fly out|airport|check-in|check in/i.test(item.title)
  );
}

function relaxTrip(trip: Trip): AgentResponse {
  const drop = trip.itinerary.filter(
    (i) =>
      !isEssential(i) &&
      (/hallstatt|day trip|palace \+|vintgar|full day/i.test(i.title) || (i.travelTimeMinutes ?? 0) > 140),
  );
  if (!drop.length) {
    const busy = [...trip.itinerary]
      .filter((i) => !isEssential(i) && i.category === "activity")
      .sort((a, b) => (b.travelTimeMinutes ?? 0) - (a.travelTimeMinutes ?? 0))[0];
    if (!busy) {
      return { message: "The days are already fairly open. I would not strip more without turning this into a sofa trip.", mutations: [] };
    }
    const rest = item({
      date: busy.date,
      startTime: busy.startTime,
      title: "Unscheduled morning — café + walk",
      location: busy.location,
      category: "free",
      notes: `Replaced “${busy.title}” to protect energy.`,
    });
    return {
      message: `CHANGE PROPOSED

${formatDate(busy.date)}
• Remove ${busy.title}
• Add a free morning in ${busy.location ?? "town"}
• Keep stays and trains as they are

This is the smallest change that actually makes the trip calmer.`,
      mutations: [],
      proposal: proposal("Relax the busiest day", "Protect energy without redoing the route.", [
        { summary: `Remove ${busy.title}`, apply: { type: "remove_item", itemId: busy.id } },
        { summary: "Add a free morning", apply: { type: "upsert_item", item: rest } },
      ]),
      suggestedReplies: ["Apply these changes", "Keep the original day"],
    };
  }

  const replacements = drop.map((entry) =>
    item({
      date: entry.date,
      startTime: "10:30",
      title: "Slow local day — bakery, short walk, no transit",
      location: trip.stays.find((s) => s.checkIn <= entry.date && s.checkOut > entry.date)?.location ?? entry.location,
      category: "free",
      notes: `Replaced long-haul day “${entry.title}”.`,
    }),
  );

  return {
    message: `CHANGE PROPOSED

The trip was trying to do a long day trip on top of an already moving itinerary. November daylight does not support that.

${drop.map((d) => `• Drop ${d.title} on ${formatDate(d.date)}`).join("\n")}
${replacements.map((r) => `• Replace with a slow local day in ${r.location ?? "town"}`).join("\n")}
• Keep every hotel and train

[Review changes]`,
    mutations: [],
    proposal: proposal(
      "Make the trip more relaxed",
      "Remove the long day-trip and keep you in the town you already paid to stay in.",
      [
        ...drop.map((d) => ({ summary: `Remove ${d.title}`, apply: { type: "remove_item" as const, itemId: d.id } })),
        ...replacements.map((item) => ({ summary: `Add ${item.title}`, apply: { type: "upsert_item" as const, item } })),
      ],
    ),
    suggestedReplies: ["Apply these changes", "Only drop Hallstatt"],
  };
}

function rainFix(trip: Trip, lower: string): AgentResponse {
  const target = pickTargetDay(trip, lower);
  const hike = trip.itinerary.find(
    (i) => i.date === target && i.category === "activity" && /hike|gorge|eibsee|loop|trail|lake|hallstatt/i.test(i.title),
  );
  if (!hike) {
    return {
      message: "I do not see an outdoor day that needs swapping. If you tell me the date, I will rebuild that morning indoors.",
      mutations: [],
    };
  }
  const indoor =
    hike.alternatives?.[0] ??
    (hike.location?.toLowerCase().includes("salzburg")
      ? "Salzburg Museum + café afternoon"
      : hike.location?.toLowerCase().includes("garmisch")
        ? "Zugspitze indoor viewing + town museums"
        : "Town museum + long lunch");
  const swapped = {
    ...hike,
    title: indoor,
    notes: `🌧️ Swapped from “${hike.title}” because of rain. Original hike remains as an alternative.`,
    alternatives: [hike.title, ...(hike.alternatives ?? []).slice(1)],
    category: hike.category,
  };
  return {
    message: `🌧️ Rain is a problem for **${hike.title}**. I can swap it for **${indoor}** and keep the hotel.

The original hike stays attached as an alternative if the sky clears.`,
    mutations: [],
    proposal: proposal("Rain swap", `Replace ${hike.title} with an indoor plan.`, [
      { summary: `Swap to ${indoor}`, apply: { type: "upsert_item", item: swapped } },
    ]),
    suggestedReplies: ["Apply these changes", "Keep the hike anyway"],
  };
}

function cheaperStay(trip: Trip): AgentResponse {
  const pricey = [...trip.stays].sort((a, b) => (b.price ?? 0) - (a.price ?? 0))[0];
  if (!pricey) return { message: "There are no stays to reprice yet.", mutations: [] };
  const savings = Math.round((pricey.price ?? 0) * 0.22);
  const updated = {
    ...pricey,
    property: `${pricey.property} → simpler guesthouse nearby`,
    price: Math.max(40, (pricey.price ?? 0) - savings),
    notes: `Cheaper alternative in the same town. Saves about ${savings} ${trip.currency}. Still recommended, not booked.`,
    status: "recommended" as const,
  };
  const nextBudget = rebuildBudget({ ...trip, stays: trip.stays.map((s) => (s.id === pricey.id ? updated : s)) });
  return {
    message: `You asked for a cheaper hotel. The highest line is **${pricey.property}** in ${pricey.location}.

I can move you to a simpler guesthouse in the same neighborhood and save about ${money(savings, trip.currency)}. Location stays walkable. This is still only a recommendation.`,
    mutations: [],
    proposal: proposal("Cheaper stay", `Reduce the ${pricey.location} stay without changing dates.`, [
      { summary: `Switch ${pricey.location} stay`, apply: { type: "upsert_stay", stay: updated } },
      { summary: "Recalculate budget", apply: { type: "set_budget", budget: nextBudget } },
    ]),
    suggestedReplies: ["Apply these changes", "Keep the original stay"],
  };
}

function upgradeStay(trip: Trip): AgentResponse {
  const first = trip.stays[0];
  if (!first) return { message: "No stays to upgrade yet.", mutations: [] };
  const upgraded = {
    ...first,
    property: `${first.property.replace(/ or similar.*/, "")} — better-rated inn nearby`,
    price: Math.round((first.price ?? 80) * 1.18),
    notes: "Uses unused accommodation budget. Same dates, better breakfast and quieter rooms.",
  };
  return {
    message: `You are under the accommodation comfort line. I would spend the extra on **${first.location}**, not on a fancier dinner.

Proposed: a better-rated inn, same check-in, still refundable in this plan.`,
    mutations: [],
    proposal: proposal("Upgrade one stay", `Spend unused budget in ${first.location}.`, [
      { summary: `Upgrade ${first.location}`, apply: { type: "upsert_stay", stay: upgraded } },
    ]),
    suggestedReplies: ["Apply these changes"],
  };
}

function addDaysInPlace(trip: Trip, text: string): AgentResponse {
  const n = Number(text.match(/(\d+)\s*days?/i)?.[1] ?? 2);
  const place =
    destinationPacks
      .flatMap((p) => p.cities.map((c) => c.name))
      .find((city) => text.toLowerCase().includes(city.toLowerCase())) ??
    trip.destinations.at(-1)?.name ??
    "town";
  if (!trip.endDate) return { message: "Set dates first, then I can extend a city.", mutations: [] };

  const newEnd = dateOn(trip.endDate, n);
  const dest = trip.destinations.find((d) => d.name.toLowerCase() === place.toLowerCase());
  const stayRow = trip.stays.find((s) => s.location.toLowerCase().includes(place.toLowerCase()) || place.toLowerCase().includes(s.location.toLowerCase()));
  const extra = Array.from({ length: n }, (_, i) =>
    item({
      date: dateOn(trip.endDate!, i),
      startTime: "10:00",
      title: `Extra day in ${place} — no transit`,
      location: place,
      category: "free",
      notes: "Added at the end so existing bookings (if any) keep their dates.",
    }),
  );

  const mutations: TripMutation[] = [
    {
      type: "patch_trip",
      patch: {
        endDate: newEnd,
        destinations: dest
          ? trip.destinations.map((d) => (d.id === dest.id ? { ...d, nights: (d.nights ?? 0) + n } : d))
          : [...trip.destinations, { id: uid("dest"), name: place, nights: n }],
      },
    },
    ...extra.map((row) => ({ type: "upsert_item" as const, item: row })),
  ];
  if (stayRow) {
    mutations.push({
      type: "upsert_stay",
      stay: {
        ...stayRow,
        checkOut: dateOn(stayRow.checkOut, n),
        nights: stayRow.nights + n,
        price: stayRow.price ? Math.round(stayRow.price + (stayRow.price / stayRow.nights) * n) : stayRow.price,
      },
    });
  }

  return {
    message: `CHANGE PROPOSED

Add **${n} day${n === 1 ? "" : "s"} in ${place}** at the end of the trip.
• New end date ${formatDate(newEnd, "MMM d, yyyy")}
• Existing earlier stays and trains stay put
• ${stayRow ? `Extend the ${stayRow.property} checkout` : "You will need a stay for the new nights"}

[Review changes]`,
    mutations: [],
    proposal: proposal(`Add ${n} days in ${place}`, "Extend the end of the trip so earlier bookings stay valid.", mutations.map((apply) => ({
      summary: apply.type.replace(/_/g, " "),
      apply,
    }))),
    suggestedReplies: ["Apply these changes"],
  };
}

function removeMatching(trip: Trip, text: string): AgentResponse {
  const tokens = text.toLowerCase();
  const match = trip.itinerary.find((i) => {
    const hay = `${i.title} ${i.location ?? ""}`.toLowerCase();
    return tokens.split(/\s+/).some((word) => word.length > 3 && hay.includes(word));
  });
  if (!match) return { message: "I could not find that day. Name the activity and I will cut it.", mutations: [] };
  return {
    message: `I can remove **${match.title}** on ${formatDate(match.date)} and leave a free morning. Stays stay as they are.`,
    mutations: [],
    proposal: proposal(`Remove ${match.title}`, "Cut the activity, keep lodging.", [
      { summary: `Remove ${match.title}`, apply: { type: "remove_item", itemId: match.id } },
    ]),
    suggestedReplies: ["Apply these changes"],
  };
}

function moveItem(trip: Trip, text: string): AgentResponse {
  const weekday = Object.keys(WEEKDAYS).find((day) => text.toLowerCase().includes(day));
  const targetDate = weekday && trip.startDate ? dateForWeekday(trip, weekday) : undefined;
  const match = trip.itinerary.find((i) => {
    const hay = `${i.title} ${i.location ?? ""}`.toLowerCase();
    return text
      .toLowerCase()
      .split(/\s+/)
      .some((word) => word.length > 4 && hay.includes(word));
  });
  if (!match || !targetDate) {
    return {
      message: "Tell me what to move and which weekday. Example: “Move the museum to Wednesday.”",
      mutations: [],
    };
  }
  return {
    message: `CHANGE PROPOSED

${formatDate(targetDate)}
• Move **${match.title}** from ${formatDate(match.date)} → ${formatDate(targetDate)}
• Keep restaurant reservations and hotels
• Check walking distance that morning — I will not auto-shuffle the rest unless you ask

[Review changes]`,
    mutations: [],
    proposal: proposal(`Move ${match.title}`, "Preserve stays and other bookings.", [
      { summary: `Move to ${formatDate(targetDate)}`, apply: { type: "move_item", itemId: match.id, date: targetDate } },
    ]),
    suggestedReplies: ["Apply these changes"],
  };
}

function addCity(trip: Trip, text: string): AgentResponse {
  return {
    message: `We can fit another city only if we steal nights from the current loop. Right now the route is ${trip.destinations.map((d) => d.name).join(" → ")}.

Adding a distant city would create a transit day and usually a new hotel. Tell me which city and I will propose a night shift before changing anything.

A nearby add (same region) is usually the only honest “yes.”`,
    mutations: [],
    suggestedReplies: trip.destinations[0] ? [`Add two days in ${trip.destinations.at(-1)?.name}`] : [],
  };
}

function setOrigin(trip: Trip, text: string): AgentResponse {
  const origin = parseOrigin(text) ?? text.replace(/.*from\s+/i, "").trim();
  if (!origin) return { message: "Which city are you flying from?", mutations: [] };
  const flights = trip.transportation.filter((t) => t.type === "flight");
  const mutations: TripMutation[] = [{ type: "patch_trip", patch: { origin } }];
  if (flights[0]) {
    mutations.push({
      type: "upsert_transport",
      transport: {
        ...flights[0],
        route: `${origin} → ${flights[0].route.split("→").pop()?.trim() ?? "destination"}`,
        notes: `Recommended from ${origin}. Not booked.`,
        cost: flights[0].cost && flights[0].cost > 0 ? flights[0].cost : 780 * trip.travelers.length,
      },
    });
  }
  return {
    message: `Noted — departing from **${origin}**. I updated the recommended flight routing. Still not booked.

If you want live fares, say so and treat anything I quote as a snapshot, not a hold.`,
    mutations,
    suggestedReplies: ["What’s still missing?", "Find a cheaper hotel"],
  };
}

function markBooked(trip: Trip, text: string): AgentResponse {
  const ref = text.match(/(?:ref|reference|confirmation|code)\s*[:=]?\s*([A-Z0-9-]{5,})/i)?.[1];
  const stayMatch = trip.stays.find((s) => text.toLowerCase().includes(s.location.toLowerCase()) || text.toLowerCase().includes(s.property.toLowerCase().split(" ")[0] ?? "___"));
  const flight = /flight|air/i.test(text) ? trip.transportation.find((t) => t.type === "flight") : undefined;
  if (stayMatch) {
    return {
      message: `Marked **${stayMatch.property}** as booked${ref ? ` (${ref})` : ""}. I attached it to the stay and will treat those dates as locked.`,
      mutations: [{ type: "mark_booked", kind: "stay", id: stayMatch.id, reference: ref }],
    };
  }
  if (flight) {
    return {
      message: `Marked the ${flight.route} flight as booked${ref ? ` (${ref})` : ""}. I will warn you before moving dates that touch it.`,
      mutations: [{ type: "mark_booked", kind: "transport", id: flight.id, reference: ref }],
    };
  }
  return { message: "Which booking? Name the city, hotel, or flight and paste a reference if you have one.", mutations: [] };
}

function budgetAnswer(trip: Trip): AgentResponse {
  const totals = budgetTotals(trip);
  const lines = trip.budget
    .map((b) => `• ${b.category}: ${money(b.estimated, trip.currency)}${b.confirmed ? ` (${money(b.confirmed, trip.currency)} confirmed)` : ""}`)
    .join("\n");
  const delta =
    trip.budgetCap !== undefined && totals.remaining !== undefined
      ? totals.remaining >= 0
        ? `You are ${money(totals.remaining, trip.currency)} under the cap.`
        : `You are ${money(Math.abs(totals.remaining), trip.currency)} over the cap.`
      : "No cap set — say a number if you want me to watch it.";
  return {
    message: `**Estimated** ${money(totals.estimated, trip.currency)} · **Confirmed** ${money(totals.confirmed, trip.currency)}

${lines}

${delta}

These are plan numbers, not charges. Nothing becomes “actual” until you tell me you paid it.`,
    mutations: [],
    suggestedReplies: ["Find a cheaper hotel", "What’s still missing?"],
  };
}

function statusAnswer(trip: Trip): AgentResponse {
  const insights = detectInsights(trip);
  const actions = nextActions(trip);
  return {
    message: `**${trip.name}** is ${trip.status}.

Where: ${trip.destinations.map((d) => d.name).join(" → ") || "not chosen"}
When: ${trip.startDate ? `${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}` : "TBD"}
Staying: ${trip.stays.map((s) => `${s.location} (${s.status})`).join(" · ") || "none yet"}
Getting there: ${trip.transportation.filter((t) => t.type === "flight").map((t) => `${t.route} (${t.status})`).join(" · ") || "flights open"}

${insights.map((i) => `${icon(i.kind)} ${i.title} — ${i.message}`).join("\n\n")}

**Next**
${actions.map((a) => `• ${a}`).join("\n")}`,
    mutations: [],
    suggestedReplies: actions.slice(0, 3),
  };
}

function followUp(trip: Trip, text: string): AgentResponse {
  const insights = detectInsights(trip);
  return {
    message: `I kept the current plan as-is.

If you want a change, be concrete: move a thing, drop a day, change a city, or set a budget. Vague inspiration is how itineraries become attraction lists.

Right now the workspace already answers the useful questions — ${insights[0]?.title ?? "the structure is in place"}.

You said: “${text}”`,
    mutations: [],
    suggestedReplies: ["What’s still missing?", "Make this trip more relaxed", "Find a cheaper hotel"],
  };
}

function extractPreferences(text: string): string[] {
  const prefs: string[] = [];
  if (/hik/i.test(text)) prefs.push("hiking");
  if (/food|restaurant|eat/i.test(text)) prefs.push("good food");
  if (/small town/i.test(text)) prefs.push("small towns");
  if (/budget|fortune|cheap/i.test(text)) prefs.push("value");
  if (/museum|art/i.test(text)) prefs.push("museums");
  if (/night|party/i.test(text)) prefs.push("nightlife");
  return prefs;
}

function extractConstraints(text: string): string[] {
  const out: string[] = [];
  if (/no car|don't drive|without a car/i.test(text)) out.push("No car");
  if (/fortune|budget|cheap/i.test(text)) out.push("Keep costs mid-range");
  if (/november|winter/i.test(text)) out.push("Shoulder-season weather");
  return out;
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function proposal(title: string, rationale: string, actions: ChangeProposal["actions"]): ChangeProposal {
  return { id: uid("prop"), title, rationale, actions };
}

function dateForWeekday(trip: Trip, weekday: string): string | undefined {
  if (!trip.startDate || !trip.endDate) return undefined;
  const want = WEEKDAYS[weekday];
  let cursor = parseISO(trip.startDate);
  const end = parseISO(trip.endDate);
  while (cursor <= end) {
    if (getISODay(cursor) === want) return format(cursor, "yyyy-MM-dd");
    cursor = addDays(cursor, 1);
  }
  return undefined;
}

function pickTargetDay(trip: Trip, lower: string): string {
  if (/tomorrow/i.test(lower) && trip.startDate) return trip.startDate;
  const weekday = Object.keys(WEEKDAYS).find((day) => lower.includes(day));
  if (weekday) return dateForWeekday(trip, weekday) ?? trip.itinerary[0]?.date ?? trip.startDate ?? "";
  return (
    trip.itinerary.find((i) => /hike|gorge|eibsee|loop|trail/i.test(i.title))?.date ??
    trip.itinerary[0]?.date ??
    trip.startDate ??
    ""
  );
}

function icon(kind: string): string {
  if (kind === "warning") return "⚠️";
  if (kind === "weather") return "🌧️";
  if (kind === "opportunity") return "💡";
  if (kind === "missing") return "▢";
  return "•";
}
