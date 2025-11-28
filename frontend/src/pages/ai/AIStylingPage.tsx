import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, Download, Save, CheckCircle2,
  Sparkles, ArrowLeft, RefreshCw, ZoomIn, X, Palette
} from 'lucide-react';
import {
  ReactCompareSlider,
  ReactCompareSliderImage
} from 'react-compare-slider';
import { projectService } from '@/services/ProjectService';
import { materials } from '@/data/materials';
import SaveProjectModal, { ProjectFormData } from '@/components/project/SaveProjectModal';

// 자재 이미지 URL → Base64 변환 함수
const urlToBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // 헤더 제거
      };
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error("자재 이미지 변환 실패:", e);
    return "";
  }
};

export default function AIStylingPage() {
  const navigate = useNavigate();

  // State
  const [uploadedImage, setUploadedImage] = useState('');
  const [resultImage, setResultImage] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<string | null>(null);

  // 이미지 업로드
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // AI 스타일링 생성
  const handleGenerate = async () => {
    if (!selectedMaterial) {
      alert('자재를 선택해주세요');
      return;
    }

    if (!uploadedImage) {
      alert('건물 사진을 업로드해주세요');
      return;
    }

    setLoading(true);
    setStatusMessage('AI가 자재의 질감을 분석하여 시공 중입니다...');

    try {
      // (A) 건물 이미지 준비
      const cleanImage = uploadedImage.includes(',')
        ? uploadedImage.split(',')[1]
        : uploadedImage;

      // (B) 🚨 핵심 추가: 선택된 자재의 실물 이미지 준비
      const selectedMatData = materials.find(m => m.material_id === selectedMaterial);

      let materialImageBase64 = "";
      if (selectedMatData?.image_path) {
        console.log('🖼️ Converting material image:', selectedMatData.image_path);
        materialImageBase64 = await urlToBase64(selectedMatData.image_path);
        console.log('✅ 자재 이미지 변환 완료');
      }

      console.log('🚀 Sending request to n8n...');
      console.log('📦 Payload:', {
        material_id: selectedMaterial,
        building_image_size: cleanImage.length,
        material_image_size: materialImageBase64.length
      });

      const response = await fetch('/webhook/style-building', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image_base64: cleanImage,
          material_id: selectedMaterial,
          material_image_base64: materialImageBase64 // 👈 추가!
        })
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Full response data:', data);

      if (data.success) {
        console.log('🎉 Success is true!');

        const imgData = data.result_image_url || data.result_image;
        console.log('✅ Using image data:', imgData ? 'Found' : 'Not found');

        if (imgData) {
          console.log('🖼️ Result image found!');

          let imageToSet = imgData;
          if (!imgData.startsWith('http') && !imgData.startsWith('data:')) {
            imageToSet = `data:image/jpeg;base64,${imgData}`;
            console.log('✅ Added base64 header to image');
          } else {
            console.log('✅ Using image URL as-is');
          }

          setResultImage(imageToSet);
          setStatusMessage('');

          console.log('✅ Result image set successfully!');
        } else {
          console.error('❌ result_image_url and result_image are both missing');
          alert('AI 생성 실패: 결과 이미지가 없습니다. 콘솔을 확인해주세요.');
        }
      } else {
        console.error('❌ success is false');
        console.error('Error:', data.error);
        alert('AI 생성 실패: ' + (data.error || '알 수 없는 오류'));
      }
    } catch (error: any) {
      console.error('❌ Catch block error:', error);
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      alert('AI 생성 중 오류가 발생했습니다: ' + error.message);
    } finally {
      console.log('🏁 Finally block - setting loading to false');
      setLoading(false);
    }
  };

  // 프로젝트 저장
  const handleSaveProject = async (formData: ProjectFormData) => {
    try {
      const material = materials.find(m => m.material_id === selectedMaterial);

      const projectData = {
        name: formData.name,
        clientName: formData.clientName,
        siteAddress: formData.siteAddress,
        status: 'draft' as const,
        estimatedCost: formData.estimatedCost ? parseInt(formData.estimatedCost) : undefined,
        materialName: material?.name || '',
        beforeImage: uploadedImage,
        afterImage: resultImage,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to unified localStorage key (phomistone_projects)
      const projects = JSON.parse(localStorage.getItem('phomistone_projects') || '[]');
      const newProject = {
        ...projectData,
        id: `project_${Date.now()}`
      };
      projects.push(newProject);
      localStorage.setItem('phomistone_projects', JSON.stringify(projects));

      alert('✅ 프로젝트가 저장되었습니다!');
      setShowSaveModal(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('프로젝트 저장 실패:', error);
      alert('프로젝트 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 다시 시작
  const handleReset = () => {
    setUploadedImage('');
    setResultImage('');
    setSelectedMaterial('');
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* ===== 헤더 ===== */}
      <div className="bg-black border-b border-gray-800 flex-shrink-0">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#C59C6C]" />
              <h1 className="text-title text-white">AI 스타일링</h1>
            </div>
            {uploadedImage && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-button transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                초기화
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== 메인 컨텐츠 (2단 레이아웃) ===== */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-[1920px] mx-auto px-6 py-6">
          <div className="h-full grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">

            {/* ===== 좌측: 이미지 뷰어 ===== */}
            <div className="flex items-center justify-center bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {!uploadedImage ? (
                /* 초기 상태: 업로드 안내 */
                <div className="text-center p-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                    <Upload className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-title mb-2">이미지를 업로드하세요</h3>
                  <p className="text-caption">
                    우측 패널에서 건물 사진을 선택하면<br />
                    이곳에 미리보기가 표시됩니다
                  </p>
                </div>
              ) : !resultImage ? (
                /* 업로드 후: Before 이미지 */
                <div className="w-full h-full flex items-center justify-center p-8">
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                /* 결과 생성 후: Before/After 슬라이더 */
                <div className="w-full h-full relative">
                  <ReactCompareSlider
                    itemOne={
                      <ReactCompareSliderImage
                        src={uploadedImage}
                        alt="Before"
                        style={{ objectFit: 'contain' }}
                      />
                    }
                    itemTwo={
                      <ReactCompareSliderImage
                        src={resultImage}
                        alt="After"
                        style={{ objectFit: 'contain' }}
                      />
                    }
                    style={{ height: '100%' }}
                  />
                  <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-caption font-semibold backdrop-blur-sm">
                    Before
                  </div>
                  <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-caption font-semibold backdrop-blur-sm">
                    After
                  </div>
                </div>
              )}
            </div>

            {/* ===== 우측: 컨트롤 패널 (400px 고정) ===== */}
            <div className="flex flex-col gap-4 h-full overflow-hidden">

              {/* Step 1: 이미지 업로드 */}
              <div className="card-base p-5 flex-shrink-0">
                <div className="section-header mb-4">
                  <span className="step-badge">1</span>
                  <div>
                    <h2 className="text-title">이미지 업로드</h2>
                    <p className="text-caption">건물 사진 선택</p>
                  </div>
                </div>

                {!uploadedImage ? (
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-[#C59C6C] hover:bg-[#C59C6C]/5 transition-all text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-body font-medium text-gray-700 mb-1">이미지 선택</p>
                      <p className="text-caption">JPG, PNG (최대 20MB)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-body font-semibold text-green-700">업로드 완료</p>
                      <p className="text-caption text-green-600">이미지가 준비되었습니다</p>
                    </div>
                    <button
                      onClick={handleReset}
                      className="px-3 py-1.5 bg-white border border-green-300 text-green-700 rounded-lg text-caption font-medium hover:bg-green-50 transition-all flex-shrink-0"
                    >
                      변경
                    </button>
                  </div>
                )}
              </div>

              {/* Step 2: 자재 선택 (세로 스크롤) */}
              {uploadedImage && !resultImage && (
                <div className="card-base flex flex-col flex-1 min-h-0 overflow-hidden">
                  <div className="p-5 flex-shrink-0 border-b border-gray-200">
                    <div className="section-header mb-2">
                      <span className="step-badge">2</span>
                      <div className="flex-1">
                        <h2 className="text-title">자재 선택</h2>
                        <p className="text-caption">포미스톤 자재 • {materials.length}개</p>
                      </div>
                    </div>
                  </div>

                  {/* 세로 스크롤 자재 리스트 */}
                  <div className="flex-1 overflow-y-auto scrollbar-gold p-4">
                    <div className="space-y-3">
                      {materials.map((material) => (
                        <button
                          key={material.material_id}
                          onClick={() => setSelectedMaterial(material.material_id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                            selectedMaterial === material.material_id
                              ? 'border-[#C59C6C] bg-[#C59C6C]/5 ring-2 ring-[#C59C6C]/20'
                              : 'border-gray-200 hover:border-[#C59C6C]/50 hover:bg-gray-50'
                          }`}
                        >
                          {/* 썸네일 */}
                          <div className="relative w-[112px] h-[112px] flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={material.image_path}
                              alt={material.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                target.style.display = 'none';
                                if (target.nextElementSibling) {
                                  (target.nextElementSibling as HTMLElement).classList.remove('hidden');
                                }
                              }}
                            />
                            {/* 폴백 색상 */}
                            <div
                              className="hidden w-full h-full"
                              style={{ backgroundColor: material.color }}
                            />

                            {/* 선택 체크마크 */}
                            {selectedMaterial === material.material_id && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-[#C59C6C] rounded-full flex items-center justify-center shadow-lg">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* 텍스트 정보 */}
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-body font-bold text-gray-900 mb-1 truncate">
                              {material.name}
                            </p>
                            <p className="text-caption text-gray-500 mb-2 line-clamp-2">
                              {material.series}
                            </p>
                            {material.price_per_sqm && (
                              <p className="text-caption font-semibold text-[#C59C6C]">
                                ₩{material.price_per_sqm.toLocaleString()}/㎡
                              </p>
                            )}
                          </div>

                          {/* 자세히 보기 버튼 */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewMaterial(material.material_id);
                            }}
                            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-[#C59C6C] hover:text-white text-gray-600 transition-colors"
                          >
                            <ZoomIn className="w-4 h-4" />
                          </button>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: AI 스타일링 시작 버튼 */}
              {uploadedImage && selectedMaterial && !resultImage && (
                <div className="flex-shrink-0">
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
                      loading
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#C59C6C] to-[#A67C52] hover:shadow-lg hover:shadow-[#C59C6C]/30 hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span className="text-button">AI 스타일링 중...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        <span className="text-button">AI 스타일링 시작</span>
                      </div>
                    )}
                  </button>
                </div>
              )}

              {/* Step 3: 결과 표시 (액션 버튼들) */}
              {resultImage && (
                <div className="flex flex-col gap-4 flex-1 overflow-y-auto scrollbar-gold">
                  {/* 적용된 자재 정보 */}
                  <div className="card-base p-5 flex-shrink-0">
                    <div className="section-header mb-4">
                      <span className="step-badge">3</span>
                      <div>
                        <h2 className="text-title">스타일링 완료</h2>
                        <p className="text-caption">결과를 확인하세요</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-start gap-3">
                        <Palette className="w-5 h-5 text-[#C59C6C] flex-shrink-0 mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="text-caption mb-1">적용된 자재</p>
                          <p className="text-title truncate">
                            {materials.find(m => m.material_id === selectedMaterial)?.name}
                          </p>
                          <p className="text-body mt-1 text-gray-600 line-clamp-2">
                            {materials.find(m => m.material_id === selectedMaterial)?.series}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex-shrink-0 space-y-3">
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = resultImage;
                        link.download = 'phomistone-result.jpg';
                        link.click();
                      }}
                      className="w-full py-3 bg-gradient-to-r from-[#C59C6C] to-[#A67C52] hover:shadow-lg text-white rounded-xl text-button transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      이미지 다운로드
                    </button>
                    <button
                      onClick={() => setShowSaveModal(true)}
                      className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-button transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      견적으로 저장
                    </button>
                    <button
                      onClick={handleReset}
                      className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-button transition-all"
                    >
                      새로 시작
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ===== 로딩 오버레이 ===== */}
      {loading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-10 max-w-md text-center shadow-2xl">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-8 border-gray-200 rounded-full" />
              <div className="absolute inset-0 border-8 border-transparent border-t-[#C59C6C] rounded-full animate-spin" />
              <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-[#C59C6C]" />
            </div>
            <h3 className="text-title mb-3">AI가 작업 중입니다</h3>
            <p className="text-body text-gray-600 mb-6">
              {statusMessage || '포미스톤 자재를 적용하고 있어요'}
            </p>
            <p className="text-caption">예상 시간: 30초 ~ 1분</p>
          </div>
        </div>
      )}

      {/* ===== 자재 미리보기 모달 ===== */}
      {previewMaterial && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-title mb-1">
                  {materials.find(m => m.material_id === previewMaterial)?.name}
                </h3>
                <p className="text-caption">
                  {materials.find(m => m.material_id === previewMaterial)?.series}
                </p>
              </div>
              <button
                onClick={() => setPreviewMaterial(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* 모달 바디 */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 큰 이미지 */}
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={materials.find(m => m.material_id === previewMaterial)?.image_path}
                    alt={materials.find(m => m.material_id === previewMaterial)?.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 상세 정보 */}
                <div className="space-y-6">
                  {/* 시리즈 */}
                  <div>
                    <p className="text-caption mb-2">시리즈</p>
                    <p className="text-title">
                      {materials.find(m => m.material_id === previewMaterial)?.series}
                    </p>
                  </div>

                  {/* 설명 */}
                  {materials.find(m => m.material_id === previewMaterial)?.description && (
                    <div>
                      <p className="text-caption mb-2">제품 특징</p>
                      <p className="text-body leading-relaxed">
                        {materials.find(m => m.material_id === previewMaterial)?.description}
                      </p>
                    </div>
                  )}

                  {/* 용도 */}
                  {materials.find(m => m.material_id === previewMaterial)?.category && (
                    <div>
                      <p className="text-caption mb-2">적용 부위</p>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          const category = materials.find(m => m.material_id === previewMaterial)?.category;
                          const labels: Record<string, string> = {
                            'interior_wall': '내벽',
                            'exterior_wall': '외벽',
                            'floor': '바닥',
                            'ceiling': '천장'
                          };
                          return (
                            <span className="px-3 py-1 bg-[#C59C6C]/10 text-[#C59C6C] text-caption font-semibold rounded-full border border-[#C59C6C]/20">
                              {labels[category || ''] || category}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* 가격 */}
                  {materials.find(m => m.material_id === previewMaterial)?.price_per_sqm && (
                    <div>
                      <p className="text-caption mb-2">참고 가격</p>
                      <p className="text-2xl font-black text-gray-900">
                        ₩{materials.find(m => m.material_id === previewMaterial)?.price_per_sqm?.toLocaleString()}
                        <span className="text-body font-normal text-gray-500 ml-2">/㎡</span>
                      </p>
                    </div>
                  )}

                  {/* 선택 버튼 */}
                  <button
                    onClick={() => {
                      if (previewMaterial) {
                        setSelectedMaterial(previewMaterial);
                        setPreviewMaterial(null);
                      }
                    }}
                    className="w-full bg-gradient-to-r from-[#C59C6C] to-[#A67C52] text-white font-bold py-4 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    이 자재 선택하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 프로젝트 저장 모달 ===== */}
      <SaveProjectModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveProject}
        resultImage={resultImage}
        selectedMaterialName={materials.find(m => m.material_id === selectedMaterial)?.name || ''}
      />
    </div>
  );
}
