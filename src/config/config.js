/**
 * Конфигурация приложения
 */

export const config = {
  // Базовый URL API
  apiBaseUrl: "https://pd-projects.up.railway.app",

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
