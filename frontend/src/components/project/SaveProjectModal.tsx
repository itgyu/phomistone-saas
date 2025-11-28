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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto pb-safe">
        {/* 모바일 드래그 바 */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-neutral-300 rounded-full"></div>
        </div>

        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-4 md:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base md:text-2xl font-medium tracking-wider text-neutral-900">프로젝트로 저장</h2>
              <p className="text-xs md:text-sm text-neutral-600 mt-1 md:mt-2 tracking-wide">스타일링 결과를 프로젝트로 저장합니다</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5 text-neutral-700" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* 내용 */}
        <form onSubmit={handleSubmit} className="p-4 md:p-8">

          {/* 결과 이미지 미리보기 */}
          <div className="mb-6 md:mb-8">
            <label className="block text-xs font-medium tracking-wider uppercase text-neutral-500 mb-2 md:mb-3">
              스타일링 결과
            </label>
            <div className="relative overflow-hidden border border-neutral-200">
              <img
                src={resultImage}
                alt="Result"
                className="w-full h-48 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
                <p className="text-sm text-white tracking-wide">적용 자재: {selectedMaterialName}</p>
              </div>
            </div>
          </div>

          {/* 프로젝트명 (필수) */}
          <div className="mb-4 md:mb-6">
            <label className="block text-xs font-medium tracking-wider uppercase text-neutral-500 mb-2 md:mb-3">
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
              className={`w-full px-4 py-3 border tracking-wide focus:outline-none transition-colors text-base md:text-sm ${
                errors.name
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-neutral-300 focus:border-neutral-900'
              }`}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-2">{errors.name}</p>
            )}
          </div>

          {/* 고객명 */}
          <div className="mb-4 md:mb-6">
            <label className="block text-xs font-medium tracking-wider uppercase text-neutral-500 mb-2 md:mb-3">
              고객명
            </label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
              placeholder="예: 김철수"
              className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors tracking-wide text-base md:text-sm"
            />
          </div>

          {/* 현장 주소 */}
          <div className="mb-4 md:mb-6">
            <label className="block text-xs font-medium tracking-wider uppercase text-neutral-500 mb-2 md:mb-3">
              현장 주소
            </label>
            <input
              type="text"
              value={formData.siteAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, siteAddress: e.target.value }))}
              placeholder="예: 서울시 강남구 역삼동 123-45"
              className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors tracking-wide text-base md:text-sm"
            />
          </div>

          {/* 예상 견적 금액 */}
          <div className="mb-4 md:mb-6">
            <label className="block text-xs font-medium tracking-wider uppercase text-neutral-500 mb-2 md:mb-3">
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
                className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors tracking-wide pr-12 text-base md:text-sm"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-600">원</span>
            </div>
            {formData.estimatedCost && (
              <p className="text-sm text-neutral-600 mt-2 tracking-wide">
                {parseInt(formData.estimatedCost).toLocaleString()}원
              </p>
            )}
          </div>

          {/* 메모 */}
          <div className="mb-6 md:mb-8">
            <label className="block text-xs font-medium tracking-wider uppercase text-neutral-500 mb-2 md:mb-3">
              메모
            </label>
            <textarea
              value={formData.memo}
              onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value }))}
              placeholder="프로젝트에 대한 메모를 입력하세요"
              rows={3}
              className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors tracking-wide resize-none text-base md:text-sm"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-2 md:gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium tracking-wider uppercase text-sm transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-medium tracking-wider uppercase text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" strokeWidth={1.5} />
              프로젝트 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
