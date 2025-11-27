import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

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
    <div className="h-screen flex overflow-hidden">
      {/* 좌측: 브랜드 섹션 (50%) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-phomi-black via-phomi-gray-900 to-phomi-black relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-phomi-gold rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-phomi-gold rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* 컨텐츠 */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          {/* 로고 타이포그래피 */}
          <div className="mb-12 transform hover:scale-105 transition-transform duration-500">
            <h1 className="text-6xl font-black tracking-tight mb-2">
              PHOMI
              <span className="text-phomi-gold">STONE</span>
            </h1>
            <div className="h-1 w-32 bg-phomi-gold rounded-full"></div>
          </div>

          {/* 서브 카피 */}
          <h2 className="text-3xl font-bold mb-6 leading-tight">
            AI 기반 인테리어<br />
            자재 시뮬레이션
          </h2>

          <p className="text-lg text-white/70 mb-12 leading-relaxed max-w-md">
            포미스톤의 혁신적인 친환경 건축자재를<br />
            실시간으로 시각화하고 제안하세요.
          </p>

          {/* 특장점 */}
          <div className="space-y-4">
            {[
              { icon: '🎨', text: 'AI 자동 스타일링' },
              { icon: '⚡', text: '실시간 미리보기' },
              { icon: '🌿', text: '친환경 신소재' }
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:translate-x-2"
              >
                <span className="text-3xl">{feature.icon}</span>
                <span className="text-white/90 font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 우측: 로그인 폼 (50%) */}
      <div className="flex-1 bg-phomi-gray-50 overflow-y-scroll flex justify-center">
        <div className="w-full max-w-[448px] py-12 px-8">
          {/* 모바일 로고 */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-black text-phomi-black mb-1">
              PHOMI<span className="text-phomi-gold">STONE</span>
            </h1>
            <p className="text-phomi-gray-500 text-sm">AI 스타일링 솔루션</p>
          </div>

          {/* 로그인 카드 */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-phomi-gray-100 w-full">
            {/* 헤더 */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-phomi-gold/10 rounded-full mb-4 group hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-8 h-8 text-phomi-gold group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-phomi-black mb-2">
                로그인
              </h2>
              <p className="text-phomi-gray-500 text-sm">
                전문가용 AI 스타일링 도구
              </p>
            </div>

            {/* 폼 */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 이메일 */}
              <div className="relative">
                <label className="block text-sm font-semibold text-phomi-gray-900 mb-2">
                  이메일
                </label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                    focusedField === 'email' ? 'text-phomi-gold' : 'text-phomi-gray-300'
                  }`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                      focusedField === 'email'
                        ? 'border-phomi-gold bg-phomi-gold/5 shadow-lg shadow-phomi-gold/20'
                        : 'border-phomi-gray-100 bg-white hover:border-phomi-gray-300'
                    }`}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              {/* 비밀번호 */}
              <div className="relative">
                <label className="block text-sm font-semibold text-phomi-gray-900 mb-2">
                  비밀번호
                </label>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                    focusedField === 'password' ? 'text-phomi-gold' : 'text-phomi-gray-300'
                  }`} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                      focusedField === 'password'
                        ? 'border-phomi-gold bg-phomi-gold/5 shadow-lg shadow-phomi-gold/20'
                        : 'border-phomi-gray-100 bg-white hover:border-phomi-gray-300'
                    }`}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-shake">
                  {error}
                </div>
              )}

              {/* 로그인 버튼 */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-phomi-gold to-phomi-black text-white font-bold py-4 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    로그인 중...
                  </>
                ) : (
                  <>
                    로그인
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>
            </form>

            {/* 하단 링크 */}
            <div className="mt-8 text-center">
              <p className="text-phomi-gray-500 text-sm mb-4">
                계정이 없으신가요?
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 text-phomi-gold font-semibold hover:text-phomi-black transition-colors duration-300 group"
              >
                회원가입하기
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>

          {/* 푸터 */}
          <p className="text-center text-phomi-gray-400 text-xs mt-8">
            © 2024 Phomistone. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
