"use client";

import { useState } from "react";
import Link from "next/link";
import { Compass, Menu, MessageSquare } from "lucide-react";
import { useActiveTrip, useVoyage } from "@/lib/store";
import { formatRange } from "@/lib/format";
import { AgentPanel } from "./agent-panel";
import {
  BudgetPanel,
  DocumentsPanel,
  ItineraryPanel,
  OverviewPanel,
  PlacesPanel,
  StaysPanel,
  TransportPanel,
} from "./panels";
import { TripBadge } from "./status-badge";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "itinerary", label: "Itinerary" },
  { id: "transport", label: "Flights & transport" },
  { id: "stays", label: "Stays" },
  { id: "places", label: "Places" },
  { id: "budget", label: "Budget" },
  { id: "documents", label: "Documents" },
] as const;

export function Workspace() {
  const trip = useActiveTrip();
  const tab = useVoyage((s) => s.tab);
  const setTab = useVoyage((s) => s.setTab);
  const [mobileAgent, setMobileAgent] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  if (!trip) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="paper max-w-md rounded-3xl p-8 text-center">
          <h1 className="display text-3xl">No trip selected</h1>
          <p className="mt-2 text-sm text-ink-soft">Start from the home page and I will open a workspace.</p>
          <Link href="/" className="mt-5 inline-flex rounded-full bg-forest px-4 py-2 text-sm font-semibold text-paper">
            Back to Voyage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-line/80 bg-canvas/85 backdrop-blur">
        <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-ink">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-paper">
                <Compass className="h-4 w-4" />
              </span>
              <span className="display text-lg">Voyage</span>
            </Link>
            <span className="hidden h-5 w-px bg-line sm:block" />
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-tight">{trip.name}</p>
              <p className="text-xs text-muted">{formatRange(trip.startDate, trip.endDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TripBadge status={trip.status} />
            <button
              type="button"
              className="rounded-full p-2 text-ink lg:hidden"
              onClick={() => setNavOpen((v) => !v)}
              aria-label="Sections"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="rounded-full bg-clay px-3 py-2 text-xs font-semibold text-paper xl:hidden"
              onClick={() => setMobileAgent(true)}
            >
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" /> Agent
              </span>
            </button>
          </div>
        </div>
        <nav className={`border-t border-line px-2 lg:block ${navOpen ? "block" : "hidden"}`}>
          <div className="flex gap-1 overflow-x-auto py-2 lg:px-4">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTab(item.id);
                  setNavOpen(false);
                }}
                className={`rounded-full px-3 py-1.5 text-sm whitespace-nowrap ${
                  tab === item.id ? "bg-ink text-paper" : "text-ink-soft hover:bg-sand"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_400px]">
        <main className="min-w-0 px-4 py-6 lg:px-8">
          {tab === "overview" ? <OverviewPanel trip={trip} /> : null}
          {tab === "itinerary" ? <ItineraryPanel trip={trip} /> : null}
          {tab === "transport" ? <TransportPanel trip={trip} /> : null}
          {tab === "stays" ? <StaysPanel trip={trip} /> : null}
          {tab === "places" ? <PlacesPanel trip={trip} /> : null}
          {tab === "budget" ? <BudgetPanel trip={trip} /> : null}
          {tab === "documents" ? <DocumentsPanel trip={trip} /> : null}
        </main>
        <div className="hidden h-[calc(100vh-116px)] sticky top-[116px] xl:block">
          <AgentPanel tripId={trip.id} />
        </div>
      </div>

      {mobileAgent ? (
        <div className="fixed inset-0 z-40 bg-ink/30 xl:hidden">
          <div className="absolute inset-x-0 bottom-0 h-[88vh] overflow-hidden rounded-t-3xl">
            <AgentPanel tripId={trip.id} compact onClose={() => setMobileAgent(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
