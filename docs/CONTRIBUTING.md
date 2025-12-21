# Contributing — Гайд для разработчиков

Спасибо за интерес к проекту! Этот гайд поможет тебе начать разработку.

## Начало работы

### Требования

- Node.js >= 18
- npm >= 9
- Git
- Базовые знания Vue 3, TypeScript

### Клонирование и установка

```bash
# Клонируй оба репозитория
git clone https://github.com/IPodymov/pd-projects-backend.git
git clone https://github.com/IPodymov/pd-projects-front.git

# Установи зависимости
cd pd-projects-front
npm install

# Установи backend зависимости
cd ../pd-projects-backend
npm install

# Заполни БД тестовыми данными
npm run seed
```

### Запуск локально

**Terminal 1 — Backend:**
```bash
cd pd-projects-backend
npm run start:dev
# Запустится на http://localhost:3000
```

**Terminal 2 — Frontend:**
```bash
cd pd-projects-front
npm run dev
# Запустится на http://localhost:5173
```

## Структура кода

Всегда сначала почитай соответствующий гайд:

- **Новый компонент?** → [COMPONENTS.md](./COMPONENTS.md)
- **Новый эндпоинт?** → [SERVICES.md](./SERVICES.md)
- **Новое состояние?** → [STORES.md](./STORES.md)
- **Архитектурные вопросы?** → [ARCHITECTURE.md](./ARCHITECTURE.md)

## Процесс разработки

### 1. Создай ветку

```bash
git checkout -b feature/название-фичи
```

Примеры названий:
- `feature/add-search` — новая фичка
- `fix/project-loading-error` — исправление багов
- `docs/update-readme` — документация

### 2. Пиши код

**Код должен**:
- Быть типизирован (TypeScript)
- Иметь понятные имена переменных
- Следовать структуре проекта
- Использовать существующие компоненты/сервисы

**Примеры**:

✅ Хорошо:
```typescript
const isUserAdmin = auth.roles.includes('ADMIN')
if (isUserAdmin) {
  showAdminPanel()
}
```

❌ Плохо:
```typescript
if (u?.r?.i('A')) {  // непонятные имена
  s()  // непонятно что это
}
```

### 3. Commit

Пиши понятные commit сообщения:

```bash
git add .
git commit -m "feat: добавлена фильтрация проектов по типу учреждения"
```

Формат: `type: description`

**Types**:
- `feat` — новая фичка
- `fix` — исправление
- `docs` — документация
- `refactor` — переделка кода
- `test` — добавление тестов
- `chore` — мелкие изменения

### 4. Push и Pull Request

```bash
git push origin feature/название-фичи
```

Затем создай Pull Request на GitHub с описанием:
- Что изменилось?
- Почему это нужно?
- Как тестировать?

## Стиль кода

### TypeScript

```typescript
// ✅ Типизируй всё
interface User {
  id: number
  email: string
  name?: string
}

// ❌ Не используй any
const user: any = { id: 1 }
```

### Vue компоненты

```vue
<script setup lang="ts">
// ✅ Используй Composition API с setup
import { ref, computed } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)

// ❌ Не используй Options API
// export default {
//   data() { return { count: 0 } }
// }
</script>
```

### Именование

```typescript
// ✅ Понятные имена
const isLoading = ref(false)
const projectList = ref<Project[]>([])
const getUserEmail = () => user.value?.email

// ❌ Сокращения
const isL = ref(false)
const pl = ref([])
const gUE = () => u?.e
```

### CSS

```css
/* ✅ BEM нотация */
.project-card { }
.project-card__title { }
.project-card__title_size_large { }

/* ✅ Используй CSS переменные */
.component {
  gap: var(--space-4);
  color: var(--text);
}

/* ❌ Жёсткие значения */
.component {
  gap: 16px;
  color: #333;
}
```

## Отладка

### Console логи

```typescript
// ✅ Логи с префиксом
console.log('[ProjectsStore] Проекты загружены:', data.length)

// ❌ Без контекста
console.log('done')
```

### DevTools

1. Открой F12 → Console
2. Ищи логи с твоим префиксом
3. Смотри Pinia tab для состояния
4. Смотри Network tab для запросов

### Быстрое тестирование

```bash
# Очисти хранилище и перезагрузись
localStorage.clear()
location.reload()

# В консоли проверь состояние
useAuthStore().user
useProjectsStore().items.length
```

## Типичные задачи

### Добавить новый роут

1. **Создай страницу** `src/pages/MyPage.vue`
2. **Добавь в router** `src/router/index.ts`:

```typescript
{
  path: '/my-page',
  name: 'my-page',
  component: () => import('@/pages/MyPage.vue')
}
```

3. **Используй в навигации**:
```vue
<router-link :to="{ name: 'my-page' }">My Page</router-link>
```

### Добавить новый API вызов

1. **Добавь в сервис** `src/services/projects.ts`:

```typescript
async searchProjects(query: string): Promise<Project[]> {
  const { data } = await api.get('/projects/search', {
    params: { q: query }
  })
  return data
}
```

2. **Используй в store** `src/stores/projects.ts`:

```typescript
async search(query: string) {
  this.items = await projectsService.searchProjects(query)
}
```

3. **Используй в компоненте**:

```typescript
await projects.search('React')
```

### Добавить новый компонент

1. **Создай** `src/components/MyComponent.vue`:

```vue
<script setup lang="ts">
interface Props {
  title: string
}

defineProps<Props>()
</script>

<template>
  <div class="my-component">
    <h1>{{ title }}</h1>
  </div>
</template>

<style scoped>
.my-component { }
</style>
```

2. **Используй в другом компоненте**:

```vue
<script setup lang="ts">
import MyComponent from '@/components/MyComponent.vue'
</script>

<template>
  <MyComponent title="Hello" />
</template>
```

## Проверка кода перед push

```bash
# Убедись, что нет ошибок TypeScript
npx tsc --noEmit

# Запусти приложение и проверь в браузере
npm run dev

# Открой http://localhost:5173 и протестируй
```

## Решение конфликтов

Если при pull request возникают конфликты:

```bash
# Обнови локальную ветку
git fetch origin
git rebase origin/main

# Если конфликты, открой файлы и разреши их
# (VSCode покажет конфликты с << и >>)

# Заверши rebase
git rebase --continue
git push -f origin feature/название-фичи
```

## Документация

При добавлении нового функционала **обнови документацию**:

- Новый компонент? → обнови [COMPONENTS.md](./COMPONENTS.md)
- Новый сервис? → обнови [SERVICES.md](./SERVICES.md)
- Новый store? → обнови [STORES.md](./STORES.md)
- Большие изменения? → обнови [ARCHITECTURE.md](./ARCHITECTURE.md)

## Тестирование

Хотя автоматических тестов нет, вручную проверь:

- ✅ Компонент отрендерился правильно
- ✅ API запрос прошёл (смотри Network tab)
- ✅ Состояние обновилось (смотри Pinia tab)
- ✅ Нет ошибок в console
- ✅ Тесто работает на mobile (DevTools → Responsive Design Mode)

## Вопросы и проблемы

1. **Посмотри документацию** — возможно ответ там
2. **Посмотри логи** — console.log и Network tab
3. **Посмотри похожий код** — как это сделано в других компонентах
4. **Открой issue** — опиши проблему и что ты уже попробовал

## Принятие в проект

PR будет рассмотрена если:
- ✅ Код следует стилю проекта
- ✅ Компилируется без ошибок (TypeScript)
- ✅ Работает локально
- ✅ Документация обновлена
- ✅ Коммит сообщения понятные

Спасибо за вклад! 🙏
