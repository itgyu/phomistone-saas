import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Palette, User as UserIcon, LogOut, Menu, X, Minus } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/ai-styling', label: 'AI Styling', icon: Palette },
    { path: '/profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <header className="bg-black text-white border-b border-neutral-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-center h-16">
            {/* 로고 */}
            <Link to="/dashboard" className="flex items-center gap-6 hover:opacity-80 transition-opacity duration-300">
              <Minus className="w-4 h-4 text-[#C59C6C]" strokeWidth={1} />
              <span className="text-sm font-light tracking-[0.25em] uppercase">
                Phomistone
              </span>
            </Link>

            {/* 데스크톱 네비게이션 */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-5 py-2 transition-colors duration-300 ${
                    location.pathname === item.path
                      ? 'text-white border-b-2 border-white'
                      : 'text-neutral-600 hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4" strokeWidth={1.5} />
                  <span className="text-xs font-light tracking-wider uppercase">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* 사용자 정보 & 로그아웃 */}
            <div className="hidden md:flex items-center gap-6">
              <div className="text-right border-l border-neutral-800 pl-6">
                <p className="text-xs font-light text-white tracking-wide">{user?.name}</p>
                <p className="text-[10px] font-light text-neutral-700 tracking-wider mt-0.5">{user?.company}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 border border-neutral-700 hover:border-neutral-500 transition-colors duration-300"
              >
                <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="text-xs font-light tracking-wide uppercase">Logout</span>
              </button>
            </div>

            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 border border-neutral-800 hover:border-neutral-600 transition-colors duration-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Menu className="w-5 h-5" strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-800 bg-neutral-900">
            <div className="px-6 py-6 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 transition-colors duration-300 ${
                    location.pathname === item.path
                      ? 'text-white border-l-2 border-white bg-neutral-800'
                      : 'text-neutral-600 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <item.icon className="w-4 h-4" strokeWidth={1.5} />
                  <span className="text-xs font-light tracking-wider uppercase">{item.label}</span>
                </Link>
              ))}
              <div className="pt-6 mt-6 border-t border-neutral-800">
                <div className="px-4 mb-4">
                  <p className="text-xs font-light text-white tracking-wide">{user?.name}</p>
                  <p className="text-[10px] font-light text-neutral-700 tracking-wider mt-1">{user?.company}</p>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3 text-neutral-600 hover:text-white hover:bg-neutral-800 transition-colors duration-300"
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.5} />
                  <span className="text-xs font-light tracking-wider uppercase">Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* 푸터 */}
      <footer className="bg-neutral-50 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-center gap-3">
            <Minus className="w-3 h-3 text-neutral-600" strokeWidth={1} />
            <p className="text-center text-neutral-600 text-[10px] font-light tracking-[0.2em] uppercase">
              © 2024 Phomistone. All rights reserved.
            </p>
            <Minus className="w-3 h-3 text-neutral-600" strokeWidth={1} />
          </div>
        </div>
      </footer>
    </div>
  );
}
