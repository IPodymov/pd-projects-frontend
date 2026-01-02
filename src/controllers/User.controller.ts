/**
 * User Controller - управление пользователями
 */

import { usersService } from '../services/users';
import { UserModel, type UpdateUserDto } from '../models/User.model';

export class UserController {
  private users: UserModel[] = [];
  private loading = false;
  private error: string | null = null;

  /**
   * Получить всех пользователей
   */
  getUsers(): UserModel[] {
    return this.users;
  }

  /**
   * Получить состояние загрузки
   */
  isLoading(): boolean {
    return this.loading;
  }

  /**
   * Получить последнюю ошибку
   */
  getError(): string | null {
    return this.error;
  }

  /**
   * Загрузить список пользователей
   */
  async fetchUsers(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const usersData = await usersService.list();
      this.users = usersData.map((u) => UserModel.fromJSON(u));
    } catch (e: any) {
      this.error = e?.response?.data?.message || 'Ошибка загрузки пользователей';
      throw e;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Загрузить пользователя по ID
   */
  async fetchUser(id: number): Promise<UserModel> {
    this.loading = true;
    this.error = null;

    try {
      const userData = await usersService.get(id);
      return UserModel.fromJSON(userData);
    } catch (e: any) {
      this.error = e?.response?.data?.message || 'Ошибка загрузки пользователя';
      throw e;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Обновить пользователя
   */
  async updateUser(id: number, dto: UpdateUserDto): Promise<UserModel> {
    this.loading = true;
    this.error = null;

    try {
      const userData = await usersService.update(id, dto);
      const updatedUser = UserModel.fromJSON(userData);
      
      // Обновить в списке
      const index = this.users.findIndex((u) => u.id === id);
      if (index !== -1) {
        this.users[index] = updatedUser;
      }
      
      return updatedUser;
    } catch (e: any) {
      this.error = e?.response?.data?.message || 'Ошибка обновления пользователя';
      throw e;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Найти пользователя по ID в загруженном списке
   */
  findUserById(id: number): UserModel | undefined {
    return this.users.find((u) => u.id === id);
  }

  /**
   * Фильтровать пользователей по роли
   */
  filterByRole(role: string): UserModel[] {
    return this.users.filter((u) => u.hasRole(role));
  }

  /**
   * Получить администраторов
   */
  getAdmins(): UserModel[] {
    return this.filterByRole('ADMIN');
  }

  /**
   * Получить сотрудников университета
   */
  getStaff(): UserModel[] {
    return this.filterByRole('UNIVERSITY_STAFF');
  }
}

// Синглтон контроллера пользователей
export const userController = new UserController();
