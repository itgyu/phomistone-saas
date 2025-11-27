import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '@/services/AuthService';
import { Mail, Lock, User, Building, Phone, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    company: '',
    phone: '',
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      let strength = 0;
      if (value.length >= 6) strength++;
      if (value.length >= 10) strength++;
      if (/[A-Z]/.test(value)) strength++;
      if (/[0-9]/.test(value)) strength++;
      if (/[^A-Za-z0-9]/.test(value)) strength++;
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);

    try {
      AuthService.register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        company: formData.company,
        phone: formData.phone,
      });

      alert('🎉 회원가입이 완료되었습니다!');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = formData.password && formData.passwordConfirm && formData.password === formData.passwordConfirm;

  const getStrengthColor = (level: number) => {
    if (level <= 1) return 'bg-red-500';
    if (level <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return '약함';
    if (passwordStrength <= 3) return '보통';
    return '강함';
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* 좌측: 브랜드 섹션 (50%) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-phomi-black via-phomi-gray-900 to-phomi-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-phomi-gold rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-phomi-gold rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-12 transform hover:scale-105 transition-transform duration-500">
            <h1 className="text-6xl font-black tracking-tight mb-2">
              PHOMI
              <span className="text-phomi-gold">STONE</span>
            </h1>
            <div className="h-1 w-32 bg-phomi-gold rounded-full"></div>
          </div>

          <h2 className="text-3xl font-bold mb-6 leading-tight">
            지금 시작하세요<br />
            무료로
          </h2>

          <p className="text-lg text-white/70 mb-12 leading-relaxed max-w-md">
            혁신적인 AI 인테리어 솔루션으로<br />
            프로젝트를 한 단계 업그레이드하세요.
          </p>

          <div className="space-y-4">
            {[
              { icon: '✨', text: '무료 회원가입' },
              { icon: '🚀', text: '즉시 사용 가능' },
              { icon: '💼', text: '전문가 도구' }
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

      {/* 우측: 회원가입 폼 (50%) */}
      <div className="flex-1 flex items-center justify-center p-8 bg-phomi-gray-50 overflow-y-auto">
        <div className="w-full max-w-[448px] my-auto">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-black text-phomi-black mb-1">
              PHOMI<span className="text-phomi-gold">STONE</span>
            </h1>
            <p className="text-phomi-gray-500 text-sm">AI 스타일링 솔루션</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-phomi-gray-100 w-full">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-phomi-gold/10 rounded-full mb-4 group hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-8 h-8 text-phomi-gold group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-phomi-black mb-2">
                회원가입
              </h2>
              <p className="text-phomi-gray-500 text-sm">
                전문가용 계정 만들기
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 이메일 */}
              <div>
                <label className="block text-sm font-semibold text-phomi-gray-900 mb-2">
                  이메일 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                    focusedField === 'email' ? 'text-phomi-gold' : 'text-phomi-gray-300'
                  }`} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
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
              <div>
                <label className="block text-sm font-semibold text-phomi-gray-900 mb-2">
                  비밀번호 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                    focusedField === 'password' ? 'text-phomi-gold' : 'text-phomi-gray-300'
                  }`} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                      focusedField === 'password'
                        ? 'border-phomi-gold bg-phomi-gold/5 shadow-lg shadow-phomi-gold/20'
                        : 'border-phomi-gray-100 bg-white hover:border-phomi-gray-300'
                    }`}
                    placeholder="최소 6자 이상"
                    required
                  />
                </div>

                {/* 비밀번호 강도 표시 */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            level <= passwordStrength ? getStrengthColor(passwordStrength) : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-phomi-gray-500">
                      강도: {getStrengthText()}
                    </p>
                  </div>
                )}
              </div>

              {/* 비밀번호 확인 */}
              <div>
                <label className="block text-sm font-semibold text-phomi-gray-900 mb-2">
                  비밀번호 확인 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                    focusedField === 'passwordConfirm' ? 'text-phomi-gold' : 'text-phomi-gray-300'
                  }`} />
                  <input
                    type="password"
                    name="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('passwordConfirm')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                      focusedField === 'passwordConfirm'
                        ? 'border-phomi-gold bg-phomi-gold/5 shadow-lg shadow-phomi-gold/20'
                        : 'border-phomi-gray-100 bg-white hover:border-phomi-gray-300'
                    }`}
                    placeholder="비밀번호 재입력"
                    required
                  />
                  {formData.passwordConfirm && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {passwordsMatch ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-red-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 이름 */}
              <div>
                <label className="block text-sm font-semibold text-phomi-gray-900 mb-2">
                  이름 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                    focusedField === 'name' ? 'text-phomi-gold' : 'text-phomi-gray-300'
                  }`} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                      focusedField === 'name'
                        ? 'border-phomi-gold bg-phomi-gold/5 shadow-lg shadow-phomi-gold/20'
                        : 'border-phomi-gray-100 bg-white hover:border-phomi-gray-300'
                    }`}
                    placeholder="홍길동"
                    required
                  />
                </div>
              </div>

              {/* 회사명 */}
              <div>
                <label className="block text-sm font-semibold text-phomi-gray-900 mb-2">
                  회사명 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                    focusedField === 'company' ? 'text-phomi-gold' : 'text-phomi-gray-300'
                  }`} />
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('company')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                      focusedField === 'company'
                        ? 'border-phomi-gold bg-phomi-gold/5 shadow-lg shadow-phomi-gold/20'
                        : 'border-phomi-gray-100 bg-white hover:border-phomi-gray-300'
                    }`}
                    placeholder="회사명 또는 소속"
                    required
                  />
                </div>
              </div>

              {/* 연락처 */}
              <div>
                <label className="block text-sm font-semibold text-phomi-gray-900 mb-2">
                  연락처 <span className="text-phomi-gray-400">(선택)</span>
                </label>
                <div className="relative">
                  <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                    focusedField === 'phone' ? 'text-phomi-gold' : 'text-phomi-gray-300'
                  }`} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                      focusedField === 'phone'
                        ? 'border-phomi-gold bg-phomi-gold/5 shadow-lg shadow-phomi-gold/20'
                        : 'border-phomi-gray-100 bg-white hover:border-phomi-gray-300'
                    }`}
                    placeholder="010-1234-5678"
                  />
                </div>
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-shake">
                  {error}
                </div>
              )}

              {/* 회원가입 버튼 */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-phomi-gold to-phomi-black text-white font-bold py-4 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    가입 중...
                  </>
                ) : (
                  <>
                    회원가입 완료
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>
            </form>

            {/* 하단 링크 */}
            <div className="mt-8 text-center">
              <p className="text-phomi-gray-500 text-sm mb-4">
                이미 계정이 있으신가요?
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-phomi-gold font-semibold hover:text-phomi-black transition-colors duration-300 group"
              >
                로그인하기
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>

          <p className="text-center text-phomi-gray-400 text-xs mt-8">
            © 2024 Phomistone. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
