# Архитектура приложения (MVC)

## Обзор

```
┌───────────────────────────────────────────────────────────────────┐
│                     Vue 3 Application                              │
│   (Router, Views, Components)                                      │
└────────┬──────────────────────────────────────────────────────────┘
         │
     ┌───▼────────────────────────────────────┐
     │           Controllers                   │
     │   (Auth, Project, User)                 │
     │   Управление бизнес-логикой            │
     └───┬────────────────────────────────────┘
         │
     ┌───▼────────────────────────────────────┐
     │             Models                      │
     │   (User, Project, Auth)                 │
     │   Данные и бизнес-правила              │
     └───┬────────────────────────────────────┘
         │
     ┌───▼────────────────────────────────────┐
     │          Services Layer                 │
     │   (api, auth, projects, users)         │
     │   API интеграция                        │
     └───┬────────────────────────────────────┘
         │
     ┌───▼────────────────────────────────────┐
     │        HTTP Client (Axios)              │
     │        с JWT интерцептором              │
     └───┬────────────────────────────────────┘
         │
     ┌───▼────────────────────────────────────┐
     │           Backend API                   │
     │         (localhost:3000)                │
     └────────────────────────────────────────┘
```

## Структура проекта

```
src/
├── models/                  # Model - данные и бизнес-логика
│   ├── User.model.ts        # Модель пользователя
│   ├── Project.model.ts     # Модель проекта
│   ├── Auth.model.ts        # Модель авторизации
│   └── index.ts
│
├── views/                   # View - представления (страницы)
│   ├── HomePage.vue
│   ├── LoginPage.vue
│   ├── RegisterPage.vue
│   ├── ProfilePage.vue
│   ├── ProjectCreatePage.vue
│   ├── ProjectDetailsPage.vue
│   ├── ProposalCreatePage.vue
│   └── UsersPage.vue
│
├── controllers/             # Controller - управление логикой
│   ├── Auth.controller.ts
│   ├── Project.controller.ts
│   ├── User.controller.ts
│   └── index.ts
│
├── composables/             # Vue Composables - связь View <-> Controller
│   ├── useAuth.ts
│   ├── useProjects.ts
│   ├── useUsers.ts
│   └── index.ts
│
├── components/              # Feature компоненты
│   ├── NavBar.vue
│   ├── ProjectCard.vue
│   ├── ProjectInvite.vue
│   ├── ProjectList.vue
│   ├── UserEditDrawer.vue
│   └── index.ts
│
├── ui/                      # UI компоненты (переиспользуемые)
│   ├── components/
│   │   ├── Button.vue
│   │   ├── Input.vue
│   │   ├── FormField.vue
│   │   └── index.ts
│   └── index.ts
│
├── services/                # API сервисы
│   ├── api.ts
│   ├── auth.ts
│   ├── projects.ts
│   └── users.ts
│
├── stores/                  # Pinia stores (legacy, для совместимости)
│   ├── auth.ts
│   └── projects.ts
│
├── router/                  # Vue Router
│   └── index.ts
│
├── plugins/                 # Vue плагины
│   └── vuetify.ts
│
└── assets/                  # Статические ресурсы
    ├── fonts/
    ├── icons/
    └── images/
```

## Слои архитектуры MVC

### 1. Model (Модели)

**Файлы**: `src/models/`

Модели представляют данные приложения и содержат бизнес-логику.

**Модели**:

- `User.model.ts` — данные пользователя, роли, проверка прав
- `Project.model.ts` — данные проекта, статусы, участники
- `Auth.model.ts` — состояние авторизации, токены

**Пример использования**:

```typescript
import { UserModel, type User } from '../models/User.model';

// Создание модели из JSON
const user = UserModel.fromJSON(userData);

// Использование бизнес-логики
if (user.canModerate()) {
  // Пользователь может модерировать
}

console.log(user.fullName); // Иванов Иван Иванович
console.log(user.displayName); // Иван
```

### 2. View (Представления)

**Файлы**: `src/views/`, `src/components/`, `src/ui/`

Представления отвечают за отображение данных пользователю.

**Структура**:

- `views/` — страницы приложения (роуты)
- `components/` — feature компоненты с бизнес-логикой
- `ui/components/` — переиспользуемые UI компоненты без логики

