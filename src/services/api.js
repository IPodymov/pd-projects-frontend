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
   * Получить список проектов (с фильтрацией по роли на бекенде)
   */
  async getProjects() {
    return apiCall('/projects');
  },

  /**
   * Получить проект по ID
   */
  async getProject(id) {
    return apiCall(`/projects/${id}`);
  },

  /**
   * Создать проект
   * @param {object} data - { title, description, githubUrl?, schoolId, schoolClassId? }
   * Статус автоматически будет approved для admin/teacher/university_staff, pending для student
   */
  async createProject(data) {
    return apiCall('/projects', {
      method: 'POST',
      body: data,
    });
  },

  /**
   * Обновить проект
   * @param {number} id - ID проекта
   * @param {object} data - { title?, description?, githubUrl?, status? }
   */
  async updateProject(id, data) {
    return apiCall(`/projects/${id}`, {
      method: 'PATCH',
      body: data,
    });
  },

  /**
   * Изменить статус проекта (только для teacher/university_staff/admin)
   * @param {number} id - ID проекта
   * @param {string} status - pending | approved | rejected
   */
  async updateStatus(id, status) {
    return apiCall(`/projects/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  },

  /**
   * Присоединиться к проекту (только для student, max 3 участника)
   */
  async joinProject(id) {
    return apiCall(`/projects/${id}/join`, {
      method: 'POST',
    });
  },

  /**
   * Загрузить файл к проекту
   * @param {number} id - ID проекта
   * @param {File} file - Файл для загрузки
   * @param {string} type - document | presentation
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
      `${config.apiBaseUrl}/projects/${id}/upload`,
      {
        method: 'POST',
        body: formData,
        headers,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        message: error.message || `Upload failed: ${response.status}`,
      };
    }

    return response.json();
  },

  /**
   * Удалить проект (только admin)
   */
  async deleteProject(id) {
    return apiCall(`/projects/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Сервис для работы со школами
 */
export const schoolService = {
  /**
   * Получить все школы (публичный доступ)
   * @param {string} search - опциональный поиск по номеру, названию или городу
   */
  async getAllSchools(search = '') {
    const url = search ? `/schools?search=${encodeURIComponent(search)}` : '/schools';
    const response = await apiCall(url, {
      method: 'GET',
      includeAuth: false,
    });
    return Array.isArray(response) ? response : [];
  },

  /**
   * Получить школу по ID с её классами (публичный доступ)
   */
  async getSchoolById(id) {
    return apiCall(`/schools/${id}`, {
      method: 'GET',
      includeAuth: false,
    });
  },

  /**
   * Получить классы конкретной школы (публичный доступ)
   * @param {number} schoolId - ID школы
   * @param {string} search - опциональный поиск по названию класса
   */
  async getSchoolClasses(schoolId, search = '') {
    const url = search 
      ? `/schools/${schoolId}/classes?search=${encodeURIComponent(search)}`
      : `/schools/${schoolId}/classes`;
    const response = await apiCall(url, {
      method: 'GET',
      includeAuth: false,
    });
    return Array.isArray(response) ? response : [];
  },

  /**
   * Получить все классы с опциональной фильтрацией (публичный доступ)
   * @param {object} params - { search?, schoolId? }
   */
  async getAllClasses(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.schoolId) queryParams.append('schoolId', params.schoolId);
    
    const url = queryParams.toString() 
      ? `/schools/classes/all?${queryParams.toString()}`
      : '/schools/classes/all';
    
    const response = await apiCall(url, {
      method: 'GET',
      includeAuth: false,
    });
    return Array.isArray(response) ? response : [];
  },
};

export default {
  authService,
  userService,
  projectService,
  schoolService,
};
