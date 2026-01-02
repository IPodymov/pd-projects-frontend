<script setup lang="ts">
import { computed, ref } from "vue";
import { useAuth } from "../composables";
import { useRouter } from "vue-router";
import { useDisplay } from "vuetify";

const { isAuthenticated, isAdmin, isStaff, logout: authLogout } = useAuth();
const router = useRouter();
const { smAndDown } = useDisplay();

const isAuth = computed(() => isAuthenticated.value);
const canManageUsers = computed(() => isAdmin.value || isStaff.value);
const isMobile = computed(() => smAndDown.value);
const drawer = ref(false);

function logout() {
  authLogout();
  router.push({ name: "home" });
  drawer.value = false;
}
</script>

<template>
  <v-app-bar elevation="0" class="nav">
    <div class="container nav__wrap">
      <RouterLink class="nav__brand" :to="{ name: 'home' }"
        >PD Projects</RouterLink
      >
      <nav v-if="!isMobile" class="nav__menu">
        <RouterLink class="nav__link" :to="{ name: 'home' }"
          >Главная</RouterLink
        >
        <RouterLink v-if="isAuth" class="nav__link" :to="{ name: 'profile' }"
          >Профиль</RouterLink
        >
        <RouterLink
          v-if="isAuth"
          class="nav__link"
          :to="{ name: 'proposal-create' }"
          >Предложить проект</RouterLink
        >
        <RouterLink
          v-if="isAuth && canManageUsers"
          class="nav__link"
          :to="{ name: 'users' }"
          >Пользователи</RouterLink
        >
        <RouterLink v-if="!isAuth" class="nav__link" :to="{ name: 'login' }"
          >Войти</RouterLink
        >
        <RouterLink v-if="!isAuth" class="nav__link" :to="{ name: 'register' }"
          >Регистрация</RouterLink
        >
        <v-btn v-if="isAuth" variant="text" @click="logout">Выйти</v-btn>
      </nav>
      <v-app-bar-nav-icon v-else @click="drawer = !drawer" />
    </div>
  </v-app-bar>

  <!-- Mobile Drawer -->
  <v-navigation-drawer v-model="drawer" temporary location="right">
    <div class="nav__drawer">
      <RouterLink
        class="nav__drawer-link"
        :to="{ name: 'home' }"
        @click="drawer = false"
        >Главная</RouterLink
      >
      <RouterLink
        v-if="isAuth"
        class="nav__drawer-link"
        :to="{ name: 'profile' }"
        @click="drawer = false"
        >Профиль</RouterLink
      >
      <RouterLink
        v-if="isAuth"
        class="nav__drawer-link"
        :to="{ name: 'proposal-create' }"
        @click="drawer = false"
        >Предложить проект</RouterLink
      >
      <RouterLink
        v-if="isAuth && canManageUsers"
        class="nav__drawer-link"
        :to="{ name: 'users' }"
        @click="drawer = false"
        >Пользователи</RouterLink
      >
      <RouterLink
        v-if="!isAuth"
        class="nav__drawer-link"
        :to="{ name: 'login' }"
        @click="drawer = false"
        >Войти</RouterLink
      >
      <RouterLink
        v-if="!isAuth"
        class="nav__drawer-link"
        :to="{ name: 'register' }"
        @click="drawer = false"
        >Регистрация</RouterLink
      >
      <v-btn v-if="isAuth" class="mt-2" variant="text" @click="logout"
        >Выйти</v-btn
      >
    </div>
  </v-navigation-drawer>
</template>

<style scoped>
.nav {
  border-bottom: 1px solid var(--color-navbar-border);
  background: var(--color-navbar-bg);
  color: var(--color-navbar-text);
  position: sticky;
  top: 0;
  z-index: 10;
}
.nav__wrap {
  padding-top: var(--space-3);
  padding-bottom: var(--space-3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}
.nav__brand {
  font-weight: 700;
  color: inherit;
}
.nav__menu {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  flex-wrap: wrap;
}
.nav__link {
  color: inherit;
}
.nav__link:hover {
  color: var(--color-primary);
  text-decoration: none;
}

.nav__drawer {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}
.nav__drawer-link {
  color: inherit;
}

@media (max-width: 640px) {
}
</style>
