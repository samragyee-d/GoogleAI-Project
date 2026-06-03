import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function fallbackDecision(eventType: string) {
  if (eventType === "hotel_cancelled") {
    return {
      actions: [
        {
          type: "replace_hotel",
          city: "Toronto",
          newHotel: "Budget Stay Toronto",
          newCost: 480,
          agentNote:
            "Original hotel became unavailable. Agent selected an available replacement hotel.",
        },
        {
          type: "create_log",
          message:
            "Fallback agent replaced unavailable Toronto hotel because Gemini was unavailable.",
        },
      ],
    };
  }

  if (eventType === "match_advanced") {
    return {
      actions: [
        {
          type: "add_itinerary_stop",
          city: "Los Angeles",
          date: "July 6, 2026",
          match: "Argentina Semifinal",
          hotel: "LA Fan Stay",
          cost: 700,
          agentNote:
            "Team advancement detected. Agent added a new future match stop.",
        },
        {
          type: "create_log",
          message:
            "Fallback agent added Los Angeles semifinal stop because Gemini was unavailable.",
        },
      ],
    };
  }

  if (eventType === "budget_overrun") {
    return {
      actions: [
        {
          type: "update_cost",
          city: "Dallas",
          newCost: 450,
          agentNote:
            "Budget risk detected. Agent selected a lower-cost option for this stop.",
        },
        {
          type: "create_log",
          message:
            "Fallback agent reduced Dallas cost because Gemini was unavailable.",
        },
      ],
    };
  }

  return {
    actions: [
      {
        type: "create_log",
        message: `No action found for event: ${eventType}`,
      },
    ],
  };
}

function cleanJson(text: string) {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

export async function decideAgentActions({
  trip,
  itinerary,
  eventType,
}: {
  trip: any;
  itinerary: any[];
  eventType: string;
}) {
  const prompt = `
You are CupCompass, an agentic AI World Cup journey manager.

Your job is to decide what actions should be taken after a trip event occurs.

Trip:
${JSON.stringify(trip, null, 2)}

Current Itinerary:
${JSON.stringify(itinerary, null, 2)}

Event:
${eventType}

Return ONLY valid JSON. No markdown. No explanation.

Allowed action types:
- replace_hotel
- add_itinerary_stop
- update_cost
- create_log

Use this exact format:
{
  "actions": [
    {
      "type": "replace_hotel",
      "city": "Toronto",
      "newHotel": "Budget Stay Toronto",
      "newCost": 480,
      "agentNote": "Original hotel became unavailable. Agent selected an available replacement."
    },
    {
      "type": "create_log",
      "message": "Agent replaced unavailable hotel."
    }
  ]
}

Rules:
- If eventType is hotel_cancelled, replace the Toronto hotel.
- If eventType is match_advanced, add a Los Angeles semifinal stop.
- If eventType is budget_overrun, reduce the Dallas stop cost.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text || "{}";
    const cleaned = cleanJson(text);

    return JSON.parse(cleaned);
  } catch (error: any) {
    console.error("Gemini failed. Using fallback decision.");
    console.error(error?.message || error);

    return fallbackDecision(eventType);
  }
}

export async function processEvent({
  trip,
  itinerary,
  eventType,
  tripId,
}: {
  trip?: any;
  itinerary?: any[];
  eventType: string;
  tripId?: string;
}) {
  // If an Agent Builder endpoint is configured, prefer that. The endpoint
  // should accept JSON { tripId, trip, itinerary, eventType } and return
  // a JSON object with the same shape as decideAgentActions (i.e. { actions: [...] }).
  const agentBuilderUrl = process.env.AGENT_BUILDER_ENDPOINT;
  const apiKey = process.env.AGENT_BUILDER_KEY;

  if (agentBuilderUrl) {
    try {
      const res = await fetch(agentBuilderUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({ tripId, trip, itinerary, eventType }),
      });

      if (!res.ok) {
        console.error("Agent Builder request failed", res.status, await res.text());
        throw new Error("Agent Builder request failed");
      }

      const data = await res.json();

      // If Agent Builder returns a top-level `decision` object, use it.
      return data.decision || data;
    } catch (err) {
      console.error("Agent Builder call failed, falling back to local logic:", err);
      return decideAgentActions({ trip: trip || {}, itinerary: itinerary || [], eventType });
    }
  }

  // No Agent Builder configured — use local Gemini logic (existing flow).
  return decideAgentActions({ trip: trip || {}, itinerary: itinerary || [], eventType });
}