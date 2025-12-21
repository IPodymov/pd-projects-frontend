<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import UiInput from "../ui/Input.vue";
import UiButton from "../ui/Button.vue";
import FormField from "../ui/FormField.vue";

const email = ref("");
const password = ref("");
const firstName = ref("");
const lastName = ref("");
const middleName = ref("");
const userType = ref<"UNIVERSITY" | "SCHOOL">("UNIVERSITY");

const auth = useAuthStore();
const router = useRouter();

async function onSubmit(e: Event) {
  e.preventDefault();
  try {
    await auth.register(email.value, password.value, {
      firstName: firstName.value,
      lastName: lastName.value,
      middleName: middleName.value,
      userType: userType.value,
    });
    router.push({ name: "home" });
  } catch {}
}
</script>

<template>
  <main class="page container page_register">
    <form class="auth-form" @submit="onSubmit">
      <h1 class="auth-form__title">Регистрация</h1>
      <FormField label="Email"
        ><UiInput v-model="email" type="email" placeholder="you@example.com"
      /></FormField>
      <FormField label="Пароль"
        ><UiInput v-model="password" type="password" placeholder="••••••••"
      /></FormField>
      <FormField label="Имя"><UiInput v-model="firstName" /></FormField>
      <FormField label="Фамилия"><UiInput v-model="lastName" /></FormField>
      <FormField label="Отчество"><UiInput v-model="middleName" /></FormField>
      <FormField label="Кто вы?">
        <div class="auth-form__radio-group">
          <label class="auth-form__radio">
            <input type="radio" value="UNIVERSITY" v-model="userType" />
            <span>Студент вуза</span>
          </label>
          <label class="auth-form__radio">
            <input type="radio" value="SCHOOL" v-model="userType" />
            <span>Школьник</span>
          </label>
        </div>
      </FormField>
      <span v-if="auth.error" class="auth-form__error">{{ auth.error }}</span>
      <UiButton type="submit" theme="primary">Создать аккаунт</UiButton>
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
  max-width: 480px;
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
.auth-form__radio-group {
  display: grid;
  gap: 8px;
}
.auth-form__radio {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}
@media (min-width: 768px) {
  .auth-form {
    max-width: 560px;
  }
}
</style>
