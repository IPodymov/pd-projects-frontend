import { defineStore } from "pinia";
import { authService } from "../services/auth";
import {
  usersService,
  type UserProfile,
  type UpdateProfileDto,
} from "../services/users";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: (typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null) as string | null,
    user: null as UserProfile | null,
    loading: false as boolean,
    error: null as string | null,
  }),
  getters: {
    isAuthenticated: (s) => !!s.token,
    roles: (s) => s.user?.roles?.map((r) => r.value) || [],
    isAdmin(): boolean {
      return this.roles.includes("ADMIN");
    },
    isStaff(): boolean {
      return this.roles.includes("UNIVERSITY_STAFF");
    },
  },
  actions: {
    setToken(token: string | null) {
      this.token = token;
      if (typeof window !== "undefined") {
        if (token) localStorage.setItem("token", token);
        else localStorage.removeItem("token");
      }
    },
    async login(email: string, password: string) {
      this.loading = true;
      this.error = null;
      try {
        const { token } = await authService.login({ email, password });
        this.setToken(token);
        await this.fetchProfile();
      } catch (e: any) {
        this.error = e?.response?.data?.message || "Ошибка авторизации";
        this.setToken(null);
        this.user = null;
        throw e;
      } finally {
        this.loading = false;
      }
    },
    async register(
      email: string,
      password: string,
      names?: { firstName?: string; lastName?: string; middleName?: string }
    ) {
      this.loading = true;
      this.error = null;
      try {
        const { token } = await authService.register({
          email,
          password,
          ...names,
        });
        this.setToken(token);
        await this.fetchProfile();
      } catch (e: any) {
        this.error = e?.response?.data?.message || "Ошибка регистрации";
        this.setToken(null);
        this.user = null;
        throw e;
      } finally {
        this.loading = false;
      }
    },
    async fetchProfile() {
      if (!this.token) {
        this.user = null;
        return;
      }
      try {
        this.user = await usersService.profile();
      } catch (e) {
        // token invalid -> logout
        this.logout();
      }
    },
    async updateProfile(dto: UpdateProfileDto) {
      if (!this.user) await this.fetchProfile();
      if (!this.user) throw new Error("Требуется авторизация");
      this.loading = true;
      this.error = null;
      try {
        const updated = await usersService.updateProfile(dto);
        this.user = updated;
        return updated;
      } catch (e: any) {
        this.error =
          e?.response?.data?.message || "Не удалось обновить профиль";
        throw e;
      } finally {
        this.loading = false;
      }
    },
    async changePassword(password: string) {
      return this.updateProfile({ password });
    },
    logout() {
      this.setToken(null);
      this.user = null;
    },
  },
});
