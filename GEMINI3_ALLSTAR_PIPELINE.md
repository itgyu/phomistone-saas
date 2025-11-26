# Gemini 3 Pro All-Star Pipeline

## 🌟 개요

**세계 최고 수준의 AI 모델들만을 사용한 프리미엄 건축 자재 시각화 파이프라인**

기존의 단순한 단일 모델 접근 방식을 넘어, 각 단계마다 최적화된 최상위 AI 모델을 배치하여 **극한의 품질**을 달성합니다.

---

## 🏗️ 아키텍처

```
┌─────────────┐
│   Webhook   │  입력: 건물 이미지 + 자재 ID
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ MCP Server  │  자재 데이터 조회
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────┐
│  The Analyst (Gemini 3 Pro)     │  🔍 Vision Expert
│  - 초정밀 건물 구조 분석          │  - 기하학적 구조
│  - 창문 위치 및 그리드 패턴       │  - 조명 및 그림자
│  - 카메라 각도 및 원근법          │  - 건축 스타일
└──────────────┬──────────────────┘
               │
               ↓
┌─────────────────────────────────┐
│  The Prompter (Gemini 3 Pro)    │  📝 Reasoning Master
│  - 분석 결과 + 자재 정보 종합     │  - 완벽한 프롬프트 작성
│  - Positive + Negative 프롬프트  │  - 구조 보존 명령
└──────────────┬──────────────────┘
               │
               ↓
┌─────────────────────────────────┐
│  The Painter (Imagen 4)         │  🎨 Texture Generator
│  - 고해상도 자재 텍스처 생성      │  - 8K 품질
│  - 건축용 재질 렌더링            │  - 포토리얼리스틱
└──────────────┬──────────────────┘
               │
               ↓
┌─────────────────────────────────┐
│  The Master (NanoBanana Pro)    │  👑 Final Synthesizer
│  - Input 1: 원본 건물 (구조)     │
│  - Input 2: 생성 텍스처 (스타일)  │  - 멀티모달 합성
│  - Input 3: 프롬프트 (지시사항)   │  - 최종 렌더링
│  ────────────────────────────────│
│  Output: 최고 품질 결과 이미지    │
└──────────────┬──────────────────┘
               │
               ↓
┌─────────────────────────────────┐
│  Extract & Respond              │  반환
└─────────────────────────────────┘
```

---

## 🎯 각 노드의 역할

### 1️⃣ The Analyst (Gemini 3 Pro Vision)
**최고 수준의 비전 능력**

- **모델**: `gemini-3-pro-preview`
- **역할**: 건물 이미지를 현미경 수준으로 분석
- **출력**:
  - 건물 기하학 (정확한 형태, 각도, 비율)
  - 창문 위치 및 크기 (정밀 측정)
  - 조명 조건 및 그림자 방향
  - 카메라 원근법 및 시점
  - 건축 스타일 및 재질 구역

**Why Gemini 3 Pro?**
단순 객체 인식이 아닌 **건축적 이해**를 요구하는 작업에 최적화됨.

---

### 2️⃣ The Prompter (Gemini 3 Pro Reasoning)
**최고 수준의 추론 능력**

- **모델**: `gemini-3-pro-preview`
- **입력**:
  - The Analyst의 구조 분석 결과
  - MCP Server의 자재 정보
- **출력**:
  - **Positive Prompt**: 자재 적용 + 구조 유지 명령
  - **Negative Prompt**: 구조 변형 방지 명령

**Why Gemini 3 Pro?**
복잡한 조건들을 논리적으로 통합하여 **완벽한 프롬프트**를 작성할 수 있음.

---

### 3️⃣ The Painter (Imagen 4)
**최고 수준의 텍스처 생성**

- **모델**: `imagen-4.0`
- **역할**: 자재의 고품질 텍스처 레퍼런스 이미지 생성
- **출력**:
  - 8K 품질의 재질 클로즈업
  - 건축 파사드 적용 가능한 텍스처
  - 포토리얼리스틱 렌더링

**Why Imagen 4?**
Google의 최신 이미지 생성 모델로 **건축 재질의 사실성**에 특화됨.

---

### 4️⃣ The Master (NanoBanana Pro / Gemini 3 Pro Image)
**최고 수준의 멀티모달 합성**

- **모델**: `gemini-3-pro-image-preview` (NanoBanana Pro)
- **입력**:
  1. **IMAGE 1**: 원본 건물 이미지 (구조 기준)
  2. **IMAGE 2**: The Painter가 생성한 텍스처 (스타일 기준)
  3. **TEXT**: The Prompter가 작성한 프롬프트 (명령)

