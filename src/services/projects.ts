import api from "./api";
import type { Institution } from "./users";

export type ProjectStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ProjectLink {
  id?: number;
  url: string;
  description?: string;
}

export interface ProjectHistoryItem {
  id?: number;
  changes?: Partial<UpdateProjectDto> | Record<string, any>;
  changedBy?: { id: number; email: string; firstName?: string; lastName?: string };
  createdAt?: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  status: ProjectStatus;
  author: { id: number; email: string; firstName?: string; lastName?: string };
  institution?: Institution;
  members?: { id: number; email: string; firstName?: string; lastName?: string }[];
  links: ProjectLink[];
  invitationToken?: string;
  history?: ProjectHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  title: string;
  description: string;
  links: ProjectLink[];
}

export interface UpdateProjectDto {
  title?: string;
  description?: string;
  status?: ProjectStatus;
  links?: ProjectLink[];
}

export const projectsService = {
  async list(params?: { search?: string; institutionId?: number }): Promise<Project[]> {
    const { data } = await api.get<Project[]>("/projects", {
      params: {
        search: params?.search,
        institutionId: params?.institutionId,
      },
    });
    return data;
  },
  async get(id: number): Promise<Project> {
    const { data } = await api.get<Project>(`/projects/${id}`);
    return data;
  },
  async create(dto: CreateProjectDto): Promise<Project> {
    const { data } = await api.post<Project>("/projects", dto);
    return data;
  },
  async update(id: number, dto: UpdateProjectDto): Promise<Project> {
    const { data } = await api.patch<Project>(`/projects/${id}`, dto);
    return data;
  },
  async remove(id: number): Promise<void> {
    await api.delete(`/projects/${id}`);
  },
  async generateInvitation(
    id: number
  ): Promise<{ token: string }> {
    const { data } = await api.post<{ token: string }>(
      `/projects/${id}/invitation`,
      {}
    );
    return data;
  },
  async joinProject(token: string): Promise<Project> {
    const { data } = await api.post<Project>(
      `/projects/join/${token}`,
      {}
    );
    return data;
  },
};
