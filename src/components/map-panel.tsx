"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { BedDouble, MapPin } from "lucide-react";
import type { Trip } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { dayColor, itineraryStops, mapDays, routeLine, stayStops, unmappedCount } from "@/lib/geo";

const ItineraryMapView = dynamic(
  () => import("./itinerary-map").then((mod) => mod.ItineraryMapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-muted">Drawing the route…</div>
    ),
  },
);

export function MapPanel({ trip, compact = false }: { trip: Trip; compact?: boolean }) {
  const days = mapDays(trip);
  const stays = stayStops(trip);
  const allStops = itineraryStops(trip);
  const [day, setDay] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [follow, setFollow] = useState(false);
  const route = routeLine(trip);

  function selectStop(id: string) {
    setSelectedId(id);
    setFollow(true);
  }

  const visibleStops = useMemo(() => {
    const items = day === "all" ? allStops : allStops.filter((stop) => stop.date === day);
    if (compact) return items;
    return [...stays.filter((stay) => day === "all" || stay.date === day), ...items];
  }, [allStops, stays, day, compact]);

  const missing = unmappedCount(trip);

  if (!allStops.length && !stays.length) {
    return (
      <div className="paper rounded-3xl px-6 py-16 text-center">
        <h3 className="display text-2xl">No map yet</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
          Once there is an itinerary with places I recognize, the route will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className={`paper overflow-hidden rounded-3xl ${compact ? "" : ""}`}>
        {!compact ? (
          <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Itinerary map</p>
              <h2 className="display text-2xl">Where the days actually go</h2>
            </div>
            <p className="text-xs text-muted">
              {allStops.length} mapped stops
              {missing ? ` · ${missing} without a pin` : ""}
            </p>
          </header>
        ) : null}

        <div className="flex flex-wrap gap-1.5 px-5 pb-3">
          <DayChip
            active={day === "all"}
            onClick={() => {
              setDay("all");
              setFollow(false);
            }}
            color="#1c1914"
          >
            All days
          </DayChip>
          {days.map((date, i) => (
            <DayChip
              key={date}
              active={day === date}
              onClick={() => {
                setDay(date);
                setFollow(false);
              }}
              color={dayColor(i)}
            >
              {formatDate(date, "EEE d")}
            </DayChip>
          ))}
        </div>

        <div className={`relative bg-[#e7efe6] ${compact ? "h-[280px]" : "h-[480px] md:h-[560px]"}`}>
          <ItineraryMapView
            stops={visibleStops}
            route={route}
            selectedId={selectedId}
            followSelected={follow}
            onSelect={selectStop}
          />
        </div>
      </section>

      {!compact ? (
        <ol className="grid gap-2 md:grid-cols-2">
          {visibleStops.map((stop) => {
            const active = stop.id === selectedId;
            return (
              <li key={stop.id}>
                <button
                  type="button"
                  data-testid={`map-stop-${stop.id}`}
                  onClick={() => selectStop(stop.id)}
                  className={`flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left ${
                    active ? "bg-ink text-paper" : "paper hover:bg-sand"
                  }`}
                >
                  <span
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-paper"
                    style={{ background: stop.kind === "stay" ? "#2f4a3c" : dayColor(stop.dayIndex) }}
                  >
                    {stop.kind === "stay" ? <BedDouble className="h-3.5 w-3.5" /> : stop.sequence}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold">{stop.title}</span>
                    <span className={`mt-0.5 flex items-center gap-1 text-xs ${active ? "text-paper/70" : "text-muted"}`}>
                      <MapPin className="h-3 w-3" />
                      {stop.place}
                      {stop.date ? ` · ${formatDate(stop.date, "EEE d")}` : ""}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      ) : null}
    </div>
  );
}

function DayChip({
  active,
  onClick,
  color,
  children,
}: {
  active: boolean;
  onClick: () => void;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-semibold ${active ? "text-paper" : "bg-sand text-ink-soft"}`}
      style={active ? { background: color } : undefined}
    >
      {children}
    </button>
  );
}
