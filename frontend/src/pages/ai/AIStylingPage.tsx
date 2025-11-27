import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, Wand2, Download, Save, RotateCcw, CheckCircle2,
  Sparkles, Image as ImageIcon, ArrowRight, RefreshCw,
  Layers, Palette, Zap, Info, X, ZoomIn
} from 'lucide-react';
import {
  ReactCompareSlider,
  ReactCompareSliderImage
} from 'react-compare-slider';
import { projectService } from '@/services/ProjectService';
import { materials } from '@/data/materials';

export default function AIStylingPage() {
  const navigate = useNavigate();

  // State
  const [step, setStep] = useState(1); // 1: 업로드, 2: 자재선택, 3: 결과
  const [originalImage, setOriginalImage] = useState('');
  const [resultImage, setResultImage] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [previewMaterial, setPreviewMaterial] = useState<string | null>(null);

  // 이미지 업로드
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setOriginalImage(event.target?.result as string);
      setStep(2);
    };
    reader.readAsDataURL(file);
  };

  // AI 스타일링 생성
  const handleGenerate = async () => {
    if (!selectedMaterial) {
      alert('자재를 선택해주세요');
      return;
    }

    setLoading(true);
    setStatusMessage('AI가 공간을 분석하고 있습니다...');

    try {
      const cleanImage = originalImage.split(',')[1];

      console.log('🚀 Sending request to n8n...');
      console.log('📦 Payload:', {
        material_id: selectedMaterial,
        image_size: cleanImage.length
      });

      const response = await fetch('/webhook/style-building', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image_base64: cleanImage,
          material_id: selectedMaterial
        })
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Full response data:', data);
      console.log('✅ data.success:', data.success);
      console.log('✅ data.result_image_url exists:', !!data.result_image_url);
      console.log('✅ data.result_image exists:', !!data.result_image);

      if (data.success) {
        console.log('🎉 Success is true!');

        const imgData = data.result_image_url || data.result_image;
        console.log('✅ Using image data:', imgData ? 'Found' : 'Not found');
        console.log('✅ Image data length:', imgData?.length);

        if (imgData) {
          console.log('🖼️ Result image found!');

          let imageToSet = imgData;
          if (!imgData.startsWith('http') && !imgData.startsWith('data:')) {
            imageToSet = `data:image/jpeg;base64,${imgData}`;
            console.log('✅ Added base64 header to image');
          } else {
            console.log('✅ Using image URL as-is:', imgData.substring(0, 50) + '...');
          }

          setResultImage(imageToSet);
          setStep(3);
          setStatusMessage('');

          console.log('✅ Result image set successfully!');
        } else {
          console.error('❌ result_image_url and result_image are both missing');
          console.error('Response keys:', Object.keys(data));
          alert('AI 생성 실패: 결과 이미지가 없습니다. 콘솔을 확인해주세요.');
        }
      } else {
        console.error('❌ success is false');
        console.error('Error:', data.error);
        alert('AI 생성 실패: ' + (data.error || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('❌ Catch block error:', error);
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      alert('AI 생성 중 오류가 발생했습니다: ' + error.message);
    } finally {
      console.log('🏁 Finally block - setting loading to false');
      setLoading(false);
    }
  };

  // 견적 저장
  const handleSave = async () => {
    if (!clientName.trim()) {
      alert('현장명을 입력해주세요');
      return;
    }

    const material = materials.find(m => m.material_id === selectedMaterial);

    await projectService.create({
      clientName,
      status: 'Draft',
      materialName: material?.name || '',
      estimatedCost: 4500000,
      beforeImage: originalImage,
      afterImage: resultImage
    });

    alert('✅ 견적이 저장되었습니다!');
    setShowSaveModal(false);
    navigate('/dashboard');
  };

  // 다시 시작
  const handleReset = () => {
    setOriginalImage('');
    setResultImage('');
    setSelectedMaterial('');
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-phomi-gray-50 to-white">
      {/* 헤더 */}
      <div className="bg-white border-b border-phomi-gray-100 sticky top-0 z-20 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Wand2 className="w-7 h-7 text-phomi-gold" />
                <h1 className="text-2xl font-black text-phomi-black">
                  AI 시각 제안
                </h1>
              </div>

              {/* 진행 단계 */}
              <div className="hidden md:flex items-center gap-2 ml-8">
                {[
                  { num: 1, label: '이미지 업로드' },
                  { num: 2, label: '자재 선택' },
                  { num: 3, label: '결과 확인' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                      step >= item.num
                        ? 'bg-phomi-gold text-white'
                        : 'bg-phomi-gray-100 text-phomi-gray-400'
                    }`}>
                      <span className="text-xs">{item.num}</span>
                      <span className="hidden lg:inline">{item.label}</span>
                    </div>
                    {i < 2 && (
                      <div className={`w-8 h-0.5 mx-1 transition-colors duration-300 ${
                        step > item.num ? 'bg-phomi-gold' : 'bg-phomi-gray-200'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-phomi-gray-600 hover:text-phomi-black hover:bg-phomi-gray-100 rounded-lg transition-all duration-300"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">다시 시작</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ⭐ 좌측: Sticky 컨트롤 패널 */}
          <div className="w-full lg:w-80 space-y-4">
            <div className="lg:sticky lg:top-24 space-y-4">

              {/* Step 1: 이미지 업로드 - 컴팩트 */}
              <div className={`bg-white rounded-xl border-2 p-4 transition-all duration-300 ${
                step === 1 ? 'border-phomi-gold shadow-lg' : 'border-phomi-gray-100'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= 1 ? 'bg-phomi-gold text-white' : 'bg-phomi-gray-100 text-phomi-gray-400'
                  }`}>
                    {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
                  </div>
                  <h3 className="text-sm font-bold text-phomi-black">
                    현장 사진
                  </h3>
                </div>

                {!originalImage ? (
                  <label className="block cursor-pointer group">
                    <div className="border-2 border-dashed border-phomi-gray-200 rounded-lg p-6 text-center hover:border-phomi-gold hover:bg-phomi-gold/5 transition-all">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-phomi-gray-400 group-hover:text-phomi-gold" />
                      <p className="text-xs font-semibold text-phomi-black">
                        클릭하여 업로드
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="space-y-2">
                    <div className="relative rounded-lg overflow-hidden">
                      <img src={originalImage} alt="Original" className="w-full h-32 object-cover" />
                      <div className="absolute top-2 right-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                    <label className="block">
                      <button
                        type="button"
                        className="w-full py-2 text-xs text-phomi-gray-600 hover:text-phomi-black hover:bg-phomi-gray-100 rounded-lg transition-all"
                      >
                        다른 이미지 선택
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Step 2: 자재 선택 - 그리드 레이아웃 */}
              <div className={`bg-white rounded-xl border-2 p-4 transition-all duration-300 ${
                step === 2 ? 'border-phomi-gold shadow-lg' : 'border-phomi-gray-100'
              } ${!originalImage && 'opacity-50 pointer-events-none'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      step >= 2 ? 'bg-phomi-gold text-white' : 'bg-phomi-gray-100 text-phomi-gray-400'
                    }`}>
                      {step > 2 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
                    </div>
                    <h3 className="text-sm font-bold text-phomi-black">
                      자재 선택
                    </h3>
                  </div>
                  <span className="text-xs text-phomi-gray-500">
                    {materials.length}개
                  </span>
                </div>

                {/* ⭐ 그리드 형태로 변경 (2열) */}
                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin">
                  {materials.map((material) => (
                    <div
                      key={material.material_id}
                      className={`group relative transition-all duration-300 ${
                        selectedMaterial === material.material_id
                          ? 'ring-2 ring-phomi-gold rounded-lg'
                          : 'hover:ring-2 hover:ring-phomi-gold/50 rounded-lg'
                      }`}
                    >
                      {/* 메인 버튼 */}
                      <button
                        onClick={() => setSelectedMaterial(material.material_id)}
                        className="w-full aspect-square rounded-lg overflow-hidden relative block"
                      >
                        <img
                          src={material.image_path}
                          alt={material.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
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
                          <div className="absolute top-2 right-2 w-6 h-6 bg-phomi-gold rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                        )}

                        {/* 호버 시 오버레이 (중앙에 돋보기 + 하단에 버튼) */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center">
                          <ZoomIn className="w-8 h-8 text-white mb-2" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewMaterial(material.material_id);
                            }}
                            className="bg-white text-phomi-black text-xs font-bold px-4 py-2 rounded-lg hover:bg-phomi-gold hover:text-white transition-colors"
                          >
                            자세히 보기
                          </button>
                        </div>
                      </button>

                      {/* 자재명 - 이미지 외부에 배치 */}
                      <p className="text-[10px] text-center mt-2 text-phomi-gray-700 font-medium truncate px-1">
                        {material.name}
                      </p>
                    </div>
                  ))}
                </div>

                {/* 선택된 자재 정보 */}
                {selectedMaterial && (
                  <div className="mt-3 p-3 bg-phomi-gray-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Palette className="w-4 h-4 text-phomi-gold flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-phomi-black truncate">
                          {materials.find(m => m.material_id === selectedMaterial)?.name}
                        </p>
                        <p className="text-[10px] text-phomi-gray-500">
                          {materials.find(m => m.material_id === selectedMaterial)?.series}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI 생성 버튼 */}
                <button
                  onClick={handleGenerate}
                  disabled={!selectedMaterial || loading}
                  className="w-full mt-3 bg-gradient-to-r from-phomi-gold to-phomi-black text-white font-bold py-3 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      AI 스타일링 시작
                    </>
                  )}
                </button>
              </div>

              {/* 정보 카드 - 컴팩트 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
                <p className="font-semibold text-blue-900 mb-1">💡 팁</p>
                <ul className="text-blue-700 space-y-0.5 text-[10px]">
                  <li>• 정면 촬영 권장</li>
                  <li>• 밝은 조명</li>
                  <li>• 명확한 표면</li>
                </ul>
              </div>

            </div>
          </div>

          {/* ⭐ 우측: 큰 뷰어 (스크롤 가능) */}
          <div className="flex-1 min-h-[600px]">
            <div className="bg-white rounded-2xl border border-phomi-gray-100 p-6 h-full relative">

              {loading ? (
                /* 로딩 상태 - 전체 화면 중앙 */
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
                  <div className="flex flex-col items-center justify-center p-8">
                    <div className="relative mb-8">
                      <div className="w-24 h-24 border-8 border-phomi-gold/20 border-t-phomi-gold rounded-full animate-spin"></div>
                      <Sparkles className="w-12 h-12 text-phomi-gold absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-phomi-black mb-2">
                      AI가 작업 중입니다
                    </h3>
                    <p className="text-phomi-gray-500 text-center mb-8">
                      {statusMessage || 'AI가 공간을 분석하고 시공 중입니다...'}
                    </p>
                    <div className="flex gap-2">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-3 h-3 bg-phomi-gold rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : resultImage ? (
                /* 결과 표시 */
                <div className="space-y-6 h-full flex flex-col">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-phomi-black flex items-center gap-2">
                      <Layers className="w-5 h-5 text-phomi-gold" />
                      Before / After 비교
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = resultImage;
                          link.download = 'phomistone-result.jpg';
                          link.click();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-phomi-gray-100 text-phomi-black rounded-lg hover:bg-phomi-gray-200 transition-all duration-300 font-semibold text-sm"
                      >
                        <Download className="w-4 h-4" />
                        다운로드
                      </button>
                      <button
                        onClick={() => setShowSaveModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-phomi-gold to-phomi-black text-white rounded-lg hover:shadow-xl transition-all duration-300 font-semibold text-sm"
                      >
                        <Save className="w-4 h-4" />
                        견적 저장
                      </button>
                    </div>
                  </div>

                  {/* ⭐ 비교 슬라이더 - 더 크게 */}
                  <div className="flex-1 relative rounded-xl overflow-hidden shadow-2xl min-h-[500px] bg-phomi-gray-100">
                    <ReactCompareSlider
                      itemOne={<ReactCompareSliderImage src={originalImage} alt="Before" style={{ objectFit: 'contain' }} />}
                      itemTwo={<ReactCompareSliderImage src={resultImage} alt="After" style={{ objectFit: 'contain' }} />}
                      style={{ height: '100%', minHeight: '500px' }}
                    />
                    <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm">
                      Before
                    </div>
                    <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm">
                      After
                    </div>
                  </div>

                  {/* 자재 정보 */}
                  <div className="bg-phomi-gray-50 rounded-xl p-4 border border-phomi-gray-100">
                    <div className="flex items-start gap-4">
                      <Palette className="w-6 h-6 text-phomi-gold flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm text-phomi-gray-500 mb-1">적용된 자재</p>
                        <p className="text-lg font-bold text-phomi-black">
                          {materials.find(m => m.material_id === selectedMaterial)?.name}
                        </p>
                        <p className="text-sm text-phomi-gray-600">
                          {materials.find(m => m.material_id === selectedMaterial)?.series}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* 초기 상태 */
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-24 h-24 bg-phomi-gold/10 rounded-full flex items-center justify-center mb-6">
                    <ImageIcon className="w-12 h-12 text-phomi-gold" />
                  </div>
                  <h3 className="text-2xl font-bold text-phomi-black mb-3">
                    Ready to Design
                  </h3>
                  <p className="text-phomi-gray-500 max-w-md">
                    좌측에서 현장 사진을 업로드하고<br />
                    포미스톤 자재를 선택하여 시작하세요
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ⭐ 자재 미리보기 모달 */}
      {previewMaterial && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-phomi-gray-100">
              <div>
                <h3 className="text-2xl font-bold text-phomi-black mb-1">
                  {materials.find(m => m.material_id === previewMaterial)?.name}
                </h3>
                <p className="text-sm text-phomi-gray-500">
                  {materials.find(m => m.material_id === previewMaterial)?.series} · {materials.find(m => m.material_id === previewMaterial)?.description}
                </p>
              </div>
              <button
                onClick={() => setPreviewMaterial(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-phomi-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-phomi-gray-600" />
              </button>
            </div>

            {/* 모달 바디 */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 큰 이미지 */}
                <div className="aspect-square rounded-xl overflow-hidden bg-phomi-gray-100">
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
                    <p className="text-xs text-phomi-gray-500 mb-2">시리즈</p>
                    <p className="text-lg font-bold text-phomi-black">
                      {materials.find(m => m.material_id === previewMaterial)?.series}
                    </p>
                  </div>

                  {/* 설명 */}
                  <div>
                    <p className="text-xs text-phomi-gray-500 mb-2">제품 특징</p>
                    <p className="text-sm text-phomi-gray-700 leading-relaxed">
                      {materials.find(m => m.material_id === previewMaterial)?.description}
                    </p>
                  </div>

                  {/* 용도 */}
                  <div>
                    <p className="text-xs text-phomi-gray-500 mb-2">적용 부위</p>
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
                          <span className="px-3 py-1 bg-phomi-gold/10 text-phomi-gold text-xs font-semibold rounded-full border border-phomi-gold/20">
                            {labels[category || ''] || category}
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  {/* 가격 */}
                  {materials.find(m => m.material_id === previewMaterial)?.price_per_sqm && (
                    <div>
                      <p className="text-xs text-phomi-gray-500 mb-2">참고 가격</p>
                      <p className="text-2xl font-black text-phomi-black">
                        ₩{materials.find(m => m.material_id === previewMaterial)?.price_per_sqm?.toLocaleString()}
                        <span className="text-sm font-normal text-phomi-gray-500 ml-2">/㎡</span>
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
                    className="w-full bg-gradient-to-r from-phomi-gold to-phomi-black text-white font-bold py-4 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
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

      {/* 저장 모달 */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform scale-100 animate-in">
            <h3 className="text-2xl font-bold text-phomi-black mb-2">견적 저장</h3>
            <p className="text-phomi-gray-500 mb-6">
              프로젝트 정보를 입력하세요
            </p>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="현장명 또는 고객명"
              className="w-full px-4 py-3 border-2 border-phomi-gray-100 rounded-xl focus:border-phomi-gold focus:outline-none transition-colors duration-300 mb-6"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-3 border-2 border-phomi-gray-200 text-phomi-gray-700 rounded-xl hover:bg-phomi-gray-50 transition-all duration-300 font-semibold"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-phomi-gold to-phomi-black text-white rounded-xl hover:shadow-xl transition-all duration-300 font-semibold"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
