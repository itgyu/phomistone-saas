import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '@/services/AuthService';
import { Minus, Check } from 'lucide-react';

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

      alert('회원가입이 완료되었습니다!');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = formData.password && formData.passwordConfirm && formData.password === formData.passwordConfirm;

  const getStrengthColor = (level: number) => {
    if (level <= 1) return 'bg-red-900';
    if (level <= 3) return 'bg-yellow-700';
    return 'bg-green-900';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return 'WEAK';
    if (passwordStrength <= 3) return 'MEDIUM';
    return 'STRONG';
  };

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* 좌측: 브랜드 섹션 (50%) */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-900 relative overflow-hidden">
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
            START NOW<br />
            FOR FREE
          </h2>

          <p className="text-sm font-light tracking-wide text-white/60 mb-16 leading-loose max-w-md uppercase">
            UPGRADE YOUR PROJECT<br />
            WITH INNOVATIVE AI<br />
            INTERIOR SOLUTION
          </p>

          {/* 특장점 */}
          <div className="space-y-3">
            {[
              'FREE REGISTRATION',
              'INSTANT ACCESS',
              'PROFESSIONAL TOOLS'
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

      {/* 우측: 회원가입 폼 (50%) */}
      <div className="flex-1 bg-white overflow-y-scroll flex justify-center">
        <div className="w-full max-w-[420px] py-8 px-4 md:py-12 md:px-8">
          {/* 모바일 로고 */}
          <div className="lg:hidden text-center mb-8 md:mb-12">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Minus className="w-6 h-6 md:w-8 md:h-8 text-neutral-900" strokeWidth={1} />
              <h1 className="text-xl md:text-2xl font-light tracking-wider text-neutral-900 uppercase">
                PHOMISTONE
              </h1>
            </div>
            <p className="text-xs font-normal tracking-wider text-neutral-600 uppercase">AI Styling Solution</p>
          </div>

          {/* 회원가입 카드 */}
          <div className="w-full">
            {/* 헤더 */}
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-medium tracking-wider text-neutral-900 mb-3 uppercase">
                REGISTER
              </h2>
              <p className="text-xs font-normal tracking-wider text-neutral-600 uppercase">
                CREATE PROFESSIONAL ACCOUNT
              </p>
            </div>

            {/* 폼 */}
            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
              {/* 이메일 */}
              <div>
                <label className="block text-xs font-medium tracking-wider text-neutral-500 mb-3 uppercase">
                  EMAIL <span className="text-red-900">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-0 py-3 border-b bg-transparent transition-all duration-300 focus:outline-none text-base md:text-sm font-normal tracking-wide text-neutral-700 ${
                    focusedField === 'email'
                      ? 'border-neutral-900'
                      : 'border-neutral-300'
                  }`}
                  placeholder="your@email.com"
                  required
                />
              </div>

              {/* 비밀번호 */}
              <div>
                <label className="block text-xs font-medium tracking-wider text-neutral-500 mb-3 uppercase">
                  PASSWORD <span className="text-red-900">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-0 py-3 border-b bg-transparent transition-all duration-300 focus:outline-none text-base md:text-sm font-normal tracking-wide text-neutral-700 ${
                    focusedField === 'password'
                      ? 'border-neutral-900'
                      : 'border-neutral-300'
                  }`}
                  placeholder="MINIMUM 6 CHARACTERS"
                  required
                />

                {/* 비밀번호 강도 표시 */}
                {formData.password && (
                  <div className="mt-3">
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-px flex-1 transition-all duration-300 ${
                            level <= passwordStrength ? getStrengthColor(passwordStrength) : 'bg-neutral-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs font-normal tracking-wider text-neutral-600 uppercase">
                      STRENGTH: {getStrengthText()}
                    </p>
                  </div>
                )}
              </div>

              {/* 비밀번호 확인 */}
              <div>
                <label className="block text-xs font-medium tracking-wider text-neutral-500 mb-3 uppercase">
                  CONFIRM PASSWORD <span className="text-red-900">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('passwordConfirm')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-0 py-3 pr-8 border-b bg-transparent transition-all duration-300 focus:outline-none text-base md:text-sm font-normal tracking-wide text-neutral-700 ${
                      focusedField === 'passwordConfirm'
                        ? 'border-neutral-900'
                        : 'border-neutral-300'
                    }`}
                    placeholder="RE-ENTER PASSWORD"
                    required
                  />
                  {formData.passwordConfirm && passwordsMatch && (
                    <Check className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-green-900" strokeWidth={1} />
                  )}
                </div>
              </div>

              {/* 이름 */}
              <div>
                <label className="block text-xs font-medium tracking-wider text-neutral-500 mb-3 uppercase">
                  NAME <span className="text-red-900">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-0 py-3 border-b bg-transparent transition-all duration-300 focus:outline-none text-base md:text-sm font-normal tracking-wide text-neutral-700 ${
                    focusedField === 'name'
                      ? 'border-neutral-900'
                      : 'border-neutral-300'
                  }`}
                  placeholder="JOHN DOE"
                  required
                />
              </div>

              {/* 회사명 */}
              <div>
                <label className="block text-xs font-medium tracking-wider text-neutral-500 mb-3 uppercase">
                  COMPANY <span className="text-red-900">*</span>
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('company')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-0 py-3 border-b bg-transparent transition-all duration-300 focus:outline-none text-base md:text-sm font-normal tracking-wide text-neutral-700 ${
                    focusedField === 'company'
                      ? 'border-neutral-900'
                      : 'border-neutral-300'
                  }`}
                  placeholder="COMPANY NAME OR AFFILIATION"
                  required
                />
              </div>

              {/* 연락처 */}
              <div>
                <label className="block text-xs font-medium tracking-wider text-neutral-500 mb-3 uppercase">
                  PHONE <span className="text-neutral-500">(OPTIONAL)</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-0 py-3 border-b bg-transparent transition-all duration-300 focus:outline-none text-base md:text-sm font-normal tracking-wide text-neutral-700 ${
                    focusedField === 'phone'
                      ? 'border-neutral-900'
                      : 'border-neutral-300'
                  }`}
                  placeholder="010-1234-5678"
                />
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="p-4 border border-red-900 text-red-900 text-xs font-normal tracking-wide">
                  {error}
                </div>
              )}

              {/* 회원가입 버튼 */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-900 text-white text-xs font-medium tracking-wider py-3.5 md:py-4 hover:bg-neutral-800 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase mt-6 md:mt-8"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border border-white/30 border-t-white animate-spin"></div>
                    REGISTERING...
                  </>
                ) : (
                  'COMPLETE REGISTRATION'
                )}
              </button>
            </form>

            {/* 하단 링크 */}
            <div className="mt-8 md:mt-12 text-center">
              <p className="text-xs font-normal tracking-wide text-neutral-600 mb-4 uppercase">
                ALREADY HAVE AN ACCOUNT?
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-neutral-900 text-xs font-medium tracking-wider hover:text-neutral-600 transition-colors duration-300 uppercase border-b border-neutral-900"
              >
                LOGIN
              </Link>
            </div>
          </div>

          {/* 푸터 */}
          <p className="text-center text-xs font-normal tracking-wide text-neutral-500 mt-12 md:mt-16 uppercase">
            © 2024 PHOMISTONE. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </div>
  );
}
