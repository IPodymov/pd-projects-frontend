# 📖 Быстрый справочник API

## 🔐 Аутентификация

### Вход
```javascript
import { useAuth } from '@/store/store.js';

const { login, isLoading, error } = useAuth();

try {
  await login({
    email: 'user@example.com',
    password: 'password123'
  });
  // Успешно! Пользователь авторизован
} catch (err) {
  // Ошибка уже в store.error
  console.error(err.message);
}
```

### Регистрация
```javascript
import { useAuth } from '@/store/store.js';

const { register, isLoading, error } = useAuth();

try {
  await register({
    name: 'Иван Петров',
    email: 'ivan@example.com',
    password: 'password123',
    schoolId: '1', // опционально
    token: 'invite-token' // опционально (для приглашения)
  });
  // Успешно! Пользователь создан и авторизован
} catch (err) {
  console.error(err.message);
}
```

### Выход
```javascript
import { useAuth } from '@/store/store.js';

const { logout } = useAuth();

logout();
// Пользователь вышел, токен удален
```

### Проверка авторизации
```javascript
import { useAuth } from '@/store/store.js';

const { isAuthenticated, user } = useAuth();

if (isAuthenticated.value) {
  console.log(`Привет, ${user.value.name}!`);
  console.log(`Email: ${user.value.email}`);
  console.log(`Роль: ${user.value.role}`);
}
```

---

## 👤 Пользователи

### Получить профиль
```javascript
import { userService } from '@/services/api.js';

const profile = await userService.getProfile();
console.log(profile);
// { id, name, email, role, schoolId, ... }
```

### Обновить профиль
```javascript
import { userService } from '@/services/api.js';

const updated = await userService.updateProfile(userId, {
  name: 'Новое имя',
  email: 'newemail@example.com',
  password: 'newpassword',
  schoolId: '2',
  schoolClassId: '10a'
});
```

### Поиск пользователя по email
```javascript
import { userService } from '@/services/api.js';

const results = await userService.searchByEmail('user@example.com');
// Доступно только для Admin и University Staff
```

### Связь с GitHub
```javascript
import { userService } from '@/services/api.js';

const result = await userService.linkGitHub(oauthCode);
// oauthCode получается от GitHub OAuth
```

---

## 📋 Проекты

### Получить все проекты
```javascript
import { projectService } from '@/services/api.js';

const projects = await projectService.getProjects();
// Фильтруется по школе/классу в зависимости от роли пользователя
// [
//   { id, title, description, status, owner, team, ... },
//   ...
// ]
```

### Получить проект по ID
```javascript
import { projectService } from '@/services/api.js';

const project = await projectService.getProject(projectId);
// { id, title, description, status, owner, team, files, ... }
```

### Создать проект
```javascript
import { projectService } from '@/services/api.js';

const newProject = await projectService.createProject({
  title: 'Название проекта',
  description: 'Описание проекта',
  schoolId: '1',
  schoolClassId: '10a', // опционально
  githubUrl: 'https://github.com/user/repo' // опционально
});
// Для Admin/Teacher/Staff автоматически одобряется
```

### Обновить проект
```javascript
import { projectService } from '@/services/api.js';

const updated = await projectService.updateProject(projectId, {
  title: 'Новое название',
  description: 'Новое описание',
  githubUrl: 'https://github.com/new/url'
});
```

### Изменить статус проекта
```javascript
import { projectService } from '@/services/api.js';

await projectService.updateStatus(projectId, 'approved');
// или 'rejected'
// Доступно только для Teacher, University Staff, Admin
```

### Присоединиться к проекту
```javascript
import { projectService } from '@/services/api.js';

await projectService.joinProject(projectId);
// Только для Student (максимум 3 участника в команде)
```

### Загрузить файл
```javascript
import { projectService } from '@/services/api.js';

const file = document.querySelector('input[type="file"]').files[0];

const result = await projectService.uploadFile(
  projectId,
  file,
  'document' // или 'presentation'
);
// { id, name, url, uploadedAt, ... }
```

### Удалить проект
```javascript
import { projectService } from '@/services/api.js';

await projectService.deleteProject(projectId);
// Доступно только для Admin
```

---

## 🎯 Использование в компонентах

### Пример компонента с формой
```vue
<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="formData.email" type="email" />
    <input v-model="formData.password" type="password" />
    
    <div v-if="error" class="error">{{ error }}</div>
    
    <button :disabled="isLoading">
      {{ isLoading ? 'Загрузка...' : 'Отправить' }}
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth } from '@/store/store.js';

const formData = ref({ email: '', password: '' });
const { login, isLoading, error } = useAuth();

const handleSubmit = async () => {
  try {
    await login(formData.value);
    // Успешно!
  } catch (err) {
    // Ошибка уже в error
  }
};
</script>
```

