<template>
  <nav class="navbar">
    <div class="nav-left">
      <router-link class="profile-link" to="/profile" title="Профиль">
        <img :src="accountIconUrl" alt="Профиль" class="profile-icon" />
      </router-link>
      <router-link class="app-title" to="/">PD Projects</router-link>
    </div>

    <div class="nav-center">
      <template v-for="item in navItems" :key="item.key">
        <router-link
          v-if="item.type === 'link'"
          :to="item.to"
          class="nav-link"
          @click="emit('navigate', item)"
        >
          {{ item.label }}
        </router-link>
      </template>
    </div>

    <div class="nav-right">
      <a
        v-if="canAddProject"
        href="#"
        class="nav-link"
        @click.prevent="emit('add-project')"
      >
        Добавить проект
      </a>

      <a
        v-if="canModerateProjects"
        href="#"
        class="nav-link accent"
        @click.prevent="emit('open-moderation')"
      >
        Премодерация
      </a>
    </div>
  </nav>
</template>

<script setup>
import { computed } from "vue";
// no direct router usage; nav links use <router-link>
import { useAuth } from "../store/store.js";
import accountIconUrl from "../assets/icons/account-icon.svg";
import { getNavLinks } from "./ui/links.js";

const { user } = useAuth();
const emit = defineEmits(["navigate", "add-project", "open-moderation"]);

const role = computed(() => user.value?.role || "guest");
const schoolId = computed(
  () => user.value?.schoolId || user.value?.school?.id || null
);

const canAddProject = computed(() =>
  ["teacher", "admin", "university_staff"].includes(role.value)
);
const canModerateProjects = computed(() =>
  ["teacher", "admin", "university_staff"].includes(role.value)
);

const navItems = computed(() => getNavLinks(role.value, schoolId.value));

const handleNavigate = (item) => {
  // оставлено для обратной совместимости трекинга
  emit("navigate", item);
};
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  z-index: 100;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.app-title {
  font-weight: 700;
  color: var(--color-text);
  text-decoration: none;
}
.app-title:hover {
  color: var(--color-primary);
}

.profile-link {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-light-gray);
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.profile-icon {
  width: 22px;
  height: 22px;
}

.nav-center {
  display: flex;
  align-items: center;
  gap: 8px;
}
.nav-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid transparent;
}
.nav-link:hover {
  text-decoration: underline;
}
.nav-link.accent {
  color: var(--color-accent);
}

@media (max-width: 768px) {
  .navbar {
    flex-wrap: wrap;
    gap: 10px;
  }
  .nav-left,
  .nav-right {
    width: 100%;
    justify-content: space-between;
  }
  .nav-center {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .app-title {
    font-size: 16px;
  }
  .profile-link {
    width: 32px;
    height: 32px;
  }
  .profile-icon {
    width: 20px;
    height: 20px;
  }
}
</style>
