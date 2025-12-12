<template>
  <div class="register-container">
    <div class="register-card">
      <h1>Регистрация</h1>

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

        <BaseInput
          v-model="formData.schoolId"
          type="text"
          label="Школа (опционально):"
          placeholder="ID школы"
          :disabled="isLoading"
        />

        <BaseInput
          v-model="formData.token"
          type="text"
          label="Токен приглашения (опционально):"
          placeholder="Ссылка приглашения для учителя"
          :disabled="isLoading"
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
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../store/store.js";
import { BaseInput, BaseButton, ErrorMessage } from './ui';

const router = useRouter();
const { register, isLoading, error, clearError } = useAuth();

const formData = ref({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  schoolId: "",
  token: "",
});

const passwordsMatch = computed(() => {
  if (!formData.value.password && !formData.value.confirmPassword) {
    return null;
  }
  return formData.value.password === formData.value.confirmPassword;
});

const isFormValid = computed(() => {
  return (
    formData.value.name &&
    formData.value.email &&
    formData.value.password &&
    formData.value.confirmPassword &&
    passwordsMatch.value === true
  );
});

const handleRegister = async () => {
  try {
    const registerData = {
      name: formData.value.name,
      email: formData.value.email,
      password: formData.value.password,
    };

    // Добавляем опциональные поля
    if (formData.value.schoolId) {
      registerData.schoolId = formData.value.schoolId;
    }
    if (formData.value.token) {
      registerData.token = formData.value.token;
    }

    await register(registerData);
    // Перенаправляем на главную страницу после успешной регистрации
    router.push("/");
  } catch (err) {
    // Ошибка уже установлена в store
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
</style>
