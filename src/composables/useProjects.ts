/**
 * Composable для работы с контроллером проектов
 */

import { ref, computed, onMounted } from 'vue';
import { projectController } from '../controllers/Project.controller';
import type { ProjectModel, CreateProjectDto, UpdateProjectDto } from '../models/Project.model';

export function useProjects(options?: { autoLoad?: boolean; projectId?: number }) {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const projects = ref<ProjectModel[]>([]);
  const currentProject = ref<ProjectModel | null>(null);

  // Computed свойства
  const pendingProjects = computed(() =>
    projects.value.filter((p) => p.isPending())
  );
  
  const approvedProjects = computed(() =>
    projects.value.filter((p) => p.isApproved())
  );

  // Методы работы с проектами
  const fetchProjects = async (params?: {
    search?: string;
    institutionId?: number;
    skipAuth?: boolean;
  }) => {
    loading.value = true;
    error.value = null;
    try {
      await projectController.fetchProjects(params);
      projects.value = projectController.getProjects();
    } catch (e: any) {
      error.value = projectController.getError();
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const fetchProject = async (id: number) => {
    loading.value = true;
    error.value = null;
    try {
      const project = await projectController.fetchProject(id);
      currentProject.value = project;
      return project;
    } catch (e: any) {
      error.value = projectController.getError();
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const createProject = async (dto: CreateProjectDto) => {
    loading.value = true;
    error.value = null;
    try {
      const project = await projectController.createProject(dto);
      projects.value = projectController.getProjects();
      return project;
    } catch (e: any) {
      error.value = projectController.getError();
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateProject = async (id: number, dto: UpdateProjectDto) => {
    loading.value = true;
    error.value = null;
    try {
      const project = await projectController.updateProject(id, dto);
      projects.value = projectController.getProjects();
      if (currentProject.value?.id === id) {
        currentProject.value = project;
      }
      return project;
    } catch (e: any) {
      error.value = projectController.getError();
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const deleteProject = async (id: number) => {
    loading.value = true;
    error.value = null;
    try {
      await projectController.deleteProject(id);
      projects.value = projectController.getProjects();
      if (currentProject.value?.id === id) {
        currentProject.value = null;
      }
    } catch (e: any) {
      error.value = projectController.getError();
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const approveProject = async (id: number) => {
    loading.value = true;
    error.value = null;
    try {
      await projectController.approveProject(id);
      projects.value = projectController.getProjects();
    } catch (e: any) {
      error.value = projectController.getError();
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const rejectProject = async (id: number) => {
    loading.value = true;
    error.value = null;
    try {
      await projectController.rejectProject(id);
      projects.value = projectController.getProjects();
    } catch (e: any) {
      error.value = projectController.getError();
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const generateInvitation = async (id: number) => {
    loading.value = true;
    error.value = null;
    try {
      const token = await projectController.generateInvitation(id);
      return token;
    } catch (e: any) {
      error.value = projectController.getError();
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const joinProject = async (token: string) => {
    loading.value = true;
    error.value = null;
    try {
      const project = await projectController.joinProject(token);
      projects.value = projectController.getProjects();
      return project;
    } catch (e: any) {
      error.value = projectController.getError();
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // Автозагрузка при монтировании
  onMounted(() => {
    if (options?.autoLoad) {
      fetchProjects().catch(() => {
        // Игнорируем ошибки автозагрузки
      });
    }
    if (options?.projectId) {
      fetchProject(options.projectId).catch(() => {
        // Игнорируем ошибки автозагрузки
      });
    }
  });

  return {
    // State
    loading,
    error,
    projects,
    currentProject,
    // Computed
    pendingProjects,
    approvedProjects,
    // Methods
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    approveProject,
    rejectProject,
    generateInvitation,
    joinProject,
  };
}
