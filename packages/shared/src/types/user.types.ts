export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  bio?: string;
  avatarUrl?: string;
  phone?: string;
  location?: string;
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  emailNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  bio?: string;
  phone?: string;
  location?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}
