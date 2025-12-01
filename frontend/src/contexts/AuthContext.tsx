/**
 * AuthContext - Cognito 기반 인증 컨텍스트
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AuthService from '@/services/AuthService';
import { User, LoginCredentials } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; confirmRequired?: boolean }>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 앱 시작 시 Cognito 세션 확인
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; confirmRequired?: boolean }> => {
    try {
      setError(null);
      setIsLoading(true);

      const credentials: LoginCredentials = { email, password };
      const loggedInUser = await AuthService.signIn(credentials);

      setUser(loggedInUser);
      return { success: true };
    } catch (err: unknown) {
      const error = err as Error;

      // 이메일 인증이 필요한 경우
      if (error.message === 'CONFIRM_REQUIRED') {
        return { success: false, confirmRequired: true };
      }

      setError(error.message);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await AuthService.signOut();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      // 에러가 나도 로컬 상태는 클리어
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (data: Partial<User>): Promise<boolean> => {
    if (!user) return false;

    try {
      setError(null);
      const updatedUser = await AuthService.updateUser({
        name: data.name,
        company: data.company,
        phone: data.phone,
      });

      if (updatedUser) {
        setUser(updatedUser);
        return true;
      }
      return false;
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
      return false;
    }
  }, [user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        logout,
        updateUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
