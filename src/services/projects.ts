import api from "./api";
import type { Institution } from "./users";

export type ProjectStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ProjectLink {
  id?: number;
  url: string;
  description?: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  status: ProjectStatus;
  author: { id: number; email: string; firstName?: string; lastName?: string };
  institution?: Institution;
  links: ProjectLink[];
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
  async list(): Promise<Project[]> {
    const { data } = await api.get<Project[]>("/projects");
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
};
