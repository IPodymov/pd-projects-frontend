<template>
  <div class="register-container">
    <div class="register-card">
      <h1>Регистрация</h1>

      <p v-if="isTeacherInvite" class="invite-notice">
        Регистрация по приглашению учителя
      </p>

      <ErrorMessage :message="error" @close="clearError" />

      <form @submit.prevent="handleRegister">
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
          placeholder="your@email.com"
          required
          :disabled="isLoading"
        />

        <BaseInput
          v-model="formData.password"
          type="password"
          label="Пароль:"
          placeholder="••••••••"
          required
          :disabled="isLoading"
        />

        <BaseInput
          v-model="formData.confirmPassword"
          type="password"
          label="Подтвердите пароль:"
          placeholder="••••••••"
          required
          :disabled="isLoading"
          :error="passwordsMatch === false ? 'Пароли не совпадают' : ''"
        />

        <BaseCombobox
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
          v-if="!isTeacherInvite && formData.schoolId"
          v-model="formData.schoolClassId"
          label="Класс"
          placeholder="Выберите класс..."
          :fetchOptions="() => fetchClasses(formData.schoolId)"
          valueKey="id"
          displayKey="name"
          :disabled="isLoading"
          required
        />

        <BaseButton
          type="submit"
          variant="primary"
          :loading="isLoading"
          :disabled="!isFormValid"
        >
          Зарегистрироваться
        </BaseButton>
      </form>

      <div class="auth-link">
        <p>
          Уже есть аккаунт?
          <router-link to="/login">Войдите здесь</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "../store/store.js";
import {
  BaseInput,
  BaseButton,
  ErrorMessage,
  BaseCombobox,
} from "../components/ui";
import { schoolService } from "../services/api.js";

const router = useRouter();
const route = useRoute();
const { register, isLoading, error, clearError } = useAuth();

// Проверяем наличие токена приглашения в URL
const inviteToken = ref(route.query.token || "");
const isTeacherInvite = computed(() => !!inviteToken.value);

const formData = ref({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  schoolId: "",
  schoolClassId: "",
});

onMounted(() => {
  // Если есть токен приглашения, сохраняем его
  if (inviteToken.value) {
    console.log("Регистрация по приглашению учителя");
  }
});

const passwordsMatch = computed(() => {
  if (!formData.value.password && !formData.value.confirmPassword) {
    return null;
  }
  return formData.value.password === formData.value.confirmPassword;
});

const isFormValid = computed(() => {
  const baseValid =
    formData.value.name &&
    formData.value.email &&
    formData.value.password &&
    formData.value.confirmPassword &&
    formData.value.schoolId &&
    passwordsMatch.value === true;

  // Для школьника (обычная регистрация) требуется класс
  if (!isTeacherInvite.value) {
    return baseValid && formData.value.schoolClassId;
  }

  // Для учителя (по приглашению) класс не требуется
  return baseValid;
});

// Загрузка школ для комбобокса
const fetchSchools = async () => {
  try {
    const schools = await schoolService.getAllSchools();
    return schools;
  } catch (error) {
    console.error("Ошибка загрузки школ:", error);
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
    console.error("Ошибка загрузки классов:", error);
    throw error;
  }
};

const handleRegister = async () => {
  try {
    const registerData = {
      name: formData.value.name,
      email: formData.value.email,
      password: formData.value.password,
      schoolId: formData.value.schoolId,
    };

    // Если регистрация по приглашению (учитель)
    if (isTeacherInvite.value) {
      registerData.token = inviteToken.value;
    } else {
      // Обычная регистрация (школьник) - добавляем класс
      if (formData.value.schoolClassId) {
        registerData.schoolClassId = formData.value.schoolClassId;
      }
    }

    await register(registerData);
    router.push("/");
  } catch (err) {
    console.error("Registration error:", err);
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--color-light-gray);
  padding: 20px;
}

.register-card {
  background: var(--color-background);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 40px;
  width: 100%;
  max-width: 450px;
}

h1 {
  text-align: center;
  color: var(--color-text);
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: 600;
}

.invite-notice {
  text-align: center;
  color: var(--color-primary);
  background: rgba(0, 91, 187, 0.1);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 500;
}

.error-message {
  background-color: #fadbd8;
  border-left: 4px solid var(--color-error);
  color: var(--color-error);
  padding: 12px 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-error);
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: var(--color-text);
  font-weight: 500;
  font-size: 14px;
}

input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s ease;
  background-color: var(--color-background);
  color: var(--color-text);
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 91, 187, 0.1);
}

input:disabled {
  background-color: var(--color-light-gray);
  cursor: not-allowed;
  color: var(--color-disabled);
}

.validation-error {
  display: block;
  color: var(--color-error);
  font-size: 12px;
  margin-top: 6px;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.submit-btn:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 91, 187, 0.3);
}

.submit-btn:disabled {
  background-color: var(--color-disabled);
  cursor: not-allowed;
  transform: none;
}

.auth-link {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
}

.auth-link p {
  margin: 0;
  color: var(--color-text);
  font-size: 14px;
}

.auth-link a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.auth-link a:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

@media (max-width: 480px) {
  .register-card {
    padding: 24px;
  }
  h1 {
    font-size: 24px;
    margin-bottom: 20px;
  }
}
</style>
