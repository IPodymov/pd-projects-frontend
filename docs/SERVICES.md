# API Services

## Обзор

Слой сервисов инкапсулирует взаимодействие с API. Каждый сервис отвечает за один домен (auth, projects, users).

**Местоположение**: `src/services/`

```
services/
├── api.ts         # Axios клиент (основной)
├── auth.ts        # Auth endpoints
├── projects.ts    # Projects endpoints
└── users.ts       # Users endpoints
```

## api.ts — Base HTTP Client

### Описание

Настроенный Axios клиент с автоматическим добавлением JWT токена.

### Конфигурация

```typescript
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/";

const api = axios.create({ baseURL, withCredentials: false });
```

### Интерцепторы

**Request интерцептор**: добавляет Bearer токен ко всем запросам

```typescript
api.interceptors.request.use((config) => {
  const skipAuth = (config as any).skipAuth;
  if (skipAuth) return config;

  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Использование

```typescript
import api from "@/services/api";

// GET
const { data } = await api.get("/projects");

// POST
const { data } = await api.post("/projects", { title: "New" });

// PATCH
const { data } = await api.patch(`/projects/${id}`, { title: "Updated" });

// DELETE
await api.delete(`/projects/${id}`);
```

## auth.ts — Authentication

### Интерфейсы

```typescript
interface LoginDto {
  email: string;
  password: string;
}

interface RegisterDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  userType?: "UNIVERSITY" | "SCHOOL";
}

interface AuthResponse {
  token: string;
}
```

### Методы

#### login(dto: LoginDto): Promise<AuthResponse>

Вход в приложение.

```typescript
const { token } = await authService.login({
  email: "user@example.com",
  password: "password123",
});
// token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### register(dto: RegisterDto): Promise<AuthResponse>

Регистрация нового пользователя.

```typescript
const { token } = await authService.register({
  email: "newuser@example.com",
  password: "password123",
  firstName: "John",
  lastName: "Doe",
  userType: "UNIVERSITY", // или 'SCHOOL'
});
```

## projects.ts — Projects Management

### Типы

```typescript
interface Project {
  id: number;
  title: string;
  description: string;
  status: ProjectStatus; // 'PENDING' | 'APPROVED' | 'REJECTED'
  author: UserRef;
  institution?: Institution;
  members?: UserRef[];
  links: ProjectLink[];
  invitationToken?: string;
  history?: ProjectHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

type ProjectStatus = "PENDING" | "APPROVED" | "REJECTED";

interface ProjectLink {
  id?: number;
  url: string;
  description?: string;
}

interface CreateProjectDto {
  title: string;
  description: string;
  links: ProjectLink[];
}

interface UpdateProjectDto {
  title?: string;
  description?: string;
  status?: ProjectStatus;
  links?: ProjectLink[];
}
```

### Методы

#### list(params?: { search?: string; skipAuth?: boolean }): Promise<Project[]>

Получить список всех проектов.

**Параметры**:

- `search` — поиск по названию
- `skipAuth` — не добавлять токен (для публичного доступа)

**Фильтрация**:

- Автоматически на стороне клиента в `projects.ts` store
- Студент видит только проекты своего ВУЗа
- Школьник видит только проекты своей школы
- Админ/сотрудник видит все

```typescript
// Получить все проекты публично
const projects = await projectsService.list({ skipAuth: true });

// С поиском
const projects = await projectsService.list({ search: "React" });
```

#### get(id: number): Promise<Project>

Получить один проект по ID.

```typescript
const project = await projectsService.get(123);
```

#### create(dto: CreateProjectDto): Promise<Project>

Создать новый проект.

```typescript
const project = await projectsService.create({
  title: "My Awesome Project",
  description: "Description here",
  links: [{ url: "https://github.com/user/repo", description: "GitHub" }],
});
```

**Статус проекта**:

- Для `ADMIN`/`UNIVERSITY_STAFF` → `APPROVED`
- Для других → `PENDING` (ждёт модерации)

#### update(id: number, dto: UpdateProjectDto): Promise<Project>

Обновить проект.

```typescript
const updated = await projectsService.update(123, {
  title: "Updated Title",
  status: "APPROVED",
});
```

**История**: При каждом обновлении создаётся запись в истории проекта.

#### remove(id: number): Promise<void>

Удалить проект (только автор или админ).

```typescript
await projectsService.remove(123);
```

#### generateInvitation(id: number): Promise<{ token: string }>

