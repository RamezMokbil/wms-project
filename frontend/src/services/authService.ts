import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface Admin {
  id: string;
  email: string;
  name: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async register(data: RegisterData) {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async getProfile(): Promise<Admin> {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/auth/change-password', { currentPassword, newPassword });
  },

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};
