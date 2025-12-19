import { defineStore } from "pinia";
import {
  projectsService,
  type Project,
  type ProjectStatus,
} from "../services/projects";
import { useAuthStore } from "./auth";

export const useProjectsStore = defineStore("projects", {
  state: () => ({
    items: [] as Project[],
    loading: false as boolean,
    error: null as string | null,
  }),
  actions: {
    async fetchAll() {
      this.loading = true;
      this.error = null;
      try {
        const auth = useAuthStore();
        // Обеспечиваем наличие профиля
        if (auth.token && !auth.user) {
          try {
            await auth.fetchProfile();
          } catch {}
        }

        // Временно запрашиваем публично (skipAuth), чтобы обойти 500 на /projects с токеном студента
        console.log("[ProjectsStore] Загружаю проекты (публично)...", {
          isAuthenticated: auth.isAuthenticated,
          hasUser: !!auth.user,
          institutionType: auth.user?.group?.institution?.type,
        });
        const data = await projectsService.list({ skipAuth: true });

        const userInstType = auth.user?.group?.institution?.type as
          | "UNIVERSITY"
          | "SCHOOL"
          | undefined;
        const isPrivileged = auth.isAdmin || auth.isStaff;

        // Клиентская фильтрация: студент/школьник видит проекты своего типа учреждения
        this.items = !isPrivileged && userInstType
          ? (data || []).filter((p) => p.institution?.type === userInstType)
          : data;
        console.log("[ProjectsStore] Проекты загружены:", this.items.length);
      } catch (e: any) {
        const status = e?.response?.status;
        const serverMessage = e?.response?.data?.message || e?.message;
        console.error("[ProjectsStore] Ошибка загрузки проектов:", {
          status,
          message: serverMessage,
          fullError: e?.response?.data,
        });
        if (status === 500) {
          this.error = `Ошибка сервера: ${
            serverMessage || "Попробуйте позже."
          }`;
        } else if (status === 401 || status === 403) {
          this.error = "Недостаточно прав для просмотра проектов";
        } else {
          this.error = serverMessage || "Не удалось загрузить проекты";
        }
      } finally {
        this.loading = false;
      }
    },
    async setStatus(id: number, status: ProjectStatus) {
      const updated = await projectsService.update(id, { status });
      const idx = this.items.findIndex((p) => p.id === id);
      if (idx !== -1) this.items[idx] = updated;
      return updated;
    },
  },
});
