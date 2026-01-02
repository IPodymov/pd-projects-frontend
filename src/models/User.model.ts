/**
 * User Model - представляет пользователя системы
 */

export interface Role {
  id: number;
  value: string;
}

export interface Institution {
  id: number;
  name: string;
  type: 'UNIVERSITY' | 'SCHOOL';
}

export interface StudentGroup {
  id: number;
  name: string;
  grade?: number;
  institution: Institution;
}

export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  roles?: Role[];
  group?: StudentGroup;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
}

/**
 * User Model Class - содержит бизнес-логику работы с пользователем
 */
export class UserModel {
  private data: User;

  constructor(data: User) {
    this.data = data;
  }

  get id(): number {
    return this.data.id;
  }

  get email(): string {
    return this.data.email;
  }

  get fullName(): string {
    const parts = [this.data.lastName, this.data.firstName, this.data.middleName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : this.data.email;
  }

  get displayName(): string {
    return this.data.firstName || this.data.email;
  }

  get roles(): string[] {
    return this.data.roles?.map((r) => r.value) || [];
  }

  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isStaff(): boolean {
    return this.hasRole('UNIVERSITY_STAFF');
  }

  canModerate(): boolean {
    return this.isAdmin() || this.isStaff();
  }

  get institution(): Institution | undefined {
    return this.data.group?.institution;
  }

  getData(): User {
    return this.data;
  }

  update(dto: UpdateUserDto): void {
    Object.assign(this.data, dto);
  }

  static fromJSON(json: User): UserModel {
    return new UserModel(json);
  }
}
