import api from "./api";

export interface Institution {
  id: number;
  name: string;
  type: "UNIVERSITY" | "SCHOOL";
}

export interface StudentGroup {
  id: number;
  name: string;
  grade?: number;
  institution: Institution;
}

export interface UserProfile {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  roles?: { id: number; value: string }[];
  group?: StudentGroup;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
}

export type UpdateProfileDto = UpdateUserDto;

export const usersService = {
  async profile(): Promise<UserProfile> {
    const { data } = await api.get<UserProfile>("/users/profile");
    return data;
  },
  async updateProfile(dto: UpdateProfileDto): Promise<UserProfile> {
    const { data } = await api.patch<UserProfile>("/users/profile", dto);
    return data;
  },
  async list(): Promise<UserProfile[]> {
    const { data } = await api.get<UserProfile[]>("/users");
    return data;
  },
  async get(id: number): Promise<UserProfile> {
    const { data } = await api.get<UserProfile>(`/users/${id}`);
    return data;
  },
  async update(id: number, dto: UpdateUserDto): Promise<UserProfile> {
    const { data } = await api.patch<UserProfile>(`/users/${id}`, dto);
    return data;
  },
};