- **처리 로직**:
  ```
  "Use IMAGE 1 for structure (preserve EXACT geometry, windows, perspective)
   Apply style from IMAGE 2 (material texture to walls only)
   Follow instructions from TEXT (perfect execution)
   Output: High-fidelity architectural visualization"
  ```

- **출력**: 최종 합성 이미지

**Why NanoBanana Pro?**
- **멀티 이미지 입력** 지원 (구조 + 스타일 분리)
- **텍스트 조건 결합** 가능
- **이미지 생성 능력** 보유 (일반 Gemini는 불가)

---

## 🔑 핵심 혁신

### 1. 역할 분리 (Separation of Concerns)
| 이전 (단일 모델) | 현재 (All-Star Pipeline) |
|------------------|--------------------------|
| 모든 작업을 한 모델이 처리 | 각 단계마다 전문가 모델 배치 |
| 분석 + 생성 동시 수행 → 품질 저하 | 분석 → 기획 → 텍스처 → 합성 분리 |
| 단일 프롬프트 의존 | 다단계 추론 체인 |

### 2. 멀티 이미지 조건부 생성
**The Master의 혁신적 접근**:
- 기존: 텍스트 프롬프트만으로 이미지 생성 → 구조 보존 실패
- 현재: **원본 구조 이미지 + 텍스처 이미지**를 모두 입력 → 정확한 합성

### 3. 프롬프트 엔지니어링 자동화
- The Prompter가 **최적의 프롬프트를 자동 생성**
- 사용자는 자재만 선택하면 됨
- 건축적 요구사항을 AI가 자동으로 번역

---

## 📊 품질 비교

| 항목 | 기존 단일 모델 | Gemini 3 All-Star |
|------|----------------|-------------------|
| **구조 보존** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **재질 사실성** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **조명 일관성** | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **창문 정밀도** | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **전체 품질** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **처리 시간** | 30초 | 90-120초 |
| **비용** | $ | $$$ |

---

## 🚀 사용 방법

### 1. n8n에서 워크플로우 Import
```
파일: n8n-workflows/phomistone-gemini3-allstar.json
```

### 2. API Key 확인
워크플로우에 하드코딩된 Key:
```
AIzaSyBLK7Oas8ShOHWnyT5WpL5cRyTMoLwunCg
```

### 3. Active 토글 ON

### 4. 프론트엔드에서 테스트
- http://localhost:5173
- 자재 선택 + 이미지 업로드
- **90-120초 대기** (고품질 처리에는 시간 필요)

---

## ⚙️ 기술 스펙

### API Endpoints
1. **Analyst & Prompter**: `gemini-3-pro-preview`
2. **Painter**: `imagen-4.0`
3. **Master**: `gemini-3-pro-image-preview`

### Timeout 설정
- Analyst: 60초
- Prompter: 60초
- Painter: 90초
- Master: **120초** (멀티 이미지 처리)

### Temperature 설정
- Analyst: 0.2 (정밀 분석)
- Prompter: 0.4 (창의적 프롬프트)
- Painter: 0.5 (다양한 텍스처)
- Master: 0.3 (안정적 합성)

---

## 🎓 학습 포인트

### 이 파이프라인에서 배울 수 있는 것:

1. **Multi-Agent AI System Design**
   - 각 단계마다 전문화된 에이전트 배치
   - 역할 분리와 협업

2. **Multimodal Conditioning**
   - 텍스트 + 이미지 + 이미지 → 이미지 생성
   - 복합 조건부 생성의 실전 응용

3. **Prompt Engineering Automation**
   - AI가 AI를 위한 프롬프트 작성
   - 메타 레벨의 자동화

4. **Quality-First Architecture**
   - 속도보다 품질 우선
   - 프리미엄 서비스 설계

---

## 🔮 향후 개선 방향

1. **The Critic** 추가
   - The Master의 출력을 평가
   - 품질 미달 시 재생성

2. **The Optimizer** 추가
   - 파라미터 자동 튜닝
   - A/B 테스트 자동화

3. **병렬 처리**
   - The Painter를 여러 스타일로 동시 생성
   - The Master가 최적 선택

---

## ✅ 결론

**Gemini 3 Pro All-Star Pipeline**은 단순한 이미지 생성을 넘어,
**AI들의 협업을 통한 건축 시각화 혁신**을 보여줍니다.

각 단계마다 최고의 모델을 배치하여,
**인간 디자이너 수준의 품질**을 자동화합니다.

---

**버전**: 2.0 (All-Star Edition)
**날짜**: 2025-11-25
**모델**: Gemini 3 Pro + Imagen 4 + NanoBanana Pro
