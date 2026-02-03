import type { FlightStatus, TripDetails } from "../types";

const fallbackStatus: FlightStatus = {
  status: "Configure the backend to fetch flight data.",
  departureTimeLocal: "Unknown",
  arrivalTimeLocal: "Unknown",
  terminal: "Unknown",
  gate: "Unknown",
  lastUpdated: new Date().toLocaleString(),
};

export async function fetchFlightStatus(
  trip: TripDetails,
): Promise<FlightStatus> {
  if (!trip.origin || !trip.destination) {
    return {
      ...fallbackStatus,
      status: "Add origin and destination to check flights.",
    };
  }

  try {
    const apiBase =
      import.meta.env.VITE_API_BASE_URL ||
      `http://${window.location.hostname}:5179`;
    const url = new URL(`${apiBase}/api/flight`);
    url.searchParams.set("origin", trip.origin);
    url.searchParams.set("destination", trip.destination);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Backend error");
    }

    const data = (await response.json()) as FlightStatus;
    return {
      status: data.status || fallbackStatus.status,
      departureTimeLocal: data.departureTimeLocal || fallbackStatus.departureTimeLocal,
      arrivalTimeLocal: data.arrivalTimeLocal || fallbackStatus.arrivalTimeLocal,
      terminal: data.terminal || fallbackStatus.terminal,
      gate: data.gate || fallbackStatus.gate,
      lastUpdated: data.lastUpdated || new Date().toLocaleString(),
    };
  } catch (error) {
    console.warn("Flight status fallback:", error);
    return fallbackStatus;
  }
}
