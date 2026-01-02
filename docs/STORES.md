# Pinia Stores

Pinia — это library для управления глобальным состоянием (state management) в Vue приложениях.

## Что такое Store?

Store — это объект с состоянием (state), методами для изменения состояния (actions) и вычисляемыми значениями (getters).

```typescript
// Без Pinia (плохо — состояние раздросано):
const user = ref(null)
const loading = ref(false)
function updateUser() { ... }

// С Pinia (хорошо — состояние централизовано):
const auth = useAuthStore()
auth.user  // доступ к состоянию
auth.updateProfile()  // вызов методов
```

## Структура

```
stores/
├── auth.ts      # Авторизация, профиль, пользователь
└── projects.ts  # Список проектов, загрузка, фильтрация
```

## auth.ts

**Отвечает за**: авторизация, профиль пользователя, управление токеном.

### State

```typescript
state: () => ({
  token: string | null, // JWT токен
  user: UserProfile | null, // Профиль пользователя
  loading: boolean, // Идёт ли операция
  error: string | null, // Сообщение об ошибке
  userTypePreference: "UNIVERSITY" | "SCHOOL" | null, // Предпочтение при регистрации
});
```

### Getters

```typescript
isAuthenticated: boolean  // Есть ли токен
roles: string[]          // Массив ролей пользователя
isAdmin: boolean         // Есть ли роль ADMIN
isStaff: boolean         // Есть ли роль UNIVERSITY_STAFF
```

**Примеры**:

```typescript
const auth = useAuthStore();

if (auth.isAuthenticated) {
  console.log("Пользователь залогинен");
}

if (auth.isAdmin) {
  // показать панель админа
}
```

### Actions (методы)

#### setToken(token: string | null): void

Установить токен и сохранить в localStorage.

```typescript
auth.setToken("eyJhbGciOi...");
// localStorage.token теперь "eyJhbGciOi..."
```

#### setUserTypePreference(type: 'UNIVERSITY' | 'SCHOOL' | null): void

Сохранить предпочтение типа пользователя.

```typescript
auth.setUserTypePreference("UNIVERSITY");
```

#### login(email: string, password: string): Promise<void>

Логин пользователя.

```typescript
try {
  await auth.login("user@example.com", "password123");
  // Токен сохранён, профиль загружен
} catch (e) {
  console.log(auth.error); // "Неверные учётные данные"
}
```

**Процесс**:

1. Отправляет POST /auth/login
2. Получает токен
3. Сохраняет в localStorage
4. Загружает профиль пользователя

#### register(email: string, password: string, names?: {...}): Promise<void>

Регистрация пользователя.

```typescript
await auth.register("newuser@example.com", "password123", {
  firstName: "John",
  lastName: "Doe",
  userType: "UNIVERSITY",
});
```

#### fetchProfile(): Promise<void>

Загрузить профиль текущего пользователя (требуется токен).

```typescript
await auth.fetchProfile();
console.log(auth.user?.firstName);
```

**Используется**: при инициализации приложения, если токен есть в localStorage.

#### updateProfile(dto: UpdateProfileDto): Promise<UserProfile>

Обновить профиль пользователя.

```typescript
const updated = await auth.updateProfile({
  firstName: "Jane",
  lastName: "Smith",
});
```

#### changePassword(password: string): Promise<UserProfile>

Изменить пароль (используя updateProfile).

```typescript
await auth.changePassword("newpassword123");
```

#### logout(): void

Выход: очистить токен, профиль и состояние.

```typescript
auth.logout();
// localStorage.token удалён
// auth.user = null
```

### Использование в компонентах

```vue
<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();

async function handleLogin(email: string, password: string) {
  try {
    await auth.login(email, password);
    // Успешно
  } catch (e) {
    console.log(auth.error); // Ошибка
  }
}
</script>

<template>
  <div v-if="auth.isAuthenticated">
    <p>Привет, {{ auth.user?.firstName }}!</p>
    <button @click="auth.logout">Выход</button>
  </div>
  <div v-else>
    <p>Не авторизирован</p>
  </div>
</template>
```

## projects.ts

**Отвечает за**: загрузка проектов, фильтрация по ролям, управление статусами.

### State

```typescript
state: () => ({
  items: Project[],      // Список проектов после фильтрации
  loading: boolean,      // Идёт ли загрузка
  error: string | null   // Ошибка загрузки
})
```

### Actions (методы)

#### fetchAll(): Promise<void>

Загрузить проекты и применить фильтрацию по роли пользователя.

