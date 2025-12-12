# UI компоненты - Документация

Полное руководство по использованию переиспользуемых UI компонентов из папки `src/components/ui/`.

## 📦 Содержание

- [BaseButton](#basebutton) - Универсальная кнопка
- [BaseInput](#baseinput) - Текстовое поле ввода
- [BaseCombobox](#basecombobox) - Выпадающий список с поиском и загрузкой из API
- [ErrorMessage](#errormessage) - Сообщение об ошибке

---

## BaseButton

Универсальный компонент кнопки с поддержкой различных стилей и состояния загрузки.

### Props

| Prop | Тип | По умолчанию | Описание |
|------|-----|--------------|----------|
| `type` | String | `'button'` | Тип кнопки: `'button'`, `'submit'`, `'reset'` |
| `variant` | String | `'primary'` | Стиль: `'primary'`, `'secondary'`, `'accent'`, `'danger'`, `'ghost'` |
| `disabled` | Boolean | `false` | Блокировка кнопки |
| `loading` | Boolean | `false` | Состояние загрузки (показывает спиннер) |

### Events

- `@click` - Событие клика по кнопке

### Примеры использования

```vue
<template>
  <!-- Primary кнопка -->
  <BaseButton variant="primary" @click="save">
    Сохранить
  </BaseButton>

  <!-- С загрузкой -->
  <BaseButton :loading="isLoading" @click="submit">
    Отправить
  </BaseButton>

  <!-- Danger кнопка -->
  <BaseButton variant="danger" @click="deleteItem">
    Удалить
  </BaseButton>
</template>

<script setup>
import { ref } from 'vue';
import { BaseButton } from './components/ui';

const isLoading = ref(false);

const submit = async () => {
  isLoading.value = true;
  try {
    await someApiCall();
  } finally {
    isLoading.value = false;
  }
};
</script>
```

---

## BaseInput

Текстовое поле ввода с поддержкой валидации, подсказок и различных типов.

### Props

| Prop | Тип | По умолчанию | Описание |
|------|-----|--------------|----------|
| `modelValue` | String/Number | `''` | Значение (используется с v-model) |
| `label` | String | `''` | Метка поля |
| `type` | String | `'text'` | Тип: `'text'`, `'email'`, `'password'`, `'number'`, `'tel'`, `'url'` |
| `placeholder` | String | `''` | Placeholder текст |
| `disabled` | Boolean | `false` | Блокировка поля |
| `required` | Boolean | `false` | Обязательное поле |
| `error` | String | `''` | Сообщение об ошибке |
| `hint` | String | `''` | Подсказка |

### Events

- `@update:modelValue` - Обновление значения (v-model)
- `@blur` - Потеря фокуса
- `@focus` - Получение фокуса

### Примеры использования

```vue
<template>
  <!-- Обычный input -->
  <BaseInput
    v-model="username"
    label="Имя пользователя"
    placeholder="Введите имя"
  />

  <!-- Email с валидацией -->
  <BaseInput
    v-model="email"
    type="email"
    label="Email"
    placeholder="your@email.com"
    required
    :error="emailError"
  />

  <!-- Password с подсказкой -->
  <BaseInput
    v-model="password"
    type="password"
    label="Пароль"
    hint="Минимум 8 символов"
    required
  />
</template>

<script setup>
import { ref, computed } from 'vue';
import { BaseInput } from './components/ui';

const username = ref('');
const email = ref('');
const password = ref('');

const emailError = computed(() => {
  if (!email.value) return '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.value) ? '' : 'Некорректный email';
});
</script>
```

---

## BaseCombobox

Выпадающий список с поиском, поддержкой статических данных и загрузки из API.

### Props

| Prop | Тип | По умолчанию | Описание |
|------|-----|--------------|----------|
| `modelValue` | String/Number/Object | `null` | Выбранное значение (v-model) |
| `label` | String | `''` | Метка поля |
| `placeholder` | String | `'Выберите...'` | Placeholder текст |
| `options` | Array | `[]` | Статический массив опций |
| `fetchOptions` | Function | `null` | Функция для загрузки данных из API |
| `valueKey` | String | `'id'` | Ключ для значения в объекте опции |
| `displayKey` | String | `'name'` | Ключ для отображения в объекте опции |
| `searchable` | Boolean | `true` | Включить поиск |
| `disabled` | Boolean | `false` | Блокировка |
| `required` | Boolean | `false` | Обязательное поле |
| `error` | String | `''` | Сообщение об ошибке |
| `hint` | String | `''` | Подсказка |
| `emptyText` | String | `'Нет данных'` | Текст при пустом списке |

### Events

- `@update:modelValue` - Обновление выбранного значения (v-model)
- `@change` - Изменение выбора (передает полный объект опции)

### Slots

- `#option="{ option }"` - Кастомный шаблон для отображения опций

### Примеры использования

#### 1. Статические данные

```vue
<template>
  <BaseCombobox
    v-model="selectedCountry"
    label="Страна"
    placeholder="Выберите страну..."
    :options="countries"
    valueKey="id"
    displayKey="name"
  />
</template>

<script setup>
import { ref } from 'vue';
import { BaseCombobox } from './components/ui';

const selectedCountry = ref(null);
const countries = [
  { id: 1, name: 'Россия' },
  { id: 2, name: 'США' },
  { id: 3, name: 'Германия' }
];
</script>
```

#### 2. Загрузка из API (пользователи)

```vue
<template>
  <BaseCombobox
    v-model="selectedUserId"
    label="Выберите пользователя"
    placeholder="Выберите пользователя..."
    :fetchOptions="fetchUsers"
    valueKey="id"
    displayKey="name"
    @change="handleUserChange"
  >
    <template #option="{ option }">
      <div>
        <strong>{{ option.name }}</strong>
        <br />
        <small>{{ option.email }}</small>
      </div>
    </template>
  </BaseCombobox>
</template>

<script setup>
import { ref } from 'vue';
import { BaseCombobox } from './components/ui';
import { userService } from './services/api';

const selectedUserId = ref(null);

const fetchUsers = async () => {
  const response = await userService.searchUsers('');
  return response.users || [];
};

const handleUserChange = (user) => {
  console.log('Выбран пользователь:', user);
};
</script>
```

#### 3. Загрузка школ из API

```vue
<template>
  <BaseCombobox
    v-model="formData.schoolId"
    label="Школа"
    placeholder="Выберите школу..."
    :fetchOptions="fetchSchools"
    valueKey="id"
    displayKey="name"
    hint="Выберите вашу школу из списка"
  />
</template>

<script setup>
import { ref } from 'vue';
import { BaseCombobox } from './components/ui';
import { apiCall } from './services/api';

const formData = ref({
  schoolId: null
});

// Функция для загрузки школ
// Примечание: endpoint /api/schools должен быть реализован на бэкенде
const fetchSchools = async () => {
  try {
    const response = await apiCall('/api/schools', {
      method: 'GET'
    });
    return response.schools || [];
  } catch (error) {
    console.error('Ошибка загрузки школ:', error);
    throw error;
  }
};
</script>
```

#### 4. Без поиска

```vue
<template>
  <BaseCombobox
    v-model="selectedRole"
    label="Роль"
    :options="roles"
    :searchable="false"
    valueKey="id"
    displayKey="name"
  />
</template>

<script setup>
import { ref } from 'vue';
import { BaseCombobox } from './components/ui';

const selectedRole = ref(null);
const roles = [
  { id: 'admin', name: 'Администратор' },
  { id: 'teacher', name: 'Учитель' },
  { id: 'student', name: 'Ученик' }
];
</script>
```

---

## ErrorMessage

Компонент для отображения сообщений об ошибках с возможностью закрытия.

### Props

| Prop | Тип | По умолчанию | Описание |
|------|-----|--------------|----------|
| `message` | String | `''` | Текст сообщения об ошибке |
| `closable` | Boolean | `true` | Возможность закрыть сообщение |

### Events

- `@close` - Событие закрытия сообщения

### Примеры использования

```vue
<template>
  <!-- Простое сообщение -->
  <ErrorMessage 
    :message="error" 
    @close="error = ''" 
  />

  <!-- Без возможности закрытия -->
  <ErrorMessage 
    message="Критическая ошибка!"
    :closable="false"
  />
</template>

<script setup>
import { ref } from 'vue';
import { ErrorMessage } from './components/ui';

const error = ref('');
</script>
```

---

## Импорт компонентов

Все компоненты можно импортировать из одного файла:

```javascript
// Импорт всех компонентов
import { BaseButton, BaseInput, BaseCombobox, ErrorMessage } from './components/ui';

// Или по отдельности
import BaseButton from './components/ui/BaseButton.vue';
import BaseInput from './components/ui/BaseInput.vue';
import BaseCombobox from './components/ui/BaseCombobox.vue';
import ErrorMessage from './components/ui/ErrorMessage.vue';
```

---

## Кастомизация стилей

Компоненты используют CSS переменные из `src/style.css`:

```css
:root {
  --color-primary: #005BBB;
  --color-primary-dark: #004994;
  --color-secondary: #E8ECF0;
  --color-accent: #FF6F00;
  --color-accent-dark: #E65100;
  --color-error: #E74C3C;
  --color-success: #27AE60;
  --color-text: #2C3E50;
  --color-background: #FFFFFF;
  --color-light-gray: #F5F7FA;
  --color-border: #D0D8E0;
  --color-disabled: #BDC3C7;
}
```

Вы можете переопределить эти переменные для кастомизации внешнего вида.

---

## API endpoints для Combobox

Для полноценной работы `BaseCombobox` с загрузкой данных из API, убедитесь, что следующие endpoints реализованы на бэкенде:

### Пользователи
```
GET /api/users/search?query=
Возвращает: { users: [...] }
```

### Школы (требует реализации)
```
GET /api/schools
Возвращает: { schools: [{ id, name, ... }] }
```

### Проекты
```
GET /api/projects
Возвращает: [{ id, title, description, ... }]
```

---

## Дополнительные примеры

Смотрите файл `UI_COMPONENTS_EXAMPLES.js` для большего количества примеров использования всех UI компонентов.

---

## Поддержка

При возникновении вопросов или проблем обращайтесь к основной документации проекта в файлах:
- `README.md` - Общая документация
- `AUTHENTICATION.md` - Система аутентификации
- `ARCHITECTURE.md` - Архитектура приложения
