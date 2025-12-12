/**
 * Примеры использования системы аутентификации
 */

// ============================================
// 1. ИСПОЛЬЗОВАНИЕ В КОМПОНЕНТЕ Vue
// ============================================

// Пример хука для работы с аутентификацией

// ============================================
// 2. ПРИМЕР: ФОРМА ВХОДА
// ============================================

/*
<template>
  <form @submit.prevent="handleLogin">
    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />
    <button :disabled="isLoading">{{ isLoading ? 'Loading...' : 'Login' }}</button>
    <div v-if="error" class="error">{{ error }}</div>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth } from '@/store/store.js';

const email = ref('');
const password = ref('');
const { login, isLoading, error } = useAuth();

const handleLogin = async () => {
  try {
    await login({ email: email.value, password: password.value });
    // Успешный вход
  } catch (err) {
    // Ошибка уже обработана в store
  }
};
</script>
*/

// ============================================
// 3. ПРИМЕР: РАБОТА С API
// ============================================

// Получить список проектов
async function fetchProjects() {
  const { projectService } = await import('@/services/api.js');
  try {
    const projects = await projectService.getProjects();
    console.log(projects);
  } catch (error) {
    console.error('Ошибка получения проектов:', error);
  }
}

// Создать проект
async function createNewProject() {
  const { projectService } = await import('@/services/api.js');
  try {
    const project = await projectService.createProject({
      title: 'Мой проект',
      description: 'Описание проекта',
      schoolId: '1',
      githubUrl: 'https://github.com/...'
    });
    console.log('Проект создан:', project);
  } catch (error) {
    console.error('Ошибка создания проекта:', error);
  }
}

// Обновить профиль пользователя
async function updateUserProfile() {
  const { userService } = await import('@/services/api.js');
  try {
    const updatedUser = await userService.updateProfile(userId, {
      name: 'Новое имя',
      email: 'newemail@example.com'
    });
    console.log('Профиль обновлен:', updatedUser);
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
  }
}

// ============================================
// 4. ПРИМЕР: ЗАЩИТА МАРШРУТА
// ============================================

/*
// router.js
const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    component: Login,
    meta: { requiresGuest: true }
  }
];

router.beforeEach((to, from, next) => {
  const { isAuthenticated } = useAuth();
  
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next('/login');
  } else if (to.meta.requiresGuest && isAuthenticated.value) {
    next('/');
  } else {
    next();
  }
});
*/

// ============================================
// 5. ПРИМЕР: ГЛОБАЛЬНОЕ СОСТОЯНИЕ
// ============================================

/*
import { store } from '@/store/store.js';

// Получить текущего пользователя
const currentUser = store.state.user;

// Проверить авторизацию
const isAuth = store.getters.isAuthenticated();

// Получить роль пользователя
const userRole = store.getters.userRole();

// Установить ошибку
store.actions.setError('Произошла ошибка');

// Очистить ошибку
store.actions.clearError();

// Выход из системы
store.actions.logout();
*/

// ============================================
// 6. ПРИМЕР: ЗАГРУЗКА ФАЙЛА
// ============================================

async function uploadProjectFile() {
  const { projectService } = await import('@/services/api.js');
  try {
    const file = document.querySelector('input[type="file"]').files[0];
    
    const result = await projectService.uploadFile(
      projectId,
      file,
      'document' // или 'presentation'
    );
    
    console.log('Файл загружен:', result);
  } catch (error) {
    console.error('Ошибка загрузки файла:', error);
  }
}

// ============================================
// 7. ПРИМЕР: ОБРАБОТКА ОШИБОК
// ============================================

/*
const { login, error, clearError } = useAuth();

const handleLogin = async (credentials) => {
  try {
    await login(credentials);
  } catch (err) {
    // err.status - HTTP статус код
    // err.message - сообщение об ошибке
    // err.data - данные ошибки от сервера
    
    if (err.status === 401) {
      // Неверные учетные данные
    } else if (err.status === 400) {
      // Неверные данные
    } else if (err.status === 500) {
      // Ошибка сервера
    }
  }
};
*/

// ============================================
// 8. ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ
// ============================================

/*
// .env (Development)
VITE_API_URL_DEV=http://localhost:3000
VITE_API_URL_PROD=https://api.pd-projects.com

// .env.production
VITE_API_URL_PROD=https://api.pd-projects.com

// Доступ в коде:
import { config } from '@/config/config.js';
console.log(config.apiBaseUrl); // http://localhost:3000 (dev) или https://... (prod)
*/

// ============================================
// 9. ЦВЕТОВАЯ ПАЛИТРА
// ============================================

/*
CSS переменные доступны везде:

:root {
  --color-primary: #005BBB          // Синий
  --color-secondary: #E1E8ED        // Светло-серый
  --color-accent: #FF6F00           // Оранжевый
  --color-background: #FFFFFF       // Белый
  --color-light-gray: #F5F5F5       // Светло-серый фон
  --color-text: #2C2C2C             // Темный текст
  --color-primary-dark: #003D7A     // Темный синий
  --color-primary-light: #0A7FD1    // Светлый синий
  --color-accent-dark: #E85A00      // Темный оранжевый
  --color-accent-light: #FF8C2E     // Светлый оранжевый
}

Использование:
background-color: var(--color-primary);
color: var(--color-text);
border: 1px solid var(--color-border);
*/

// ============================================
// 10. ТИПЫ ДАННЫХ (из API)
// ============================================

/*
// Пользователь
{
  id: string,
  name: string,
  email: string,
  role: 'Student' | 'Teacher' | 'University Staff' | 'Admin',
  schoolId?: string,
  schoolClassId?: string,
  avatar?: string
}

// Проект
{
  id: string,
  title: string,
  description: string,
  status: 'pending' | 'approved' | 'rejected',
  owner: User,
  team: User[],
  schoolId: string,
  schoolClassId?: string,
  githubUrl?: string,
  files: File[],
  createdAt: string,
  updatedAt: string
}

// Файл
{
  id: string,
  name: string,
  type: 'document' | 'presentation',
  size: number,
  url: string,
  uploadedAt: string
}
*/

export {};
