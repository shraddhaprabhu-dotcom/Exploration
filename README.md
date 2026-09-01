# Voyage

A trip workspace — not a travel chatbot.

Voyage turns a sentence into a living plan: itinerary, transportation, stays, places, budget, documents, and a persistent trip agent that updates those sections instead of only talking.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Try the core loop

1. On the home page, keep the Europe / November example (or write your own).
2. Choose one of the three destinations the agent proposes.
3. Switch Overview → Itinerary → Transport → Stays → Budget.
4. Ask the agent: “Make this trip more relaxed”, “Find a cheaper hotel”, or “It’s going to rain — fix the hike.”
5. Review the proposed change, then apply it. Bookings are never implied.

Trips persist in local storage. Nothing is actually reserved.

## Scripts

- `npm run dev` — Next.js app
- `npm test` — planner and insight tests
- `npm run build` — production build

## Notes

The agent uses destination knowledge and itinerary rules (geography, November conditions, booking honesty). It does not invent live seat maps or hotel availability. Share a departure city when you want flight routing attached.
