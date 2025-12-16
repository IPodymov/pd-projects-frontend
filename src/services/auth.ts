import api from './api';

export interface LoginDto { email: string; password: string }
export interface RegisterDto { email: string; password: string; firstName?: string; lastName?: string; middleName?: string }

export interface AuthResponse { token: string }

export const authService = {
  async login(dto: LoginDto): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', dto);
    return data;
  },
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/registration', dto);
    return data;
  },
};
