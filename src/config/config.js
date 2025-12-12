/**
 * Конфигурация приложения
 * Управляет URL на основе окружения (dev/prod)
 */

const isDevelopment = import.meta.env.MODE === "development";
const isProduction = import.meta.env.MODE === "production";

export const config = {
  // API URL в зависимости от окружения
  apiBaseUrl: isProduction
    ? import.meta.env.VITE_API_URL_PROD || "https://pd-projects.up.railway.app/"
    : import.meta.env.VITE_API_URL_DEV || "http://localhost:3000",

  isDevelopment,
  isProduction,

  // Endpoints
  endpoints: {
    auth: {
      register: "/auth/register",
      login: "/auth/login",
      invitation: "/auth/invitation",
    },
    users: {
      profile: "/users",
      search: "/users/search",
      github: "/users/github/link",
    },
    projects: {
      list: "/projects",
      create: "/projects",
      detail: (id) => `/projects/${id}`,
      update: (id) => `/projects/${id}`,
      status: (id) => `/projects/${id}/status`,
      join: (id) => `/projects/${id}/join`,
      upload: (id) => `/projects/${id}/upload`,
      delete: (id) => `/projects/${id}`,
    },
  },

  // Время жизни токена в хранилище (в миллисекундах)
  tokenExpiryTime: 3600000, // 1 час
};

export default config;
