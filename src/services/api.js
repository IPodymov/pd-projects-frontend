/**
 * API сервис для работы с бекенд
 * Реализует DRY принципы с единой функцией для всех запросов
 */

import config from '../config/config.js';

/**
 * Базовая функция для API запросов
 * @param {string} endpoint - API endpoint
 * @param {object} options - опции запроса
 * @returns {Promise}
 */
export async function apiCall(endpoint, options = {}) {
  const {
    method = 'GET',
    body = null,
    headers = {},
    includeAuth = true,
  } = options;

  const requestOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  // Добавляем токен если требуется
  if (includeAuth) {
    const token = localStorage.getItem('authToken');
    if (token) {
      requestOptions.headers.Authorization = `Bearer ${token}`;
    }
  }

  // Добавляем тело запроса если оно есть
  if (body) {
    requestOptions.body = JSON.stringify(body);
  }

  const url = `${config.apiBaseUrl}${endpoint}`;

  try {
    const response = await fetch(url, requestOptions);

    // Проверяем статус ответа
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        message: errorData.message || `HTTP ${response.status}`,
        data: errorData,
      };
    }

    // Парсим JSON если есть контент
    if (response.headers.get('content-length') === '0') {
      return null;
    }

    return await response.json();
  } catch (error) {
    // Если ошибка 401 - токен истёк, очищаем хранилище
    if (error.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('logout'));
    }

    throw error;
  }
}

/**
 * Сервис аутентификации
 */
export const authService = {
  /**
   * Регистрация нового пользователя
   * @param {object} data - { name, email, password, schoolId?, schoolClassId?, token? }
   */
  async register(data) {
    const response = await apiCall(config.endpoints.auth.register, {
      method: 'POST',
      body: data,
      includeAuth: false,
    });
    this.setToken(response.token);
    return response;
  },

  /**
   * Вход в систему
   * @param {object} credentials - { email, password }
   */
  async login(credentials) {
    const response = await apiCall(config.endpoints.auth.login, {
      method: 'POST',
      body: credentials,
      includeAuth: false,
    });
    this.setToken(response.token);
    return response;
  },

  /**
   * Выход из системы
   */
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  /**
   * Сохраняет токен в локальное хранилище
   */
  setToken(token) {
    localStorage.setItem('authToken', token);
  },

  /**
   * Получает токен из локального хранилища
   */
  getToken() {
    return localStorage.getItem('authToken');
  },

  /**
   * Проверяет наличие токена
   */
  isAuthenticated() {
    return !!this.getToken();
  },
};

/**
 * Сервис пользователей
 */
export const userService = {
  /**
   * Получить профиль текущего пользователя
   */
  async getProfile() {
    return apiCall(config.endpoints.users.profile);
  },

  /**
   * Обновить профиль
   * @param {object} data - { name?, email?, password?, schoolId?, schoolClassId? }
   */
  async updateProfile(userId, data) {
    return apiCall(`${config.endpoints.users.profile}/${userId}`, {
      method: 'PATCH',
      body: data,
    });
  },

  /**
   * Поиск пользователей по email
   * @param {string} email
   */
  async searchByEmail(email) {
    return apiCall(`${config.endpoints.users.search}?email=${email}`);
  },

  /**
   * Связать с GitHub
   * @param {string} code - OAuth код от GitHub
   */
  async linkGitHub(code) {
    return apiCall(config.endpoints.users.github, {
      method: 'POST',
      body: { code },
    });
  },
};

/**
 * Сервис проектов
 */
export const projectService = {
  /**
   * Получить список проектов
   */
  async getProjects() {
    return apiCall(config.endpoints.projects.list);
  },

  /**
   * Получить проект по ID
   */
  async getProject(id) {
    return apiCall(config.endpoints.projects.detail(id));
  },

  /**
   * Создать проект
   */
  async createProject(data) {
    return apiCall(config.endpoints.projects.create, {
      method: 'POST',
      body: data,
    });
  },

  /**
   * Обновить проект
   */
  async updateProject(id, data) {
    return apiCall(config.endpoints.projects.update(id), {
      method: 'PATCH',
      body: data,
    });
  },

  /**
   * Изменить статус проекта
   */
  async updateStatus(id, status) {
    return apiCall(config.endpoints.projects.status(id), {
      method: 'PATCH',
      body: { status },
    });
  },

  /**
   * Присоединиться к проекту
   */
  async joinProject(id) {
    return apiCall(config.endpoints.projects.join(id), {
      method: 'POST',
    });
  },

  /**
   * Загрузить файл
   */
  async uploadFile(id, file, type) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const token = authService.getToken();
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `${config.apiBaseUrl}${config.endpoints.projects.upload(id)}`,
      {
        method: 'POST',
        body: formData,
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Удалить проект
   */
  async deleteProject(id) {
    return apiCall(config.endpoints.projects.delete(id), {
      method: 'DELETE',
    });
  },
};

/**
 * Сервис для работы со школами
 */
export const schoolService = {
  /**
   * Получить все школы
   */
  async getAllSchools() {
    const response = await apiCall('/api/schools', {
      method: 'GET',
    });
    return response.schools || response || [];
  },

  /**
   * Получить школу по ID
   */
  async getSchoolById(id) {
    return apiCall(`/api/schools/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Поиск школ
   */
  async searchSchools(query) {
    const response = await apiCall(`/api/schools/search?query=${encodeURIComponent(query)}`, {
      method: 'GET',
    });
    return response.schools || response || [];
  },
};

export default {
  authService,
  userService,
  projectService,
  schoolService,
};
