import type { PackingAdvice, TripDetails, WeatherForecast } from "../types";

const fallbackAdvice: PackingAdvice = {
  summary: "Suggested items based on destination",
  items: [
    "Comfortable clothing",
    "Walking shoes",
    "Phone charger",
    "Travel documents",
  ],
  notes: ["Configure the backend to get AI-generated advice."],
};

export async function generatePackingAdvice(
  trip: TripDetails,
  weather?: WeatherForecast | null,
): Promise<PackingAdvice> {
  if (!trip.origin || !trip.destination) {
    return {
      ...fallbackAdvice,
      notes: ["Add origin and destination for more accurate advice."],
    };
  }

  try {
    const apiBase =
      import.meta.env.VITE_API_BASE_URL ||
      `http://${window.location.hostname}:5179`;
    const response = await fetch(`${apiBase}/api/packing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin: trip.origin,
        destination: trip.destination,
        weather,
      }),
    });

    if (!response.ok) {
      throw new Error("Backend error");
    }

    const data = (await response.json()) as PackingAdvice;
    return {
      summary: data.summary || fallbackAdvice.summary,
      items: data.items?.length ? data.items : fallbackAdvice.items,
      notes: data.notes?.length ? data.notes : fallbackAdvice.notes,
    };
  } catch (error) {
    console.warn("Packing advice fallback:", error);
    return fallbackAdvice;
  }
}
