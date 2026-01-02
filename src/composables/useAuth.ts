/**
 * Composable для работы с контроллером авторизации
 */

import { ref, computed, onMounted } from 'vue';
import { authController } from '../controllers/Auth.controller';
import type { LoginDto, RegisterDto } from '../models/Auth.model';
import type { UserModel } from '../models/User.model';

export function useAuth() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const user = ref<UserModel | null>(null);

  // Computed свойства
  const isAuthenticated = computed(() => authController.isAuthenticated());
  const token = computed(() => authController.getToken());

  // Методы авторизации
  const login = async (dto: LoginDto) => {
    loading.value = true;
    error.value = null;
    try {
      await authController.login(dto);
      user.value = authController.getCurrentUser();
    } catch (e: any) {
      error.value = authController.getError();
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const register = async (dto: RegisterDto) => {
    loading.value = true;
    error.value = null;
    try {
      await authController.register(dto);
      user.value = authController.getCurrentUser();
    } catch (e: any) {
      error.value = authController.getError();
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    authController.logout();
    user.value = null;
  };

  const fetchProfile = async () => {
    loading.value = true;
    error.value = null;
    try {
      const profile = await authController.fetchProfile();
      user.value = profile;
      return profile;
    } catch (e: any) {
      error.value = authController.getError();
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateProfile = async (data: {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
  }) => {
    loading.value = true;
    error.value = null;
    try {
      await authController.updateProfile(data);
      user.value = authController.getCurrentUser();
    } catch (e: any) {
      error.value = authController.getError();
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const setUserTypePreference = (type: 'UNIVERSITY' | 'SCHOOL' | null) => {
    authController.setUserTypePreference(type);
  };

  const getUserTypePreference = () => {
    return authController.getUserTypePreference();
  };

  // Загрузить профиль при монтировании, если есть токен
  onMounted(() => {
    if (isAuthenticated.value && !user.value) {
      fetchProfile().catch(() => {
        // Игнорируем ошибки при автоматической загрузке
      });
    } else {
      user.value = authController.getCurrentUser();
    }
  });

  return {
    // State
    loading,
    error,
    user,
    // Computed
    isAuthenticated,
    token,
    // Computed из модели пользователя
    isAdmin: computed(() => user.value?.isAdmin() || false),
    isStaff: computed(() => user.value?.isStaff() || false),
    canModerate: computed(() => user.value?.canModerate() || false),
    roles: computed(() => user.value?.roles || []),
    // Methods
    login,
    register,
    logout,
    fetchProfile,
    updateProfile,
    setUserTypePreference,
    getUserTypePreference,
  };
}