### Пример защиты маршрута
```javascript
// router.js
const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  }
];

router.beforeEach((to, from, next) => {
  const { isAuthenticated } = useAuth();
  
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next('/login');
  } else {
    next();
  }
});
```

### Пример использования в навигации
```vue
<template>
  <nav v-if="isAuthenticated">
    <span>{{ user.name }}</span>
    <button @click="logout">Выход</button>
  </nav>
  
  <router-link v-else to="/login">Вход</router-link>
</template>

<script setup>
import { useAuth } from '@/store/store.js';

const { isAuthenticated, user, logout } = useAuth();
</script>
```

---

## 🛠️ Обработка ошибок

### Типы ошибок
```javascript
try {
  await apiCall(endpoint, options);
} catch (error) {
  // error.status - HTTP статус код (401, 400, 500 и т.д.)
  // error.message - строка сообщения об ошибке
  // error.data - полный ответ от сервера
  
  if (error.status === 401) {
    // Неверные учетные данные или токен истек
    // Пользователь будет перенаправлен на логин
  } else if (error.status === 400) {
    // Неверные данные
    console.log(error.data); // детали ошибки
  } else if (error.status === 403) {
    // Нет доступа (недостаточно прав)
  } else if (error.status === 500) {
    // Ошибка сервера
  }
}
```

### Обработка в компоненте
```javascript
import { useAuth } from '@/store/store.js';

const { login, error, clearError } = useAuth();

const handleLogin = async (credentials) => {
  try {
    await login(credentials);
  } catch (err) {
    // Ошибка уже в store.error
    // Покажите пользователю: error.value
  }
};

// Очистить ошибку
const dismiss = () => clearError();
```

---

## 🔧 Конфигурация

### Доступ к конфигурации
```javascript
import { config } from '@/config/config.js';

console.log(config.apiBaseUrl); // URL бэкенда
console.log(config.endpoints);  // Все endpoints
console.log(config.isDevelopment); // true/false
console.log(config.isProduction);  // true/false
```

### Список endpoints
```javascript
// Аутентификация
config.endpoints.auth.register      // /auth/register
config.endpoints.auth.login         // /auth/login
config.endpoints.auth.invitation    // /auth/invitation

// Пользователи
config.endpoints.users.profile      // /users
config.endpoints.users.search       // /users/search
config.endpoints.users.github       // /users/github/link

// Проекты
config.endpoints.projects.list      // /projects
config.endpoints.projects.create    // /projects
config.endpoints.projects.detail(id) // /projects/:id
config.endpoints.projects.update(id) // /projects/:id
config.endpoints.projects.status(id) // /projects/:id/status
config.endpoints.projects.join(id)  // /projects/:id/join
config.endpoints.projects.upload(id) // /projects/:id/upload
config.endpoints.projects.delete(id) // /projects/:id
```

---

## 💾 LocalStorage

### Что сохраняется
```javascript
// authToken - JWT токен
localStorage.getItem('authToken');

// user - данные пользователя
const user = JSON.parse(localStorage.getItem('user'));
console.log(user.id, user.name, user.email, user.role);
```

### Очистка
```javascript
// При выходе все автоматически удаляется
import { useAuth } from '@/store/store.js';
const { logout } = useAuth();
logout(); // Удалит authToken и user из localStorage
```

---

## 🎨 CSS переменные

```css
/* Основные цвета */
var(--color-primary)        /* #005BBB - Синий */
var(--color-secondary)      /* #E1E8ED - Светло-серый */
var(--color-accent)         /* #FF6F00 - Оранжевый */

/* Фоны */
var(--color-background)     /* #FFFFFF */
var(--color-light-gray)     /* #F5F5F5 */

/* Текст */
var(--color-text)           /* #2C2C2C */

/* Дополнительные */
var(--color-primary-dark)   /* #003D7A */
var(--color-primary-light)  /* #0A7FD1 */
var(--color-accent-dark)    /* #E85A00 */
var(--color-accent-light)   /* #FF8C2E */
var(--color-border)         /* #D0D0D0 */
var(--color-disabled)       /* #CCCCCC */
var(--color-success)        /* #2ECC71 */
var(--color-warning)        /* #F39C12 */
var(--color-error)          /* #E74C3C */
```

---

## 📚 Полезные ссылки

- [SETUP.md](./SETUP.md) - Установка и запуск
- [AUTHENTICATION.md](./AUTHENTICATION.md) - Подробная документация
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Архитектура приложения
- [STATUS.md](./STATUS.md) - Статус реализации
- [EXAMPLES.js](./EXAMPLES.js) - Больше примеров

---

**Все необходимое для разработки находится здесь!** ✅
