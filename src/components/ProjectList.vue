<script setup lang="ts">
import { onMounted, computed, ref } from "vue";
import ProjectCard from "./ProjectCard.vue";
import { useAuth } from "../composables";
import { projectsService, type Project } from "../services/projects";

const { user, isAdmin, isStaff } = useAuth();

const items = ref<Project[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

async function fetchAll() {
  loading.value = true;
  error.value = null;
  try {
    items.value = await projectsService.list();
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Ошибка загрузки проектов';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (!items.value.length) fetchAll();
});

async function approve(id: number) {
  await projectsService.update(id, { status: 'APPROVED' });
  await fetchAll();
}
async function reject(id: number) {
  await projectsService.update(id, { status: 'REJECTED' });
  await fetchAll();
}

const emptyText = computed(() => {
  const instType = user.value?.institution?.type;
  if (isAdmin.value || isStaff.value) return "Пока нет проектов";
  if (instType === "UNIVERSITY") return "Пока нет проектов вашего вуза";
  if (instType === "SCHOOL") return "Пока нет проектов вашей школы";
  return "Пока нет связанных с вами проектов";
});
</script>

<template>
  <section class="project-list">
    <div v-if="loading">Загрузка...</div>
    <div v-else-if="error" class="project-list__error">
      <span>{{ error }}</span>
      <button class="project-list__retry" @click="fetchAll()">
        Повторить
      </button>
    </div>
    <div v-else-if="!items.length" class="project-list__empty">
      <h3 class="project-list__empty-title">{{ emptyText }}</h3>
      <p class="project-list__empty-text">
        Как только вы создадите или к вам добавят проект, он появится здесь.
      </p>
    </div>
    <div v-else class="project-list__grid">
      <ProjectCard
        v-for="p in items"
        :key="p.id"
        :project="p"
        @approve="approve"
        @reject="reject"
      />
    </div>
  </section>
</template>

<style scoped>
.project-list__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-4);
}
.project-list__empty {
  padding: var(--space-5);
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  background: #fff;
}
.project-list__empty-title {
  margin: 0 0 var(--space-2);
  font-size: 18px;
}
.project-list__empty-text {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
}
.project-list__error {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-4);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: #fff;
}
.project-list__retry {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--color-primary);
  color: #fff;
  cursor: pointer;
}
@media (min-width: 768px) {
  .project-list__grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}
</style>
