import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  // 로딩 중에는 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-phomi-gray-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-phomi-gold/30 border-t-phomi-gold rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-phomi-gray-500 font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우에만 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
