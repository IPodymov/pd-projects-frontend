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

      <div class="toolbar">
        <BaseButton v-if="canPropose" variant="accent" @click="openProposeModal"
          >Предложить проект</BaseButton
        >
      </div>

      <div v-if="isLoading" class="loading">
        <span class="spinner"></span>
        <span>Загрузка проектов...</span>
      </div>

      <div v-else>
        <div v-if="filteredProjects.length === 0" class="empty">
          Проекты не найдены
        </div>

        <div class="projects-grid">
          <div
            v-for="project in filteredProjects"
            :key="project.id"
            class="project-card"
          >
            <div class="project-header">
              <h3>{{ project.title }}</h3>
              <span class="status" :class="project.status">{{
                statusLabel(project.status)
              }}</span>
            </div>
            <p class="description">{{ project.description }}</p>

            <div class="meta">
              <span
                >Школа:
                {{ project.school?.name || project.schoolName || "—" }}</span
              >
            </div>

            <div class="card-actions">
              <BaseButton variant="secondary" @click="viewProject(project)"
                >Подробнее</BaseButton
              >
              <BaseCombobox
                v-if="canChangeStatus"
                v-model="statusSelections[project.id]"
                :options="statusOptions"
                valueKey="value"
                displayKey="label"
                :searchable="false"
                placeholder="Сменить статус"
                @change="({ value }) => changeStatus(project, value)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Простейшие модальные окна-заглушки -->
      <div v-if="showPropose" class="modal">
        <div class="modal-content">
          <h3>Предложить проект</h3>
          <BaseInput v-model="newProject.title" label="Название" required />
          <BaseInput
            v-model="newProject.description"
            label="Описание"
            required
          />
          <div class="modal-actions">
            <BaseButton
              variant="primary"
              :loading="modalLoading"
              @click="submitPropose"
              >Отправить</BaseButton
            >
            <BaseButton variant="secondary" @click="closeProposeModal"
              >Отмена</BaseButton
            >
          </div>
        </div>
      </div>

      
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAuth } from "../store/store.js";
import { projectService, apiCall } from "../services/api.js";
import {
  BaseButton,
  BaseInput,
  BaseCombobox,
  ErrorMessage,
} from "../components/ui";

const {
  user,
  isAuthenticated,
  isLoading: authLoading,
  error,
  clearError,
} = useAuth();
const projects = ref([]);
const isLoading = ref(false);

const statusOptions = [
  { value: "draft", label: "Черновик" },
  { value: "pending", label: "На рассмотрении" },
  { value: "approved", label: "Одобрен" },
  { value: "rejected", label: "Отклонён" },
];
const statusSelections = ref({});

const role = computed(() => user.value?.role || "guest");
const schoolId = computed(
  () => user.value?.schoolId || user.value?.school?.id || null
);

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

const canPropose = computed(() => role.value === "student");
const canCreateDirect = computed(() =>
  ["teacher", "admin", "university_staff"].includes(role.value)
);
const canChangeStatus = computed(() =>
  ["admin", "university_staff"].includes(role.value)
);

const moderationMode = ref(false);
const filteredProjects = computed(() => {
  const list = moderationMode.value
    ? projects.value.filter((p) => p.status === "pending")
    : projects.value;
  if (["admin", "university_staff"].includes(role.value)) {
    return list;
  }
  if (role.value === "teacher") {
    return list.filter((p) => (p.schoolId || p.school?.id) === schoolId.value);
  }
  if (role.value === "student") {
    // Ученик видит проекты своей школы и доступные ему (можно расширить по классам/учителям)
    return list.filter((p) => (p.schoolId || p.school?.id) === schoolId.value);
  }
  return [];
});

const statusLabel = (status) => {
  const item = statusOptions.find((s) => s.value === status);
  return item ? item.label : status;
};

