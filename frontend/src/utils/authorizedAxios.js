import axios from "axios";
import i18n from "../configuration/i18n";

const authorizedAxios = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

const publicAuthRoutes = ["/login", "/signup"];

// Callback to trigger premium modal
let setShowPremiumModal = null;

export const registerPremiumModalCallback = (callback) => {
  setShowPremiumModal = callback;
};

authorizedAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const lang = i18n.language || localStorage.getItem("language") || "en";
    config.params = { ...config.params, lang };

    return config;
  },
  (error) => Promise.reject(error)
);

authorizedAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("jwtToken");

      const currentPath = window.location.pathname;

      const isOnPublicAuthRoute = publicAuthRoutes.some((route) =>
        currentPath.startsWith(route)
      );

      if (!isOnPublicAuthRoute) {
        window.location.href = "/login";
      }
    }

    if (error.response?.status === 402 && setShowPremiumModal) {
      setShowPremiumModal(true);
    }

    return Promise.reject(error);
  }
);
export default authorizedAxios;
