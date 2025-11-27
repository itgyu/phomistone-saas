import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User as UserIcon, Mail, Building, Phone, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    company: user?.company || '',
    phone: user?.phone || '',
  });

  const handleSave = () => {
    if (user) {
      updateUser({
        ...user,
        name: formData.name,
        company: formData.company,
        phone: formData.phone,
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      company: user?.company || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-full bg-phomi-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* 프로필 헤더 */}
        <div className="bg-gradient-to-r from-phomi-gold to-phomi-black rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <UserIcon className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
              <p className="text-white/80">{user.company}</p>
            </div>
          </div>
        </div>

        {/* 정보 카드 */}
        <div className="bg-white rounded-2xl border border-phomi-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-phomi-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-phomi-black">계정 정보</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-phomi-gold text-white rounded-lg hover:bg-phomi-black transition-colors duration-300"
              >
                수정하기
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-phomi-gray-300 text-phomi-gray-700 rounded-lg hover:bg-phomi-gray-50 transition-colors duration-300"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-phomi-gold text-white rounded-lg hover:bg-phomi-black transition-colors duration-300"
                >
                  저장
                </button>
              </div>
            )}
          </div>

          <div className="p-6 space-y-6">
            {/* 이메일 (읽기 전용) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-phomi-gray-900 mb-2">
                <Mail className="w-4 h-4" />
                이메일
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-3 border border-phomi-gray-100 rounded-xl bg-phomi-gray-50 text-phomi-gray-500 cursor-not-allowed"
              />
            </div>

            {/* 이름 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-phomi-gray-900 mb-2">
                <UserIcon className="w-4 h-4" />
                이름
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                className={`w-full px-4 py-3 border border-phomi-gray-100 rounded-xl transition-colors duration-300 ${
                  isEditing
                    ? 'bg-white focus:border-phomi-gold focus:outline-none'
                    : 'bg-phomi-gray-50 text-phomi-gray-700 cursor-not-allowed'
                }`}
              />
            </div>

            {/* 회사명 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-phomi-gray-900 mb-2">
                <Building className="w-4 h-4" />
                회사명
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                disabled={!isEditing}
                className={`w-full px-4 py-3 border border-phomi-gray-100 rounded-xl transition-colors duration-300 ${
                  isEditing
                    ? 'bg-white focus:border-phomi-gold focus:outline-none'
                    : 'bg-phomi-gray-50 text-phomi-gray-700 cursor-not-allowed'
                }`}
              />
            </div>

            {/* 연락처 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-phomi-gray-900 mb-2">
                <Phone className="w-4 h-4" />
                연락처
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                className={`w-full px-4 py-3 border border-phomi-gray-100 rounded-xl transition-colors duration-300 ${
                  isEditing
                    ? 'bg-white focus:border-phomi-gold focus:outline-none'
                    : 'bg-phomi-gray-50 text-phomi-gray-700 cursor-not-allowed'
                }`}
                placeholder="010-1234-5678"
              />
            </div>

            {/* 계정 타입 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-phomi-gray-900 mb-2">
                <Shield className="w-4 h-4" />
                계정 타입
              </label>
              <div className="px-4 py-3 border border-phomi-gray-100 rounded-xl bg-phomi-gray-50">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-phomi-gold/10 text-phomi-gold rounded-lg text-sm font-medium">
                  {user.role === 'admin' ? '관리자' : '일반 사용자'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-phomi-gray-100">
            <h3 className="text-phomi-gray-500 text-sm mb-1">총 프로젝트</h3>
            <p className="text-2xl font-bold text-phomi-black">0</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-phomi-gray-100">
            <h3 className="text-phomi-gray-500 text-sm mb-1">진행 중</h3>
            <p className="text-2xl font-bold text-phomi-black">0</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-phomi-gray-100">
            <h3 className="text-phomi-gray-500 text-sm mb-1">완료</h3>
            <p className="text-2xl font-bold text-phomi-black">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
