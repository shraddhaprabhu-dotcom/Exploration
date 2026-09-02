import { describe, expect, it } from "vitest";
import { handleAgentMessage } from "../agent";
import { emptyTrip } from "../trip-utils";
import { itineraryStops, resolvePoint, routeLine, stayStops } from "../geo";

describe("resolvePoint", () => {
  it("resolves known towns and airport codes", () => {
    expect(resolvePoint("Lake Bled")?.label).toMatch(/Bled/);
    expect(resolvePoint("LJU")?.lat).toBeCloseTo(46.22, 1);
    expect(resolvePoint("Munich Airport (MUC)")?.label).toMatch(/Munich Airport/);
    expect(resolvePoint("Pinhão")?.label).toMatch(/Pinh/);
  });

  it("returns null for unknown places", () => {
    expect(resolvePoint("a made-up hamlet xyz")).toBeNull();
  });
});

describe("trip map geometry", () => {
  it("builds a Slovenia route through the stay towns", () => {
    const built = handleAgentMessage(emptyTrip({ preferences: ["hiking"] }), "Let’s do Slovenia");
    if (built.mutations[0].type !== "replace_trip") throw new Error("expected trip");
    const trip = built.mutations[0].trip;
    const stays = stayStops(trip);
    const items = itineraryStops(trip);
    const line = routeLine(trip);
    expect(stays.length).toBe(trip.stays.length);
    expect(items.length).toBeGreaterThan(5);
    expect(line.length).toBeGreaterThanOrEqual(3);
    expect(stays.map((s) => s.place).join(" ")).toMatch(/Ljubljana/);
    expect(stays.map((s) => s.place).join(" ")).toMatch(/Piran/);
  });
});
