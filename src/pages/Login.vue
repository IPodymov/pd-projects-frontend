<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Вход в систему</h1>

      <ErrorMessage :message="error" @close="clearError" />

      <form @submit.prevent="handleLogin">
        <BaseInput
          v-model="credentials.email"
          type="email"
          label="Email:"
          placeholder="your@email.com"
          required
          :disabled="isLoading"
        />

        <BaseInput
          v-model="credentials.password"
          type="password"
          label="Пароль:"
          placeholder="••••••••"
          required
          :disabled="isLoading"
        />

        <BaseButton
          type="submit"
          variant="primary"
          :loading="isLoading"
        >
          Войти
        </BaseButton>
      </form>

      <div class="auth-link">
        <p>
          Нет аккаунта?
          <router-link to="/register">Зарегистрируйтесь</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../store/store.js';
import { BaseInput, BaseButton, ErrorMessage } from '../components/ui';

const router = useRouter();
const { login, isLoading, error, clearError } = useAuth();

const credentials = ref({
  email: '',
  password: '',
});

const handleLogin = async () => {
  try {
    await login(credentials.value);
    router.push('/');
  } catch (err) {
    console.error('Login error:', err);
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--color-light-gray);
  padding: 20px;
}

.login-card {
  background: var(--color-background);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  color: var(--color-text);
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: 600;
}

form {
  margin-bottom: 20px;
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
  .login-card {
    padding: 24px;
  }
  h1 {
    font-size: 24px;
    margin-bottom: 20px;
  }
}
</style>
