/**
 * Роутер приложения
 * Определяет навигацию между компонентами
 */

import { createRouter, createWebHistory } from 'vue-router';
import { store } from '../store/store.js';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import UIDemo from '../pages/UIDemo.vue';
import Home from '../pages/Home.vue';
import Profile from '../pages/Profile.vue';
import Users from '../pages/Users.vue';
import Schools from '../pages/Schools.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
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
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
  },
  {
    path: '/users',
    name: 'Users',
    component: Users,
    meta: { requiresAdmin: true },
  },
  {
    path: '/schools',
    name: 'Schools',
    component: Schools,
    meta: { requiresAdmin: true },
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
  const user = store.state.user;

  // Если требуется гостевой доступ, а пользователь авторизован
  if (to.meta.requiresGuest && isAuthenticated) {
    next('/');
    return;
  }

  // Если требуется админ доступ
  if (to.meta.requiresAdmin) {
    if (!isAuthenticated) {
      next('/login');
      return;
    }
    if (user?.role !== 'admin' && user?.role !== 'university_staff') {
      next('/');
      return;
    }
  }

  next();
});

export default router;
