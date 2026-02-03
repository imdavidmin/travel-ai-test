export interface TripDetails {
  origin: string;
  destination: string;
}

export interface FlightStatus {
  status: string;
  departureTimeLocal: string;
  arrivalTimeLocal: string;
  terminal: string;
  gate: string;
  lastUpdated: string;
}

export interface WeatherForecast {
  summary: string;
  temperatureC: string;
  precipitationChance: string;
  windKph: string;
  alerts: string[];
  lastUpdated: string;
}

export interface PackingAdvice {
  summary: string;
  items: string[];
  notes: string[];
}
