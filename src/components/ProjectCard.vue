<script setup lang="ts">
import type { Project } from "../services/projects";
import { computed } from "vue";
import { useAuthStore } from "../stores/auth";

const props = defineProps<{ project: Project }>();
const emit = defineEmits<{
  (e: "approve", id: number): void;
  (e: "reject", id: number): void;
}>();

const auth = useAuthStore();
const canModerate = computed(
  () => (auth.isAdmin || auth.isStaff) && props.project.status === "PENDING"
);
</script>

<template>
  <article
    class="project-card project-card_status_"
    :class="`project-card_status_${project.status.toLowerCase()}`"
  >
    <header class="project-card__header">
      <router-link class="project-card__title" :to="{ name: 'project-details', params: { id: project.id } }">{{ project.title }}</router-link>
      <span class="project-card__badge">{{ project.status }}</span>
    </header>
    <p class="project-card__desc">{{ project.description }}</p>
    <ul class="project-card__links">
      <li
        v-for="link in project.links"
        :key="link.id"
        class="project-card__link-item"
      >
        <a class="project-card__link" :href="link.url" target="_blank">{{
          link.description || link.url
        }}</a>
      </li>
    </ul>
    <footer class="project-card__footer">
      <span class="project-card__author"
        >Автор: {{ project.author.firstName || project.author.email }}</span
      >
      <div class="project-card__actions" v-if="canModerate">
        <button
          class="btn btn_theme_success"
          @click="$emit('approve', project.id)"
        >
          Одобрить
        </button>
        <button
          class="btn btn_theme_danger"
          @click="$emit('reject', project.id)"
        >
          Отклонить
        </button>
      </div>
    </footer>
  </article>
</template>

<style scoped>
.project-card { border: 1px solid var(--border); border-radius: var(--radius); padding: var(--space-4); display: grid; gap: var(--space-2); background: #fff; }
.project-card__header { display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); flex-wrap: wrap; }
.project-card__title { margin: 0; font-size: 16px; word-break: break-word; color: inherit; text-decoration: none; }
.project-card__title:hover { text-decoration: underline; }
.project-card__badge { font-size: 12px; color: #555; background: #f3f4f6; padding: 2px 8px; border-radius: 9999px; white-space: nowrap; }
.project-card__desc { margin: 0; color: #444; font-size: 14px; }
.project-card__links { list-style: none; padding: 0; margin: 0; display: flex; gap: var(--space-2); flex-wrap: wrap; }
.project-card__link { color: #1f2937; text-decoration: underline; font-size: 13px; }
.project-card__footer { display: grid; gap: var(--space-2); }
.project-card__author { font-size: 13px; color: var(--muted); }
.project-card__actions { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); }
.btn { padding: 6px 10px; border-radius: 8px; border: 1px solid var(--border); cursor: pointer; font-size: 12px; }
.btn_theme_success { background: #ecfdf5; border-color: #34d399; }
.btn_theme_danger { background: #fef2f2; border-color: #f87171; }
.project-card_status_pending .project-card__badge { background: #fff7ed; }
.project-card_status_approved .project-card__badge { background: #ecfdf5; }
.project-card_status_rejected .project-card__badge { background: #fef2f2; }

@media (min-width: 768px) {
  .project-card__title { font-size: 18px; }
  .project-card__footer { display: flex; justify-content: space-between; align-items: center; }
  .project-card__actions { grid-template-columns: auto auto; }
  .btn { padding: 8px 12px; }
}
</style>
