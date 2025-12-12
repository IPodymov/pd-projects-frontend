/**
 * Примеры использования UI компонентов
 * 
 * Этот файл содержит примеры интеграции компонентов из папки src/components/ui/
 */

// ============================================
// 1. ПРИМЕР: BaseButton
// ============================================

/*
<template>
  <div>
    <!-- Primary кнопка -->
    <BaseButton variant="primary" @click="handleClick">
      Сохранить
    </BaseButton>

    <!-- Secondary кнопка -->
    <BaseButton variant="secondary" @click="handleCancel">
      Отмена
    </BaseButton>

    <!-- Accent кнопка -->
    <BaseButton variant="accent">
      Акцент
    </BaseButton>

    <!-- Danger кнопка -->
    <BaseButton variant="danger" @click="handleDelete">
      Удалить
    </BaseButton>

    <!-- Ghost кнопка -->
    <BaseButton variant="ghost">
      Призрачная
    </BaseButton>

    <!-- С загрузкой -->
    <BaseButton :loading="isLoading" @click="submitForm">
      Отправить
    </BaseButton>

    <!-- Disabled -->
    <BaseButton disabled>
      Недоступно
    </BaseButton>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { BaseButton } from './components/ui';

const isLoading = ref(false);

const handleClick = () => {
  console.log('Клик!');
};

const submitForm = async () => {
  isLoading.value = true;
  try {
    // Ваша логика
    await someApiCall();
  } finally {
    isLoading.value = false;
  }
};
</script>
*/

// ============================================
// 2. ПРИМЕР: BaseInput
// ============================================

/*
<template>
  <div>
    <!-- Обычный текстовый input -->
    <BaseInput
      v-model="username"
      label="Имя пользователя"
      placeholder="Введите имя"
    />

    <!-- Email input с валидацией -->
    <BaseInput
      v-model="email"
      type="email"
      label="Email"
      placeholder="your@email.com"
      required
      :error="emailError"
    />

    <!-- Password input -->
    <BaseInput
      v-model="password"
      type="password"
      label="Пароль"
      placeholder="••••••••"
      required
      hint="Минимум 8 символов"
    />

    <!-- Disabled input -->
    <BaseInput
      v-model="disabledValue"
      label="Только для чтения"
      disabled
    />

    <!-- С обработчиками событий -->
    <BaseInput
      v-model="searchQuery"
      label="Поиск"
      placeholder="Введите запрос"
      @focus="handleFocus"
      @blur="handleBlur"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { BaseInput } from './components/ui';

const username = ref('');
const email = ref('');
const password = ref('');
const searchQuery = ref('');

const emailError = computed(() => {
  if (!email.value) return '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.value) ? '' : 'Некорректный email';
});
</script>
*/

// ============================================
// 3. ПРИМЕР: ErrorMessage
// ============================================

/*
<template>
  <div>
    <!-- Простое сообщение об ошибке -->
    <ErrorMessage 
      :message="error" 
      @close="error = ''" 
    />

    <!-- Без возможности закрытия -->
    <ErrorMessage 
      message="Критическая ошибка!"
      :closable="false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ErrorMessage } from './components/ui';

const error = ref('Что-то пошло не так!');
</script>
*/

// ============================================
// 4. ПРИМЕР: BaseCombobox - Статические данные
// ============================================

/*
<template>
  <div>
    <!-- Combobox со статическими данными -->
    <BaseCombobox
      v-model="selectedCountry"
      label="Выберите страну"
      placeholder="Выберите страну..."
      :options="countries"
      valueKey="id"
      displayKey="name"
      @change="handleCountryChange"
    />

    <p v-if="selectedCountry">
      Выбрана страна: {{ selectedCountry }}
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { BaseCombobox } from './components/ui';

const selectedCountry = ref(null);

const countries = [
  { id: 1, name: 'Россия' },
  { id: 2, name: 'США' },
  { id: 3, name: 'Германия' },
  { id: 4, name: 'Франция' },
  { id: 5, name: 'Италия' }
];

const handleCountryChange = (country) => {
  console.log('Выбрана страна:', country);
};
</script>
*/

// ============================================
// 5. ПРИМЕР: BaseCombobox - Загрузка из API (пользователи)
// ============================================

/*
<template>
  <div>
    <!-- Combobox с загрузкой пользователей из API -->
    <BaseCombobox
      v-model="selectedUserId"
      label="Выберите пользователя"
      placeholder="Выберите пользователя..."
      :fetchOptions="fetchUsers"
      valueKey="id"
      displayKey="name"
      @change="handleUserChange"
    >
      <!-- Кастомный шаблон для отображения опций -->
      <template #option="{ option }">
        <div class="user-option">
          <strong>{{ option.name }}</strong>
          <br />
          <small>{{ option.email }}</small>
        </div>
      </template>
    </BaseCombobox>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { BaseCombobox } from './components/ui';
import { userService } from './services/api';

const selectedUserId = ref(null);

// Функция для загрузки пользователей из API
const fetchUsers = async () => {
  try {
    const response = await userService.searchUsers(''); // Поиск всех пользователей
    return response.users || [];
  } catch (error) {
    console.error('Ошибка загрузки пользователей:', error);
    throw error;
  }
};

const handleUserChange = (user) => {
  console.log('Выбран пользователь:', user);
};
</script>

<style scoped>
.user-option {
  padding: 4px 0;
}
</style>
*/

// ============================================
// 6. ПРИМЕР: BaseCombobox - Загрузка школ из API
// ============================================