Создать токен приглашения для присоединения в проект.

```typescript
const { token } = await projectsService.generateInvitation(123);
// Ссылка приглашения: ?join=token
```

#### joinProject(token: string): Promise<Project>

Присоединиться к проекту по токену приглашения.

```typescript
const project = await projectsService.joinProject(inviteToken);
```

**Ограничения**:

- Для школы: макс 3 участника
- Для ВУЗа: макс 50 участников

## users.ts — User Profile

### Типы

```typescript
interface Institution {
  id: number;
  name: string;
  type: "UNIVERSITY" | "SCHOOL";
}

interface StudentGroup {
  id: number;
  name: string;
  grade?: number;
  institution: Institution;
}

interface UserProfile {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  roles?: { id: number; value: string }[];
  group?: StudentGroup;
}

interface UpdateUserDto {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  groupId?: number;
}

type UpdateProfileDto = UpdateUserDto;
```

### Методы

#### profile(): Promise<UserProfile>

Получить профиль текущего пользователя (требуется авторизация).

```typescript
const user = await usersService.profile();
console.log(user.group?.institution.name); // "Test University"
```

#### updateProfile(dto: UpdateProfileDto): Promise<UserProfile>

Обновить профиль текущего пользователя.

```typescript
const updated = await usersService.updateProfile({
  firstName: "John",
  lastName: "Doe",
  password: "newpassword123",
});
```

#### list(): Promise<UserProfile[]>

Получить список всех пользователей (admin only).

```typescript
const users = await usersService.list();
```

#### get(id: number): Promise<UserProfile>

Получить профиль конкретного пользователя.

```typescript
const user = await usersService.get(3);
```

#### update(id: number, dto: UpdateUserDto): Promise<UserProfile>

Обновить профиль пользователя (admin only).

```typescript
const updated = await usersService.update(3, { firstName: "Jane" });
```

## Обработка ошибок

### Ошибки API

Ошибки оборачиваются в структуру ответа:

```typescript
try {
  const project = await projectsService.get(999);
} catch (error: any) {
  console.log(error.response.status); // 404
  console.log(error.response.data.message); // "Project not found"
}
```

### Типичные коды

- `200` — успех
- `201` — создано
- `400` — неправильный запрос
- `401` — не авторизирован (токен истёк)
- `403` — нет прав
- `404` — не найдено
- `500` — ошибка сервера

### Обработка в Stores

```typescript
try {
  const data = await projectsService.list();
} catch (e: any) {
  const status = e?.response?.status;
  const message = e?.response?.data?.message;

  if (status === 401) {
    // Токен истёк — выход
    auth.logout();
  } else if (status === 500) {
    // Ошибка сервера
    this.error = `Ошибка сервера: ${message}`;
  } else {
    this.error = message || "Неизвестная ошибка";
  }
}
```

## Примеры использования

### Загрузка проектов студентом

```typescript
// 1. Service запрашивает публично
const data = await projectsService.list({ skipAuth: true });
// GET /projects (без Authorization)
// Ответ: все проекты

// 2. Store фильтрует на клиенте
const userType = "UNIVERSITY"; // из профиля или preference
const items = data.filter((p) => p.institution?.type === userType);
// Результат: только проекты ВУЗа
```

### Создание проекта

```typescript
// 1. Компонент собирает данные
const newProject = {
  title: "React App",
  description: "A React application",
  links: [{ url: "https://github.com/user/react-app", description: "GitHub" }],
};

// 2. Вызывает сервис
const created = await projectsService.create(newProject);
// POST /projects
// Authorization: Bearer <token>

// 3. Store обновляется
this.items.push(created);

// 4. UI перерисовывается
```

### Присоединение к проекту

```typescript
// 1. User получает ссылку: http://app.com?join=token123

// 2. На главной странице обрабатывается параметр
if (route.query.join) {
  const project = await projectsService.joinProject(token);
  // POST /projects/join/:token
  // Authorization: Bearer <token>
}

// 3. Пользователь добавлен в members[]
```

## Best Practices

- ✅ Типизируй все DTOs и responses
- ✅ Обрабатывай ошибки в catch блоках
- ✅ Используй async/await вместо .then()
- ✅ Логируй ошибки для отладки
- ✅ Используй skipAuth для публичных эндпоинтов
- ❌ Не обращайся к API напрямую из компонентов
- ❌ Не пробрасывай сырые ошибки пользователю
