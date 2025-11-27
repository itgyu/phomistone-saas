import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  User, Mail, Building, Phone, Calendar, Shield,
  Edit2, Check, X, LogOut, Sparkles, FileText,
  TrendingUp, Award
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    company: user?.company || '',
    phone: user?.phone || ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = () => {
    const success = updateUser(formData);
    if (success) {
      setMessage('✅ 정보가 성공적으로 수정되었습니다.');
      setMessageType('success');
      setIsEditing(false);
    } else {
      setMessage('❌ 정보 수정에 실패했습니다.');
      setMessageType('error');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      company: user.company,
      phone: user.phone || ''
    });
    setIsEditing(false);
    setMessage('');
  };

  const stats = [
    { label: '총 프로젝트', value: '0', icon: FileText, color: 'text-phomi-black' },
    { label: '진행 중', value: '0', icon: TrendingUp, color: 'text-blue-500' },
    { label: '완료됨', value: '0', icon: Award, color: 'text-green-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-phomi-gray-50 to-white">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-phomi-gold" />
            <div>
              <h1 className="text-title text-phomi-black">
                마이페이지
              </h1>
              <p className="text-caption">
                계정 정보 및 설정을 관리합니다
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* 메시지 알림 */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border-2 animate-in ${
            messageType === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 좌측: 프로필 카드 */}
          <div className="lg:col-span-1">
            <div className="card-base p-6 sticky top-6">
              {/* 아바타 */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-phomi-gold to-phomi-black text-white text-3xl font-black rounded-full mb-4 shadow-xl">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-title mb-1">
                  {user.name}
                </h2>
                <p className="text-body mb-3">
                  {user.company}
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-phomi-gold/10 text-phomi-gold rounded-full text-caption font-semibold border border-phomi-gold/20">
                  <Shield className="w-3 h-3" />
                  {user.role === 'admin' ? '관리자' : '일반 사용자'}
                </div>
              </div>

              {/* 가입 정보 */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-caption">
                  <Calendar className="w-4 h-4" />
                  <span>
                    가입일: {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>

              {/* 로그아웃 버튼 */}
              <button
                onClick={logout}
                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 text-button"
              >
                <LogOut className="w-4 h-4" />
                로그아웃
              </button>
            </div>
          </div>

          {/* 우측: 정보 및 통계 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 계정 정보 카드 */}
            <div className="card-base p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-title flex items-center gap-2">
                  <User className="w-5 h-5 text-phomi-gold" />
                  계정 정보
                </h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-phomi-gold/10 text-phomi-gold rounded-lg hover:bg-phomi-gold hover:text-white transition-all duration-300 text-button"
                  >
                    <Edit2 className="w-4 h-4" />
                    정보 수정
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* 이메일 (수정 불가) */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <label className="flex items-center gap-2 text-caption font-semibold text-gray-500 mb-2">
                    <Mail className="w-4 h-4" />
                    이메일
                  </label>
                  <p className="text-body font-medium">{user.email}</p>
                  <p className="text-caption text-gray-400 mt-1">
                    이메일은 변경할 수 없습니다
                  </p>
                </div>

                {/* 이름 */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <label className="flex items-center gap-2 text-caption font-semibold text-gray-500 mb-2">
                    <User className="w-4 h-4" />
                    이름
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-phomi-gold focus:outline-none transition-colors duration-300 text-input"
                    />
                  ) : (
                    <p className="text-body font-medium">{user.name}</p>
                  )}
                </div>

                {/* 회사명 */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <label className="flex items-center gap-2 text-caption font-semibold text-gray-500 mb-2">
                    <Building className="w-4 h-4" />
                    회사명
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-phomi-gold focus:outline-none transition-colors duration-300 text-input"
                    />
                  ) : (
                    <p className="text-body font-medium">{user.company}</p>
                  )}
                </div>

                {/* 연락처 */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <label className="flex items-center gap-2 text-caption font-semibold text-gray-500 mb-2">
                    <Phone className="w-4 h-4" />
                    연락처
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="010-1234-5678"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-phomi-gold focus:outline-none transition-colors duration-300 text-input"
                    />
                  ) : (
                    <p className="text-body font-medium">
                      {user.phone || '등록된 연락처가 없습니다'}
                    </p>
                  )}
                </div>
              </div>

              {/* 수정 모드 버튼 */}
              {isEditing && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleCancel}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 text-button"
                  >
                    <X className="w-4 h-4" />
                    취소
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-phomi-gold to-phomi-black text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-button"
                  >
                    <Check className="w-4 h-4" />
                    저장
                  </button>
                </div>
              )}
            </div>

            {/* 활동 통계 카드 */}
            <div className="card-base p-6">
              <h3 className="text-title mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-phomi-gold" />
                활동 통계
              </h3>

              <div className="grid grid-cols-3 gap-4">
                {stats.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={i}
                      className="group p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-300 text-center cursor-pointer"
                    >
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full mb-3 group-hover:bg-phomi-gold/10 transition-colors duration-300">
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <p className="text-title text-2xl mb-1">
                        {stat.value}
                      </p>
                      <p className="text-caption font-medium">
                        {stat.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-body text-blue-700">
                  💡 프로젝트를 생성하고 AI 스타일링을 사용하면 통계가 자동으로 업데이트됩니다.
                </p>
              </div>
            </div>

            {/* 계정 보안 카드 */}
            <div className="card-base p-6">
              <h3 className="text-title mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-phomi-gold" />
                계정 보안
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <p className="text-body font-semibold mb-1">
                      비밀번호 변경
                    </p>
                    <p className="text-caption">
                      보안을 위해 정기적으로 비밀번호를 변경하세요
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-phomi-gold hover:text-white transition-all duration-300 text-button">
                    변경
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <p className="text-body font-semibold mb-1">
                      계정 삭제
                    </p>
                    <p className="text-caption">
                      계정을 삭제하면 모든 데이터가 영구 삭제됩니다
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300 text-button">
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
