import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const HomePage = () => import("../pages/HomePage.vue");
const LoginPage = () => import("../pages/LoginPage.vue");
const RegisterPage = () => import("../pages/RegisterPage.vue");
const ProfilePage = () => import("../pages/ProfilePage.vue");
const ProjectDetailsPage = () => import("../pages/ProjectDetailsPage.vue");
const ProjectCreatePage = () => import("../pages/ProjectCreatePage.vue");
const ProposalCreatePage = () => import("../pages/ProposalCreatePage.vue");
const UsersPage = () => import("../pages/UsersPage.vue");

export const routes: RouteRecordRaw[] = [
  { path: "/", name: "home", component: HomePage },
  {
    path: "/login",
    name: "login",
    component: LoginPage,
    meta: { guestOnly: true },
  },
  {
    path: "/register",
    name: "register",
    component: RegisterPage,
    meta: { guestOnly: true },
  },
  {
    path: "/profile",
    name: "profile",
    component: ProfilePage,
    meta: { requiresAuth: true },
  },
  {
    path: "/projects/new",
    name: "project-create",
    component: ProjectCreatePage,
    meta: { requiresAuth: true, roles: ["ADMIN", "UNIVERSITY_STAFF"] },
  },
  {
    path: "/projects/propose",
    name: "proposal-create",
    component: ProposalCreatePage,
    meta: { requiresAuth: true },
  },
  {
    path: "/projects/:id",
    name: "project-details",
    component: ProjectDetailsPage,
  },
  {
    path: "/users",
    name: "users",
    component: UsersPage,
    meta: { requiresAuth: true, roles: ["ADMIN", "UNIVERSITY_STAFF"] },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});
