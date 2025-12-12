/**
 * Хранилище состояния приложения (простая реактивная система)
 * Управляет состоянием пользователя и аутентификацией
 */

import { reactive, computed } from "vue";
import { authService } from "../services/api.js";

// Инициализируем состояние из localStorage
const initUser = () => {
  const stored = localStorage.getItem("user");
  return stored ? JSON.parse(stored) : null;
};

const initAuthToken = () => {
  return localStorage.getItem("authToken") || null;
};

// Реактивное состояние
const state = reactive({
  user: initUser(),
  authToken: initAuthToken(),
  isLoading: false,
  error: null,
});

// Вычисляемые свойства
const getters = {
  isAuthenticated: () => !!state.authToken && !!state.user,
  userRole: () => state.user?.role || null,
  userId: () => state.user?.id || null,
  userEmail: () => state.user?.email || null,
};

// Методы для изменения состояния
const mutations = {
  setUser(user) {
    state.user = user;
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  },

  setAuthToken(token) {
    state.authToken = token;
    if (token) {
      localStorage.setItem("authToken", token);
    }
  },

  setLoading(loading) {
    state.isLoading = loading;
  },

  setError(error) {
    state.error = error;
  },

  clearError() {
    state.error = null;
  },

  logout() {
    state.user = null;
    state.authToken = null;
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
  },
};

// Асинхронные действия
const actions = {
  async register(userData) {
    mutations.setLoading(true);
    mutations.clearError();

    try {
      const response = await authService.register(userData);
      mutations.setUser(response.user);
      mutations.setAuthToken(response.token);
      authService.setToken(response.token);
      return response;
    } catch (error) {
      mutations.setError(error.message || "Ошибка регистрации");
      throw error;
    } finally {
      mutations.setLoading(false);
    }
  },

  async login(credentials) {
    mutations.setLoading(true);
    mutations.clearError();

    try {
      const response = await authService.login(credentials);
      mutations.setUser(response.user);
      mutations.setAuthToken(response.token);
      authService.setToken(response.token);
      return response;
    } catch (error) {
      mutations.setError(error.message || "Ошибка входа");
      throw error;
    } finally {
      mutations.setLoading(false);
    }
  },

  logout() {
    mutations.logout();
    authService.logout();
  },

  setUser(user) {
    mutations.setUser(user);
  },

  setAuthToken(token) {
    mutations.setAuthToken(token);
  },

  setError(error) {
    mutations.setError(error);
  },

  clearError() {
    mutations.clearError();
  },
};

// Слушатель события logout (из api.js)
window.addEventListener("logout", () => {
  mutations.logout();
});

/**
 * Композиция для использования в компонентах
 * @returns {object}
 */
export function useAuth() {
  return {
    // State
    state,
    isLoading: computed(() => state.isLoading),
    error: computed(() => state.error),
    user: computed(() => state.user),
    authToken: computed(() => state.authToken),

    // Getters
    isAuthenticated: computed(() => getters.isAuthenticated()),
    userRole: computed(() => getters.userRole()),
    userId: computed(() => getters.userId()),
    userEmail: computed(() => getters.userEmail()),

    // Actions
    ...actions,
  };
}

// Экспортируем для глобального использования
export const store = {
  state,
  getters,
  mutations,
  actions,
};

export default store;
