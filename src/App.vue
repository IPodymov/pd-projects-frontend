<script setup>
import { ref } from "vue";
import { useAuth } from "./store/store.js";
import router from "./router/router.js";
import NavBar from "./components/NavBar.vue";
import CreateProjectModal from "./components/CreateProjectModal.vue";
import { projectService } from "./services/api.js";

const { isAuthenticated, user, logout } = useAuth();

const showCreateModal = ref(false);
const openCreateModal = () => (showCreateModal.value = true);
const closeCreateModal = () => (showCreateModal.value = false);

const handleCreateSubmit = async (payload) => {
  try {
    await projectService.createProject(payload);
    closeCreateModal();
    window.dispatchEvent(new CustomEvent("projects:reload"));
  } catch (e) {
    console.error("Create project failed", e);
  }
};
</script>

<template>
  <div class="app">
    <!-- Навигационная панель -->
    <NavBar v-if="isAuthenticated" @add-project="openCreateModal" />

    <!-- Основное содержимое -->
    <main class="main-content">
      <router-view />
    </main>

    <CreateProjectModal
      v-if="showCreateModal"
      @close="closeCreateModal"
      @submit="handleCreateSubmit"
    />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  height: 100%;
}

.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text);
  font-family: var(--font-family, "Onest", system-ui, sans-serif);
}

/* Навигационная панель */
/* Навбар вынесен в компонент NavBar */

/* Основное содержимое */
.main-content {
  flex: 1;
  overflow-y: auto;
  background-color: var(--color-background);
}

/* Адаптивность управляется внутри NavBar */
</style>
