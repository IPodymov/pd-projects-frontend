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

        // Теперь бекенд поддерживает кеширование и фильтрацию по ролям, поэтому передаем токен (без skipAuth)
        console.log("[ProjectsStore] Загружаю проекты...", {
          isAuthenticated: auth.isAuthenticated,
          hasUser: !!auth.user,
          institutionType: auth.user?.group?.institution?.type,
        });

        // Передаем institutionId для студентов/школьников, чтобы бекенд мог корректно отфильтровать/закешировать
        // (хотя бекенд должен уметь брать это из токена, явная передача может помочь избежать ошибок или улучшить кеширование)
        const isPrivileged = auth.isAdmin || auth.isStaff;
        const institutionId = !isPrivileged
          ? auth.user?.group?.institution?.id
          : undefined;

        const data = await projectsService.list(
          institutionId ? { institutionId } : {},
        );

        // Фильтрация теперь происходит на стороне сервера
        this.items = data || [];
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
