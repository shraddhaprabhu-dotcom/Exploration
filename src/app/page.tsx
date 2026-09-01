"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Compass } from "lucide-react";
import { useVoyage } from "@/lib/store";
import { formatRange } from "@/lib/format";
import { ClientReady } from "@/components/client-ready";

const EXAMPLES = [
  "I have two weeks in Europe in November. I like hiking, small towns and good food, but I don't want to spend a fortune.",
  "Long weekend in Lisbon for two, mid-range, we walk everywhere.",
  "Make this a food trip with one hiking day, not a museum marathon.",
];

export default function HomePage() {
  const router = useRouter();
  const trips = useVoyage((s) => s.trips);
  const createTrip = useVoyage((s) => s.createTrip);
  const sendMessage = useVoyage((s) => s.sendMessage);
  const setActiveTrip = useVoyage((s) => s.setActiveTrip);
  const [draft, setDraft] = useState(EXAMPLES[0]);

  function openTrip(id: string) {
    setActiveTrip(id);
    router.push(`/trip/${id}`);
  }

  function start(text: string) {
    const trip = createTrip({ name: "New trip", notes: text });
    sendMessage(trip.id, text);
    router.push(`/trip/${trip.id}`);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    start(draft.trim() || EXAMPLES[0]);
  }

  return (
    <ClientReady>
    <div className="relative min-h-screen overflow-hidden">
      <div className="grain pointer-events-none absolute inset-0 opacity-40 mix-blend-multiply" />
      <header className="relative flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-paper">
            <Compass className="h-4 w-4" />
          </span>
          <span className="display text-xl">Voyage</span>
        </div>
        <p className="hidden text-xs uppercase tracking-[0.2em] text-muted sm:block">Trip workspace</p>
      </header>

      <main className="relative mx-auto grid max-w-6xl gap-12 px-6 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:py-16">
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-clay">Not a travel chatbot</p>
          <h1 className="display mt-3 text-5xl leading-[1.05] text-ink md:text-6xl">
            Turn an idea
            <br />
            into a trip.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-soft">
            Then keep the trip on track. I maintain the itinerary, stays, trains, bookings, and budget — and I will tell you what is still open.
          </p>

          <form onSubmit={onSubmit} className="paper mt-8 rounded-[28px] p-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={4}
              className="w-full resize-none bg-transparent px-3 py-2 text-base outline-none"
              placeholder="Where, when, what you care about…"
            />
            <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-2">
              <p className="text-xs text-muted">I will assume 2 travelers if you do not say otherwise.</p>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-clay px-4 py-2 text-sm font-semibold text-paper hover:bg-clay-deep"
              >
                Build the workspace <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {EXAMPLES.slice(1).map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setDraft(example)}
                className="rounded-full border border-line bg-paper/70 px-3 py-1.5 text-left text-xs text-ink-soft hover:border-forest"
              >
                {example}
              </button>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="paper rounded-[28px] p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">The workspace answers</h2>
            <ul className="mt-4 space-y-2 text-sm text-ink-soft">
              {[
                "Where am I going?",
                "What am I doing today?",
                "Where am I staying?",
                "How am I getting there?",
                "What is booked — and what is not?",
                "How much is this costing?",
                "What could go wrong?",
                "What should I do next?",
              ].map((q) => (
                <li key={q} className="flex gap-2">
                  <span className="text-clay">—</span> {q}
                </li>
              ))}
            </ul>
          </div>

          <div className="paper rounded-[28px] p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">Your trips</h2>
            {trips.length === 0 ? (
              <p className="mt-3 text-sm text-ink-soft">None yet. Start with the sentence you already have.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {trips.map((trip) => (
                  <li key={trip.id}>
                    <button
                      type="button"
                      onClick={() => openTrip(trip.id)}
                      className="flex w-full items-center justify-between rounded-2xl bg-canvas/70 px-3 py-3 text-left hover:bg-sand"
                    >
                      <span>
                        <span className="block font-semibold">{trip.name}</span>
                        <span className="text-xs text-muted">{formatRange(trip.startDate, trip.endDate)}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </main>
    </div>
    </ClientReady>
  );
}
