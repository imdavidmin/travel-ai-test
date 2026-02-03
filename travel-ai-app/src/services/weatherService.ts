import type { TripDetails, WeatherForecast } from "../types";

const fallbackWeather: WeatherForecast = {
  summary: "Configure the backend to fetch weather data.",
  temperatureC: "N/A",
  precipitationChance: "N/A",
  windKph: "N/A",
  alerts: [],
  lastUpdated: new Date().toLocaleString(),
};

export async function fetchWeather(
  trip: TripDetails,
): Promise<WeatherForecast> {
  if (!trip.destination) {
    return {
      ...fallbackWeather,
      summary: "Add a destination to check weather.",
    };
  }

  try {
    const apiBase =
      import.meta.env.VITE_API_BASE_URL ||
      `http://${window.location.hostname}:5179`;
    const url = new URL(`${apiBase}/api/weather`);
    url.searchParams.set("destination", trip.destination);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Backend error");
    }

    const data = (await response.json()) as WeatherForecast;
    return {
      summary: data.summary || fallbackWeather.summary,
      temperatureC: data.temperatureC || fallbackWeather.temperatureC,
      precipitationChance:
        data.precipitationChance || fallbackWeather.precipitationChance,
      windKph: data.windKph || fallbackWeather.windKph,
      alerts: data.alerts || fallbackWeather.alerts,
      lastUpdated: data.lastUpdated || new Date().toLocaleString(),
    };
  } catch (error) {
    console.warn("Weather fallback:", error);
    return fallbackWeather;
  }
}
