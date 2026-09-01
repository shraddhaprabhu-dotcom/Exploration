"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChangeProposal, ChatMessage, Trip, TripMutation } from "./types";
import { applyMutations, emptyTrip } from "./trip-utils";
import { handleAgentMessage } from "./agent";
import { uid } from "./ids";

type Tab =
  | "overview"
  | "itinerary"
  | "transport"
  | "stays"
  | "places"
  | "budget"
  | "documents";

interface VoyageState {
  trips: Trip[];
  activeTripId: string | null;
  messages: Record<string, ChatMessage[]>;
  proposals: Record<string, ChangeProposal | undefined>;
  tab: Tab;
  agentOpen: boolean;
  createTrip: (trip?: Partial<Trip>) => Trip;
  setActiveTrip: (id: string) => void;
  setTab: (tab: Tab) => void;
  setAgentOpen: (open: boolean) => void;
  apply: (tripId: string, mutations: TripMutation[]) => void;
  sendMessage: (tripId: string | null, text: string) => void;
  applyProposal: (tripId: string) => void;
  dismissProposal: (tripId: string) => void;
}

export const useVoyage = create<VoyageState>()(
  persist(
    (set, get) => ({
      trips: [],
      activeTripId: null,
      messages: {},
      proposals: {},
      tab: "overview",
      agentOpen: true,
      createTrip: (partial) => {
        const trip = emptyTrip(partial);
        set((state) => ({
          trips: [trip, ...state.trips],
          activeTripId: trip.id,
          messages: {
            ...state.messages,
            [trip.id]: [
              {
                id: uid("msg"),
                role: "agent",
                content:
                  "I have an empty workspace ready. Tell me the trip in whatever shape it is — even just “two weeks in Europe in November.”",
                createdAt: new Date().toISOString(),
              },
            ],
          },
        }));
        return trip;
      },
      setActiveTrip: (id) => set({ activeTripId: id, tab: "overview" }),
      setTab: (tab) => set({ tab }),
      setAgentOpen: (agentOpen) => set({ agentOpen }),
      apply: (tripId, mutations) => {
        if (!mutations.length) return;
        set((state) => ({
          trips: state.trips.map((trip) => (trip.id === tripId ? applyMutations(trip, mutations) : trip)),
        }));
      },
      sendMessage: (tripId, text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        let id = tripId;
        if (!id) {
          id = get().createTrip().id;
        }
        const userMsg: ChatMessage = {
          id: uid("msg"),
          role: "user",
          content: trimmed,
          createdAt: new Date().toISOString(),
        };
        const trip = get().trips.find((t) => t.id === id) ?? null;
        const result = handleAgentMessage(trip, trimmed);
        const agentMsg: ChatMessage = {
          id: uid("msg"),
          role: "agent",
          content: result.message,
          createdAt: new Date().toISOString(),
          proposalId: result.proposal?.id,
        };
        set((state) => ({
          activeTripId: id,
          trips: state.trips.map((t) => (t.id === id ? applyMutations(t, result.mutations) : t)),
          messages: {
            ...state.messages,
            [id!]: [...(state.messages[id!] ?? []), userMsg, agentMsg],
          },
          proposals: result.proposal
            ? { ...state.proposals, [id!]: result.proposal }
            : state.proposals,
        }));
      },
      applyProposal: (tripId) => {
        const proposal = get().proposals[tripId];
        if (!proposal) return;
        const mutations = proposal.actions.map((action) => action.apply);
        set((state) => ({
          trips: state.trips.map((trip) => (trip.id === tripId ? applyMutations(trip, mutations) : trip)),
          proposals: { ...state.proposals, [tripId]: undefined },
          messages: {
            ...state.messages,
            [tripId]: [
              ...(state.messages[tripId] ?? []),
              {
                id: uid("msg"),
                role: "agent",
                content: `Applied: ${proposal.title}. Existing bookings were left in place unless the change named them.`,
                createdAt: new Date().toISOString(),
              },
            ],
          },
        }));
      },
      dismissProposal: (tripId) =>
        set((state) => ({
          proposals: { ...state.proposals, [tripId]: undefined },
        })),
    }),
    {
      name: "voyage-trip-workspace",
      partialize: (state) => ({
        trips: state.trips,
        activeTripId: state.activeTripId,
        messages: state.messages,
        proposals: state.proposals,
      }),
      skipHydration: true,
    },
  ),
);

export function useActiveTrip(): Trip | null {
  return useVoyage((s) => s.trips.find((t) => t.id === s.activeTripId) ?? null);
}
