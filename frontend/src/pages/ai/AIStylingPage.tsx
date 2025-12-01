import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, Download, Save, CheckCircle2,
  RefreshCw, ZoomIn, X, Palette, Minus
} from 'lucide-react';
import {
  ReactCompareSlider,
  ReactCompareSliderImage
} from 'react-compare-slider';
import { projectService } from '@/services/ProjectService';
import { materials } from '@/data/materials';
import SaveProjectModal, { ProjectFormData } from '@/components/project/SaveProjectModal';

// 이미지 리사이즈 및 압축 함수
const resizeAndCompressImage = (
  base64: string,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.8
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // 비율 유지하며 리사이즈
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);

      // JPEG로 압축
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed.split(',')[1]);
    };
    img.src = base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`;
  });
};

// 자재 이미지 URL → Base64 변환 (압축 포함)
const urlToBase64 = async (url: string, compress: boolean = true): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    const base64Full = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

    if (compress) {
      // 자재 이미지는 512x512로 압축 (충분한 품질)
      return await resizeAndCompressImage(base64Full, 512, 512, 0.85);
    }

    return base64Full.split(',')[1];
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
      // (A) 원본 이미지 크기 추출
      const img = new Image();
      img.src = uploadedImage;
      await new Promise((resolve) => { img.onload = resolve; });
      const originalWidth = img.naturalWidth;
      const originalHeight = img.naturalHeight;
      console.log('📐 Original image dimensions:', originalWidth, 'x', originalHeight);

      // (A-1) 건물 이미지 압축 (최대 1920px, API 제한 고려)
      let cleanImage: string;
      if (originalWidth > 1920 || originalHeight > 1920) {
        console.log('🗜️ Compressing building image...');
        cleanImage = await resizeAndCompressImage(uploadedImage, 1920, 1920, 0.85);
        console.log('✅ Building image compressed');
      } else {
        cleanImage = uploadedImage.includes(',')
          ? uploadedImage.split(',')[1]
          : uploadedImage;
      }

      // (B) 🚨 핵심 추가: 선택된 자재의 실물 이미지 준비
      const selectedMatData = materials.find(m => m.material_id === selectedMaterial);

      let materialImageBase64 = "";
      if (selectedMatData?.image_path) {
        console.log('🖼️ Converting material image:', selectedMatData.image_path);
        materialImageBase64 = await urlToBase64(selectedMatData.image_path);
        console.log('✅ 자재 이미지 변환 완료');
      }

      console.log('🚀 Sending request to AWS Lambda...');
      console.log('📦 Payload:', {
        material_id: selectedMaterial,
        building_image_size: cleanImage.length,
        material_image_size: materialImageBase64.length,
        original_width: originalWidth,
        original_height: originalHeight
      });

      // Lambda Function URL - no API Gateway timeout (supports 5min+ requests)
      const STYLE_BUILDING_URL = 'https://bryt3elfgtzaupi6qe5hlszjti0dkhaf.lambda-url.ap-northeast-2.on.aws/';
      const response = await fetch(STYLE_BUILDING_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image_base64: cleanImage,
          material_id: selectedMaterial,
          material_image_base64: materialImageBase64,
          original_width: originalWidth,
          original_height: originalHeight
        })
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      console.log('📡 Response content-type:', response.headers.get('content-type'));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 응답 텍스트 먼저 확인
      const responseText = await response.text();
      console.log('📡 Response text length:', responseText.length);
      console.log('📡 Response text preview:', responseText.substring(0, 200));

      if (!responseText || responseText.trim().length === 0) {
        throw new Error('서버로부터 빈 응답을 받았습니다. n8n 워크플로우를 확인해주세요.');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON 파싱 실패:', parseError);
        console.error('❌ 원본 응답:', responseText);
        throw new Error(`잘못된 응답 형식입니다: ${responseText.substring(0, 100)}`);
      }

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
      const selectedMat = materials.find(m => m.material_id === selectedMaterial);

      const success = await projectService.create({
        name: formData.name,
        clientName: formData.clientName,
        siteAddress: formData.siteAddress,
        status: 'draft' as const,
        materialName: selectedMat?.name || 'Unknown Material',
        estimatedCost: formData.estimatedCost ? parseInt(formData.estimatedCost) : 0,
        beforeImage: uploadedImage,
        afterImage: resultImage
      });

      if (success) {
        alert('✅ 프로젝트가 저장되었습니다!');
        setShowSaveModal(false);
        navigate('/dashboard');
      } else {
        throw new Error('프로젝트 생성 실패');
      }
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
    <div className="h-screen flex flex-col bg-[#FAFAFA]">
      {/* ===== 헤더 ===== */}
      <div className="bg-black border-b border-neutral-800 flex-shrink-0">
        <div className="max-w-[1920px] mx-auto px-4 md:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-6">
              <Minus className="w-4 h-4 md:w-5 md:h-5 text-[#C59C6C]" strokeWidth={1} />
              <h1 className="text-xs md:text-sm font-light tracking-[0.3em] text-white uppercase">AI Styling</h1>
            </div>
            {uploadedImage && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2 md:py-2.5 bg-transparent border border-neutral-700 hover:border-neutral-500 text-white text-xs font-light tracking-wider uppercase transition-colors duration-300"
              >
                <RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={1.5} />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== 메인 컨텐츠 (2단 레이아웃) ===== */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-[1920px] mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="h-full grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 md:gap-6">

            {/* ===== 좌측: 이미지 뷰어 ===== */}
            <div className="flex items-center justify-center bg-white border border-neutral-200 overflow-hidden">
              {!uploadedImage ? (
                /* 초기 상태: 업로드 안내 */
                <div className="text-center p-8 md:p-16">
                  <Upload className="w-10 h-10 md:w-12 md:h-12 text-neutral-300 mx-auto mb-6 md:mb-8" strokeWidth={1} />
                  <h3 className="text-xs md:text-sm font-medium tracking-[0.25em] text-neutral-900 uppercase mb-3 md:mb-4">Upload Image</h3>
                  <p className="text-xs text-neutral-700 leading-relaxed tracking-wide">
                    우측 패널에서 건물 사진을 선택하면<br />
                    이곳에 미리보기가 표시됩니다
                  </p>
                </div>
              ) : !resultImage ? (
                /* 업로드 후: Before 이미지 */
                <div className="w-full h-full flex items-center justify-center p-4 md:p-8">
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
                  <div className="absolute top-3 left-3 md:top-6 md:left-6 bg-black/80 text-white px-3 md:px-4 py-1.5 md:py-2 text-[10px] font-light tracking-[0.2em] uppercase backdrop-blur-sm">
                    Before
                  </div>
                  <div className="absolute top-3 right-3 md:top-6 md:right-6 bg-black/80 text-white px-3 md:px-4 py-1.5 md:py-2 text-[10px] font-light tracking-[0.2em] uppercase backdrop-blur-sm">
                    After
                  </div>
                </div>
              )}
            </div>

            {/* ===== 우측: 컨트롤 패널 (400px 고정) ===== */}
            <div className="flex flex-col gap-3 md:gap-4 h-full overflow-hidden">

              {/* Step 1: 이미지 업로드 */}
              <div className="bg-white border border-neutral-200 p-4 md:p-6 flex-shrink-0">
                <div className="mb-4 md:mb-6 pb-3 md:pb-4 border-b border-neutral-100">
                  <span className="text-[10px] font-medium tracking-[0.3em] text-neutral-500 uppercase mb-2 md:mb-3 block">Step 01</span>
                  <h2 className="text-xs md:text-sm font-medium text-neutral-900 tracking-wide">이미지 업로드</h2>
                  <p className="text-xs text-neutral-600 mt-1 tracking-wide">건물 사진 선택</p>
                </div>

                {!uploadedImage ? (
                  <label className="block cursor-pointer">
                    <div className="border border-neutral-200 p-6 md:p-10 hover:border-neutral-400 transition-colors duration-300 text-center">
                      <Upload className="w-8 h-8 md:w-10 md:h-10 text-neutral-300 mx-auto mb-3 md:mb-4" strokeWidth={1} />
                      <p className="text-xs text-neutral-900 mb-1 tracking-wide">이미지 선택</p>
                      <p className="text-[10px] font-medium text-neutral-500 tracking-wider">JPG, PNG (최대 20MB)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 border border-neutral-900 bg-neutral-50">
                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-neutral-900 flex-shrink-0" strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-neutral-900 tracking-wide">업로드 완료</p>
                      <p className="text-[10px] text-neutral-700 tracking-wide mt-0.5">이미지가 준비되었습니다</p>
                    </div>
                    <button
                      onClick={handleReset}
                      className="px-3 md:px-4 py-1.5 md:py-2 border border-neutral-300 text-neutral-700 text-[10px] font-medium tracking-wider uppercase hover:border-neutral-900 hover:text-neutral-900 transition-colors duration-300 flex-shrink-0"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>

              {/* Step 2: 자재 선택 (세로 스크롤) */}
              {uploadedImage && !resultImage && (
                <div className="bg-white border border-neutral-200 flex flex-col flex-1 min-h-0 overflow-hidden">
                  <div className="p-4 md:p-6 flex-shrink-0 border-b border-neutral-100">
                    <span className="text-[10px] font-medium tracking-[0.3em] text-neutral-500 uppercase mb-2 md:mb-3 block">Step 02</span>
                    <h2 className="text-xs md:text-sm font-medium text-neutral-900 tracking-wide">자재 선택</h2>
                    <p className="text-xs text-neutral-600 mt-1 tracking-wide">포미스톤 자재 • {materials.length}개</p>
                  </div>

                  {/* 세로 스크롤 자재 리스트 */}
                  <div className="flex-1 overflow-y-auto scrollbar-gold p-3 md:p-4">
                    <div className="space-y-2 md:space-y-3">
                      {materials.map((material) => (
                        <button
                          key={material.material_id}
                          onClick={() => setSelectedMaterial(material.material_id)}
                          className={`w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 border transition-colors duration-300 ${
                            selectedMaterial === material.material_id
                              ? 'border-neutral-900 bg-white'
                              : 'border-neutral-200 hover:border-neutral-400 bg-white'
                          }`}
                        >
                          {/* 썸네일 */}
                          <div className="relative w-[80px] h-[80px] md:w-[100px] md:h-[100px] flex-shrink-0 overflow-hidden bg-neutral-100">
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
                              <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2 w-4 h-4 md:w-5 md:h-5 bg-neutral-900 flex items-center justify-center">
                                <Minus className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" strokeWidth={1} />
                              </div>
                            )}
                          </div>

                          {/* 텍스트 정보 */}
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-xs font-medium text-neutral-900 mb-1 truncate tracking-wide">
                              {material.name}
                            </p>
                            <p className="text-[10px] text-neutral-700 mb-1 md:mb-2 line-clamp-2 tracking-wide">
                              {material.series}
                            </p>
                            {material.price_per_sqm && (
                              <p className="text-[10px] font-medium text-neutral-500 tracking-wider">
                                ₩{material.price_per_sqm.toLocaleString()}/㎡
                              </p>
                            )}
                          </div>

                          {/* 자세히 보기 버튼 */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewMaterial(material.material_id);
                            }}
                            className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 flex items-center justify-center border border-neutral-200 hover:border-neutral-900 text-neutral-600 hover:text-neutral-900 transition-colors duration-300 cursor-pointer"
                          >
                            <ZoomIn className="w-3 h-3 md:w-3.5 md:h-3.5" strokeWidth={1.5} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: AI 스타일링 시작 버튼 */}
              {uploadedImage && selectedMaterial && !resultImage && (
                <div className="flex-shrink-0 border-t border-neutral-100 pt-3 md:pt-4">
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className={`w-full py-3.5 md:py-4 font-medium text-white transition-colors duration-300 tracking-wider uppercase text-xs ${
                      loading
                        ? 'bg-neutral-300 cursor-not-allowed'
                        : 'bg-neutral-900 hover:bg-black'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2 md:gap-3">
                        <div className="w-4 h-4 md:w-5 md:h-5 border border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <span>Generate AI Styling</span>
                    )}
                  </button>
                </div>
              )}

              {/* Step 3: 결과 표시 (액션 버튼들) */}
              {resultImage && (
                <div className="flex flex-col gap-3 md:gap-4 flex-1 overflow-y-auto scrollbar-gold">
                  {/* 적용된 자재 정보 */}
                  <div className="bg-white border border-neutral-200 p-4 md:p-6 flex-shrink-0">
                    <div className="mb-4 md:mb-6 pb-3 md:pb-4 border-b border-neutral-100">
                      <span className="text-[10px] font-medium tracking-[0.3em] text-neutral-500 uppercase mb-2 md:mb-3 block">Step 03</span>
                      <h2 className="text-xs md:text-sm font-medium text-neutral-900 tracking-wide">스타일링 완료</h2>
                      <p className="text-xs text-neutral-600 mt-1 tracking-wide">결과를 확인하세요</p>
                    </div>

                    <div className="bg-neutral-50 p-4 md:p-5 border border-neutral-200">
                      <div className="flex items-start gap-3 md:gap-4">
                        <Palette className="w-4 h-4 md:w-5 md:h-5 text-neutral-600 flex-shrink-0 mt-1" strokeWidth={1.5} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-medium tracking-wider text-neutral-500 uppercase mb-1 md:mb-2">Applied Material</p>
                          <p className="text-xs font-medium text-neutral-900 truncate tracking-wide mb-1">
                            {materials.find(m => m.material_id === selectedMaterial)?.name}
                          </p>
                          <p className="text-[10px] text-neutral-700 line-clamp-2 tracking-wide">
                            {materials.find(m => m.material_id === selectedMaterial)?.series}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex-shrink-0 space-y-2 md:space-y-3">
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = resultImage;
                        link.download = 'phomistone-result.jpg';
                        link.click();
                      }}
                      className="w-full py-3.5 md:py-4 bg-neutral-900 hover:bg-black text-white text-xs font-medium tracking-wider uppercase transition-colors duration-300 flex items-center justify-center gap-2 md:gap-3"
                    >
                      <Download className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.5} />
                      Download
                    </button>
                    <button
                      onClick={() => setShowSaveModal(true)}
                      className="w-full py-3.5 md:py-4 border border-neutral-900 hover:bg-neutral-900 hover:text-white text-neutral-900 text-xs font-medium tracking-wider uppercase transition-colors duration-300 flex items-center justify-center gap-2 md:gap-3"
                    >
                      <Save className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.5} />
                      Save as Project
                    </button>
                    <button
                      onClick={handleReset}
                      className="w-full py-3.5 md:py-4 border border-neutral-200 hover:border-neutral-400 text-neutral-600 text-xs font-medium tracking-wider uppercase transition-colors duration-300"
                    >
                      Start Over
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 md:p-12 max-w-md text-center border border-neutral-200">
            <div className="relative w-12 h-12 md:w-16 md:h-16 mx-auto mb-6 md:mb-8">
              <div className="absolute inset-0 border border-neutral-200 rounded-full" />
              <div className="absolute inset-0 border border-transparent border-t-neutral-900 rounded-full animate-spin" />
            </div>
            <h3 className="text-xs md:text-sm font-medium tracking-[0.2em] text-neutral-900 uppercase mb-3 md:mb-4">Processing</h3>
            <p className="text-xs text-neutral-700 mb-4 md:mb-6 leading-relaxed tracking-wide">
              {statusMessage || 'AI가 포미스톤 자재를 적용하고 있습니다'}
            </p>
            <div className="flex items-center justify-center gap-2">
              <Minus className="w-3 h-3 text-neutral-600" strokeWidth={1} />
              <p className="text-[10px] font-medium text-neutral-500 tracking-wider">예상 시간: 30초 ~ 1분</p>
              <Minus className="w-3 h-3 text-neutral-600" strokeWidth={1} />
            </div>
          </div>
        </div>
      )}

      {/* ===== 자재 미리보기 모달 ===== */}
      {previewMaterial && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-hidden border border-neutral-200">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-4 md:p-8 border-b border-neutral-200">
              <div>
                <h3 className="text-xs md:text-sm font-medium text-neutral-900 tracking-wide mb-1">
                  {materials.find(m => m.material_id === previewMaterial)?.name}
                </h3>
                <p className="text-xs text-neutral-700 tracking-wide">
                  {materials.find(m => m.material_id === previewMaterial)?.series}
                </p>
              </div>
              <button
                onClick={() => setPreviewMaterial(null)}
                className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border border-neutral-200 hover:border-neutral-900 transition-colors duration-300"
              >
                <X className="w-4 h-4 md:w-5 md:h-5 text-neutral-600" strokeWidth={1.5} />
              </button>
            </div>

            {/* 모달 바디 */}
            <div className="p-4 md:p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                {/* 큰 이미지 */}
                <div className="aspect-square overflow-hidden bg-neutral-100 border border-neutral-200">
                  <img
                    src={materials.find(m => m.material_id === previewMaterial)?.image_path}
                    alt={materials.find(m => m.material_id === previewMaterial)?.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 상세 정보 */}
                <div className="space-y-4 md:space-y-6">
                  {/* 시리즈 */}
                  <div className="border-b border-neutral-100 pb-3 md:pb-4">
                    <p className="text-[10px] font-medium tracking-wider text-neutral-500 uppercase mb-2">Series</p>
                    <p className="text-xs md:text-sm font-medium text-neutral-900 tracking-wide">
                      {materials.find(m => m.material_id === previewMaterial)?.series}
                    </p>
                  </div>

                  {/* 설명 */}
                  {materials.find(m => m.material_id === previewMaterial)?.description && (
                    <div className="border-b border-neutral-100 pb-3 md:pb-4">
                      <p className="text-[10px] font-medium tracking-wider text-neutral-500 uppercase mb-2">Description</p>
                      <p className="text-xs text-neutral-600 leading-relaxed tracking-wide">
                        {materials.find(m => m.material_id === previewMaterial)?.description}
                      </p>
                    </div>
                  )}

                  {/* 용도 */}
                  {materials.find(m => m.material_id === previewMaterial)?.category && (
                    <div className="border-b border-neutral-100 pb-3 md:pb-4">
                      <p className="text-[10px] font-medium tracking-wider text-neutral-500 uppercase mb-2">Application</p>
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
                            <span className="px-3 py-1.5 border border-neutral-300 text-neutral-700 text-[10px] tracking-wider uppercase">
                              {labels[category || ''] || category}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* 가격 */}
                  {materials.find(m => m.material_id === previewMaterial)?.price_per_sqm && (
                    <div className="border-b border-neutral-100 pb-3 md:pb-4">
                      <p className="text-[10px] font-medium tracking-wider text-neutral-500 uppercase mb-2">Price</p>
                      <p className="text-base md:text-lg font-medium text-neutral-900 tracking-wide">
                        ₩{materials.find(m => m.material_id === previewMaterial)?.price_per_sqm?.toLocaleString()}
                        <span className="text-xs text-neutral-700 ml-2">/㎡</span>
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
                    className="w-full bg-neutral-900 hover:bg-black text-white font-medium py-3.5 md:py-4 transition-colors duration-300 flex items-center justify-center gap-2 md:gap-3 tracking-wider uppercase text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.5} />
                    Select Material
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
