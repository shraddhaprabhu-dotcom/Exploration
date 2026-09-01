import { describe, expect, it } from "vitest";
import { handleAgentMessage } from "../agent";
import { emptyTrip } from "../trip-utils";

const idea = "I have two weeks in Europe in November. I like hiking, small towns and good food, but I don't want to spend a fortune.";

describe("handleAgentMessage", () => {
  it("suggests a short destination list instead of building immediately", () => {
    const res = handleAgentMessage(emptyTrip(), idea);
    expect(res.mutations.some((m) => m.type === "replace_trip")).toBe(false);
    expect(res.message).toMatch(/Slovenia|Bavarian|Portugal/);
    expect(res.suggestedReplies?.length).toBeGreaterThan(0);
  });

  it("builds a full workspace when a destination is chosen", () => {
    const seed = emptyTrip({ preferences: ["hiking"], budgetCap: 5600 });
    const res = handleAgentMessage(seed, "Let’s do Slovenia");
    const built = res.mutations.find((m) => m.type === "replace_trip");
    expect(built?.type).toBe("replace_trip");
    if (built?.type !== "replace_trip") throw new Error("expected replace");
    expect(built.trip.destinations.length).toBeGreaterThan(1);
    expect(built.trip.itinerary.length).toBeGreaterThan(4);
    expect(built.trip.stays.length).toBeGreaterThan(1);
    expect(built.trip.budget.length).toBeGreaterThan(3);
    expect(res.message).toMatch(/not booked/i);
  });

  it("proposes a relax change instead of applying it immediately", () => {
    const seed = emptyTrip({ preferences: ["hiking"] });
    const built = handleAgentMessage(seed, "Let’s do Bavarian Alps");
    const trip = built.mutations[0];
    if (trip.type !== "replace_trip") throw new Error("expected trip");
    const relax = handleAgentMessage(trip.trip, "Make this trip more relaxed");
    expect(relax.proposal).toBeTruthy();
    expect(relax.mutations).toHaveLength(0);
  });

  it("does not propose dropping airport or transfer days when relaxing", () => {
    const seed = emptyTrip({ preferences: ["hiking"] });
    const built = handleAgentMessage(seed, "Let’s do Slovenia");
    if (built.mutations[0].type !== "replace_trip") throw new Error("expected trip");
    const trip = built.mutations[0].trip;
    const relax = handleAgentMessage(trip, "Make this trip more relaxed");
    const removed = relax.proposal?.actions.filter((a) => a.apply.type === "remove_item") ?? [];
    const removedIds = new Set(removed.map((a) => (a.apply.type === "remove_item" ? a.apply.itemId : "")));
    const removedItems = trip.itinerary.filter((i) => removedIds.has(i.id));
    expect(removedItems.every((i) => i.category !== "transport")).toBe(true);
    expect(removedItems.some((i) => /vintgar|day trip|palace/i.test(i.title))).toBe(true);
  });
});
