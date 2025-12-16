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
    <div v-else class="project-list__grid">
      <ProjectCard v-for="p in projects.items" :key="p.id" :project="p" @approve="approve" @reject="reject" />
    </div>
  </section>
</template>

<style scoped>
.project-list__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--space-4); }
@media (min-width: 768px) { .project-list__grid { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); } }
</style>
