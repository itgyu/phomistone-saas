import { useState, useEffect } from 'react';
import { X, Minus } from 'lucide-react';
import { Project } from '@/types/project';
import { ProjectFormData } from './SaveProjectModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProjectFormData) => void;
  project: Project;
}

export default function EditProjectModal({
  isOpen,
  onClose,
  onSave,
  project
}: Props) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    clientName: '',
    siteAddress: '',
    estimatedCost: '',
    memo: ''
  });

  const [errors, setErrors] = useState<Partial<ProjectFormData>>({});

  // Pre-fill form with project data
  useEffect(() => {
    if (isOpen && project) {
      setFormData({
        name: project.name || '',
        clientName: project.clientName || '',
        siteAddress: project.siteAddress || '',
        estimatedCost: project.estimatedCost?.toString() || '',
        memo: ''  // memo is not in Project type, so default to empty
      });
    }
  }, [isOpen, project]);

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
      <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-gold">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Minus className="w-5 h-5 text-neutral-900" />
              <div>
                <h2 className="text-[15px] font-light tracking-wider uppercase text-neutral-900">EDIT PROJECT</h2>
                <p className="text-[12px] font-light tracking-wider text-neutral-600 mt-1">MODIFY PROJECT INFORMATION</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 transition-all"
            >
              <X className="w-5 h-5 text-neutral-600" />
            </button>
          </div>
        </div>

        {/* 내용 */}
        <form onSubmit={handleSubmit} className="p-6">

          {/* 프로젝트명 (필수) */}
          <div className="mb-4">
            <label className="block text-[12px] font-light tracking-wider uppercase text-neutral-900 mb-2">
              PROJECT NAME <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, name: e.target.value }));
                setErrors(prev => ({ ...prev, name: undefined }));
              }}
              placeholder="예: 강남 아파트 리모델링"
              className={`w-full px-4 py-3 border focus:outline-none transition-colors text-[14px] font-light tracking-wider text-neutral-900 ${
                errors.name
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-neutral-200 focus:border-neutral-900'
              }`}
            />
            {errors.name && (
              <p className="text-[11px] font-light tracking-wider text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* 고객명 */}
          <div className="mb-4">
            <label className="block text-[12px] font-light tracking-wider uppercase text-neutral-900 mb-2">
              CLIENT NAME
            </label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
              placeholder="예: 김철수"
              className="w-full px-4 py-3 border border-neutral-200 focus:outline-none focus:border-neutral-900 transition-colors text-[14px] font-light tracking-wider text-neutral-900"
            />
          </div>

          {/* 현장 주소 */}
          <div className="mb-4">
            <label className="block text-[12px] font-light tracking-wider uppercase text-neutral-900 mb-2">
              SITE ADDRESS
            </label>
            <input
              type="text"
              value={formData.siteAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, siteAddress: e.target.value }))}
              placeholder="예: 서울시 강남구 역삼동 123-45"
              className="w-full px-4 py-3 border border-neutral-200 focus:outline-none focus:border-neutral-900 transition-colors text-[14px] font-light tracking-wider text-neutral-900"
            />
          </div>

          {/* 예상 견적 금액 */}
          <div className="mb-4">
            <label className="block text-[12px] font-light tracking-wider uppercase text-neutral-900 mb-2">
              ESTIMATED COST
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
                className="w-full px-4 py-3 border border-neutral-200 focus:outline-none focus:border-neutral-900 transition-colors text-[14px] font-light tracking-wider text-neutral-900 pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-light tracking-wider text-neutral-600">원</span>
            </div>
            {formData.estimatedCost && (
              <p className="text-[11px] font-light tracking-wider text-neutral-600 mt-1">
                {parseInt(formData.estimatedCost).toLocaleString()}원
              </p>
            )}
          </div>

          {/* 메모 */}
          <div className="mb-6">
            <label className="block text-[12px] font-light tracking-wider uppercase text-neutral-900 mb-2">
              MEMO
            </label>
            <textarea
              value={formData.memo}
              onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value }))}
              placeholder="프로젝트에 대한 메모를 입력하세요"
              rows={3}
              className="w-full px-4 py-3 border border-neutral-200 focus:outline-none focus:border-neutral-900 transition-colors text-[14px] font-light tracking-wider text-neutral-900 resize-none"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[12px] font-light tracking-wider uppercase transition-all"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-[12px] font-light tracking-wider uppercase transition-all flex items-center justify-center gap-2"
            >
              <Minus className="w-4 h-4" />
              SAVE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
