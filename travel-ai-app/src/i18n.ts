import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      appTitle: "Travel AI Assistant",
      appSubtitle: "Check flights, weather, and get packing advice",
      language: "Language",
      theme: "Theme",
      themeLight: "Light",
      themeDark: "Dark",
      darkMode: "Dark mode",
      tripDetails: "Trip details",
      origin: "Origin airport/city",
      destination: "Destination airport/city",
      checkButton: "Check flight times & weather",
      packingButton: "Get packing advice",
      flightStatus: "Flight status",
      weather: "Destination weather",
      packingAdvice: "Packing advice",
      notAvailable: "Not available yet",
      lastUpdated: "Last updated",
    },
  },
  es: {
    translation: {
      appTitle: "Asistente de Viajes con IA",
      appSubtitle: "Consulta vuelos, clima y recibe consejos de equipaje",
      language: "Idioma",
      theme: "Tema",
      themeLight: "Claro",
      themeDark: "Oscuro",
      darkMode: "Modo oscuro",
      tripDetails: "Detalles del viaje",
      origin: "Origen (aeropuerto/ciudad)",
      destination: "Destino (aeropuerto/ciudad)",
      checkButton: "Consultar horarios de vuelo y clima",
      packingButton: "Obtener consejos de equipaje",
      flightStatus: "Estado del vuelo",
      weather: "Clima en destino",
      packingAdvice: "Consejos de equipaje",
      notAvailable: "Aún no disponible",
      lastUpdated: "Última actualización",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
