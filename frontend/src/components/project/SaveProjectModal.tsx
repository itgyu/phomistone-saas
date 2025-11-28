import { useState } from 'react';
import { X, Save } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProjectFormData) => void;
  resultImage: string;
  selectedMaterialName: string;
}

export interface ProjectFormData {
  name: string;
  clientName: string;
  siteAddress: string;
  estimatedCost: string;
  memo: string;
}

export default function SaveProjectModal({
  isOpen,
  onClose,
  onSave,
  resultImage,
  selectedMaterialName
}: Props) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    clientName: '',
    siteAddress: '',
    estimatedCost: '',
    memo: ''
  });

  const [errors, setErrors] = useState<Partial<ProjectFormData>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    const newErrors: Partial<ProjectFormData> = {};
    if (!formData.name.trim()) {
      newErrors.name = '프로젝트명은 필수입니다';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-gold">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-title">프로젝트로 저장</h2>
              <p className="text-caption mt-1">스타일링 결과를 프로젝트로 저장합니다</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* 내용 */}
        <form onSubmit={handleSubmit} className="p-6">

          {/* 결과 이미지 미리보기 */}
          <div className="mb-6">
            <p className="text-caption text-gray-500 mb-2">스타일링 결과</p>
            <div className="relative rounded-xl overflow-hidden border border-gray-200">
              <img
                src={resultImage}
                alt="Result"
                className="w-full h-48 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className="text-caption text-white font-medium">적용 자재: {selectedMaterialName}</p>
              </div>
            </div>
          </div>

          {/* 프로젝트명 (필수) */}
          <div className="mb-4">
            <label className="block text-body font-semibold text-gray-900 mb-2">
              프로젝트명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, name: e.target.value }));
                setErrors(prev => ({ ...prev, name: undefined }));
              }}
              placeholder="예: 강남 아파트 리모델링"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-input ${
                errors.name
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-200 focus:border-[#C59C6C]'
              }`}
            />
            {errors.name && (
              <p className="text-caption text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* 고객명 */}
          <div className="mb-4">
            <label className="block text-body font-semibold text-gray-900 mb-2">
              고객명
            </label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
              placeholder="예: 김철수"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#C59C6C] transition-colors text-input"
            />
          </div>

          {/* 현장 주소 */}
          <div className="mb-4">
            <label className="block text-body font-semibold text-gray-900 mb-2">
              현장 주소
            </label>
            <input
              type="text"
              value={formData.siteAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, siteAddress: e.target.value }))}
              placeholder="예: 서울시 강남구 역삼동 123-45"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#C59C6C] transition-colors text-input"
            />
          </div>

          {/* 예상 견적 금액 */}
          <div className="mb-4">
            <label className="block text-body font-semibold text-gray-900 mb-2">
              예상 견적 금액
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.estimatedCost}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, '');
                  setFormData(prev => ({ ...prev, estimatedCost: value }));
                }}
                placeholder="예: 15000000"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#C59C6C] transition-colors text-input pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-body text-gray-500">원</span>
            </div>
            {formData.estimatedCost && (
              <p className="text-caption text-gray-500 mt-1">
                {parseInt(formData.estimatedCost).toLocaleString()}원
              </p>
            )}
          </div>

          {/* 메모 */}
          <div className="mb-6">
            <label className="block text-body font-semibold text-gray-900 mb-2">
              메모
            </label>
            <textarea
              value={formData.memo}
              onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value }))}
              placeholder="프로젝트에 대한 메모를 입력하세요"
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#C59C6C] transition-colors text-input resize-none"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-button transition-all"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-[#C59C6C] to-[#A67C52] hover:shadow-lg text-white rounded-xl text-button transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              프로젝트 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
