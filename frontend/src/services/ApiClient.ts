/**
 * API Client - JWT 토큰 자동 첨부 HTTP 클라이언트
 */

import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = import.meta.env.VITE_API_URL;

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    requestId: string;
    timestamp: string;
  };
}

interface RequestOptions {
  skipAuth?: boolean;
  headers?: Record<string, string>;
}

/**
 * 인증 헤더 생성
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();

    if (!token) {
      throw new Error('No authentication token');
    }

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  } catch {
    return {
      'Content-Type': 'application/json',
    };
  }
}

/**
 * API 응답 처리
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    const errorMessage = data.error?.message || `HTTP Error: ${response.status}`;
    const error = new Error(errorMessage) as Error & { code?: string; status?: number };
    error.code = data.error?.code;
    error.status = response.status;
    throw error;
  }

  return data.data as T;
}

/**
 * API Client
 */
export const apiClient = {
  /**
   * GET 요청
   */
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const headers = options.skipAuth
      ? { 'Content-Type': 'application/json', ...options.headers }
      : { ...(await getAuthHeaders()), ...options.headers };

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });

    return handleResponse<T>(response);
  },

  /**
   * POST 요청
   */
  async post<T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    const headers = options.skipAuth
      ? { 'Content-Type': 'application/json', ...options.headers }
      : { ...(await getAuthHeaders()), ...options.headers };

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return handleResponse<T>(response);
  },

  /**
   * PUT 요청
   */
  async put<T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    const headers = options.skipAuth
      ? { 'Content-Type': 'application/json', ...options.headers }
      : { ...(await getAuthHeaders()), ...options.headers };

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return handleResponse<T>(response);
  },

  /**
   * PATCH 요청
   */
  async patch<T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    const headers = options.skipAuth
      ? { 'Content-Type': 'application/json', ...options.headers }
      : { ...(await getAuthHeaders()), ...options.headers };

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return handleResponse<T>(response);
  },

  /**
   * DELETE 요청
   */
  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const headers = options.skipAuth
      ? { 'Content-Type': 'application/json', ...options.headers }
      : { ...(await getAuthHeaders()), ...options.headers };

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    return handleResponse<T>(response);
  },
};

export default apiClient;
