# Архитектура приложения

## Обзор

```
┌─────────────────────────────────────────┐
│         Vue 3 Application               │
│  (Router, Components, Pages)            │
└────────┬────────────────────────────────┘
         │
     ┌───▼─────────────────────────┐
     │  Pinia Stores               │
     │  (auth, projects)           │
     │  Глобальное состояние       │
     └───┬───────────────────────────┘
         │
     ┌───▼─────────────────────────┐
     │  Services Layer             │
     │  (auth, projects, users)    │
     │  API интеграция             │
     └───┬───────────────────────────┘
         │
     ┌───▼─────────────────────────┐
     │  HTTP Client (Axios)        │
     │  с JWT интерцептором        │
     └───┬───────────────────────────┘
         │
     ┌───▼─────────────────────────┐
     │  Backend API                │
     │  (localhost:3000)           │
     └─────────────────────────────┘
```

## Слои архитектуры

### 1. Презентационный слой (Pages & Components)

**Файлы**: `src/pages/`, `src/components/`

Vue компоненты, отвечающие за UI. Взаимодействуют со stores через Composition API.

**Примеры**:
- `RegisterPage.vue` — форма регистрации
- `ProjectList.vue` — список проектов
- `ProjectCard.vue` — карточка проекта

### 2. Слой состояния (Pinia Stores)

**Файлы**: `src/stores/`

Глобальное состояние приложения. Используется для управления данными, которые нужны в разных компонентах.

**Stores**:
- `auth.ts` — состояние пользователя, токен, методы login/register
- `projects.ts` — список проектов, загрузка, фильтрация

**Принцип**: Компоненты подписываются на изменения stores через composition API:

```typescript
import { useAuthStore } from '../stores/auth'

export default {
  setup() {
    const auth = useAuthStore()
    return { auth } // auth.user, auth.isAuthenticated и т.д.
  }
}
```

### 3. Слой сервисов (API Services)

**Файлы**: `src/services/`

Инкапсулирует логику взаимодействия с API. Каждый сервис отвечает за один домен (auth, projects, users).

**Services**:
- `api.ts` — базовый axios клиент с интерцептором для JWT
- `auth.ts` — эндпоинты для регистрации и логина
- `projects.ts` — операции с проектами (создание, загрузка, обновление)
- `users.ts` — профиль пользователя

**Пример использования**:

```typescript
// В services/projects.ts
export const projectsService = {
  async list(params?: { search?: string }): Promise<Project[]> {
    const { data } = await api.get<Project[]>('/projects', { params })
    return data
  }
}

// В stores/projects.ts
async fetchAll() {
  this.items = await projectsService.list()
}
```

### 4. HTTP клиент

**Файл**: `src/services/api.ts`

Axios клиент с автоматическим добавлением JWT токена ко всем запросам:

```typescript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

## Data Flow (поток данных)

### Пример: Загрузка проектов

```
1. Компонент ProjectList.vue монтируется
   └─> onMounted(() => { projects.fetchAll() })

2. ProjectList вызывает метод store: useProjectsStore().fetchAll()
   └─> projects.ts fetchAll()

3. Store вызывает сервис: projectsService.list({ skipAuth })
   └─> projects.ts service

4. Сервис делает HTTP запрос: GET /projects
   └─> api.ts (axios)

5. Интерцептор добавляет токен: Authorization: Bearer <token>
   └─> Request goes to backend

6. Backend возвращает JSON с проектами
   └─> Response { id, title, description, ... }[]

7. Сервис возвращает данные: Promise<Project[]>
   └─> projectsService.list()

8. Store сохраняет в this.items
   └─> this.items = data

9. Компонент перерисовывается (Vue reactivity)
   └─> v-for="p in projects.items"
```

## Фильтрация проектов по ролям

**Местоположение логики**: `stores/projects.ts`

```typescript
// Логика фильтрации
const userInstType = (auth.user?.group?.institution?.type || auth.userTypePreference)
const isPrivileged = auth.isAdmin || auth.isStaff

// Для студентов/школьников: фильтруем проекты по типу их учреждения
this.items = !isPrivileged && userInstType
  ? (data || []).filter((p) => p.institution?.type === userInstType)
  : data
```

**Как работает**:
1. Если пользователь имеет роль `ADMIN` или `UNIVERSITY_STAFF` → видит ВСЕ проекты
2. Если обычный пользователь (студент/школьник) → видит только проекты своего типа учреждения
3. Тип определяется из `user.group.institution.type` или из сохранённого при регистрации `userTypePreference`

## Типы и интерфейсы

**Основные типы** (в сервисах):

```typescript
// Auth
interface LoginDto { email: string; password: string }
interface AuthResponse { token: string }

// User
interface UserProfile {
  id: number
  email: string
  firstName?: string
  roles?: { id: number; value: string }[]
  group?: StudentGroup
}

// Institution & Group
interface Institution { id: number; name: string; type: 'UNIVERSITY' | 'SCHOOL' }
interface StudentGroup {
  id: number
  name: string
  grade?: number
  institution: Institution
}

// Project
interface Project {
  id: number
  title: string
  description: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  author: UserRef
  institution?: Institution
  members?: UserRef[]
  links: ProjectLink[]
  createdAt: string
  updatedAt: string
}
```

## Роутинг

**Файл**: `src/router/index.ts`

```typescript
const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/login', name: 'login', component: LoginPage },
  { path: '/register', name: 'register', component: RegisterPage },
  { path: '/projects/:id', name: 'project-details', component: ProjectDetailsPage },
  { path: '/projects/create', name: 'project-create', component: ProjectCreatePage },
  // ...
]
```

Навигация: `router.push({ name: 'home' })` или `<router-link to="{ name: 'home' }" />`

## Управление памятью

- **localStorage** — сохранение токена и пользовательских настроек
- **Pinia stores** — состояние, сбрасываемое при перезагрузке
- **Кэш Axios** — нет встроенного кэша, запросы идут всегда

## Производительность

- **Code splitting** — маршруты ленивые (lazy loaded)
- **HMR (Hot Module Replacement)** в dev режиме
- **Vite** — быстрая сборка и dev сервер

## Обработка ошибок

1. **HTTP ошибки** → перехватываются в try-catch в stores
2. **401/403** → store очищает токен и перенаправляет на login
3. **500** → выводится сообщение об ошибке пользователю
4. **Network ошибки** → axios error перехватывается, показывается сообщение

Пример:

```typescript
try {
  const data = await projectsService.list()
} catch (e: any) {
  if (e?.response?.status === 401) {
    // Токен истёк
    auth.logout()
  } else if (e?.response?.status === 500) {
    // Ошибка сервера
    this.error = 'Ошибка сервера'
  }
}
```

## Безопасность

- ✅ JWT токены в localStorage (с риском XSS, но приемлемо для учебного проекта)
- ✅ CORS настроен на бэкенде
- ⚠️ Хешиование паролей на бэкенде (не на клиенте)
- ⚠️ Валидация прав доступа на бэкенде
