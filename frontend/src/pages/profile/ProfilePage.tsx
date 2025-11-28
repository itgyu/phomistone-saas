import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  User, Mail, Building, Phone, Calendar, Shield,
  Edit2, Check, X, LogOut, Minus, FileText,
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
    { label: 'TOTAL PROJECTS', value: '0', icon: FileText, color: 'text-neutral-900' },
    { label: 'IN PROGRESS', value: '0', icon: TrendingUp, color: 'text-neutral-900' },
    { label: 'COMPLETED', value: '0', icon: Award, color: 'text-neutral-900' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-full md:max-w-5xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-3">
            <Minus className="w-5 h-5 text-neutral-900" />
            <div>
              <h1 className="text-[15px] font-medium tracking-wider uppercase text-neutral-900">
                MY PAGE
              </h1>
              <p className="text-[13px] font-medium tracking-wider text-neutral-600">
                MANAGE YOUR ACCOUNT AND SETTINGS
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full md:max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-6 lg:py-8">
        {/* 메시지 알림 */}
        {message && (
          <div className={`mb-4 md:mb-6 p-4 border-2 animate-in ${
            messageType === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* 좌측: 프로필 카드 */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-neutral-200 p-4 md:p-6 sticky top-6">
              {/* 아바타 */}
              <div className="text-center mb-4 md:mb-6">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-neutral-900 text-white text-3xl font-light uppercase mb-4">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-[15px] font-medium tracking-wider uppercase text-neutral-900 mb-1">
                  {user.name}
                </h2>
                <p className="text-[13px] font-normal tracking-wider text-neutral-700 mb-3">
                  {user.company}
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 text-neutral-900 text-[11px] font-medium tracking-wider uppercase border border-neutral-200">
                  <Shield className="w-3 h-3" />
                  {user.role === 'admin' ? 'ADMIN' : 'USER'}
                </div>
              </div>

              {/* 가입 정보 */}
              <div className="pt-4 md:pt-6 border-t border-neutral-200">
                <div className="flex items-center gap-2 text-[12px] font-medium tracking-wider text-neutral-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    JOINED: {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>

              {/* 로그아웃 버튼 */}
              <button
                onClick={logout}
                className="w-full mt-4 md:mt-6 flex items-center justify-center gap-2 px-4 py-2.5 md:py-3 border border-neutral-200 text-neutral-700 hover:border-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 text-[12px] font-medium tracking-wider uppercase"
              >
                <LogOut className="w-4 h-4" />
                LOGOUT
              </button>
            </div>
          </div>

          {/* 우측: 정보 및 통계 */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* 계정 정보 카드 */}
            <div className="bg-white border border-neutral-200 p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-[15px] font-medium tracking-wider uppercase text-neutral-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-neutral-900" />
                  ACCOUNT INFO
                </h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2.5 md:py-2 bg-neutral-100 text-neutral-900 hover:bg-neutral-900 hover:text-white transition-all duration-300 text-[11px] font-medium tracking-wider uppercase"
                  >
                    <Edit2 className="w-4 h-4" />
                    EDIT
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* 이메일 (수정 불가) */}
                <div className="p-4 bg-neutral-50 border border-neutral-200">
                  <label className="flex items-center gap-2 text-[11px] font-medium tracking-wider uppercase text-neutral-500 mb-2">
                    <Mail className="w-4 h-4" />
                    EMAIL
                  </label>
                  <p className="text-[14px] font-normal tracking-wider text-neutral-900">{user.email}</p>
                  <p className="text-[11px] font-medium tracking-wider text-neutral-500 mt-1">
                    EMAIL CANNOT BE CHANGED
                  </p>
                </div>

                {/* 이름 */}
                <div className="p-4 bg-neutral-50 border border-neutral-200">
                  <label className="flex items-center gap-2 text-[11px] font-medium tracking-wider uppercase text-neutral-500 mb-2">
                    <User className="w-4 h-4" />
                    NAME
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none transition-colors duration-300 text-[14px] font-normal tracking-wider text-neutral-900"
                    />
                  ) : (
                    <p className="text-[14px] font-normal tracking-wider text-neutral-900">{user.name}</p>
                  )}
                </div>

                {/* 회사명 */}
                <div className="p-4 bg-neutral-50 border border-neutral-200">
                  <label className="flex items-center gap-2 text-[11px] font-medium tracking-wider uppercase text-neutral-500 mb-2">
                    <Building className="w-4 h-4" />
                    COMPANY
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none transition-colors duration-300 text-[14px] font-normal tracking-wider text-neutral-900"
                    />
                  ) : (
                    <p className="text-[14px] font-normal tracking-wider text-neutral-900">{user.company}</p>
                  )}
                </div>

                {/* 연락처 */}
                <div className="p-4 bg-neutral-50 border border-neutral-200">
                  <label className="flex items-center gap-2 text-[11px] font-medium tracking-wider uppercase text-neutral-500 mb-2">
                    <Phone className="w-4 h-4" />
                    PHONE
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="010-1234-5678"
                      className="w-full px-4 py-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none transition-colors duration-300 text-[14px] font-normal tracking-wider text-neutral-900 placeholder:text-neutral-400"
                    />
                  ) : (
                    <p className="text-[14px] font-normal tracking-wider text-neutral-900">
                      {user.phone || 'NO PHONE NUMBER'}
                    </p>
                  )}
                </div>
              </div>

              {/* 수정 모드 버튼 */}
              {isEditing && (
                <div className="flex gap-3 mt-4 md:mt-6">
                  <button
                    onClick={handleCancel}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 md:py-3 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-all duration-300 text-[12px] font-medium tracking-wider uppercase"
                  >
                    <X className="w-4 h-4" />
                    CANCEL
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 md:py-3 bg-neutral-900 text-white hover:bg-neutral-800 transition-all duration-300 text-[12px] font-medium tracking-wider uppercase"
                  >
                    <Check className="w-4 h-4" />
                    SAVE
                  </button>
                </div>
              )}
            </div>

            {/* 활동 통계 카드 */}
            <div className="bg-white border border-neutral-200 p-4 md:p-6">
              <h3 className="text-[15px] font-medium tracking-wider uppercase text-neutral-900 mb-4 md:mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-neutral-900" />
                ACTIVITY STATS
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={i}
                      className="group p-4 bg-neutral-50 border border-neutral-200 hover:border-neutral-900 transition-all duration-300 text-center cursor-pointer"
                    >
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-white border border-neutral-200 mb-3 group-hover:bg-neutral-100 transition-colors duration-300">
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <p className="text-[20px] font-normal tracking-wider text-neutral-900 mb-1">
                        {stat.value}
                      </p>
                      <p className="text-[11px] font-medium tracking-wider uppercase text-neutral-600">
                        {stat.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 md:mt-6 p-4 bg-blue-50 border border-blue-200">
                <p className="text-[13px] font-normal tracking-wider text-blue-700">
                  CREATE PROJECTS AND USE AI STYLING TO UPDATE YOUR STATS AUTOMATICALLY.
                </p>
              </div>
            </div>

            {/* 계정 보안 카드 */}
            <div className="bg-white border border-neutral-200 p-4 md:p-6">
              <h3 className="text-[15px] font-medium tracking-wider uppercase text-neutral-900 mb-4 md:mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-neutral-900" />
                ACCOUNT SECURITY
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-200">
                  <div>
                    <p className="text-[13px] font-normal tracking-wider uppercase text-neutral-900 mb-1">
                      CHANGE PASSWORD
                    </p>
                    <p className="text-[12px] font-medium tracking-wider text-neutral-600">
                      CHANGE YOUR PASSWORD REGULARLY FOR SECURITY
                    </p>
                  </div>
                  <button className="px-4 py-2.5 md:py-2 bg-neutral-200 text-neutral-700 hover:bg-neutral-900 hover:text-white transition-all duration-300 text-[11px] font-medium tracking-wider uppercase">
                    CHANGE
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-200">
                  <div>
                    <p className="text-[13px] font-normal tracking-wider uppercase text-neutral-900 mb-1">
                      DELETE ACCOUNT
                    </p>
                    <p className="text-[12px] font-medium tracking-wider text-neutral-600">
                      ALL YOUR DATA WILL BE PERMANENTLY DELETED
                    </p>
                  </div>
                  <button className="px-4 py-2.5 md:py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-500 hover:text-white transition-all duration-300 text-[11px] font-medium tracking-wider uppercase">
                    DELETE
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
