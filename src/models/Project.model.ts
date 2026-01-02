/**
 * Project Model - представляет проект
 */

import type { User, Institution } from './User.model';

export type ProjectStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ProjectLink {
  id?: number;
  url: string;
  description?: string;
}

export interface ProjectHistoryItem {
  id?: number;
  changes?: Record<string, any>;
  changedBy?: User;
  createdAt?: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  status: ProjectStatus;
  author: User;
  institution?: Institution;
  members?: User[];
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

/**
 * Project Model Class - содержит бизнес-логику работы с проектом
 */
export class ProjectModel {
  private data: Project;

  constructor(data: Project) {
    this.data = data;
  }

  get id(): number {
    return this.data.id;
  }

  get title(): string {
    return this.data.title;
  }

  get description(): string {
    return this.data.description;
  }

  get status(): ProjectStatus {
    return this.data.status;
  }

  get author(): User {
    return this.data.author;
  }

  get authorName(): string {
    return this.data.author.firstName || this.data.author.email;
  }

  get institution(): Institution | undefined {
    return this.data.institution;
  }

  get institutionName(): string {
    if (!this.data.institution) return '';
    const type = this.data.institution.type === 'UNIVERSITY' ? 'ВУЗ' : 'Школа';
    return `${this.data.institution.name} (${type})`;
  }

  get links(): ProjectLink[] {
    return this.data.links;
  }

  get members(): User[] {
    return this.data.members || [];
  }

  get invitationToken(): string | undefined {
    return this.data.invitationToken;
  }

  isPending(): boolean {
    return this.data.status === 'PENDING';
  }

  isApproved(): boolean {
    return this.data.status === 'APPROVED';
  }

  isRejected(): boolean {
    return this.data.status === 'REJECTED';
  }

  canBeModerated(): boolean {
    return this.isPending();
  }

  isAuthor(userId: number): boolean {
    return this.data.author.id === userId;
  }

  isMember(userId: number): boolean {
    return this.members.some((m) => m.id === userId);
  }

  hasAccess(userId: number): boolean {
    return this.isAuthor(userId) || this.isMember(userId);
  }

  getData(): Project {
    return this.data;
  }

  update(dto: UpdateProjectDto): void {
    Object.assign(this.data, dto);
  }

  static fromJSON(json: Project): ProjectModel {
    return new ProjectModel(json);
  }
}