**Пример UI компонента**:

```vue
<!-- ui/components/Button.vue -->
<template>
  <v-btn :type="type" :color="theme" :disabled="disabled">
    <slot />
  </v-btn>
</template>
```

**Пример feature компонента**:

```vue
<!-- components/ProjectCard.vue -->
<script setup lang="ts">
import type { Project } from '../models';
import { useAuth } from '../composables';

const props = defineProps<{ project: Project }>();
const { isAdmin, isStaff } = useAuth();

const canModerate = computed(
  () => (isAdmin.value || isStaff.value) && props.project.status === 'PENDING'
);
</script>
```

### 3. Controller (Контроллеры)

**Файлы**: `src/controllers/`

Контроллеры управляют взаимодействием между моделями и представлениями.

**Контроллеры**:

- `Auth.controller.ts` — авторизация, регистрация, профиль
- `Project.controller.ts` — управление проектами
- `User.controller.ts` — управление пользователями

**Пример использования**:

```typescript
import { authController } from '../controllers';

// Вход в систему
await authController.login({ email, password });

// Получение текущего пользователя
const user = authController.getCurrentUser();

// Проверка авторизации
if (authController.isAuthenticated()) {
  // Пользователь авторизован
}
```

### 4. Composables (Связующий слой)

**Файлы**: `src/composables/`

Composables предоставляют реактивный интерфейс к контроллерам для Vue компонентов.

**Composables**:

- `useAuth()` — работа с авторизацией
- `useProjects()` — работа с проектами
- `useUsers()` — работа с пользователями

**Пример использования**:

```vue
<script setup lang="ts">
import { useAuth, useProjects } from '../composables';

const { user, isAuthenticated, login, logout } = useAuth();
const { projects, fetchProjects, createProject } = useProjects();

onMounted(() => {
  if (isAuthenticated.value) {
    fetchProjects();
  }
});
</script>
```

## Поток данных

```
User Action → View → Composable → Controller → Service → API
                ↑                      ↓
                └── Model ←────────────┘
```

1. **User Action**: Пользователь нажимает кнопку
2. **View**: Vue компонент вызывает метод composable
3. **Composable**: Вызывает метод контроллера, управляет реактивным состоянием
4. **Controller**: Обрабатывает бизнес-логику, вызывает сервис
5. **Service**: Выполняет HTTP запрос к API
6. **Model**: Данные преобразуются в модель с бизнес-логикой
7. **View**: Обновляется через реактивное состояние composable

## Сервисный слой

**Файлы**: `src/services/`

Сервисы инкапсулируют взаимодействие с API:

```typescript
// services/projects.ts
export const projectsService = {
  async list(params?: { search?: string }): Promise<Project[]> {
    const { data } = await api.get<Project[]>('/projects', { params });
    return data;
  },

  async create(dto: CreateProjectDto): Promise<Project> {
    const { data } = await api.post<Project>('/projects', dto);
    return data;
  },
};
```

## UI компоненты

**Файлы**: `src/ui/components/`

Переиспользуемые компоненты без бизнес-логики:

- `Button.vue` — кнопка с темами
- `Input.vue` — поле ввода
- `FormField.vue` — обертка для полей формы

**Использование**:

```vue
<script setup lang="ts">
import { Button, Input, FormField } from '../ui/components';
</script>

<template>
  <FormField label="Email">
    <Input v-model="email" type="email" />
  </FormField>
  <Button theme="primary" @click="submit">Отправить</Button>
</template>
```

## Преимущества MVC архитектуры

1. **Разделение ответственности**: Каждый слой отвечает за свою задачу
2. **Тестируемость**: Контроллеры и модели можно тестировать изолированно
3. **Переиспользование**: UI компоненты не зависят от бизнес-логики
4. **Масштабируемость**: Легко добавлять новые функции
5. **Поддерживаемость**: Понятная структура проекта

## Миграция со старой архитектуры

Старые stores (`src/stores/`) остаются для обратной совместимости, но рекомендуется использовать новые composables:

```typescript
// Старый способ (deprecated)
import { useAuthStore } from '../stores/auth';
const auth = useAuthStore();

// Новый способ (рекомендуется)
import { useAuth } from '../composables';
const { user, login, logout } = useAuth();
```
