/**
 * Auth Controller - управление авторизацией и аутентификацией
 */

import { authService } from '../services/auth';
import { usersService } from '../services/users';
import { AuthModel, type LoginDto, type RegisterDto } from '../models/Auth.model';
import { UserModel } from '../models/User.model';

export class AuthController {
  private authModel: AuthModel;
  private currentUser: UserModel | null = null;
  private loading = false;
  private error: string | null = null;

  constructor() {
    this.authModel = new AuthModel();
  }

  /**
   * Получить текущего пользователя
   */
  getCurrentUser(): UserModel | null {
    return this.currentUser;
  }

  /**
   * Проверить, авторизован ли пользователь
   */
  isAuthenticated(): boolean {
    return this.authModel.isAuthenticated();
  }

  /**
   * Получить токен
   */
  getToken(): string | null {
    return this.authModel.getToken();
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
   * Вход в систему
   */
  async login(dto: LoginDto): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const response = await authService.login(dto);
      this.authModel.setToken(response.token);
      await this.fetchProfile();
    } catch (e: any) {
      this.error = e?.response?.data?.message || 'Ошибка авторизации';
      this.authModel.clear();
      this.currentUser = null;
      throw e;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Регистрация нового пользователя
   */
  async register(dto: RegisterDto): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const response = await authService.register(dto);
      this.authModel.setToken(response.token);
      
      if (dto.userType) {
        this.authModel.setUserTypePreference(dto.userType);
      }
      
      await this.fetchProfile();
    } catch (e: any) {
      this.error = e?.response?.data?.message || 'Ошибка регистрации';
      this.authModel.clear();
      this.currentUser = null;
      throw e;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Загрузить профиль текущего пользователя
   */
  async fetchProfile(): Promise<UserModel | null> {
    if (!this.authModel.isAuthenticated()) {
      this.currentUser = null;
      return null;
    }

    this.loading = true;
    this.error = null;

    try {
      const userData = await usersService.profile();
      this.currentUser = UserModel.fromJSON(userData);
      return this.currentUser;
    } catch (e: any) {
      this.error = e?.response?.data?.message || 'Ошибка загрузки профиля';
      // Если профиль не загрузился, токен может быть невалидным
      if (e?.response?.status === 401) {
        this.logout();
      }
      throw e;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Обновить профиль текущего пользователя
   */
  async updateProfile(data: {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
  }): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const updatedUser = await usersService.updateProfile(data);
      this.currentUser = UserModel.fromJSON(updatedUser);
    } catch (e: any) {
      this.error = e?.response?.data?.message || 'Ошибка обновления профиля';
      throw e;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Выход из системы
   */
  logout(): void {
    this.authModel.clear();
    this.currentUser = null;
  }

  /**
   * Установить предпочтение типа пользователя
   */
  setUserTypePreference(type: 'UNIVERSITY' | 'SCHOOL' | null): void {
    this.authModel.setUserTypePreference(type);
  }

  /**
   * Получить предпочтение типа пользователя
   */
  getUserTypePreference(): 'UNIVERSITY' | 'SCHOOL' | null {
    return this.authModel.getUserTypePreference();
  }
}

// Синглтон контроллера авторизации
export const authController = new AuthController();
