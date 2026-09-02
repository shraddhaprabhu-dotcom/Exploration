"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Compass, Send, Sparkles, X } from "lucide-react";
import { RichText } from "./rich-text";
import { useActiveTrip, useVoyage } from "@/lib/store";

export function AgentPanel({
  tripId,
  compact = false,
  onClose,
}: {
  tripId: string | null;
  compact?: boolean;
  onClose?: () => void;
}) {
  const trip = useActiveTrip();
  const sendMessage = useVoyage((s) => s.sendMessage);
  const messages = useVoyage((s) => (tripId ? s.messages[tripId] ?? [] : []));
  const proposal = useVoyage((s) => (tripId ? s.proposals[tripId] : undefined));
  const applyProposal = useVoyage((s) => s.applyProposal);
  const dismissProposal = useVoyage((s) => s.dismissProposal);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, proposal?.id]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const value = draft.trim();
    if (!value) return;
    sendMessage(tripId, value);
    setDraft("");
  }

  const lastAgent = [...messages].reverse().find((m) => m.role === "agent");
  const suggestions = suggestFrom(lastAgent?.content, Boolean(trip?.destinations.length));

  return (
    <aside className={`flex h-full min-h-0 flex-col bg-paper ${compact ? "" : "border-l border-line"}`}>
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-paper">
            <Compass className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">Ask your Trip Agent</p>
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Living workspace</p>
          </div>
        </div>
        {onClose ? (
          <button type="button" onClick={onClose} className="rounded-full p-1 text-muted hover:bg-sand" aria-label="Close agent">
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="rounded-2xl bg-canvas/70 px-4 py-5 text-sm text-ink-soft">
            <p className="mb-2 flex items-center gap-2 font-medium text-ink">
              <Sparkles className="h-4 w-4 text-clay" /> Start from what you already know.
            </p>
            I will not send a questionnaire. A destination, a month, or a constraint is enough.
          </div>
        ) : null}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 ${
                msg.role === "user" ? "bg-forest text-paper" : "bg-canvas text-ink"
              }`}
            >
              {msg.role === "user" ? (
                <p className="text-sm leading-6">{msg.content}</p>
              ) : (
                <RichText text={msg.content} />
              )}
            </div>
          </div>
        ))}

        {proposal && tripId ? (
          <div className="rounded-2xl border border-gold/50 bg-[#fbf6e8] p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a5b14]">Change proposed</p>
            <p className="mt-1 font-semibold text-ink">{proposal.title}</p>
            <p className="mt-1 text-sm text-ink-soft">{proposal.rationale}</p>
            <ul className="mt-2 space-y-1 text-sm text-ink-soft">
              {proposal.actions.map((action, i) => (
                <li key={i}>• {action.summary}</li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                data-testid="apply-changes"
                onClick={() => applyProposal(tripId)}
                className="rounded-full bg-forest px-3 py-1.5 text-xs font-semibold text-paper"
              >
                Apply changes
              </button>
              <button
                type="button"
                onClick={() => dismissProposal(tripId)}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted hover:bg-sand"
              >
                Keep current plan
              </button>
            </div>
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      <div className="border-t border-line p-3">
        {suggestions.length ? (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => sendMessage(tripId, s)}
                className="rounded-full border border-line bg-paper px-2.5 py-1 text-[11px] text-ink-soft hover:border-forest hover:text-forest"
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}
        <form onSubmit={onSubmit} className="flex items-end gap-2">
          <textarea
            data-testid="agent-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e);
              }
            }}
            rows={2}
            placeholder="Move the museum. Add two days. It’s going to rain…"
            className="min-h-[44px] flex-1 resize-none rounded-2xl border border-line bg-canvas/50 px-3 py-2 text-sm outline-none focus:border-forest"
          />
          <button
            type="submit"
            data-testid="agent-send"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-clay text-paper hover:bg-clay-deep"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </aside>
  );
}

function suggestFrom(content: string | undefined, hasTrip: boolean): string[] {
  if (!content) {
    return [
      "I have two weeks in Europe in November. I like hiking, small towns and good food, but I don't want to spend a fortune.",
    ];
  }
  if (content.includes("Let’s do") || content.includes("Pick one")) {
    return ["Let’s do Slovenia", "Let’s do Bavarian Alps", "Let’s do Portugal"];
  }
  if (hasTrip) return ["What’s still missing?", "Make this trip more relaxed", "Find a cheaper hotel"];
  return [];
}
