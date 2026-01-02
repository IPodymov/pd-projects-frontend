<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import type { User, UpdateUserDto } from "../models";
import { useUsers, useAuth } from "../composables";
import UserEditDrawer from "../components/UserEditDrawer.vue";
import { usersService } from "../services/users";

const { isAdmin, isStaff } = useAuth();
const users = ref<User[]>([]);
const loading = ref(false);
const error = ref("");

const drawer = ref(false);
const selected = ref<User | null>(null);

const canEdit = computed(() => isAdmin.value || isStaff.value);

async function fetchUsers() {
  loading.value = true;
  error.value = "";
  try {
    const userData = await usersService.list();
    users.value = userData as User[];
  } catch (e: any) {
    error.value =
      e?.response?.data?.message || "Не удалось загрузить пользователей";
  } finally {
    loading.value = false;
  }
}

function openEdit(u: User) {
  if (!canEdit.value) return;
  selected.value = u;
  drawer.value = true;
}

async function save(dto: UpdateUserDto) {
  if (!selected.value) return;
  const updated = await usersService.update(selected.value.id, dto);
  const idx = users.value.findIndex((u) => u.id === updated.id);
  if (idx !== -1) users.value[idx] = updated as User;
  drawer.value = false;
}

onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <main class="page container page_users">
    <section v-if="loading">Загрузка...</section>
    <section v-else-if="error">{{ error }}</section>
    <section v-else class="users">
      <header class="users__header">
        <h1 class="users__title">Пользователи</h1>
      </header>
      <div class="users__grid">
        <v-card
          v-for="u in users"
          :key="u.id"
          class="user-card"
          variant="outlined"
        >
          <v-card-title class="user-card__title">{{
            u.firstName || u.email
          }}</v-card-title>
          <v-card-text class="user-card__body">
            <div class="user-card__row">
              <span class="label">Email:</span
              ><span class="value">{{ u.email }}</span>
            </div>
            <div class="user-card__row">
              <span class="label">Имя:</span
              ><span class="value">{{ u.firstName || "-" }}</span>
            </div>
            <div class="user-card__row">
              <span class="label">Фамилия:</span
              ><span class="value">{{ u.lastName || "-" }}</span>
            </div>
            <div class="user-card__row">
              <span class="label">Отчество:</span
              ><span class="value">{{ u.middleName || "-" }}</span>
            </div>
            <div class="user-card__roles" v-if="u.roles?.length">
              <v-chip
                v-for="r in u.roles"
                :key="r.id"
                size="small"
                class="mr-1"
                >{{ r.value }}</v-chip
              >
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn v-if="canEdit" variant="text" @click="openEdit(u)"
              >Редактировать</v-btn
            >
          </v-card-actions>
        </v-card>
      </div>
    </section>

    <UserEditDrawer v-model="drawer" :user="selected" @save="save" />
  </main>
</template>

<style scoped>
.page {
  padding-top: var(--space-6);
  padding-bottom: var(--space-6);
}
.users__header {
  margin-bottom: var(--space-4);
}
.users__title {
  margin: 0;
}
.users__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
}
.user-card__row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.user-card__row .label {
  color: var(--muted);
  font-size: 13px;
}
.user-card__roles {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 6px;
}
</style>
