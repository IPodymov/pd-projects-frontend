<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../composables";
import { Input as UiInput, Button as UiButton, FormField } from "../ui/components";

const email = ref("");
const password = ref("");
const { login } = useAuth();
const router = useRouter();

async function onSubmit(e: Event) {
  e.preventDefault();
  try {
    await login({ email: email.value, password: password.value });
    router.push({ name: "home" });
  } catch {}
}
</script>

<template>
  <main class="page container page_login">
    <form class="auth-form" @submit="onSubmit">
      <h1 class="auth-form__title">Вход</h1>
      <FormField label="Email">
        <UiInput v-model="email" type="email" placeholder="you@example.com" />
      </FormField>
      <FormField label="Пароль">
        <UiInput v-model="password" type="password" placeholder="••••••••" />
      </FormField>
      <span v-if="auth.error" class="auth-form__error">{{ auth.error }}</span>
      <UiButton type="submit" theme="primary">Войти</UiButton>
    </form>
  </main>
</template>

<style scoped>
.page {
  display: grid;
  place-items: center;
  padding: var(--space-6) 0;
}
.auth-form {
  width: 100%;
  max-width: 420px;
  display: grid;
  gap: var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--space-4);
  background: #fff;
}
.auth-form__title {
  margin: 0 0 var(--space-3);
}
.auth-form__error {
  color: #dc2626;
  font-size: 12px;
}
@media (min-width: 768px) {
  .auth-form {
    max-width: 480px;
  }
}
</style>
