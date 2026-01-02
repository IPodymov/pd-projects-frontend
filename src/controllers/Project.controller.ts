/**
 * Project Controller - управление проектами
 */

import { projectsService } from '../services/projects';
import {
  ProjectModel,
  type CreateProjectDto,
  type UpdateProjectDto,
  type ProjectStatus,
} from '../models/Project.model';

export class ProjectController {
  private projects: ProjectModel[] = [];
  private currentProject: ProjectModel | null = null;
  private loading = false;
  private error: string | null = null;

  /**
   * Получить все проекты
   */
  getProjects(): ProjectModel[] {
    return this.projects;
  }

  /**
   * Получить текущий проект
   */
  getCurrentProject(): ProjectModel | null {
    return this.currentProject;
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
   * Загрузить список проектов
   */
  async fetchProjects(params?: {
    search?: string;
    institutionId?: number;
    skipAuth?: boolean;
  }): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const projectsData = await projectsService.list(params);
      this.projects = projectsData.map((p) => ProjectModel.fromJSON(p));
    } catch (e: any) {
      this.error = e?.response?.data?.message || 'Ошибка загрузки проектов';
      throw e;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Загрузить проект по ID
   */
  async fetchProject(id: number): Promise<ProjectModel> {
    this.loading = true;
    this.error = null;

    try {
      const projectData = await projectsService.get(id);
      this.currentProject = ProjectModel.fromJSON(projectData);
      return this.currentProject;
    } catch (e: any) {
      this.error = e?.response?.data?.message || 'Ошибка загрузки проекта';
      throw e;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Создать новый проект
   */
  async createProject(dto: CreateProjectDto): Promise<ProjectModel> {
    this.loading = true;
    this.error = null;

    try {
      const projectData = await projectsService.create(dto);
      const newProject = ProjectModel.fromJSON(projectData);
      this.projects.unshift(newProject);
      return newProject;
    } catch (e: any) {
      this.error = e?.response?.data?.message || 'Ошибка создания проекта';
      throw e;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Обновить проект
   */
  async updateProject(id: number, dto: UpdateProjectDto): Promise<ProjectModel> {
    this.loading = true;
    this.error = null;

    try {
      const projectData = await projectsService.update(id, dto);
      const updatedProject = ProjectModel.fromJSON(projectData);
      
      // Обновить в списке
      const index = this.projects.findIndex((p) => p.id === id);
      if (index !== -1) {
        this.projects[index] = updatedProject;
      }
      
      // Обновить текущий проект, если это он
      if (this.currentProject?.id === id) {
        this.currentProject = updatedProject;
      }
      
      return updatedProject;
    } catch (e: any) {
      this.error = e?.response?.data?.message || 'Ошибка обновления проекта';
      throw e;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Удалить проект
   */
  async deleteProject(id: number): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      await projectsService.remove(id);
      
      // Удалить из списка
      this.projects = this.projects.filter((p) => p.id !== id);
      
      // Очистить текущий проект, если это он
      if (this.currentProject?.id === id) {
        this.currentProject = null;
      }
    } catch (e: any) {
      this.error = e?.response?.data?.message || 'Ошибка удаления проекта';
      throw e;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Одобрить проект
   */
  async approveProject(id: number): Promise<void> {
    await this.updateProject(id, { status: 'APPROVED' });
  }

  /**
   * Отклонить проект
   */
  async rejectProject(id: number): Promise<void> {
    await this.updateProject(id, { status: 'REJECTED' });
  }

  /**
   * Сгенерировать токен приглашения в проект
   */
  async generateInvitation(id: number): Promise<string> {
    this.loading = true;
    this.error = null;

    try {
      const { token } = await projectsService.generateInvitation(id);
      return token;
    } catch (e: any) {
      this.error = e?.response?.data?.message || 'Ошибка генерации приглашения';
      throw e;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Присоединиться к проекту по токену
   */
  async joinProject(token: string): Promise<ProjectModel> {
    this.loading = true;
    this.error = null;

    try {
      const projectData = await projectsService.joinProject(token);
      const project = ProjectModel.fromJSON(projectData);
      
      // Добавить в список, если его там нет
      const exists = this.projects.find((p) => p.id === project.id);
      if (!exists) {
        this.projects.unshift(project);
      }
      
      return project;
    } catch (e: any) {
      this.error = e?.response?.data?.message || 'Ошибка присоединения к проекту';
      throw e;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Фильтровать проекты по статусу
   */
  filterByStatus(status: ProjectStatus): ProjectModel[] {
    return this.projects.filter((p) => p.status === status);
  }

  /**
   * Получить проекты, ожидающие модерации
   */
  getPendingProjects(): ProjectModel[] {
    return this.filterByStatus('PENDING');
  }

  /**
   * Получить одобренные проекты
   */
  getApprovedProjects(): ProjectModel[] {
    return this.filterByStatus('APPROVED');
  }

  /**
   * Очистить текущий проект
   */
  clearCurrentProject(): void {
    this.currentProject = null;
  }
}

// Синглтон контроллера проектов
export const projectController = new ProjectController();
