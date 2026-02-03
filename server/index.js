import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const port = process.env.PORT || 5179;
const openaiApiKey = process.env.OPENAI_API_KEY;
const amadeusClientId = process.env.AMADEUS_CLIENT_ID;
const amadeusClientSecret = process.env.AMADEUS_CLIENT_SECRET;

if (!openaiApiKey) {
  console.warn("Missing OPENAI_API_KEY. Packing advice endpoint will fail.");
}

if (!amadeusClientId || !amadeusClientSecret) {
  console.warn(
    "Missing AMADEUS_CLIENT_ID or AMADEUS_CLIENT_SECRET. Flight endpoint will fail.",
  );
}

app.use(cors());
app.use(express.json());

const client = new OpenAI({ apiKey: openaiApiKey });

const amadeusTokenCache = {
  token: null,
  expiresAt: 0,
};

async function getAmadeusToken() {
  if (amadeusTokenCache.token && Date.now() < amadeusTokenCache.expiresAt) {
    return amadeusTokenCache.token;
  }

  if (!amadeusClientId || !amadeusClientSecret) {
    throw new Error("Missing Amadeus credentials");
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: amadeusClientId,
    client_secret: amadeusClientSecret,
  });

  const response = await fetch(
    "https://test.api.amadeus.com/v1/security/oauth2/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch Amadeus token: ${text}`);
  }

  const data = await response.json();
  amadeusTokenCache.token = data.access_token;
  amadeusTokenCache.expiresAt = Date.now() + (data.expires_in - 60) * 1000;

  return amadeusTokenCache.token;
}

async function resolveLocationCode(keyword) {
  const token = await getAmadeusToken();
  const url = new URL(
    "https://test.api.amadeus.com/v1/reference-data/locations",
  );
  url.searchParams.set("keyword", keyword);
  url.searchParams.set("subType", "AIRPORT,CITY");

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to resolve location: ${text}`);
  }

  const data = await response.json();
  const match = data.data?.[0];
  return match?.iataCode || null;
}

async function fetchFlightOffer(originCode, destinationCode) {
  const token = await getAmadeusToken();
  const today = new Date();
  const departureDate = today.toISOString().slice(0, 10);

  const url = new URL(
    "https://test.api.amadeus.com/v2/shopping/flight-offers",
  );
  url.searchParams.set("originLocationCode", originCode);
  url.searchParams.set("destinationLocationCode", destinationCode);
  url.searchParams.set("departureDate", departureDate);
  url.searchParams.set("adults", "1");
  url.searchParams.set("max", "1");

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch flight offers: ${text}`);
  }

  const data = await response.json();
  return { offer: data.data?.[0], departureDate };
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/packing", async (req, res) => {
  try {
    const { origin, destination, weather } = req.body ?? {};

    if (!origin || !destination) {
      return res.status(400).json({
        error: "origin and destination are required",
      });
    }

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      input: [
        {
          role: "system",
          content:
            "You are a travel assistant. Output only JSON with keys: summary, items, notes. Keep items short.",
        },
        {
          role: "user",
          content: `Trip route: ${origin} to ${destination}. Weather info (may be empty): ${JSON.stringify(
            weather ?? {},
          )}`,
        },
      ],
      temperature: 0.4,
      max_output_tokens: 300,
    });

    const text = response.output_text || "{}";
    let data = {};

    try {
      data = JSON.parse(text);
    } catch (parseError) {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      const jsonSlice =
        start !== -1 && end !== -1 && end > start
          ? text.slice(start, end + 1)
          : null;
      if (jsonSlice) {
        try {
          data = JSON.parse(jsonSlice);
          return res.json(data);
        } catch (sliceError) {
          console.warn("Packing advice JSON slice parse error:", sliceError);
        }
      }
      console.warn("Packing advice JSON parse error:", parseError, text);
      data = {
        summary: "Packing advice",
        items: [],
        notes: ["The model response was not valid JSON."],
      };
    }

    return res.json(data);
  } catch (error) {
    console.error("Packing advice error:", error);
    return res.status(500).json({ error: "Failed to generate packing advice" });
  }
});

app.get("/api/flight", async (req, res) => {
  try {
    const origin = req.query.origin;
    const destination = req.query.destination;

    if (!origin || !destination) {
      return res.status(400).json({
        error: "origin and destination are required",
      });
    }

    const [originCode, destinationCode] = await Promise.all([
      resolveLocationCode(origin),
      resolveLocationCode(destination),
    ]);

    if (!originCode || !destinationCode) {
      return res.status(404).json({
        error: "Could not resolve origin or destination to an airport code",
      });
    }

    const { offer, departureDate } = await fetchFlightOffer(
      originCode,
      destinationCode,
    );

    if (!offer) {
      return res.json({
        status: "No flights found for today",
        departureTimeLocal: "Unknown",
        arrivalTimeLocal: "Unknown",
        terminal: "Unknown",
        gate: "Unknown",
        lastUpdated: new Date().toLocaleString(),
      });
    }

    const segment = offer.itineraries?.[0]?.segments?.[0];
    const lastSegment =
      offer.itineraries?.[0]?.segments?.[
        offer.itineraries?.[0]?.segments?.length - 1
      ];

    return res.json({
      status: `Sample schedule for ${departureDate} (update with date later)`,
      departureTimeLocal: segment?.departure?.at || "Unknown",
      arrivalTimeLocal: lastSegment?.arrival?.at || "Unknown",
      terminal: segment?.departure?.terminal || "Unknown",
      gate: segment?.departure?.gate || "Unknown",
      lastUpdated: new Date().toLocaleString(),
    });
  } catch (error) {
    console.error("Flight status error:", error);
    return res.status(500).json({ error: "Failed to fetch flight data" });
  }
});

app.get("/api/weather", async (req, res) => {
  try {
    const destination = req.query.destination;

    if (!destination) {
      return res.status(400).json({ error: "destination is required" });
    }

    const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
    geoUrl.searchParams.set("name", destination);
    geoUrl.searchParams.set("count", "1");
    geoUrl.searchParams.set("language", "en");
    geoUrl.searchParams.set("format", "json");

    const geoResponse = await fetch(geoUrl);
    if (!geoResponse.ok) {
      throw new Error(`Geocoding failed: ${await geoResponse.text()}`);
    }

    const geoData = await geoResponse.json();
    const location = geoData.results?.[0];

    if (!location) {
      return res.status(404).json({ error: "Destination not found" });
    }

    const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
    weatherUrl.searchParams.set("latitude", location.latitude);
    weatherUrl.searchParams.set("longitude", location.longitude);
    weatherUrl.searchParams.set(
      "current",
      "temperature_2m,precipitation_probability,wind_speed_10m",
    );
    weatherUrl.searchParams.set("timezone", "auto");

    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) {
      throw new Error(`Weather fetch failed: ${await weatherResponse.text()}`);
    }

    const weatherData = await weatherResponse.json();
    const current = weatherData.current || {};

    return res.json({
      summary: `Current weather in ${location.name}`,
      temperatureC: `${current.temperature_2m ?? "N/A"}°C`,
      precipitationChance:
        current.precipitation_probability !== undefined
          ? `${current.precipitation_probability}%`
          : "N/A",
      windKph:
        current.wind_speed_10m !== undefined
          ? `${current.wind_speed_10m} km/h`
          : "N/A",
      alerts: [],
      lastUpdated: new Date().toLocaleString(),
    });
  } catch (error) {
    console.error("Weather error:", error);
    return res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

app.listen(port, () => {
  console.log(`Travel AI server running on port ${port}`);
});
