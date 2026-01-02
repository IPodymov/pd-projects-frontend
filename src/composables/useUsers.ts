/**
 * Composable для работы с контроллером пользователей
 */

import { ref, computed, onMounted } from 'vue';
import { userController } from '../controllers/User.controller';
import type { UserModel, UpdateUserDto } from '../models/User.model';

export function useUsers(options?: { autoLoad?: boolean }) {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const users = ref<UserModel[]>([]);

  // Computed свойства
  const admins = computed(() => users.value.filter((u) => u.isAdmin()));
  const staff = computed(() => users.value.filter((u) => u.isStaff()));

  // Методы работы с пользователями
  const fetchUsers = async () => {
    loading.value = true;
    error.value = null;
    try {
      await userController.fetchUsers();
      users.value = userController.getUsers();
    } catch (e: any) {
      error.value = userController.getError();
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const fetchUser = async (id: number) => {
    loading.value = true;
    error.value = null;
    try {
      const user = await userController.fetchUser(id);
      return user;
    } catch (e: any) {
      error.value = userController.getError();
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateUser = async (id: number, dto: UpdateUserDto) => {
    loading.value = true;
    error.value = null;
    try {
      const user = await userController.updateUser(id, dto);
      users.value = userController.getUsers();
      return user;
    } catch (e: any) {
      error.value = userController.getError();
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const findUserById = (id: number) => {
    return users.value.find((u) => u.id === id);
  };

  // Автозагрузка при монтировании
  onMounted(() => {
    if (options?.autoLoad) {
      fetchUsers().catch(() => {
        // Игнорируем ошибки автозагрузки
      });
    }
  });

  return {
    // State
    loading,
    error,
    users,
    // Computed
    admins,
    staff,
    // Methods
    fetchUsers,
    fetchUser,
    updateUser,
    findUserById,
  };
}
