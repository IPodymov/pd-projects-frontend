# UI Компоненты - Быстрый старт 🚀

Папка с переиспользуемыми UI компонентами для проекта pd-projects-frontend.

## 📁 Структура

```
src/components/ui/
├── BaseButton.vue      # Универсальная кнопка
├── BaseInput.vue       # Текстовое поле ввода
├── BaseCombobox.vue    # Выпадающий список с поиском и API
├── ErrorMessage.vue    # Сообщение об ошибке
└── index.js           # Экспорт всех компонентов
```

## 🎯 Быстрый импорт

```javascript
// Импорт всех компонентов сразу
import { BaseButton, BaseInput, BaseCombobox, ErrorMessage } from './components/ui';

// Или по отдельности
import BaseButton from './components/ui/BaseButton.vue';
```

## 💡 Базовые примеры

### BaseButton
```vue
<BaseButton variant="primary" @click="handleClick">
  Сохранить
</BaseButton>

<BaseButton :loading="isLoading">
  Загрузка...
</BaseButton>
```

### BaseInput
```vue
<BaseInput
  v-model="email"
  type="email"
  label="Email"
  placeholder="your@email.com"
  required
/>
```

### BaseCombobox (статика)
```vue
<BaseCombobox
  v-model="selectedId"
  label="Выберите страну"
  :options="countries"
  valueKey="id"
  displayKey="name"
/>
```

### BaseCombobox (API)
```vue
<BaseCombobox
  v-model="userId"
  label="Пользователь"
  :fetchOptions="fetchUsers"
  valueKey="id"
  displayKey="name"
/>

<script setup>
import { userService } from './services/api';

const fetchUsers = async () => {
  const response = await userService.searchUsers('');
  return response.users || [];
};
</script>
```

### ErrorMessage
```vue
<ErrorMessage 
  :message="error" 
  @close="error = ''" 
/>
```

## 🎨 Демо-страница

Запустите проект и перейдите на `/ui-demo` для интерактивной демонстрации всех компонентов.

```bash
npm run dev
```

Откройте: `http://localhost:5173/ui-demo`

## 📚 Полная документация

Смотрите файл [UI_COMPONENTS.md](../../UI_COMPONENTS.md) в корне проекта для:
- Полного списка props и events
- Расширенных примеров использования
- Интеграции с API
- Кастомизации стилей

## 🔧 Примеры из проекта

Компоненты уже используются в:
- `src/components/Login.vue` - форма входа
- `src/components/Register.vue` - форма регистрации
- `src/components/UIDemo.vue` - демонстрация всех компонентов

## 🎨 Варианты кнопок

- `primary` - основная (синяя)
- `secondary` - второстепенная (серая)
- `accent` - акцент (оранжевая)
- `danger` - опасная (красная)
- `ghost` - прозрачная с обводкой

## 📦 API сервисы для Combobox

Используйте существующие сервисы из `src/services/api.js`:

```javascript
import { userService, schoolService, projectService } from './services/api';

// Загрузка пользователей
const fetchUsers = () => userService.searchUsers('');

// Загрузка школ
const fetchSchools = () => schoolService.getAllSchools();

// Загрузка проектов
const fetchProjects = () => projectService.getAllProjects();
```

## ✨ Фичи BaseCombobox

- ✅ Поиск по значениям (опционально)
- ✅ Загрузка данных из API
- ✅ Статические данные
- ✅ Кастомные шаблоны для опций
- ✅ Обработка состояний загрузки и ошибок
- ✅ Повторная загрузка при ошибке
- ✅ Автоматическое закрытие при клике вне компонента

## 🚀 Расширение

Для добавления нового UI компонента:

1. Создайте файл в `src/components/ui/NewComponent.vue`
2. Добавьте экспорт в `src/components/ui/index.js`:
   ```javascript
   export { default as NewComponent } from './NewComponent.vue';
   ```
3. Используйте в проекте:
   ```javascript
   import { NewComponent } from './components/ui';
   ```

---

**Вопросы?** Смотрите [UI_COMPONENTS_EXAMPLES.js](../../UI_COMPONENTS_EXAMPLES.js) для 10+ детальных примеров.
