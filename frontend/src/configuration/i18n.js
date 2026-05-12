import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";
import uk from "../locales/uk.json";
import ru from "../locales/ru.json"; // Add Russian translation import
import Backend from "i18next-http-backend";
import axios from "axios";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import { enGB, uk as ukLocale, ru as ruLocale } from "date-fns/locale"; // Add Russian locale

const defaultUserLanguage = "en";
// Load user's preferred language from localStorage or default to English
const userLanguage = localStorage.getItem("language") || defaultUserLanguage;

// Register locales with unique names
registerLocale("en", enGB);
registerLocale("uk", ukLocale);
registerLocale("ru", ruLocale);

// Set the default locale for react-datepicker
setDefaultLocale(userLanguage);

// Set <html> lang attribute on page load
document.documentElement.lang = userLanguage;

i18n
  .use(Backend) // Use the backend plugin if loading from the server
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      uk: {
        translation: uk,
      },
      ru: { // Add Russian resource
        translation: ru,
      },
    },
    lng: userLanguage, // Set initial language based on localStorage
    fallbackLng: defaultUserLanguage, // Default to English
    interpolation: {
      escapeValue: false, // React already protects from XSS
    },
    react: {
      useSuspense: false, // Disable suspense to prevent flickering
    },
    preload: ["en", "uk", "ru"], 
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
      request: (options) => {
        return axios.get(options.loadPath).then((response) => response.data);
      },
    },
  });

// Custom function to change language and update localStorage and <html> lang attribute
export const changeLanguage = (lng) => {
  i18n.changeLanguage(lng);
  document.documentElement.lang = lng;
  localStorage.setItem("language", lng); // Persist language choice
};

export const getCurrentLanguage = () => i18n.language;

export default i18n;