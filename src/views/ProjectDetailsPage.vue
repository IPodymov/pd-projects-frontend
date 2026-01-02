<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import { projectsService } from "../services/projects";
import type { Project, ProjectStatus } from "../models";
import { useAuth } from "../composables";
import { Button as UiButton } from "../ui/components";
import ProjectInvite from "../components/ProjectInvite.vue";

const route = useRoute();
const { user, isAdmin, isStaff } = useAuth();

const project = ref<Project | null>(null);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);

const canModerate = computed(
  () =>
    !!project.value &&
    (isAdmin.value || isStaff.value) &&
    project.value.status === "PENDING",
);

const isAuthor = computed(
  () => !!project.value && user.value?.id === project.value.author.id,
);
const canInvite = computed(
  () => !!project.value && (isAuthor.value || auth.isAdmin || auth.isStaff),
);

const inviteToken = ref<string | null>(null);
const inviteLoading = ref(false);
const inviteError = ref<string | null>(null);
const inviteLink = computed(() => {
  if (typeof window !== "undefined" && inviteToken.value) {
    return `${window.location.origin}?join=${inviteToken.value}`;
  }
  return "";
});

async function generateInviteToken() {
  if (!project.value) return;
  inviteLoading.value = true;
  inviteError.value = null;
  try {
    const { token } = await projectsService.generateInvitation(
      project.value.id,
    );
    inviteToken.value = token;
  } catch (e: any) {
    inviteError.value =
      e?.response?.data?.message || "Не удалось создать приглашение";
  } finally {
    inviteLoading.value = false;
  }
}

function copyInviteLink() {
  if (
    inviteLink.value &&
    typeof navigator !== "undefined" &&
    navigator.clipboard
  ) {
    navigator.clipboard.writeText(inviteLink.value);
  }
}

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
            <template v-if="project.institution">
              · {{ project.institution.name }} ({{
                project.institution.type === "UNIVERSITY" ? "ВУЗ" : "Школа"
              }})
            </template>
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
      <section v-if="canInvite" class="project__invite">
        <div class="project__invite-row">
          <UiButton
            theme="primary"
            :disabled="inviteLoading"
            @click="generateInviteToken"
          >
            {{ inviteLoading ? "Создание..." : "Создать приглашение" }}
          </UiButton>
          <template v-if="inviteToken">
            <code class="project__invite-link">{{ inviteLink }}</code>
            <UiButton theme="secondary" @click="copyInviteLink"
              >Копировать</UiButton
            >
          </template>
        </div>
        <p v-if="inviteError" class="project__error">{{ inviteError }}</p>
      </section>
      <section class="project__team" v-if="project">
        <h3>Команда</h3>
        <div class="project__team-list">
          <span class="project__chip project__chip_author">
            {{ project.author.firstName || project.author.email }}
            <small class="project__chip-badge">Автор</small>
          </span>
          <span
            v-for="m in project.members || []"
            :key="m.id"
            class="project__chip"
          >
            {{ m.firstName || m.email }}
          </span>
        </div>
      </section>
      <section class="project__history" v-if="project?.history">
        <h3>История изменений</h3>
        <p v-if="!project.history?.length" class="project__history-empty">
          История пока пуста
        </p>
        <ul v-else class="project__history-list">
          <li
            v-for="(h, i) in project.history"
            :key="h.id || i"
            class="project__history-item"
          >
            <span class="project__history-date">
              {{ h.createdAt ? new Date(h.createdAt).toLocaleString() : "" }}
            </span>
            <span class="project__history-user">
              {{ h.changedBy?.firstName || h.changedBy?.email || "Система" }}
            </span>
            <span class="project__history-action"
              >— {{ h.changes ? "Обновление полей" : "Изменение" }}</span
            >
          </li>
        </ul>
      </section>
      <ProjectInvite :project="project" @updated="project = $event" />
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
.project__invite {
  display: grid;
  gap: var(--space-2);
}
.project__invite-row {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  flex-wrap: wrap;
}
.project__invite-link {
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: #fff;
  font-size: 12px;
}
.project__error {
  margin: 0;
  color: var(--color-danger);
  font-size: 13px;
}
.project__team {
  display: grid;
  gap: var(--space-2);
}
.project__team-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.project__chip {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 9999px;
  background: #fff;
  font-size: 12px;
}
.project__chip_author {
  background: #ecfdf5;
  border-color: #a7f3d0;
}
.project__chip-badge {
  color: var(--muted);
}
.project__history {
  display: grid;
  gap: var(--space-2);
}
.project__history-empty {
  margin: 0;
  color: var(--muted);
}
.project__history-list {
  display: grid;
  gap: 8px;
  padding-left: 0;
  list-style: none;
}
.project__history-item {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: baseline;
}
.project__history-date {
  color: var(--muted);
  font-size: 12px;
}
.project__history-user {
  font-weight: 600;
}
.project__history-action {
  color: var(--text);
}
</style>
