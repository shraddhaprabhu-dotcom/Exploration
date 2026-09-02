import { describe, expect, it } from "vitest";
import { detectInsights } from "../insights";
import { emptyTrip, transport } from "../trip-utils";

describe("detectInsights", () => {
  it("flags a tight train-to-flight connection", () => {
    const trip = emptyTrip({
      name: "Test",
      destinations: [{ id: "d1", name: "Munich" }],
      startDate: "2026-11-08",
      endDate: "2026-11-21",
      transportation: [
        transport({
          type: "train",
          route: "Salzburg → Munich",
          date: "2026-11-21",
          arrivalTime: "12:00",
        }),
        transport({
          type: "flight",
          route: "Munich (MUC) → NYC",
          date: "2026-11-21",
          departureTime: "12:40",
        }),
      ],
    });
    const insights = detectInsights(trip);
    expect(insights.some((i) => i.kind === "warning" && /tight/i.test(i.title))).toBe(true);
  });

  it("flags unused budget as an opportunity", () => {
    const trip = emptyTrip({
      destinations: [{ id: "d1", name: "Bled" }],
      startDate: "2026-11-08",
      endDate: "2026-11-21",
      budgetCap: 8000,
      budget: [{ id: "b1", category: "Stays", estimated: 1200, currency: "EUR" }],
    });
    expect(detectInsights(trip).some((i) => i.kind === "opportunity")).toBe(true);
  });
});
