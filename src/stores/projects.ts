import { defineStore } from "pinia";
import {
  projectsService,
  type Project,
  type ProjectStatus,
} from "../services/projects";

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
        this.items = await projectsService.list();
      } catch (e: any) {
        const status = e?.response?.status;
        if (status === 500) {
          this.error = "Не удалось загрузить проекты. Попробуйте позже.";
        } else if (status === 401 || status === 403) {
          this.error = "Недостаточно прав для просмотра проектов";
        } else {
          this.error =
            e?.response?.data?.message || "Не удалось загрузить проекты";
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
