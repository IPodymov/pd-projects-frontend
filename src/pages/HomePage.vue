<script setup lang="ts">
import { onMounted, computed } from "vue";
import ProjectList from "../components/ProjectList.vue";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();

const institutionInfo = computed(() => {
  if (auth.user?.group?.institution) {
    const inst = auth.user.group.institution;
    return `${inst.name} (${inst.type === "UNIVERSITY" ? "ВУЗ" : "Школа"})`;
  }
  return null;
});

onMounted(() => {
  if (!auth.user && auth.token) auth.fetchProfile();
});
</script>

<template>
  <main class="page container page_home">
    <template v-if="auth.isAuthenticated">
      <section class="home__header">
        <h1 class="home__title">Проекты</h1>
        <div class="home__subline">
          <p class="home__subtitle">
            {{
              institutionInfo
                ? `Проекты ${institutionInfo}`
                : "Все проекты платформы"
            }}
          </p>
          <router-link
            v-if="auth.isAdmin || auth.isStaff"
            class="home__create"
            :to="{ name: 'project-create' }"
            >Добавить проект</router-link
          >
        </div>
      </section>
      <ProjectList />
    </template>

    <section v-else class="promo">
      <div class="promo__content">
        <p class="promo__eyebrow">Проектная платформа</p>
        <h1 class="promo__title">
          Запускайте и развивайте проекты вместе с наставниками
        </h1>
        <p class="promo__text">
          Участвуйте в реальных инициативах, проходите модерацию и собирайте
          команду из однокурсников или коллег по вузу.
        </p>
        <ul class="promo__list">
          <li class="promo__item">
            Каталог проектов с фильтрацией по учебным заведениям
          </li>
          <li class="promo__item">Модерация от админов и сотрудников вуза</li>
          <li class="promo__item">
            Управление участниками и история изменений
          </li>
        </ul>
        <div class="promo__actions">
          <router-link
            class="promo__btn promo__btn_primary"
            :to="{ name: 'register' }"
            >Зарегистрироваться</router-link
          >
          <router-link class="promo__btn" :to="{ name: 'login' }"
            >Войти</router-link
          >
        </div>
      </div>
      <div class="promo__panel">
        <div class="promo__card">
          <p class="promo__card-title">Пример проекта</p>
          <h3 class="promo__card-name">Цифровой ассистент кафедры</h3>
          <p class="promo__card-desc">
            Автоматизируем расписание консультаций и приём заявок студентов
            через веб-панель и чат-бота.
          </p>
          <div class="promo__tags">
            <span class="promo__tag">ВУЗ</span>
            <span class="promo__tag">Автоматизация</span>
            <span class="promo__tag">Чат-бот</span>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.page {
  padding-top: var(--space-6);
  padding-bottom: var(--space-6);
}
.home__header {
  margin-bottom: var(--space-4);
}
.home__title {
  margin: 0;
  font-size: 24px;
}
.home__subtitle {
  margin: 4px 0 0;
  color: var(--muted);
}
.home__subline {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}
.home__create {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: #111827;
  color: #fff;
  text-decoration: none;
  font-size: 14px;
}

.promo {
  display: grid;
  gap: var(--space-6);
  align-items: center;
  padding: var(--space-6);
  border: 1px solid var(--border);
  border-radius: calc(var(--radius) * 1.5);
  background: var(--color-surface-2);
}
.promo__content {
  display: grid;
  gap: var(--space-3);
}
.promo__eyebrow {
  margin: 0;
  color: var(--color-primary);
  font-weight: 600;
  letter-spacing: 0.02em;
}
.promo__title {
  margin: 0;
  font-size: 28px;
  line-height: 1.2;
}
.promo__text {
  margin: 0;
  color: var(--muted);
  max-width: 720px;
}
.promo__list {
  margin: 0;
  padding-left: 18px;
  color: var(--text);
  display: grid;
  gap: var(--space-2);
}
.promo__item {
  list-style: disc;
}
.promo__actions {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}
.promo__btn {
  padding: 10px 14px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  text-decoration: none;
  color: var(--text);
  background: #fff;
  font-weight: 600;
}
.promo__btn_primary {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}
.promo__panel {
  width: 100%;
}
.promo__card {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--space-4);
  background: #fff;
  display: grid;
  gap: var(--space-2);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
}
.promo__card-title {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
}
.promo__card-name {
  margin: 0;
  font-size: 18px;
}
.promo__card-desc {
  margin: 0;
  color: var(--muted);
}
.promo__tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.promo__tag {
  padding: 4px 10px;
  border-radius: 9999px;
  background: #f3f4f6;
  font-size: 12px;
}

@media (min-width: 768px) {
  .home__title {
    font-size: 28px;
  }
  .promo {
    grid-template-columns: 1.2fr 0.8fr;
  }
  .promo__title {
    font-size: 32px;
  }
}
</style>
