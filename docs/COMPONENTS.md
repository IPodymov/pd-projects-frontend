# Компоненты

## Структура компонентов

```
components/
├── NavBar.vue            # Навигационная панель
├── ProjectList.vue       # Список всех проектов
├── ProjectCard.vue       # Карточка одного проекта
├── ProjectInvite.vue     # Компонент приглашений
└── UserEditDrawer.vue    # Drawer редактирования профиля

ui/
├── Button.vue            # Кнопка
├── Input.vue             # Текстовое поле
└── FormField.vue         # Обёртка для поля формы
```

## Описание компонентов

### NavBar.vue

Навигационная панель вверху страницы.

**Props**: нет

**Состояние**:
- `user` — текущий пользователь (из auth store)
- `isMenuOpen` — открыто ли меню

**Методы**:
- `logout()` — выход из приложения

**Пример использования**:
```vue
<NavBar />
```

### ProjectList.vue

Список проектов с фильтрацией по роли пользователя.

**Props**: нет

**Состояние**:
- `projects.items` — массив проектов (из store)
- `projects.loading` — идёт ли загрузка

**Lifecycle**:
- На `onMounted()` загружаются проекты: `projects.fetchAll()`

**Events**:
- `@approve="approve(id)"` — одобрить проект
- `@reject="reject(id)"` — отклонить проект

**Пример использования**:
```vue
<ProjectList />
```

### ProjectCard.vue

Карточка проекта (миниатюра в списке).

**Props**:
```typescript
interface Props {
  project: Project
}
```

**Emits**:
```typescript
defineEmits<{
  (e: 'approve', id: number): void
  (e: 'reject', id: number): void
}>()
```

**Функции**:
- `canModerate` — может ли пользователь модерировать проект (admin или staff + status === PENDING)
- `isAuthor` — текущий пользователь — автор проекта

**Пример использования**:
```vue
<ProjectCard
  :project="project"
  @approve="approveProject"
  @reject="rejectProject"
/>
```

### ProjectInvite.vue

Компонент для создания приглашений в проект и управления приглашениями.

**Props**:
```typescript
interface Props {
  project: Project
}
```

**Emits**:
- `@updated="project = $event"` — проект обновился

**Методы**:
- `generateInviteToken()` — создать новое приглашение
- `copyInviteLink()` — скопировать ссылку приглашения в буфер обмена

**Использует**:
- `projectsService.generateInvitation(id)` — создание токена на сервере

### UserEditDrawer.vue

Drawer (выдвижная панель) для редактирования профиля пользователя.

**Props**:
```typescript
interface Props {
  modelValue: boolean  // Открыт ли drawer
}
```

**Emits**:
- `@update:modelValue="value"` — закрыть drawer

**Функции**:
- `updateProfile()` — отправить изменения профиля на сервер

**Использует**:
- `auth.updateProfile()` — обновление профиля в store

## UI компоненты

### Button.vue

Универсальная кнопка.

**Props**:
```typescript
interface Props {
  theme?: 'primary' | 'secondary' | 'danger'  // Стиль кнопки
  disabled?: boolean                           // Отключена ли
  type?: 'button' | 'submit' | 'reset'        // HTML type
}
```

**Slots**:
- `default` — содержимое кнопки

**Пример**:
```vue
<UiButton theme="primary" @click="submit" :disabled="loading">
  {{ loading ? 'Загрузка...' : 'Отправить' }}
</UiButton>
```

### Input.vue

Текстовое поле ввода.

**Props**:
```typescript
interface Props {
  modelValue: string | number
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number'
  disabled?: boolean
}
```

**Events**:
- `@update:modelValue="value"` — (v-model)

**Пример**:
```vue
<UiInput
  v-model="email"
  type="email"
  placeholder="user@example.com"
/>
```

### FormField.vue

Обёртка для поля формы (label + input + error).

**Props**:
```typescript
interface Props {
  label: string      // Заголовок поля
  error?: string     // Сообщение об ошибке
  required?: boolean // Обязательное ли поле
}
```

**Slots**:
- `default` — содержимое (обычно `<UiInput />`)

**Пример**:
```vue
<FormField label="Email" error="Email обязателен">
  <UiInput v-model="email" type="email" />
</FormField>
```

## Создание нового компонента

1. **Создай файл** в нужной папке (`components/` или `ui/`)
2. **Используй Composition API**:
   ```vue
   <script setup lang="ts">
   import { ref } from 'vue'

   interface Props {
     title: string
   }

   defineProps<Props>()

   const isOpen = ref(false)
   </script>

   <template>
     <div class="component">
       <h1>{{ title }}</h1>
       <button @click="isOpen = !isOpen">Toggle</button>
     </div>
   </template>

   <style scoped>
   .component { }
   </style>
   ```

3. **Импортируй в родительский компонент**:
   ```vue
   <script setup lang="ts">
   import MyComponent from '@/components/MyComponent.vue'
   </script>

   <template>
     <MyComponent title="Hello" />
   </template>
   ```

## Стили

Компоненты используют:
- **Scoped CSS** (`<style scoped>`) — стили применяются только к компоненту
- **CSS переменные** (`--space-4`, `--color-primary`, etc.) — из `src/style.css`
- **BEM нотация** для классов: `.component-name__element_modifier`

**Переменные CSS**:
```css
--space-1, --space-2, --space-3, --space-4, --space-5, --space-6
--color-primary, --color-danger, --color-success
--border, --muted, --text
--radius  /* border-radius */
```

## Переиспользование и композиция

**Хорошо**: Маленькие, переиспользуемые компоненты

```vue
<!-- Button.vue -->
<template>
  <button class="btn" :class="[ `btn_theme_${theme}` ]">
    <slot />
  </button>
</template>

<!-- ProjectCard.vue использует Button -->
<template>
  <UiButton theme="primary" @click="approve">Одобрить</UiButton>
</template>
```

**Плохо**: Большие, монолитные компоненты с множеством логики

## Best practices

- ✅ Типизируй Props и Events
- ✅ Используй `<script setup lang="ts">`
- ✅ Разделяй логику и UI
- ✅ Используй переиспользуемые компоненты
- ✅ Делай компоненты маленькими и узконаправленными
- ❌ Не рассеивай логику по компонентам, используй stores
- ❌ Не пробрасывай многоуровневые props, используй stores