/*
<template>
  <div>
    <!-- Combobox с загрузкой школ -->
    <BaseCombobox
      v-model="selectedSchoolId"
      label="Выберите школу"
      placeholder="Выберите школу..."
      :fetchOptions="fetchSchools"
      valueKey="id"
      displayKey="name"
      emptyText="Школы не найдены"
      @change="handleSchoolChange"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { BaseCombobox } from './components/ui';
import { apiCall } from './services/api';

const selectedSchoolId = ref(null);

// Функция для загрузки школ
// Примечание: этот endpoint нужно добавить в ваше API
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

const handleSchoolChange = (school) => {
  console.log('Выбрана школа:', school);
};
</script>
*/

// ============================================
// 7. ПРИМЕР: Combobox в форме регистрации со школами
// ============================================

/*
<template>
  <div class="register-form">
    <h2>Регистрация</h2>

    <BaseInput
      v-model="formData.name"
      label="Полное имя"
      placeholder="Иван Петров"
      required
    />

    <BaseInput
      v-model="formData.email"
      type="email"
      label="Email"
      placeholder="your@email.com"
      required
    />

    <BaseInput
      v-model="formData.password"
      type="password"
      label="Пароль"
      placeholder="••••••••"
      required
    />

    <!-- Combobox для выбора школы -->
    <BaseCombobox
      v-model="formData.schoolId"
      label="Школа"
      placeholder="Выберите вашу школу..."
      :fetchOptions="fetchSchools"
      valueKey="id"
      displayKey="name"
      hint="Выберите школу из списка"
    />

    <BaseButton
      type="submit"
      variant="primary"
      :loading="isLoading"
      @click="handleSubmit"
    >
      Зарегистрироваться
    </BaseButton>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { BaseInput, BaseButton, BaseCombobox } from './components/ui';
import { apiCall, authService } from './services/api';

const isLoading = ref(false);
const formData = ref({
  name: '',
  email: '',
  password: '',
  schoolId: null
});

const fetchSchools = async () => {
  const response = await apiCall('/api/schools', { method: 'GET' });
  return response.schools || [];
};

const handleSubmit = async () => {
  isLoading.value = true;
  try {
    await authService.register(formData.value);
    // Успешная регистрация
  } catch (error) {
    console.error('Ошибка регистрации:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>
*/

// ============================================
// 8. ПРИМЕР: BaseCombobox с поиском проектов
// ============================================

/*
<template>
  <div>
    <!-- Combobox с поиском проектов -->
    <BaseCombobox
      v-model="selectedProjectId"
      label="Выберите проект"
      placeholder="Найдите проект..."
      :fetchOptions="fetchProjects"
      valueKey="id"
      displayKey="title"
      searchable
      @change="handleProjectChange"
    >
      <template #option="{ option }">
        <div class="project-option">
          <strong>{{ option.title }}</strong>
          <br />
          <small>{{ option.description }}</small>
        </div>
      </template>
    </BaseCombobox>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { BaseCombobox } from './components/ui';
import { projectService } from './services/api';

const selectedProjectId = ref(null);

const fetchProjects = async () => {
  try {
    const projects = await projectService.getAllProjects();
    return projects;
  } catch (error) {
    console.error('Ошибка загрузки проектов:', error);
    throw error;
  }
};

const handleProjectChange = (project) => {
  console.log('Выбран проект:', project);
};
</script>
*/

// ============================================
// 9. ПРИМЕР: Полная форма с несколькими Combobox
// ============================================

/*
<template>
  <div class="form-container">
    <h2>Создание задачи</h2>

    <BaseInput
      v-model="task.title"
      label="Название задачи"
      placeholder="Введите название"
      required
    />

    <BaseCombobox
      v-model="task.projectId"
      label="Проект"
      placeholder="Выберите проект..."
      :fetchOptions="fetchProjects"
      valueKey="id"
      displayKey="title"
      required
    />

    <BaseCombobox
      v-model="task.assigneeId"
      label="Исполнитель"
      placeholder="Выберите исполнителя..."
      :fetchOptions="fetchUsers"
      valueKey="id"
      displayKey="name"
    >
      <template #option="{ option }">
        <div>
          {{ option.name }} ({{ option.email }})
        </div>
      </template>
    </BaseCombobox>

    <BaseCombobox
      v-model="task.priority"
      label="Приоритет"
      placeholder="Выберите приоритет..."
      :options="priorities"
      valueKey="value"
      displayKey="label"
    />

    <BaseButton
      variant="primary"
      :loading="isCreating"
      @click="createTask"
    >
      Создать задачу
    </BaseButton>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { BaseInput, BaseButton, BaseCombobox } from './components/ui';
import { projectService, userService, apiCall } from './services/api';

const isCreating = ref(false);
const task = ref({
  title: '',
  projectId: null,
  assigneeId: null,
  priority: 'medium'
});

const priorities = [
  { value: 'low', label: 'Низкий' },
  { value: 'medium', label: 'Средний' },
  { value: 'high', label: 'Высокий' },
  { value: 'urgent', label: 'Срочный' }
];

const fetchProjects = async () => {
  const projects = await projectService.getAllProjects();
  return projects;
};

const fetchUsers = async () => {
  const response = await userService.searchUsers('');
  return response.users || [];
};

const createTask = async () => {
  isCreating.value = true;
  try {
    await apiCall('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task.value)
    });
    console.log('Задача создана!');
  } catch (error) {
    console.error('Ошибка создания задачи:', error);
  } finally {
    isCreating.value = false;
  }
};
</script>
*/

// ============================================
// 10. ПРИМЕР: Combobox без поиска
// ============================================

/*
<template>
  <div>
    <!-- Combobox без функции поиска -->
    <BaseCombobox
      v-model="selectedRole"
      label="Роль"
      placeholder="Выберите роль..."
      :options="roles"
      valueKey="id"
      displayKey="name"
      :searchable="false"
    />
  </div>
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
*/

export {};
