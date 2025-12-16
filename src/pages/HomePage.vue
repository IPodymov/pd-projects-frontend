<script setup lang="ts">
import { onMounted } from "vue";
import ProjectList from "../components/ProjectList.vue";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();

onMounted(() => {
  if (!auth.user && auth.token) auth.fetchProfile();
});
</script>

<template>
  <main class="page container page_home">
    <section class="home__header">
      <h1 class="home__title">Проекты</h1>
      <div class="home__subline">
        <p class="home__subtitle">Все проекты платформы</p>
        <router-link v-if="auth.isAdmin || auth.isStaff" class="home__create" :to="{ name: 'project-create' }">Добавить проект</router-link>
      </div>
    </section>
    <ProjectList />
  </main>
</template>

<style scoped>
.page { padding-top: var(--space-6); padding-bottom: var(--space-6); }
.home__header { margin-bottom: var(--space-4); }
.home__title { margin: 0; font-size: 24px; }
.home__subtitle { margin: 4px 0 0; color: var(--muted); }
.home__subline { display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap; }
.home__create { padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius); background: #111827; color: #fff; text-decoration: none; font-size: 14px; }
@media (min-width: 768px) { .home__title { font-size: 28px; } }
</style>
