import { useMemo, useState } from "react";
import {
  Card,
  FluentProvider,
  Select,
  Switch,
  makeStyles,
  tokens,
  webDarkTheme,
  webLightTheme,
} from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import Header from "./components/Header";
import TripForm from "./components/TripForm";
import ResultsPanel from "./components/ResultsPanel";
import PackingAdvice from "./components/PackingAdvice";
import { fetchFlightStatus } from "./services/flightService";
import { fetchWeather } from "./services/weatherService";
import { generatePackingAdvice } from "./services/packingService";
import type { PackingAdvice as PackingAdviceType, TripDetails } from "./types";

const useStyles = makeStyles({
  page: {
    minHeight: "100vh",
    padding: tokens.spacingHorizontalXL,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "grid",
    gap: tokens.spacingVerticalXL,
  },
  topBar: {
    display: "flex",
    justifyContent: "flex-end",
    gap: tokens.spacingHorizontalL,
    alignItems: "center",
  },
  topBarItem: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
  section: {
    padding: tokens.spacingHorizontalL,
  },
});

const initialTrip: TripDetails = {
  origin: "",
  destination: "",
};

export default function App() {
  const styles = useStyles();
  const { t, i18n } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState(i18n.language || "en");
  const [trip, setTrip] = useState<TripDetails>(initialTrip);
  const [flightStatus, setFlightStatus] = useState<null | Awaited<
    ReturnType<typeof fetchFlightStatus>
  >>(null);
  const [weather, setWeather] = useState<null | Awaited<
    ReturnType<typeof fetchWeather>
  >>(null);
  const [packingAdvice, setPackingAdvice] = useState<PackingAdviceType | null>(
    null,
  );

  const labels = useMemo(
    () => ({
      origin: t("origin"),
      destination: t("destination"),
      checkButton: t("checkButton"),
      packingButton: t("packingButton"),
      flightStatus: t("flightStatus"),
      weather: t("weather"),
      packingAdvice: t("packingAdvice"),
      lastUpdated: t("lastUpdated"),
      notAvailable: t("notAvailable"),
      language: t("language"),
      darkMode: t("darkMode"),
    }),
    [t],
  );

  const handleChange = (field: keyof TripDetails, value: string) => {
    setTrip((current) => ({ ...current, [field]: value }));
  };

  const handleLanguageChange = (nextLanguage: string) => {
    setLanguage(nextLanguage);
    i18n.changeLanguage(nextLanguage);
  };

  const handleCheck = async () => {
    const [flightData, weatherData] = await Promise.all([
      fetchFlightStatus(trip),
      fetchWeather(trip),
    ]);
    setFlightStatus(flightData);
    setWeather(weatherData);
  };

  const handlePacking = async () => {
    let weatherData = weather;

    if (!weatherData && trip.destination) {
      weatherData = await fetchWeather(trip);
      setWeather(weatherData);
    }

    const advice = await generatePackingAdvice(trip, weatherData);
    setPackingAdvice(advice);
  };

  return (
    <FluentProvider theme={isDarkMode ? webDarkTheme : webLightTheme}>
      <div className={styles.page}>
        <div className={styles.container}>
        <div className={styles.topBar}>
          <div className={styles.topBarItem}>
            <label htmlFor="language-select">{labels.language}</label>
            <Select
              id="language-select"
              value={language}
              onChange={(event) =>
                handleLanguageChange(
                  (event.target as HTMLSelectElement).value,
                )
              }
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </Select>
          </div>
          <div className={styles.topBarItem}>
            <Switch
              checked={isDarkMode}
              onChange={(_, data) => setIsDarkMode(data.checked)}
              label={labels.darkMode}
            />
          </div>
        </div>
        <Header title={t("appTitle")} subtitle={t("appSubtitle")} />

        <Card className={styles.section}>
          <TripForm
            value={trip}
            onChange={handleChange}
            onCheck={handleCheck}
            onPacking={handlePacking}
            labels={labels}
          />
        </Card>

        <ResultsPanel
          flightStatus={flightStatus ?? undefined}
          weather={weather ?? undefined}
          labels={{
            flightStatus: labels.flightStatus,
            weather: labels.weather,
            lastUpdated: labels.lastUpdated,
            notAvailable: labels.notAvailable,
          }}
        />

        <PackingAdvice
          advice={packingAdvice ?? undefined}
          label={labels.packingAdvice}
          notAvailable={labels.notAvailable}
        />
        </div>
      </div>
    </FluentProvider>
  );
}
