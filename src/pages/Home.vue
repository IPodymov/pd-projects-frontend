<template>
  <div class="home-container">
    <div v-if="!isAuthenticated" class="guest-view">
      <h1>Добро пожаловать!</h1>
      <p>
        Для доступа к проектам, пожалуйста, авторизуйтесь или зарегистрируйтесь.
      </p>
      <div class="actions">
        <router-link to="/login" class="link-btn">Войти</router-link>
        <router-link to="/register" class="link-btn secondary"
          >Зарегистрироваться</router-link
        >
      </div>
    </div>

    <div v-else class="projects-view">
      <div class="header">
        <h1>Проекты</h1>
        <p class="subtitle">Отображаются проекты согласно вашей роли</p>
        <div class="role-badge">Роль: {{ roleLabel }}</div>
      </div>

      <ErrorMessage :message="error" @close="clearError" />

      <div v-if="isLoading" class="loading">
        <span class="spinner"></span>
        <span>Загрузка проектов...</span>
      </div>

      <div v-else>
        <div v-if="projects.length === 0" class="empty">Проекты не найдены</div>

        <div class="projects-grid">
          <ProjectCard
            v-for="project in projects"
            :key="project.id"
            :project="project"
            :userRole="role"
            :canChangeStatus="canChangeStatus"
            :canJoin="canJoin(project)"
            @view="viewProject"
            @join="handleJoinProject"
            @status-change="handleStatusChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAuth } from "../store/store.js";
import { projectService } from "../services/api.js";
import { ErrorMessage } from "../components/ui";
import ProjectCard from "../components/ProjectCard.vue";

const {
  user,
  isAuthenticated,
  isLoading: authLoading,
  error,
  clearError,
} = useAuth();
const projects = ref([]);
const isLoading = ref(false);

const role = computed(() => user.value?.role || "guest");
const userId = computed(() => user.value?.id);

const roleLabel = computed(() => {
  switch (role.value) {
    case "student":
      return "Ученик";
    case "teacher":
      return "Учитель";
    case "admin":
      return "Администратор";
    case "university_staff":
      return "Сотрудник вуза";
    default:
      return "Гость";
  }
});

const canChangeStatus = computed(() =>
  ["admin", "university_staff", "teacher"].includes(role.value)
);

const canJoin = (project) => {
  if (role.value !== "student") return false;
  if (!project.members || !Array.isArray(project.members)) return false;

  // Проверяем, не является ли пользователь уже участником
  const isMember = project.members.some((member) => member.id === userId.value);
  if (isMember) return false;

  // Проверяем лимит участников (max 3)
  if (project.members.length >= 3) return false;

  return true;
};

const loadProjects = async () => {
  if (!isAuthenticated.value) return;

  isLoading.value = true;
  try {
    const data = await projectService.getProjects();
    projects.value = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Load projects error:", err);
    projects.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadProjects();

  const reload = () => loadProjects();
  window.addEventListener("projects:reload", reload);

  onUnmounted(() => {
    window.removeEventListener("projects:reload", reload);
  });
});

const viewProject = (project) => {
  // TODO: Открыть детальную страницу проекта или модальное окно
  alert(`Проект: ${project.title}\n\nОписание:\n${project.description}`);
};

const handleJoinProject = async (project) => {
  try {
    await projectService.joinProject(project.id);
    await loadProjects();
  } catch (err) {
    console.error("Join project error:", err);
    alert(err.message || "Ошибка при вступлении в проект");
  }
};

const handleStatusChange = async (project, newStatus) => {
  try {
    await projectService.updateStatus(project.id, newStatus);
    // Обновляем статус локально
    const idx = projects.value.findIndex((p) => p.id === project.id);
    if (idx !== -1) {
      projects.value[idx].status = newStatus;
    }
  } catch (err) {
    console.error("Change status error:", err);
    alert(err.message || "Ошибка при изменении статуса");
  }
};
</script>

<style scoped>
.home-container {
  padding: 24px;
  min-height: calc(100vh - 60px);
}

.guest-view {
  max-width: 640px;
  margin: 80px auto;
  text-align: center;
}

.guest-view h1 {
  color: var(--color-text);
  margin-bottom: 16px;
}

.guest-view p {
  color: var(--color-text-secondary);
  margin-bottom: 24px;
  font-size: 16px;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
}

.link-btn {
  padding: 12px 24px;
  border-radius: 8px;
  background: var(--color-primary);
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s;
}

.link-btn:hover {
  opacity: 0.9;
}

.link-btn.secondary {
  background: var(--color-secondary);
  color: var(--color-text);
}

.projects-view {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.header h1 {
  margin: 0;
  color: var(--color-text);
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.role-badge {
  margin-left: auto;
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--color-light-gray);
  color: var(--color-text);
  font-size: 14px;
  font-weight: 500;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--color-text-secondary);
  padding: 60px 20px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-secondary);
  font-size: 16px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

@media (max-width: 1024px) {
  .projects-view {
    max-width: 960px;
  }

  .projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .home-container {
    padding: 16px;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .role-badge {
    margin-left: 0;
  }

  .projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .guest-view {
    margin: 40px auto;
  }

  .actions {
    flex-direction: column;
  }

  .link-btn {
    width: 100%;
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }
}
</style>