```typescript
const projects = useProjectsStore();
await projects.fetchAll();
// projects.items содержит отфильтрованный список
```

**Логика фильтрации**:

```
Если пользователь ADMIN или UNIVERSITY_STAFF:
  → показываем ВСЕ проекты

Если обычный пользователь (студент/школьник):
  → показываем только проекты типа его учреждения

Тип определяется из:
  1. user.group.institution.type (если есть группа)
  2. userTypePreference (сохранено при регистрации)
```

**Пример**:

```typescript
const projects = useProjectsStore();
await projects.fetchAll();

// Для студента ВУЗа:
// projects.items = [
//   { id: 1, title: '...', institution: { type: 'UNIVERSITY' } },
//   { id: 4, title: '...', institution: { type: 'UNIVERSITY' } }
// ]

// Для админа:
// projects.items = [все проекты независимо от типа]
```

**Обработка ошибок**:

```typescript
try {
  await projects.fetchAll();
} catch (e) {
  console.log(projects.error); // "Ошибка сервера: ..."
}
```

#### setStatus(id: number, status: ProjectStatus): Promise<Project>

Изменить статус проекта (PENDING → APPROVED/REJECTED).

```typescript
const updated = await projects.setStatus(123, "APPROVED");
// Проект с id=123 теперь имеет status='APPROVED'
```

**Используется**: модераторами для одобрения/отклонения проектов.

### Использование в компонентах

```vue
<script setup lang="ts">
import { useProjectsStore } from "@/stores/projects";

const projects = useProjectsStore();

// При монтировании компонента
onMounted(() => {
  if (!projects.items.length) {
    projects.fetchAll();
  }
});
</script>

<template>
  <div v-if="projects.loading">Загрузка...</div>
  <div v-else-if="projects.error" class="error">
    <p>{{ projects.error }}</p>
    <button @click="projects.fetchAll">Повторить</button>
  </div>
  <div v-else-if="!projects.items.length" class="empty">Пока нет проектов</div>
  <div v-else>
    <ul>
      <li v-for="p in projects.items" :key="p.id">
        {{ p.title }}
      </li>
    </ul>
  </div>
</template>
```

## Как создать новый Store

1. **Создай файл** `src/stores/mystore.ts`:

```typescript
import { defineStore } from "pinia";

interface MyState {
  data: string[];
  loading: boolean;
}

export const useMyStore = defineStore("my", {
  state: (): MyState => ({
    data: [],
    loading: false,
  }),

  getters: {
    isEmpty: (state) => state.data.length === 0,
  },

  actions: {
    async loadData() {
      this.loading = true;
      try {
        // Получи данные
        this.data = await fetchData();
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },

    addItem(item: string) {
      this.data.push(item);
    },
  },
});
```

2. **Используй в компоненте**:

```vue
<script setup lang="ts">
import { useMyStore } from "@/stores/mystore";

const store = useMyStore();

onMounted(() => {
  store.loadData();
});
</script>

<template>
  <div>
    <p v-if="store.isEmpty">Нет данных</p>
    <ul v-else>
      <li v-for="item in store.data" :key="item">{{ item }}</li>
    </ul>
  </div>
</template>
```

## Реактивность

Все изменения в store автоматически вызывают обновление компонентов:

```typescript
// В store
this.items.push(newProject)  // Компонент обновится автоматически

// В компоненте
<div>{{ projects.items.length }}</div>  // Обновится на экран
```

## DevTools

Pinia интегрируется с Vue DevTools для отладки:

1. Установи [Vue DevTools](https://devtools.vuejs.org/)
2. Открой DevTools → Pinia tab
3. Смотри состояние и историю изменений

## Best Practices

- ✅ Держи state простым (примитивные типы и массивы)
- ✅ Используй getters для вычисляемых значений
- ✅ Используй actions для асинхронных операций
- ✅ Типизируй state с интерфейсами
- ✅ Изолируй логику в store, не в компонентах
- ❌ Не обращайся к store из других store (исключение — необходимые зависимости)
- ❌ Не делай сложные вычисления в getters (используй computed в компоненте)
- ❌ Не изменяй state напрямую, используй actions

## Миграция с Options API на Composition API

Если видишь старый код:

```typescript
// Старое (Options API)
export const useAuthStore = defineStore('auth', {
  state: () => ({ user: null }),
  mutations: { setUser(state, user) { state.user = user } },
  actions: { async login() { ... } }
})

// Новое (Composition API) — современный способ
export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const login = async () => { ... }
  return { user, login }
})
```

Текущий проект использует **Options API** (более просто), но оба варианта работают.
