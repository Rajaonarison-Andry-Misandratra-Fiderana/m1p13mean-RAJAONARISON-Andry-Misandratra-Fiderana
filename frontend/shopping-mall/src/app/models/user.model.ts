export interface User {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'boutique' | 'acheteur';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'boutique' | 'acheteur';
}
