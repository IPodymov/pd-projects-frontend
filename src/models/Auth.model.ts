/**
 * Auth Model - представляет данные авторизации
 */

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  userType?: 'UNIVERSITY' | 'SCHOOL';
}

export interface AuthResponse {
  token: string;
}

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  userTypePreference: 'UNIVERSITY' | 'SCHOOL' | null;
}

/**
 * Auth Model Class - управление состоянием авторизации
 */
export class AuthModel {
  private token: string | null = null;
  private userTypePreference: 'UNIVERSITY' | 'SCHOOL' | null = null;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
      this.userTypePreference = localStorage.getItem('userTypePreference') as
        | 'UNIVERSITY'
        | 'SCHOOL'
        | null;
    }
  }

  setToken(token: string | null): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  setUserTypePreference(type: 'UNIVERSITY' | 'SCHOOL' | null): void {
    this.userTypePreference = type;
    if (typeof window !== 'undefined') {
      if (type) {
        localStorage.setItem('userTypePreference', type);
      } else {
        localStorage.removeItem('userTypePreference');
      }
    }
  }

  getUserTypePreference(): 'UNIVERSITY' | 'SCHOOL' | null {
    return this.userTypePreference;
  }

  clear(): void {
    this.setToken(null);
    this.setUserTypePreference(null);
  }

  getState(): AuthState {
    return {
      token: this.token,
      isAuthenticated: this.isAuthenticated(),
      userTypePreference: this.userTypePreference,
    };
  }
}
