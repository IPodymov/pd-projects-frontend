<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useProjectsStore } from '../stores/projects';
import ProjectCard from './ProjectCard.vue';
import { useAuthStore } from '../stores/auth';

const projects = useProjectsStore();
const auth = useAuthStore();

onMounted(() => {
  if (!projects.items.length) projects.fetchAll();
});

function approve(id: number) { projects.setStatus(id, 'APPROVED'); }
function reject(id: number) { projects.setStatus(id, 'REJECTED'); }

const emptyText = computed(() => {
  const instType = auth.user?.group?.institution?.type;
  if (auth.isAdmin || auth.isStaff) return 'Пока нет проектов';
  if (instType === 'UNIVERSITY') return 'Пока нет проектов вашего вуза';
  if (instType === 'SCHOOL') return 'Пока нет проектов вашей школы';
  return 'Пока нет связанных с вами проектов';
});
</script>

<template>
  <section class="project-list">
    <div v-if="projects.loading">Загрузка...</div>
    <div v-else-if="projects.error" class="project-list__error">
      <span>{{ projects.error }}</span>
      <button class="project-list__retry" @click="projects.fetchAll()">Повторить</button>
    </div>
    <div v-else-if="!projects.items.length" class="project-list__empty">
      <h3 class="project-list__empty-title">{{ emptyText }}</h3>
      <p class="project-list__empty-text">Как только вы создадите или к вам добавят проект, он появится здесь.</p>
    </div>
    <div v-else class="project-list__grid">
      <ProjectCard v-for="p in projects.items" :key="p.id" :project="p" @approve="approve" @reject="reject" />
    </div>
  </section>
</template>

<style scoped>
.project-list__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--space-4); }
.project-list__empty { padding: var(--space-5); border: 1px dashed var(--border); border-radius: var(--radius); background: #fff; }
.project-list__empty-title { margin: 0 0 var(--space-2); font-size: 18px; }
.project-list__empty-text { margin: 0; color: var(--muted); font-size: 14px; }
.project-list__error { display: flex; gap: var(--space-3); align-items: center; padding: var(--space-4); border: 1px solid var(--border); border-radius: var(--radius); background: #fff; }
.project-list__retry { padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--color-primary); color: #fff; cursor: pointer; }
@media (min-width: 768px) { .project-list__grid { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); } }
</style>
