<script setup>
import { useAuth } from "./store/store.js";
import router from "./router/router.js";

const { isAuthenticated, user, logout } = useAuth();
</script>

<template>
  <div class="app">
    <!-- Навигационная панель -->
    <nav v-if="isAuthenticated" class="navbar">
      <div class="navbar-brand">
        <h1>PD Projects</h1>
      </div>
      <div class="navbar-menu">
        <span class="user-info">{{ user?.name }} ({{ user?.email }})</span>
        <button @click="logout" class="logout-btn">Выход</button>
      </div>
    </nav>

    <!-- Основное содержимое -->
    <main class="main-content">
      <router-view />
    </main>
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
.navbar {
  background-color: var(--color-primary);
  color: white;
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 91, 187, 0.15);
}

.navbar-brand h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  font-size: 14px;
  opacity: 0.9;
}

.logout-btn {
  background-color: var(--color-accent);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: var(--color-accent-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 111, 0, 0.3);
}

/* Основное содержимое */
.main-content {
  flex: 1;
  overflow-y: auto;
  background-color: var(--color-background);
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 15px;
  }

  .navbar-menu {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
