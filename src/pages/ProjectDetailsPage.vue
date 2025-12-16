<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import {
  projectsService,
  type Project,
  type ProjectStatus,
} from "../services/projects";
import { useAuthStore } from "../stores/auth";
import UiButton from "../ui/Button.vue";

const route = useRoute();
const auth = useAuthStore();

const project = ref<Project | null>(null);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);

const canModerate = computed(
  () =>
    !!project.value &&
    (auth.isAdmin || auth.isStaff) &&
    project.value.status === "PENDING"
);

async function fetchProject() {
  loading.value = true;
  error.value = null;
  try {
    const id = Number(route.params.id);
    project.value = await projectsService.get(id);
  } catch (e: any) {
    error.value = e?.response?.data?.message || "Не удалось загрузить проект";
  } finally {
    loading.value = false;
  }
}

async function setStatus(status: ProjectStatus) {
  if (!project.value) return;
  project.value = await projectsService.update(project.value.id, { status });
}

onMounted(() => {
  fetchProject();
});
</script>

<template>
  <main class="page container page_project-details">
    <section v-if="loading">Загрузка...</section>
    <section v-else-if="error">{{ error }}</section>
    <section v-else-if="project" class="project">
      <header class="project__header">
        <div>
          <p class="project__status">
            Статус:
            <span
              class="project__badge"
              :class="`project__badge_${project.status.toLowerCase()}`"
              >{{ project.status }}</span
            >
          </p>
          <h1 class="project__title">{{ project.title }}</h1>
          <p class="project__meta">
            Автор: {{ project.author.firstName || project.author.email }}
          </p>
        </div>
        <div v-if="canModerate" class="project__actions">
          <UiButton theme="primary" @click="setStatus('APPROVED')"
            >Одобрить</UiButton
          >
          <UiButton theme="secondary" @click="setStatus('REJECTED')"
            >Отклонить</UiButton
          >
        </div>
      </header>
      <p class="project__desc">{{ project.description }}</p>
      <section class="project__links" v-if="project.links?.length">
        <h3>Ссылки</h3>
        <ul>
          <li v-for="link in project.links" :key="link.id">
            <a :href="link.url" target="_blank">{{
              link.description || link.url
            }}</a>
          </li>
        </ul>
      </section>
      <section class="project__dates">
        <span>Создан: {{ new Date(project.createdAt).toLocaleString() }}</span>
        <span
          >Обновлён: {{ new Date(project.updatedAt).toLocaleString() }}</span
        >
      </section>
    </section>
  </main>
</template>

<style scoped>
.page {
  padding-top: var(--space-6);
  padding-bottom: var(--space-6);
}
.project {
  display: grid;
  gap: var(--space-4);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--space-4);
  background: #fff;
}
.project__header {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}
.project__title {
  margin: 4px 0;
}
.project__meta {
  margin: 0;
  color: var(--muted);
}
.project__desc {
  margin: 0;
  font-size: 15px;
}
.project__links ul {
  padding-left: var(--space-4);
  margin: var(--space-2) 0 0;
  display: grid;
  gap: var(--space-2);
}
.project__dates {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
  color: var(--muted);
  font-size: 13px;
}
.project__badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 9999px;
  background: #f3f4f6;
  font-size: 12px;
}
.project__badge_pending {
  background: #fff7ed;
}
.project__badge_approved {
  background: #ecfdf5;
}
.project__badge_rejected {
  background: #fef2f2;
}
.project__actions {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}
</style>
