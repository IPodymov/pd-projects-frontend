<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Добавить нового пользователя</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <ErrorMessage :message="error" @close="clearError" />

      <form @submit.prevent="handleSubmit">
        <BaseInput
          v-model="formData.name"
          type="text"
          label="Полное имя:"
          placeholder="Иван Петров"
          required
          :disabled="isLoading"
        />

        <BaseInput
          v-model="formData.email"
          type="email"
          label="Email:"
          placeholder="user@example.com"
          required
          :disabled="isLoading"
        />

        <BaseInput
          v-model="formData.password"
          type="password"
          label="Пароль:"
          placeholder="Минимум 6 символов"
          required
          :disabled="isLoading"
        />

        <div class="form-group">
          <label>Роль: <span class="required">*</span></label>
          <select
            v-model="formData.role"
            required
            :disabled="isLoading"
            class="role-select"
          >
            <option value="">Выберите роль...</option>
            <option value="student">Школьник</option>
            <option value="teacher">Учитель</option>
            <option value="university_staff">Сотрудник ВУЗа</option>
            <option value="admin">Администратор</option>
          </select>
        </div>

        <!-- Школа: для student/teacher обязательна, для admin/university_staff необязательна с опцией Без школы -->
        <BaseCombobox
          v-if="requiresSchool"
          v-model="formData.schoolId"
          label="Школа"
          placeholder="Выберите школу..."
          :fetchOptions="fetchSchools"
          valueKey="id"
          displayKey="name"
          :disabled="isLoading"
          required
        />

        <BaseCombobox
          v-else-if="isAdminOrStaff"
          v-model="formData.schoolId"
          label="Школа (необязательно)"
          placeholder="Выберите школу или — Без школы —"
          :fetchOptions="fetchSchoolsWithNull"
          valueKey="id"
          displayKey="name"
          :disabled="isLoading"
        />

        <BaseCombobox
          v-if="showClassField"
          v-model="formData.schoolClassId"
          label="Класс"
          placeholder="Выберите класс..."
          :fetchOptions="() => fetchClasses(formData.schoolId)"
          valueKey="id"
          displayKey="name"
          :disabled="isLoading"
          :required="formData.role === 'student'"
        />

        <div class="modal-actions">
          <BaseButton
            type="button"
            variant="secondary"
            @click="$emit('close')"
            :disabled="isLoading"
          >
            Отмена
          </BaseButton>
          <BaseButton
            type="submit"
            variant="primary"
            :loading="isLoading"
            :disabled="!isFormValid"
          >
            Создать пользователя
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { userService, schoolService } from '../services/api.js';
import {
  BaseInput,
  BaseButton,
  ErrorMessage,
  BaseCombobox,
} from '../components/ui';

const emit = defineEmits(['close', 'created']);

const formData = ref({
  name: '',
  email: '',
  password: '',
  role: '',
  schoolId: '',
  schoolClassId: '',
});

const isLoading = ref(false);
const error = ref('');

const clearError = () => {
  error.value = '';
};

// Требуется ли школа для выбранной роли
const requiresSchool = computed(() => {
  const role = formData.value.role;
  return role === 'student' || role === 'teacher';
});

// Админ или сотрудник ВУЗа
const isAdminOrStaff = computed(() => {
  const role = formData.value.role;
  return role === 'admin' || role === 'university_staff';
});

// Показывать ли поле выбора класса
const showClassField = computed(() => {
  return formData.value.schoolId && 
         (formData.value.role === 'student' || formData.value.role === 'teacher');
});

// Валидация формы
const isFormValid = computed(() => {
  const baseValid =
    formData.value.name &&
    formData.value.email &&
    formData.value.password &&
    formData.value.password.length >= 6 &&
    formData.value.role;

  // Для администраторов и сотрудников ВУЗа школа не обязательна
  if (formData.value.role === 'admin' || formData.value.role === 'university_staff') {
    return baseValid;
  }

  // Для остальных ролей школа обязательна
  if (!formData.value.schoolId) {
    return false;
  }

  // Для школьника класс обязателен
  if (formData.value.role === 'student') {
    return baseValid && formData.value.schoolClassId;
  }

  return baseValid;
});

// Загрузка школ для комбобокса
const fetchSchools = async () => {
  try {
    const schools = await schoolService.getAllSchools();
    return schools;
  } catch (error) {
    console.error('Ошибка загрузки школ:', error);
    throw error;
  }
};

// Загрузка школ с опцией null для admin/university_staff
const fetchSchoolsWithNull = async () => {
  try {
    const schools = await schoolService.getAllSchools();
    return [
      { id: null, name: '— Без школы —' },
      ...schools,
    ];
  } catch (error) {
    console.error('Ошибка загрузки школ:', error);
    throw error;
  }
};

// Загрузка классов для выбранной школы
const fetchClasses = async (schoolId) => {
  if (!schoolId) return [];
  try {
    const classes = await schoolService.getSchoolClasses(schoolId);
    return classes;
  } catch (error) {
    console.error('Ошибка загрузки классов:', error);
    throw error;
  }
};

const handleSubmit = async () => {
  if (!isFormValid.value) return;

  isLoading.value = true;
  error.value = '';

  try {
    const userData = {
      name: formData.value.name,
      email: formData.value.email,
      password: formData.value.password,
      role: formData.value.role,
    };

    // Добавляем schoolId: для admin/university_staff допустим null, для остальных только если указана
    if (isAdminOrStaff.value) {
      userData.schoolId = formData.value.schoolId ?? null;
    } else if (formData.value.schoolId) {
      userData.schoolId = formData.value.schoolId;
    }

    // Добавляем класс только если он указан
    if (formData.value.schoolClassId) {
      userData.schoolClassId = formData.value.schoolClassId;
    }

    await userService.createUser(userData);
    emit('created');
  } catch (err) {
    error.value = err.message || 'Ошибка создания пользователя';
    console.error('Error creating user:', err);
  } finally {
    isLoading.value = false;
  }
};

// По умолчанию для admin/university_staff школа = null, для остальных сбрасываем при смене роли
watch(
  () => formData.value.role,
  (role) => {
    if (role === 'admin' || role === 'university_staff') {
      formData.value.schoolId = null;
      formData.value.schoolClassId = '';
    } else {
      // Для student/teacher оставим пустыми до выбора
      formData.value.schoolId = '';
      formData.value.schoolClassId = '';
    }
  }
);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--color-background);
  border-radius: 12px;
  padding: 32px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h2 {
  margin: 0;
  color: var(--color-text);
  font-size: 24px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--color-text);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--color-text);
  font-weight: 500;
  font-size: 14px;
}

.required {
  color: var(--color-error);
}

.role-select {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background-color: var(--color-background);
  color: var(--color-text);
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.role-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 91, 187, 0.1);
}

.role-select:disabled {
  background-color: var(--color-light-gray);
  cursor: not-allowed;
  color: var(--color-disabled);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
}

@media (max-width: 480px) {
  .modal-content {
    padding: 24px;
  }

  .modal-header h2 {
    font-size: 20px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions button {
    width: 100%;
  }
}
</style>
