"use client";

import {
  Banknote,
  Bus,
  CalendarRange,
  FileText,
  MapPin,
  Plane,
  Train,
  Utensils,
  BedDouble,
  Mountain,
} from "lucide-react";
import type { ItineraryItem, Trip } from "@/lib/types";
import { bookedCount, budgetTotals, formatDate, formatRange, money, transportLabel, tripLengthLabel } from "@/lib/format";
import { detectInsights, nextActions } from "@/lib/insights";
import { BookingBadge, InsightMark, TripBadge } from "./status-badge";

export function OverviewPanel({ trip }: { trip: Trip }) {
  const insights = detectInsights(trip);
  const actions = nextActions(trip);
  const totals = budgetTotals(trip);
  const booking = bookedCount(trip);
  const today = trip.startDate ? trip.itinerary.filter((i) => i.date === trip.startDate) : [];

  return (
    <div className="space-y-6">
      <section className="paper overflow-hidden rounded-3xl">
        <div className="grid gap-6 p-6 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Trip overview</p>
            <h2 className="display mt-2 text-3xl text-ink md:text-4xl">{trip.name}</h2>
            <p className="mt-3 max-w-xl text-ink-soft">{trip.notes || "A living plan — not a saved chat."}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <TripBadge status={trip.status} />
              {trip.preferences.map((p) => (
                <span key={p} className="rounded-full bg-sand px-2.5 py-1 text-xs text-ink-soft">
                  {p}
                </span>
              ))}
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Meta label="When" value={formatRange(trip.startDate, trip.endDate)} />
            <Meta label="Length" value={tripLengthLabel(trip)} />
            <Meta label="Travelers" value={trip.travelers.map((t) => t.name).join(", ") || "—"} />
            <Meta
              label="Budget"
              value={
                trip.budgetCap
                  ? `${money(totals.estimated, trip.currency)} / ${money(trip.budgetCap, trip.currency)}`
                  : money(totals.estimated, trip.currency)
              }
            />
          </dl>
        </div>
        <div className="grid gap-px bg-line md:grid-cols-4">
          {trip.destinations.length
            ? trip.destinations.map((d) => (
                <div key={d.id} className="bg-paper px-5 py-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{d.region}</p>
                  <p className="mt-1 font-semibold">{d.name}</p>
                  <p className="text-xs text-muted">{d.nights ?? 0} nights</p>
                </div>
              ))
            : (
              <div className="bg-paper px-5 py-4 text-sm text-muted md:col-span-4">
                No destinations yet — ask the agent to propose a short list.
              </div>
            )}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<CalendarRange className="h-4 w-4" />}
          label="Today / first day"
          value={today?.length ? today[0].title : "Nothing scheduled"}
          hint={trip.startDate ? formatDate(trip.startDate) : "Dates TBD"}
        />
        <StatCard
          icon={<BedDouble className="h-4 w-4" />}
          label="Staying"
          value={trip.stays[0]?.property ?? "No stays yet"}
          hint={trip.stays[0] ? `${trip.stays.length} properties · first in ${trip.stays[0].location}` : "Ask the agent to place you"}
        />
        <StatCard
          icon={<Plane className="h-4 w-4" />}
          label="Booked vs open"
          value={`${booking.booked} booked`}
          hint={`${booking.open} still recommended or pending`}
        />
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="paper rounded-3xl p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">What could go wrong</h3>
          <ul className="mt-4 space-y-3">
            {insights.length === 0 ? (
              <li className="text-sm text-muted">No structural issues right now.</li>
            ) : (
              insights.map((insight) => (
                <li key={insight.id} className="flex gap-3 rounded-2xl bg-canvas/70 px-3 py-3">
                  <InsightMark kind={insight.kind} />
                  <div>
                    <p className="text-sm font-semibold text-ink">{insight.title}</p>
                    <p className="text-sm text-ink-soft">{insight.message}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="paper rounded-3xl p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">What to do next</h3>
          <ol className="mt-4 space-y-3">
            {actions.map((action, i) => (
              <li key={action} className="flex gap-3 text-sm text-ink">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-clay text-[11px] font-semibold text-paper">
                  {i + 1}
                </span>
                {action}
              </li>
            ))}
          </ol>
          {trip.constraints.length ? (
            <p className="mt-5 text-xs text-muted">Constraints: {trip.constraints.join(" · ")}</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export function ItineraryPanel({ trip }: { trip: Trip }) {
  const days = groupDays(trip);
  if (!days.length) {
    return <Empty title="No days yet" body="Once you pick a destination, I will build a geographic itinerary — not a checklist." />;
  }
  return (
    <div className="space-y-4">
      {days.map(([date, items]) => (
        <section key={date} className="paper rounded-3xl p-5">
          <header className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                {trip.stays.find((s) => s.checkIn <= date && s.checkOut > date)?.location ?? "In transit"}
              </p>
              <h3 className="display text-2xl">{formatDate(date, "EEEE, MMM d")}</h3>
            </div>
            <p className="text-xs text-muted">{items.length} items</p>
          </header>
          <ol className="relative space-y-3 pl-2">
            <div className="timeline-rail absolute top-2 bottom-2 left-[19px] w-px" />
            {items.map((entry) => (
              <li key={entry.id} className="relative grid grid-cols-[72px_1fr] gap-3">
                <div className="pt-1 text-right text-xs font-semibold text-muted">
                  {entry.startTime ?? "—"}
                  {entry.endTime ? <div className="font-normal">{entry.endTime}</div> : null}
                </div>
                <div className="rounded-2xl bg-canvas/60 p-3">
                  <span className="absolute top-3 left-[-5px] h-3 w-3 rounded-full border-2 border-paper bg-clay" />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-ink">{entry.title}</p>
                    <BookingBadge status={entry.bookingStatus} />
                  </div>
                  <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted">
                    <span className="capitalize">{entry.category}</span>
                    {entry.location ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {entry.location}
                      </span>
                    ) : null}
                    {entry.travelTimeMinutes ? <span>{entry.travelTimeMinutes} min transit</span> : null}
                    {entry.estimatedCost ? <span>{money(entry.estimatedCost, trip.currency)}</span> : null}
                    {entry.bookingReference ? <span>Ref {entry.bookingReference}</span> : null}
                  </p>
                  {entry.notes ? <p className="mt-2 text-sm text-ink-soft">{entry.notes}</p> : null}
                  {entry.alternatives?.length ? (
                    <p className="mt-2 text-xs text-moss">Alternatives: {entry.alternatives.join(" · ")}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

export function TransportPanel({ trip }: { trip: Trip }) {
  if (!trip.transportation.length) return <Empty title="No transport yet" body="Flights, trains, and transfers will land here when the route exists." />;
  return (
    <div className="grid gap-3">
      {trip.transportation.map((row) => (
        <article key={row.id} className="paper flex flex-col gap-3 rounded-3xl p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-canvas text-forest">
              {row.type === "flight" ? <Plane className="h-5 w-5" /> : row.type === "train" ? <Train className="h-5 w-5" /> : <Bus className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{transportLabel(row.type)}</p>
              <h3 className="font-semibold">{row.route}</h3>
              <p className="text-sm text-ink-soft">
                {formatDate(row.date)}
                {row.departureTime ? ` · ${row.departureTime}` : ""}
                {row.arrivalTime ? `–${row.arrivalTime}` : ""}
                {row.duration ? ` · ${row.duration}` : ""}
              </p>
              {row.notes ? <p className="mt-1 text-xs text-muted">{row.notes}</p> : null}
            </div>
          </div>
          <div className="flex items-center gap-3 md:flex-col md:items-end">
            <BookingBadge status={row.status} />
            <p className="text-sm font-semibold">{money(row.cost, trip.currency)}</p>
            {row.bookingReference ? <p className="text-xs text-muted">{row.bookingReference}</p> : null}
          </div>
        </article>
      ))}
    </div>
  );
}

export function StaysPanel({ trip }: { trip: Trip }) {
  if (!trip.stays.length) return <Empty title="No stays yet" body="I will recommend properties after the route is set. Nothing is reserved until you book." />;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {trip.stays.map((stay) => (
        <article key={stay.id} className="paper rounded-3xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{stay.location}</p>
              <h3 className="display mt-1 text-2xl">{stay.property}</h3>
            </div>
            <BookingBadge status={stay.status} />
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            {formatDate(stay.checkIn)} → {formatDate(stay.checkOut)} · {stay.nights} nights
          </p>
          {stay.address ? <p className="mt-1 text-xs text-muted">{stay.address}</p> : null}
          {stay.notes ? <p className="mt-3 text-sm text-ink-soft">{stay.notes}</p> : null}
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="font-semibold">{money(stay.price, trip.currency)}</span>
            <span className="text-xs text-muted">
              {stay.cancellationDeadline ? `Cancel by ${formatDate(stay.cancellationDeadline)}` : "Cancellation TBD"}
            </span>
          </div>
          {stay.bookingReference ? <p className="mt-2 text-xs text-forest">Ref {stay.bookingReference}</p> : null}
        </article>
      ))}
    </div>
  );
}

export function PlacesPanel({ trip }: { trip: Trip }) {
  if (!trip.places.length) return <Empty title="No saved places" body="Restaurants, hikes, and experiences will collect here as the plan firms up." />;
  const icon = (type: string) => {
    if (type === "restaurant") return <Utensils className="h-4 w-4" />;
    if (type === "hike") return <Mountain className="h-4 w-4" />;
    return <MapPin className="h-4 w-4" />;
  };
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {trip.places.map((place) => (
        <article key={place.id} className="paper flex gap-3 rounded-3xl p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-canvas text-forest">{icon(place.type)}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{place.type}</p>
                <h3 className="font-semibold">{place.name}</h3>
              </div>
              <BookingBadge status={place.reservationStatus} />
            </div>
            <p className="text-sm text-ink-soft">{place.location}</p>
            {place.notes ? <p className="mt-1 text-xs text-muted">{place.notes}</p> : null}
          </div>
        </article>
      ))}
    </div>
  );
}

export function BudgetPanel({ trip }: { trip: Trip }) {
  const totals = budgetTotals(trip);
  if (!trip.budget.length) return <Empty title="No budget yet" body="Costs appear once there is a route to price." />;
  const max = Math.max(...trip.budget.map((b) => b.estimated), 1);
  return (
    <div className="space-y-4">
      <section className="paper grid gap-4 rounded-3xl p-5 md:grid-cols-4">
        <BudgetStat label="Estimated" value={money(totals.estimated, trip.currency)} />
        <BudgetStat label="Confirmed" value={money(totals.confirmed, trip.currency)} />
        <BudgetStat label="Actual" value={money(totals.actual, trip.currency)} />
        <BudgetStat
          label={totals.remaining !== undefined && totals.remaining < 0 ? "Over cap" : "Under cap"}
          value={trip.budgetCap ? money(Math.abs(totals.remaining ?? 0), trip.currency) : "No cap"}
        />
      </section>
      <section className="paper rounded-3xl p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-muted">By category</h3>
        <ul className="space-y-4">
          {trip.budget.map((line) => (
            <li key={line.id}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium">{line.category}</span>
                <span>
                  {money(line.estimated, trip.currency)}
                  {line.confirmed ? <span className="text-muted"> · {money(line.confirmed, trip.currency)} confirmed</span> : null}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-sand">
                <div className="h-full rounded-full bg-forest" style={{ width: `${Math.round((line.estimated / max) * 100)}%` }} />
              </div>
              {line.notes ? <p className="mt-1 text-xs text-muted">{line.notes}</p> : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function DocumentsPanel({ trip }: { trip: Trip }) {
  if (!trip.documents.length) return <Empty title="No documents" body="Booking confirmations and travel notes will file themselves here. I will never ask for passwords or card numbers." />;
  return (
    <div className="grid gap-3">
      {trip.documents.map((doc) => (
        <article key={doc.id} className="paper flex gap-3 rounded-3xl p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-canvas text-forest">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{doc.type}</p>
            <h3 className="font-semibold">{doc.title}</h3>
            {doc.notes ? <p className="text-sm text-ink-soft">{doc.notes}</p> : null}
            {doc.reference ? <p className="text-xs text-muted">Ref {doc.reference}</p> : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-canvas/70 px-3 py-3">
      <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}

function StatCard({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint: string }) {
  return (
    <div className="paper rounded-3xl p-5">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
        {icon} {label}
      </p>
      <p className="mt-2 text-lg font-semibold leading-snug">{value}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}

function BudgetStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-1 flex items-center gap-2 text-xl font-semibold">
        <Banknote className="h-4 w-4 text-gold" /> {value}
      </p>
    </div>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="paper rounded-3xl px-6 py-16 text-center">
      <h3 className="display text-2xl">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{body}</p>
    </div>
  );
}

function groupDays(trip: Trip): [string, ItineraryItem[]][] {
  const map = new Map<string, ItineraryItem[]>();
  const sorted = [...trip.itinerary].sort((a, b) => `${a.date}${a.startTime ?? ""}`.localeCompare(`${b.date}${b.startTime ?? ""}`));
  for (const item of sorted) {
    map.set(item.date, [...(map.get(item.date) ?? []), item]);
  }
  if (trip.startDate && trip.endDate && !map.size) {
    return [[trip.startDate, []]];
  }
  return [...map.entries()];
}

