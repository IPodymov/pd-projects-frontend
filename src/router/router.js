/**
 * Роутер приложения
 * Определяет навигацию между компонентами
 */

import { createRouter, createWebHistory } from 'vue-router';
import { store } from '../store/store.js';
import Login from '../components/Login.vue';
import Register from '../components/Register.vue';
import UIDemo from '../components/UIDemo.vue';

const routes = [
  {
    path: '/',
    redirect: () => {
      // Если пользователь не авторизован, перенаправляем на логин
      return store.getters.isAuthenticated() ? '/' : '/login';
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true },
  },
  {
    path: '/ui-demo',
    name: 'UIDemo',
    component: UIDemo,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

/**
 * Глобальная навигационная гвардия
 * Проверяет права доступа перед переходом на маршрут
 */
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters.isAuthenticated();

  // Если требуется гостевой доступ, а пользователь авторизован
  if (to.meta.requiresGuest && isAuthenticated) {
    next('/');
    return;
  }

  next();
});

export default router;