const loadProjects = async () => {
  isLoading.value = true;
  try {
    // Предпочтительно использовать сервис
    const list =
      (await projectService.getAllProjects?.()) || projectService.getProjects();
    projects.value = Array.isArray(list) ? list : list?.projects || [];
    // Инициализация выбора статуса
    statusSelections.value = Object.fromEntries(
      projects.value.map((p) => [p.id, p.status])
    );
  } catch (err) {
    console.error("Load projects error:", err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (isAuthenticated.value) {
    loadProjects();
  }
  const reload = () => loadProjects();
  window.addEventListener("projects:reload", reload);
  // cleanup
  onUnmounted(() => window.removeEventListener("projects:reload", reload));
});

// Модалки
const showPropose = ref(false);
const modalLoading = ref(false);
const newProject = ref({ title: "", description: "" });

const openProposeModal = () => {
  showPropose.value = true;
};
const closeProposeModal = () => {
  showPropose.value = false;
  newProject.value = { title: "", description: "" };
};

const submitPropose = async () => {
  modalLoading.value = true;
  try {
    await apiCall("/api/projects/propose", {
      method: "POST",
      body: newProject.value,
    });
    closeProposeModal();
    await loadProjects();
  } catch (err) {
    console.error("Propose project error:", err);
  } finally {
    modalLoading.value = false;
  }
};


const viewProject = (project) => {
  alert(`Проект: ${project.title}\n\nОписание:\n${project.description}`);
};

const changeStatus = async (project, status) => {
  try {
    await apiCall(`/api/projects/${project.id}/status`, {
      method: "PATCH",
      body: { status },
    });
    statusSelections.value[project.id] = status;
  } catch (err) {
    console.error("Change status error:", err);
  }
};

// Навбар события
const toggleModeration = () => {
  moderationMode.value = !moderationMode.value;
};
const handleNav = (item) => {
  // Заглушка: навигация обрабатывается внутри NavBar, тут можно добавить трекинг
};
</script>

<style scoped>
.home-container {
  padding: 24px;
}
.guest-view {
  max-width: 640px;
  margin: 40px auto;
  text-align: center;
}
.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
}
.link-btn {
  padding: 10px 16px;
  border-radius: 8px;
  background: var(--color-primary);
  color: #fff;
  text-decoration: none;
  font-weight: 600;
}
.link-btn.secondary {
  background: var(--color-secondary);
  color: var(--color-text);
}

.projects-view {
  max-width: 1100px;
  margin: 0 auto;
}
.header {
  display: flex;
  align-items: center;
  gap: 16px;
}
.header h1 {
  margin: 0;
}
.subtitle {
  color: #666;
}
.role-badge {
  margin-left: auto;
  padding: 6px 10px;
  border-radius: 6px;
  background: var(--color-light-gray);
  color: var(--color-text);
  font-size: 13px;
}

.toolbar {
  display: flex;
  gap: 10px;
  margin: 16px 0;
}
.loading {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
}
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.project-card {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 16px;
  background: var(--color-background);
}
.project-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.status {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
}
.status.approved {
  background: #e8f5e9;
  color: var(--color-success);
}
.status.pending {
  background: #fff8e1;
  color: #f57c00;
}
.status.rejected {
  background: #fdecea;
  color: var(--color-error);
}
.status.draft {
  background: #eceff1;
  color: #607d8b;
}
.description {
  color: #555;
  margin: 8px 0 12px;
}
.meta {
  color: #777;
  font-size: 13px;
}
.card-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 10px;
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  width: 520px;
  max-width: 90vw;
  background: var(--color-background);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}
.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

@media (max-width: 1024px) {
  .projects-view {
    max-width: 920px;
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
  .toolbar {
    flex-wrap: wrap;
  }
  .projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 12px;
  }
  .card-actions {
    flex-wrap: wrap;
  }
  .modal-content {
    width: 480px;
    max-width: 95vw;
  }
}

@media (max-width: 480px) {
  .projects-view {
    max-width: 100%;
  }
  .projects-grid {
    grid-template-columns: 1fr;
  }
  .modal-content {
    width: 100%;
    max-width: 96vw;
    padding: 16px;
  }
}
</style>
