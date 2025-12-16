<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "../stores/auth";
import UiInput from "../ui/Input.vue";
import UiButton from "../ui/Button.vue";
import FormField from "../ui/FormField.vue";

const auth = useAuthStore();

const email = ref("");
const firstName = ref("");
const lastName = ref("");
const middleName = ref("");
const newPassword = ref("");
const saving = ref(false);
const message = ref("");
const error = ref("");
const editing = ref(false);
const roles = computed(() => auth.user?.roles?.map((r) => r.value) || []);

function fillFromStore() {
  email.value = auth.user?.email || "";
  firstName.value = auth.user?.firstName || "";
  lastName.value = auth.user?.lastName || "";
  middleName.value = auth.user?.middleName || "";
}

onMounted(async () => {
  if (!auth.user) await auth.fetchProfile();
  fillFromStore();
});

async function save(e: Event) {
  e.preventDefault();
  if (!auth.user) return;
  saving.value = true;
  message.value = "";
  error.value = "";
  try {
    await auth.updateProfile({
      email: email.value,
      firstName: firstName.value,
      lastName: lastName.value,
      middleName: middleName.value,
      password: newPassword.value || undefined,
    });
    newPassword.value = "";
    message.value = "Профиль обновлен";
    editing.value = false;
  } catch (e: any) {
    error.value = e?.response?.data?.message || "Не удалось сохранить профиль";
  } finally {
    saving.value = false;
  }
}

function startEdit() {
  message.value = "";
  error.value = "";
  fillFromStore();
  editing.value = true;
}

function cancelEdit() {
  fillFromStore();
  newPassword.value = "";
  editing.value = false;
}
</script>

<template>
  <main class="page container page_profile">
    <section class="profile">
      <div class="profile__header">
        <h1 class="profile__title">Профиль</h1>
        <UiButton v-if="!editing" theme="primary" @click="startEdit"
          >Редактировать</UiButton
        >
      </div>
      <div class="profile__roles" v-if="roles.length">
        <span class="profile__roles-label">Роли:</span>
        <div class="profile__roles-chips">
          <span v-for="role in roles" :key="role" class="profile__role">{{
            role
          }}</span>
        </div>
      </div>
      <div class="profile__roles" v-else>
        <span class="profile__roles-label">Роли:</span>
        <span class="profile__role profile__role_empty">Не назначены</span>
      </div>
      <form class="profile__form" @submit="save">
        <FormField label="Email">
          <template v-if="editing">
            <UiInput v-model="email" type="email" />
          </template>
          <template v-else>
            <div class="profile__value">{{ email || "—" }}</div>
          </template>
        </FormField>
        <FormField label="Имя">
          <template v-if="editing">
            <UiInput v-model="firstName" />
          </template>
          <template v-else>
            <div class="profile__value">{{ firstName || "—" }}</div>
          </template>
        </FormField>
        <FormField label="Фамилия">
          <template v-if="editing">
            <UiInput v-model="lastName" />
          </template>
          <template v-else>
            <div class="profile__value">{{ lastName || "—" }}</div>
          </template>
        </FormField>
        <FormField label="Отчество">
          <template v-if="editing">
            <UiInput v-model="middleName" />
          </template>
          <template v-else>
            <div class="profile__value">{{ middleName || "—" }}</div>
          </template>
        </FormField>
        <FormField v-if="editing" label="Новый пароль (необязательно)">
          <UiInput
            v-model="newPassword"
            type="password"
            placeholder="От 4 до 16 символов"
          />
        </FormField>
        <span v-if="message" class="profile__success">{{ message }}</span>
        <span v-if="error" class="profile__error">{{ error }}</span>
        <div class="profile__actions" v-if="editing">
          <UiButton type="submit" theme="primary" :disabled="saving"
            >Сохранить</UiButton
          >
          <UiButton type="button" @click="cancelEdit">Отмена</UiButton>
        </div>
      </form>
    </section>
  </main>
</template>

<style scoped>
.page {
  padding-top: var(--space-6);
  padding-bottom: var(--space-6);
}
.profile__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}
.profile__title {
  margin: 0 0 var(--space-3);
}
.profile__roles {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
  flex-wrap: wrap;
}
.profile__roles-label {
  color: var(--muted);
  font-size: 13px;
}
.profile__roles-chips {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}
.profile__role {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 9999px;
  background: #f3f4f6;
  font-size: 13px;
}
.profile__role_empty {
  background: #fff7ed;
  color: #92400e;
}
.profile__form {
  width: 100%;
  max-width: 640px;
  display: grid;
  gap: var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--space-4);
  background: #fff;
}
.profile__value {
  padding: 12px 14px;
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  background: #fafafa;
}
.profile__actions {
  display: flex;
  gap: var(--space-3);
}
.profile__success {
  color: #16a34a;
  font-size: 13px;
}
.profile__error {
  color: #dc2626;
  font-size: 13px;
}
@media (min-width: 768px) {
  .profile__form {
    max-width: 720px;
  }
}
</style>
