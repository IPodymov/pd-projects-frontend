import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/";

export const api = axios.create({
  baseURL,
  withCredentials: false, // use Authorization header instead of cookies
});

api.interceptors.request.use((config) => {
  // skipAuth=true позволяет явно вызвать публичный эндпоинт без токена
  // например, когда бек ломается на авторизованном запросе списка проектов для студентов
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const skipAuth = (config as any).skipAuth;
  if (skipAuth) return config;

  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
