import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, Wand2, Download, Save, RotateCcw, CheckCircle2,
  Sparkles, Image as ImageIcon, ArrowRight, RefreshCw,
  Layers, Palette, Zap, Info
} from 'lucide-react';
import {
  ReactCompareSlider,
  ReactCompareSliderImage
} from 'react-compare-slider';
import { projectService } from '@/services/ProjectService';

// 자재 데이터 (MCP 서버에서 가져오거나 하드코딩)
const materials = [
  {
    material_id: 'marble_sahara_light_grey_04',
    name: 'Sahara Light Grey',
    series: 'Nature Stone',
    color: '#C0C0C0',
    description: '라이트닝 베이닝 패턴'
  },
  {
    material_id: 'marble_veil_dark_grey_05',
    name: 'Veil Dark Grey',
    series: 'Nature Stone',
    color: '#4A4A4A',
    description: '다크 그레이 우아함'
  },
  {
    material_id: 'travertine_rome_ivory',
    name: 'Travertine Rome',
    series: 'Travertine',
    color: '#E3DCCB',
    description: '아이보리 클래식'
  }
];

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
      // Base64 헤더 제거
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
      console.log('✅ data.result_image exists:', !!data.result_image);
      console.log('✅ data.result_image length:', data.result_image?.length);

      // ⭐ 응답 구조 확인
      if (data.success) {
        console.log('🎉 Success is true!');

        if (data.result_image) {
          console.log('🖼️ Result image found!');

          // 헤더 다시 추가
          const imageWithHeader = `data:image/jpeg;base64,${data.result_image}`;
          console.log('✅ Setting result image...');

          setResultImage(imageWithHeader);
          setStep(3);
          setStatusMessage('');

          console.log('✅ Result image set successfully!');
        } else {
          console.error('❌ result_image is missing in response');
          console.error('Response keys:', Object.keys(data));
          alert('AI 생성 실패: 결과 이미지가 없습니다');
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
      estimatedCost: 4500000, // 임시값
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
          {/* 좌측: 컨트롤 패널 */}
          <div className="w-full lg:w-96 space-y-6">
            {/* Step 1: 이미지 업로드 */}
            <div className={`bg-white rounded-2xl border-2 p-6 transition-all duration-300 ${
              step === 1 ? 'border-phomi-gold shadow-xl' : 'border-phomi-gray-100'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  step >= 1 ? 'bg-phomi-gold text-white' : 'bg-phomi-gray-100 text-phomi-gray-400'
                }`}>
                  {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
                </div>
                <h2 className="text-lg font-bold text-phomi-black">
                  현장 사진 업로드
                </h2>
              </div>

              {!originalImage ? (
                <label className="block cursor-pointer group">
                  <div className="relative border-2 border-dashed border-phomi-gray-200 rounded-xl p-8 text-center hover:border-phomi-gold hover:bg-phomi-gold/5 transition-all duration-300">
                    <Upload className="w-12 h-12 mx-auto mb-3 text-phomi-gray-400 group-hover:text-phomi-gold transition-colors duration-300" />
                    <p className="text-sm font-semibold text-phomi-black mb-1">
                      클릭하여 사진 업로드
                    </p>
                    <p className="text-xs text-phomi-gray-500">
                      JPG, PNG (최대 20MB)
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
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden">
                    <img src={originalImage} alt="Original" className="w-full" />
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        업로드 완료
                      </span>
                    </div>
                  </div>
                  <label className="block">
                    <button
                      type="button"
                      className="w-full py-2 text-sm text-phomi-gray-600 hover:text-phomi-black hover:bg-phomi-gray-100 rounded-lg transition-all duration-300"
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

            {/* Step 2: 자재 선택 */}
            <div className={`bg-white rounded-2xl border-2 p-6 transition-all duration-300 ${
              step === 2 ? 'border-phomi-gold shadow-xl' : 'border-phomi-gray-100'
            } ${!originalImage && 'opacity-50 pointer-events-none'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  step >= 2 ? 'bg-phomi-gold text-white' : 'bg-phomi-gray-100 text-phomi-gray-400'
                }`}>
                  {step > 2 ? <CheckCircle2 className="w-5 h-5" /> : '2'}
                </div>
                <h2 className="text-lg font-bold text-phomi-black">
                  자재 선택
                </h2>
              </div>

              <div className="space-y-3">
                {materials.map((material) => (
                  <button
                    key={material.material_id}
                    onClick={() => setSelectedMaterial(material.material_id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left group ${
                      selectedMaterial === material.material_id
                        ? 'border-phomi-gold bg-phomi-gold/5 shadow-lg'
                        : 'border-phomi-gray-100 hover:border-phomi-gold/50 hover:bg-phomi-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg border-2 border-phomi-gray-200 shadow-inner"
                        style={{ backgroundColor: material.color }}
                      ></div>
                      <div className="flex-1">
                        <p className="font-bold text-phomi-black mb-1">
                          {material.name}
                        </p>
                        <p className="text-xs text-phomi-gray-500 mb-1">
                          {material.series}
                        </p>
                        <p className="text-xs text-phomi-gray-400">
                          {material.description}
                        </p>
                      </div>
                      {selectedMaterial === material.material_id && (
                        <CheckCircle2 className="w-6 h-6 text-phomi-gold flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerate}
                disabled={!selectedMaterial || loading}
                className="w-full mt-6 bg-gradient-to-r from-phomi-gold to-phomi-black text-white font-bold py-4 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    AI 생성 중...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    AI 스타일링 시작
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>
            </div>

            {/* 정보 카드 */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    💡 최적 결과를 위한 팁
                  </p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• 정면에서 촬영된 사진 권장</li>
                    <li>• 조명이 밝고 균일한 사진</li>
                    <li>• 시공 대상 표면이 명확한 사진</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 우측: 결과 뷰어 */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl border border-phomi-gray-100 p-6 min-h-[600px]">
              {loading ? (
                /* 로딩 상태 */
                <div className="flex flex-col items-center justify-center h-full">
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
              ) : resultImage ? (
                /* 결과 표시 */
                <div className="space-y-6">
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
                        className="flex items-center gap-2 px-4 py-2 bg-phomi-gray-100 text-phomi-black rounded-lg hover:bg-phomi-gray-200 transition-all duration-300 font-semibold"
                      >
                        <Download className="w-4 h-4" />
                        다운로드
                      </button>
                      <button
                        onClick={() => setShowSaveModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-phomi-gold to-phomi-black text-white rounded-lg hover:shadow-xl transition-all duration-300 font-semibold"
                      >
                        <Save className="w-4 h-4" />
                        견적 저장
                      </button>
                    </div>
                  </div>

                  {/* 비교 슬라이더 */}
                  <div className="relative rounded-xl overflow-hidden shadow-2xl">
                    <ReactCompareSlider
                      itemOne={<ReactCompareSliderImage src={originalImage} alt="Before" />}
                      itemTwo={<ReactCompareSliderImage src={resultImage} alt="After" />}
                      style={{ height: '500px' }}
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
                    현장 사진을 업로드하고 포미스톤 자재를 선택하여<br />
                    AI 스타일링을 시작하세요
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
