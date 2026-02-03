import {
  Card,
  CardHeader,
  Text,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import type { FlightStatus, WeatherForecast } from "../types";

const useStyles = makeStyles({
  grid: {
    display: "grid",
    gap: tokens.spacingVerticalM,
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  },
  content: {
    display: "grid",
    gap: tokens.spacingVerticalXS,
  },
  meta: {
    color: tokens.colorNeutralForeground2,
  },
});

interface ResultsPanelProps {
  flightStatus?: FlightStatus;
  weather?: WeatherForecast;
  labels: {
    flightStatus: string;
    weather: string;
    lastUpdated: string;
    notAvailable: string;
  };
}

export default function ResultsPanel({
  flightStatus,
  weather,
  labels,
}: ResultsPanelProps) {
  const styles = useStyles();

  return (
    <div className={styles.grid}>
      <Card>
        <CardHeader header={<Text weight="semibold">{labels.flightStatus}</Text>} />
        <div className={styles.content}>
          <Text>
            {flightStatus?.status ?? labels.notAvailable}
          </Text>
          <Text>
            Departure: {flightStatus?.departureTimeLocal ?? labels.notAvailable}
          </Text>
          <Text>
            Arrival: {flightStatus?.arrivalTimeLocal ?? labels.notAvailable}
          </Text>
          <Text>
            Terminal: {flightStatus?.terminal ?? labels.notAvailable}
          </Text>
          <Text>
            Gate: {flightStatus?.gate ?? labels.notAvailable}
          </Text>
          <Text className={styles.meta}>
            {labels.lastUpdated}: {flightStatus?.lastUpdated ?? labels.notAvailable}
          </Text>
        </div>
      </Card>

      <Card>
        <CardHeader header={<Text weight="semibold">{labels.weather}</Text>} />
        <div className={styles.content}>
          <Text>{weather?.summary ?? labels.notAvailable}</Text>
          <Text>Temp: {weather?.temperatureC ?? labels.notAvailable}</Text>
          <Text>
            Precipitation: {weather?.precipitationChance ?? labels.notAvailable}
          </Text>
          <Text>Wind: {weather?.windKph ?? labels.notAvailable}</Text>
          <Text className={styles.meta}>
            {labels.lastUpdated}: {weather?.lastUpdated ?? labels.notAvailable}
          </Text>
        </div>
      </Card>
    </div>
  );
}
