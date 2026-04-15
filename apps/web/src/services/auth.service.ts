import { apiRequest } from './api-client';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      avatar?: string;
    };
    token: string;
    refreshToken: string;
  };
}

interface ResetPasswordRequest {
  email: string;
}

interface ResetPasswordConfirm {
  token: string;
  password: string;
}

export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiRequest<AuthResponse>({
      method: 'POST',
      url: '/auth/login',
      data: credentials,
    });
  },

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    return apiRequest<AuthResponse>({
      method: 'POST',
      url: '/auth/register',
      data,
    });
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    return apiRequest<void>({
      method: 'POST',
      url: '/auth/logout',
    });
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(data: ResetPasswordRequest): Promise<void> {
    return apiRequest<void>({
      method: 'POST',
      url: '/auth/reset-password',
      data,
    });
  },

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(data: ResetPasswordConfirm): Promise<void> {
    return apiRequest<void>({
      method: 'POST',
      url: '/auth/reset-password/confirm',
      data,
    });
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<AuthResponse['data']['user']> {
    const response = await apiRequest<{ success: boolean; data: AuthResponse['data']['user'] }>({
      method: 'GET',
      url: '/auth/profile',
    });
    return response.data;
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const response = await apiRequest<{ success: boolean; data: { token: string; refreshToken: string } }>({
      method: 'POST',
      url: '/auth/refresh',
      data: { refreshToken },
    });
    return response.data;
  },
};
