import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Minus } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('이메일 또는 비밀번호가 일치하지 않습니다.');
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* 좌측: 브랜드 섹션 (50%) */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-900 relative overflow-hidden">
        {/* 컨텐츠 */}
        <div className="relative z-10 flex flex-col justify-center px-20 text-white w-full">
          {/* 로고 */}
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <Minus className="w-12 h-12 text-white" strokeWidth={1} />
              <h1 className="text-4xl font-light tracking-wider text-white uppercase">
                PHOMISTONE
              </h1>
            </div>
            <div className="h-px w-24 bg-white"></div>
          </div>

          {/* 서브 카피 */}
          <h2 className="text-2xl font-light tracking-wider mb-6 leading-relaxed uppercase">
            AI BASED INTERIOR<br />
            MATERIAL SIMULATION
          </h2>

          <p className="text-sm font-light tracking-wide text-white/60 mb-16 leading-loose max-w-md uppercase">
            VISUALIZE AND PROPOSE<br />
            INNOVATIVE ECO-FRIENDLY<br />
            BUILDING MATERIALS IN REAL-TIME
          </p>

          {/* 특장점 */}
          <div className="space-y-3">
            {[
              'AI AUTO STYLING',
              'REAL-TIME PREVIEW',
              'ECO-FRIENDLY MATERIALS'
            ].map((text, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-3 border-b border-white/10"
              >
                <div className="w-1 h-1 bg-white"></div>
                <span className="text-xs font-light tracking-wider text-white/80 uppercase">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 우측: 로그인 폼 (50%) */}
      <div className="flex-1 bg-white overflow-y-scroll flex justify-center items-center">
        <div className="w-full max-w-[420px] px-8">
          {/* 모바일 로고 */}
          <div className="lg:hidden text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Minus className="w-8 h-8 text-neutral-900" strokeWidth={1} />
              <h1 className="text-2xl font-light tracking-wider text-neutral-900 uppercase">
                PHOMISTONE
              </h1>
            </div>
            <p className="text-xs font-medium tracking-wider text-neutral-600 uppercase">AI Styling Solution</p>
          </div>

          {/* 로그인 카드 */}
          <div className="w-full">
            {/* 헤더 */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-medium tracking-wider text-neutral-900 mb-3 uppercase">
                LOGIN
              </h2>
              <p className="text-xs font-medium tracking-wider text-neutral-600 uppercase">
                PROFESSIONAL AI STYLING TOOL
              </p>
            </div>

            {/* 폼 */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 이메일 */}
              <div className="relative">
                <label className="block text-xs font-medium tracking-wider text-neutral-500 mb-3 uppercase">
                  EMAIL
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-0 py-3 border-b bg-transparent transition-all duration-300 focus:outline-none text-sm font-normal tracking-wide ${
                    focusedField === 'email'
                      ? 'border-neutral-900'
                      : 'border-neutral-300'
                  }`}
                  placeholder="your@email.com"
                  required
                />
              </div>

              {/* 비밀번호 */}
              <div className="relative">
                <label className="block text-xs font-medium tracking-wider text-neutral-500 mb-3 uppercase">
                  PASSWORD
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-0 py-3 border-b bg-transparent transition-all duration-300 focus:outline-none text-sm font-normal tracking-wide ${
                    focusedField === 'password'
                      ? 'border-neutral-900'
                      : 'border-neutral-300'
                  }`}
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="p-4 border border-red-900 text-red-900 text-xs font-medium tracking-wide">
                  {error}
                </div>
              )}

              {/* 로그인 버튼 */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-900 text-white text-xs font-medium tracking-wider py-4 hover:bg-neutral-800 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border border-white/30 border-t-white animate-spin"></div>
                    LOGGING IN...
                  </>
                ) : (
                  'LOGIN'
                )}
              </button>
            </form>

            {/* 하단 링크 */}
            <div className="mt-12 text-center">
              <p className="text-xs font-medium tracking-wide text-neutral-600 mb-4 uppercase">
                DON'T HAVE AN ACCOUNT?
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 text-neutral-900 text-xs font-medium tracking-wider hover:text-neutral-600 transition-colors duration-300 uppercase border-b border-neutral-900"
              >
                REGISTER
              </Link>
            </div>
          </div>

          {/* 푸터 */}
          <p className="text-center text-xs font-medium tracking-wide text-neutral-500 mt-16 uppercase">
            © 2024 PHOMISTONE. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </div>
  );
}
