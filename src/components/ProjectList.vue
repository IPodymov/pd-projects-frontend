<script setup lang="ts">
import { onMounted } from 'vue';
import { useProjectsStore } from '../stores/projects';
import ProjectCard from './ProjectCard.vue';

const projects = useProjectsStore();

onMounted(() => {
  if (!projects.items.length) projects.fetchAll();
});

function approve(id: number) { projects.setStatus(id, 'APPROVED'); }
function reject(id: number) { projects.setStatus(id, 'REJECTED'); }
</script>

<template>
  <section class="project-list">
    <div v-if="projects.loading">Загрузка...</div>
    <div v-else-if="projects.error">{{ projects.error }}</div>
    <div v-else-if="!projects.items.length" class="project-list__empty">
      <h3 class="project-list__empty-title">Пока нет связанных с вами проектов</h3>
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
@media (min-width: 768px) { .project-list__grid { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); } }
</style>
