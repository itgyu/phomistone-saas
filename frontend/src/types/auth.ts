export interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  phone?: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  company: string;
  phone?: string;
}
