# Phomistone Premium Design System

> 하이엔드 건축/인테리어 SaaS를 위한 프리미엄 디자인 시스템
> 다른 프로젝트에 즉시 적용 가능한 완전한 디자인 가이드

---

## 📋 목차

1. [디자인 철학](#디자인-철학)
2. [색상 시스템](#색상-시스템)
3. [타이포그래피](#타이포그래피)
4. [레이아웃 패턴](#레이아웃-패턴)
5. [컴포넌트 스타일](#컴포넌트-스타일)
6. [모바일 반응형](#모바일-반응형)
7. [설치 가이드](#설치-가이드)

---

## 🎨 디자인 철학

### 핵심 원칙
- **미니멀리즘**: 불필요한 요소 제거, 본질에 집중
- **하이엔드**: 프리미엄 느낌의 색상과 간격
- **가독성**: 명확한 계층 구조와 충분한 대비
- **일관성**: 통일된 패턴과 규칙

### 특징
- 검은색 헤더 + 밝은 회색 배경 (#FAFAFA)
- 골드 포인트 컬러 (#C59C6C)
- 넓은 간격과 여유로운 패딩
- 부드러운 전환 효과 (300ms duration)
- 모바일 최적화 완료

---

## 🎨 색상 시스템

### 1. Tailwind Config 설정

```js
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 브랜드 컬러
        'phomi-gold': '#C59C6C',
        'phomi-black': '#1a1a1a',

        // 그레이 스케일
        'phomi-gray': {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Pretendard', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: []
}
```

### 2. 색상 사용 가이드

#### 텍스트 색상
```css
/* 주요 텍스트 */
text-neutral-900  /* 가장 중요한 텍스트 (제목, 강조) */
text-neutral-800  /* 중요한 텍스트 */
text-neutral-700  /* 일반 텍스트 */
text-neutral-600  /* 보조 텍스트 */
text-neutral-500  /* 부가 정보 */

/* 브랜드 */
text-phomi-gold   /* 포인트, 강조 */
text-phomi-black  /* 제목, 헤더 */
```

#### 배경 색상
```css
/* 레이아웃 */
bg-black          /* 헤더 */
bg-[#FAFAFA]      /* 페이지 배경 */
bg-white          /* 카드, 컨테이너 */
bg-neutral-50     /* 푸터, 서브 섹션 */

/* 상태 */
bg-neutral-900    /* Primary 버튼 */
hover:bg-neutral-800  /* Primary 버튼 호버 */
bg-neutral-100    /* Secondary 버튼 */
hover:bg-neutral-200  /* Secondary 버튼 호버 */
```

#### 테두리 색상
```css
border-gray-200   /* 기본 테두리 */
border-neutral-800  /* 어두운 배경 위 테두리 */
hover:border-neutral-900  /* 호버 시 강조 테두리 */
```

---

## ✍️ 타이포그래피

### 1. 글로벌 CSS (index.css)

```css
@layer base {
  * {
    @apply m-0 p-0 box-border;
  }

  html {
    overflow-y: scroll;
  }

  body {
    @apply font-sans text-phomi-gray-900 bg-white antialiased;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-bold text-phomi-black;
  }

  /* 모바일 입력 필드 줌 방지 (iOS) */
  @media (max-width: 767px) {
    input, select, textarea {
      font-size: 16px !important;
    }
  }
}
```

### 2. 타이포그래피 유틸리티

```css
@layer components {
  /* 타이틀 - 페이지 제목, 섹션 제목 */
  .text-title {
    @apply text-lg font-bold text-gray-900;
  }

  /* 본문 - 일반 텍스트, 설명 */
  .text-body {
    @apply text-sm text-gray-700;
  }

  /* 캡션 - 부가 정보, 날짜, 카운트 */
  .text-caption {
    @apply text-xs text-gray-500;
  }

  /* 버튼 텍스트 */
  .text-button {
    @apply text-sm font-bold;
  }

  /* 입력 필드 텍스트 */
  .text-input {
    @apply text-sm text-gray-900;
  }
}
```

### 3. 타이포그래피 사용 예시

```tsx
// 페이지 제목
<h1 className="text-lg md:text-xl lg:text-title text-phomi-black mb-1 flex items-center gap-2 md:gap-3 font-medium tracking-wider uppercase">
  <Minus className="w-4 h-4 md:w-5 md:h-5 text-phomi-black" />
  프로젝트 대시보드
</h1>

// 설명 텍스트
<p className="text-xs md:text-caption font-medium tracking-wider text-neutral-500">
  Phomistone AI 스타일링 프로젝트 관리
</p>

// 본문 텍스트
<p className="text-sm md:text-body text-neutral-600 truncate font-normal tracking-wider">
  일반 텍스트 내용
</p>

// 캡션
<span className="text-xs md:text-caption font-medium tracking-wider uppercase text-neutral-500">
  부가 정보
</span>
```

### 4. 반응형 텍스트 크기 패턴

```tsx
// 작은 텍스트
className="text-xs md:text-sm"

// 일반 텍스트
className="text-sm md:text-base"

// 제목
className="text-base md:text-lg lg:text-xl"

// 큰 제목
className="text-lg md:text-xl lg:text-2xl"

// 숫자/통계
className="text-xl md:text-2xl lg:text-3xl"
```

---

## 📐 레이아웃 패턴

### 1. 페이지 구조

```tsx
// 기본 페이지 레이아웃
<div className="min-h-screen bg-[#FAFAFA]">
  {/* 헤더 (고정) */}
  <div className="bg-[#FAFAFA] border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm bg-[#FAFAFA]/80">
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4">
      {/* 헤더 내용 */}
    </div>
  </div>

  {/* 메인 컨텐츠 */}
  <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
    {/* 페이지 내용 */}
  </div>
</div>
```

### 2. 컨테이너 패턴

```tsx
// 최대 너비 컨테이너 (7xl = 1280px)
<div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
  {/* 내용 */}
</div>

// 중간 너비 컨테이너 (2xl = 672px)
<div className="max-w-2xl mx-auto px-4 md:px-6">
  {/* 내용 */}
</div>

// 작은 너비 컨테이너 (md = 448px)
<div className="max-w-md mx-auto px-4">
  {/* 내용 */}
</div>
```

### 3. 그리드 레이아웃

```tsx
// 통계 카드 그리드 (2열 → 4열)
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
  <div className="card-base p-4 md:p-5 lg:p-6">
    {/* 카드 내용 */}
  </div>
</div>

// 프로젝트 그리드 (1열 → 2열 → 3열)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
  <div className="card-base">
    {/* 프로젝트 카드 */}
  </div>
</div>

// 재료 그리드 (3열 → 4열 → 2열)
<div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-2 gap-2 md:gap-3">
  <div>
    {/* 재료 아이템 */}
  </div>
</div>
```

### 4. Flexbox 패턴

```tsx
// 좌우 정렬 (모바일: 세로, 태블릿+: 가로)
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
  <div>{/* 왼쪽 내용 */}</div>
  <div>{/* 오른쪽 내용 */}</div>
</div>

// 버튼 그룹
<div className="flex items-center gap-2">
  <button>버튼 1</button>
  <button>버튼 2</button>
</div>

// 센터 정렬
<div className="flex items-center justify-center min-h-screen">
  {/* 중앙 내용 */}
</div>
```

---

## 🎯 컴포넌트 스타일

### 1. 카드 컴포넌트

```css
/* index.css */
@layer components {
  /* 기본 카드 */
  .card-base {
    @apply bg-white rounded-2xl shadow-sm border border-gray-200;
  }

  /* Phomi 스타일 카드 */
  .phomi-card {
    @apply bg-white border border-phomi-gray-100
           hover:shadow-lg transition-shadow duration-300;
  }
}
```

```tsx
// 사용 예시
<div className="card-base group p-4 md:p-5 lg:p-6 hover:bg-neutral-50 transition-all duration-300 cursor-pointer">
  <div className="flex items-start justify-between mb-3 md:mb-4">
    {/* 아이콘 */}
    <div className="p-2 md:p-3 group-hover:bg-gray-900 group-hover:text-white transition-all duration-300">
      <Icon className="w-5 h-5 md:w-6 md:h-6" />
    </div>

    {/* 숫자/값 */}
    <div className="text-right">
      <p className="text-lg md:text-xl lg:text-2xl mb-1 font-medium tracking-wider text-neutral-900">
        24
      </p>
      <p className="text-xs md:text-caption font-medium tracking-wider uppercase text-neutral-500">
        레이블
      </p>
    </div>
  </div>

  {/* 프로그레스 바 */}
  <div className="h-1 bg-gray-100 overflow-hidden">
    <div className="h-full bg-gray-900 w-full transition-all duration-500"></div>
  </div>
</div>
```

### 2. 버튼 컴포넌트

```tsx
// Primary 버튼 (어두운 배경)
<button className="whitespace-nowrap bg-neutral-900 text-white px-4 py-2.5 md:px-6 md:py-3 hover:bg-neutral-800 transition-all duration-300 flex items-center justify-center gap-2 group font-medium tracking-wider uppercase text-xs md:text-sm touch-target">
  <Plus className="w-4 h-4 flex-shrink-0" />
  <span>버튼 텍스트</span>
  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0 group-hover:translate-x-1 transition-transform duration-300" />
</button>

// Secondary 버튼 (밝은 배경)
<button className="whitespace-nowrap px-4 py-2.5 md:px-6 md:py-3 bg-gray-100 hover:bg-gray-200 text-neutral-700 transition-all font-medium tracking-wider uppercase text-xs md:text-sm touch-target">
  버튼 텍스트
</button>

// 위험 버튼
<button className="whitespace-nowrap px-3 py-2 md:px-4 md:py-2.5 bg-red-100 hover:bg-red-200 text-red-700 transition-all font-medium tracking-wider uppercase text-xs md:text-caption touch-target">
  삭제
</button>

// 모바일 전체 너비 버튼
<button className="w-full sm:w-auto whitespace-nowrap px-6 py-3 bg-neutral-900 text-white hover:bg-neutral-800 transition-all font-medium tracking-wider uppercase text-sm touch-target">
  제출
</button>
```

### 3. 입력 필드

```tsx
// 기본 입력 필드
<input
  type="text"
  className="w-full px-4 py-3 border border-gray-200 focus:border-neutral-900 focus:outline-none transition-colors duration-200 text-base md:text-sm"
  placeholder="입력하세요"
/>

// Textarea
<textarea
  className="w-full px-4 py-3 border border-gray-200 focus:border-neutral-900 focus:outline-none transition-colors duration-200 resize-none text-base md:text-sm"
  rows={4}
  placeholder="내용을 입력하세요"
/>

// Select
<select className="w-full px-4 py-3 border border-gray-200 focus:border-neutral-900 focus:outline-none transition-colors duration-200 text-base md:text-sm bg-white">
  <option>선택하세요</option>
  <option>옵션 1</option>
  <option>옵션 2</option>
</select>
```

### 4. 모달

```tsx
// 모바일 bottom sheet 스타일 모달
<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
  {/* 배경 오버레이 */}
  <div className="absolute inset-0 bg-black/40" onClick={onClose} />

  {/* 모달 컨텐츠 */}
  <div className="relative z-10 w-full sm:max-w-md md:max-w-2xl bg-white rounded-t-xl sm:rounded-xl overflow-hidden flex flex-col max-h-[90vh] pb-safe">

    {/* 모바일 드래그 인디케이터 */}
    <div className="sm:hidden flex justify-center pt-2 pb-1">
      <div className="w-10 h-1 bg-neutral-300 rounded-full" />
    </div>

    {/* 헤더 */}
    <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-6 border-b border-gray-200 flex-shrink-0">
      <h2 className="text-base md:text-2xl font-medium tracking-wider text-neutral-900">모달 제목</h2>
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 transition-colors touch-target"
      >
        <X className="w-5 h-5" />
      </button>
    </div>

    {/* 바디 (스크롤 가능) */}
    <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin">
      {/* 모달 내용 */}
    </div>

    {/* 푸터 (고정) */}
    <div className="flex gap-2 md:gap-3 px-4 md:px-8 py-4 border-t border-gray-200 flex-shrink-0">
      <button
        onClick={onClose}
        className="flex-1 px-4 py-3 border border-gray-300 hover:bg-gray-50 transition-all text-neutral-700 font-medium tracking-wider uppercase text-sm touch-target"
      >
        취소
      </button>
      <button
        onClick={onSubmit}
        className="flex-1 px-4 py-3 bg-neutral-900 text-white hover:bg-neutral-800 transition-all font-medium tracking-wider uppercase text-sm touch-target"
      >
        확인
      </button>
    </div>
  </div>
</div>
```

### 5. 배지 (Badge)

```tsx
// 상태 배지
const STATUS_STYLES = {
  draft: 'bg-gray-100 text-gray-700 border-gray-200',
  estimate: 'bg-blue-50 text-blue-700 border-blue-200',
  proposal: 'bg-purple-50 text-purple-700 border-purple-200',
  contract: 'bg-green-50 text-green-700 border-green-200',
  construction: 'bg-orange-50 text-orange-700 border-orange-200',
  completed: 'bg-neutral-900 text-white border-neutral-900'
};

<span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium tracking-wider uppercase border ${STATUS_STYLES[status]}`}>
  <Circle className="w-2 h-2 fill-current" />
  {label}
</span>
```

### 6. 로딩 스피너

```tsx
// 페이지 로딩
<div className="flex items-center justify-center py-12 md:py-16 lg:py-20">
  <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-neutral-900/30 border-t-neutral-900 rounded-full animate-spin"></div>
</div>

// 버튼 내 로딩
<button disabled className="px-6 py-3 bg-neutral-900 text-white opacity-50 cursor-not-allowed">
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
    <span>처리 중...</span>
  </div>
</button>
```

---

## 📱 모바일 반응형

### 1. 브레이크포인트

```js
// Tailwind 기본 브레이크포인트
{
  'sm': '640px',   // 태블릿
  'md': '768px',   // 태블릿 가로
  'lg': '1024px',  // 데스크톱
  'xl': '1280px',  // 큰 데스크톱
  '2xl': '1536px'  // 매우 큰 화면
}
```

### 2. 반응형 유틸리티

```css
@layer utilities {
  /* 스크롤바 숨기기 */
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  /* 얇은 스크롤바 */
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
    height: 8px;
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #C59C6C;
    border-radius: 10px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #A67C52;
  }

  /* Gold 스크롤바 */
  .scrollbar-gold::-webkit-scrollbar {
    width: 6px;
    height: 8px;
  }
  .scrollbar-gold::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  .scrollbar-gold::-webkit-scrollbar-thumb {
    background: #C59C6C;
    border-radius: 10px;
  }
  .scrollbar-gold::-webkit-scrollbar-thumb:hover {
    background: #A67C52;
  }

  /* iOS Safe Area */
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 0);
  }
  .pt-safe {
    padding-top: env(safe-area-inset-top, 0);
  }

  /* 터치 타겟 최소 크기 (44px) */
  .touch-target {
    min-height: 44px;
    min-width: 44px;
  }
}
```

### 3. 반응형 패턴

#### 컨테이너 패딩
```tsx
// 작음 → 중간 → 큰
className="px-4 md:px-6 lg:px-8"
className="py-4 md:py-6 lg:py-8"
className="p-4 md:p-5 lg:p-6"
```

#### 텍스트 크기
```tsx
// 제목
className="text-lg md:text-xl lg:text-2xl"

// 본문
className="text-sm md:text-base"

// 캡션
className="text-xs md:text-sm"
```

#### 간격
```tsx
// Gap
className="gap-2 md:gap-3 lg:gap-4"
className="gap-3 md:gap-4 lg:gap-6"

// Margin
className="mb-3 md:mb-4 lg:mb-6"
className="mt-4 md:mt-6 lg:mt-8"
```

#### 아이콘 크기
```tsx
// 작은 아이콘
className="w-4 h-4 md:w-5 md:h-5"

// 중간 아이콘
className="w-5 h-5 md:w-6 md:h-6"

// 큰 아이콘
className="w-8 h-8 md:w-10 md:h-10"
```

#### 레이아웃 전환
```tsx
// 세로 → 가로
className="flex flex-col sm:flex-row"

// 숨김 → 표시
className="hidden md:block"
className="hidden md:flex"

// 표시 → 숨김
className="block sm:hidden"
className="sm:hidden"
```

#### 그리드
```tsx
// 1열 → 2열 → 3열
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"

// 2열 → 4열
className="grid grid-cols-2 lg:grid-cols-4"

// 3열 → 4열 → 2열
className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-2"
```

### 4. 헤더 반응형 예시

```tsx
// 모바일: 햄버거 메뉴 / 데스크톱: 풀 네비게이션
<header className="bg-black text-white border-b border-neutral-800 sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
    <div className="flex justify-between items-center h-14 md:h-16">

      {/* 로고 */}
      <Link to="/" className="flex items-center gap-3 md:gap-6">
        <Minus className="w-3 h-3 md:w-4 md:h-4 text-[#C59C6C]" />
        <span className="text-xs md:text-sm font-normal tracking-[0.2em] md:tracking-[0.25em] uppercase">
          Brand Name
        </span>
      </Link>

      {/* 데스크톱 네비게이션 */}
      <nav className="hidden md:flex items-center gap-1">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 px-5 py-2 text-white hover:text-neutral-300 transition-colors duration-300"
        >
          <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} />
          <span className="text-xs font-medium tracking-wider uppercase">Dashboard</span>
        </Link>
        {/* 더 많은 네비게이션 아이템 */}
      </nav>

      {/* 모바일 메뉴 버튼 */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2 hover:bg-neutral-800 transition-colors duration-300 touch-target"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
    </div>
  </div>

  {/* 모바일 메뉴 */}
  {mobileMenuOpen && (
    <div className="md:hidden border-t border-neutral-800 bg-neutral-900 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
      <div className="px-4 py-4 space-y-1">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 px-3 py-3.5 text-white hover:bg-neutral-800 transition-colors duration-300 touch-target"
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-sm font-medium tracking-wide uppercase">Dashboard</span>
        </Link>
        {/* 더 많은 모바일 메뉴 아이템 */}
      </div>
    </div>
  )}
</header>
```

### 5. iOS 최적화

```tsx
// 모달에 safe area 적용
<div className="pb-safe">
  {/* 모달 내용 */}
</div>

// 입력 필드 줌 방지 (index.css에 이미 포함)
@media (max-width: 767px) {
  input, select, textarea {
    font-size: 16px !important;
  }
}

// 터치 타겟 크기 보장
<button className="touch-target">버튼</button>
```

---

## 🚀 설치 가이드

### 1. 패키지 설치

```bash
# 새 React + TypeScript + Vite 프로젝트 생성
npm create vite@latest my-project -- --template react-ts
cd my-project

# Tailwind CSS 설치
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# React Router 설치
npm install react-router-dom

# Lucide Icons 설치
npm install lucide-react

# 개발 서버 실행
npm run dev
```

### 2. Tailwind 설정

**tailwind.config.js**를 다음과 같이 수정:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'phomi-gold': '#C59C6C',
        'phomi-black': '#1a1a1a',
        'phomi-gray': {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Pretendard', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### 3. 글로벌 CSS 설정

**src/index.css** 파일을 다음 내용으로 교체:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply m-0 p-0 box-border;
  }

  html {
    overflow-y: scroll;
  }

  body {
    @apply font-sans text-phomi-gray-900 bg-white antialiased;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-bold text-phomi-black;
  }

  /* 모바일 입력 필드 줌 방지 (iOS) */
  @media (max-width: 767px) {
    input, select, textarea {
      font-size: 16px !important;
    }
  }
}

@layer components {
  /* ===== 통일된 타이포그래피 시스템 ===== */

  .text-title {
    @apply text-lg font-bold text-gray-900;
  }

  .text-body {
    @apply text-sm text-gray-700;
  }

  .text-caption {
    @apply text-xs text-gray-500;
  }

  .text-button {
    @apply text-sm font-bold;
  }

  .text-input {
    @apply text-sm text-gray-900;
  }

  /* ===== 카드 & 섹션 스타일 ===== */

  .card-base {
    @apply bg-white rounded-2xl shadow-sm border border-gray-200;
  }

  .section-header {
    @apply flex items-center gap-2 mb-4;
  }

  .step-badge {
    @apply w-8 h-8 bg-gradient-to-br from-[#C59C6C] to-[#A67C52] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0;
  }

  /* ===== 레거시 Phomi 스타일 ===== */

  .btn-primary {
    @apply px-8 py-4 bg-phomi-gold text-white font-medium tracking-wide
           hover:bg-phomi-black transition-all duration-300
           shadow-sm hover:shadow-md;
  }

  .btn-secondary {
    @apply px-8 py-4 border-2 border-phomi-black text-phomi-black font-medium
           hover:bg-phomi-black hover:text-white transition-all duration-300;
  }

  .input-field {
    @apply w-full px-4 py-3 border border-phomi-gray-100
           focus:border-phomi-gold focus:outline-none
           transition-colors duration-200;
  }

  .phomi-card {
    @apply bg-white border border-phomi-gray-100
           hover:shadow-lg transition-shadow duration-300;
  }
}

@layer utilities {
  /* ===== 스크롤바 스타일 ===== */

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
    height: 8px;
  }

  .scrollbar-thin::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #C59C6C;
    border-radius: 10px;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #A67C52;
  }

  .scrollbar-gold::-webkit-scrollbar {
    width: 6px;
    height: 8px;
  }

  .scrollbar-gold::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  .scrollbar-gold::-webkit-scrollbar-thumb {
    background: #C59C6C;
    border-radius: 10px;
  }

  .scrollbar-gold::-webkit-scrollbar-thumb:hover {
    background: #A67C52;
  }

  /* ===== 모바일 반응형 유틸리티 ===== */

  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 0);
  }

  .pt-safe {
    padding-top: env(safe-area-inset-top, 0);
  }

  .touch-target {
    min-height: 44px;
    min-width: 44px;
  }
}

/* ===== 애니메이션 ===== */

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.delay-1000 {
  animation-delay: 1s;
}
```

### 4. 폰트 설정

**index.html**의 `<head>` 안에 다음 추가:

```html
<!-- Google Fonts - Inter -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">

<!-- 한글 폰트 - Pretendard (Optional) -->
<link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
```

### 5. 프로젝트 구조

```
src/
├── components/
│   ├── layout/
│   │   ├── Layout.tsx          # 메인 레이아웃
│   │   └── Header.tsx          # 헤더 (옵션)
│   ├── common/
│   │   ├── Button.tsx          # 재사용 버튼
│   │   ├── Card.tsx            # 재사용 카드
│   │   ├── Modal.tsx           # 재사용 모달
│   │   └── Badge.tsx           # 재사용 배지
│   └── [feature]/              # 기능별 컴포넌트
├── pages/
│   ├── dashboard/
│   │   └── DashboardPage.tsx
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   └── [feature]/
├── contexts/                    # React Context
├── services/                    # API 서비스
├── types/                       # TypeScript 타입
├── utils/                       # 유틸리티 함수
├── App.tsx
├── main.tsx
└── index.css
```

---

## 📦 컴포넌트 예시 파일

### Button.tsx

```tsx
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  children: ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  children,
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'whitespace-nowrap transition-all duration-300 flex items-center justify-center gap-2 group font-medium tracking-wider uppercase touch-target';

  const variantStyles = {
    primary: 'bg-neutral-900 text-white hover:bg-neutral-800',
    secondary: 'bg-gray-100 text-neutral-700 hover:bg-gray-200',
    danger: 'bg-red-100 text-red-700 hover:bg-red-200'
  };

  const sizeStyles = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-4 py-2.5 md:px-6 md:py-3 text-xs md:text-sm',
    lg: 'px-6 py-3 md:px-8 md:py-4 text-sm md:text-base'
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      <span>{children}</span>
      {IconRight && <IconRight className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0 group-hover:translate-x-1 transition-transform duration-300" />}
    </button>
  );
}
```

### Card.tsx

```tsx
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  hover?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function Card({ children, hover = false, onClick, className = '' }: CardProps) {
  const hoverStyles = hover ? 'hover:bg-neutral-50 cursor-pointer' : '';

  return (
    <div
      onClick={onClick}
      className={`card-base group p-4 md:p-5 lg:p-6 transition-all duration-300 ${hoverStyles} ${className}`}
    >
      {children}
    </div>
  );
}
```

### Modal.tsx

```tsx
import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md'
}: ModalProps) {
  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md md:max-w-2xl',
    lg: 'sm:max-w-lg md:max-w-3xl',
    xl: 'sm:max-w-xl md:max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative z-10 w-full ${maxWidthStyles[maxWidth]} bg-white rounded-t-xl sm:rounded-xl overflow-hidden flex flex-col max-h-[90vh] pb-safe`}>

        {/* Mobile drag indicator */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-neutral-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-base md:text-2xl font-medium tracking-wider text-neutral-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-target"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-4 md:px-8 py-4 border-t border-gray-200 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🎯 빠른 시작 체크리스트

- [ ] Vite + React + TypeScript 프로젝트 생성
- [ ] Tailwind CSS 설치 및 설정
- [ ] `tailwind.config.js` 색상 설정 복사
- [ ] `src/index.css` 전체 내용 복사
- [ ] `index.html`에 폰트 링크 추가
- [ ] React Router 설치 및 설정
- [ ] Lucide React 아이콘 설치
- [ ] Layout 컴포넌트 생성
- [ ] 첫 페이지 생성 및 스타일 적용
- [ ] 모바일 테스트 (Chrome DevTools)

---

## 💡 디자인 팁

1. **간격은 넉넉하게**
   - 카드 내부: p-4 md:p-6 lg:p-8
   - 섹션 간: mb-6 md:mb-8 lg:mb-12
   - 아이템 간: gap-3 md:gap-4 lg:gap-6

2. **전환 효과는 부드럽게**
   - 기본: `transition-all duration-300`
   - 느리게: `transition-all duration-500`
   - 색상만: `transition-colors duration-300`

3. **텍스트는 명확하게**
   - 제목: font-medium 또는 font-bold
   - 본문: font-normal
   - 작은 텍스트: font-medium + uppercase

4. **호버는 섬세하게**
   - 배경: hover:bg-neutral-50
   - 테두리: hover:border-neutral-900
   - 그림자: hover:shadow-lg
   - 아이콘: group-hover:translate-x-1

5. **모바일 우선**
   - 기본 스타일은 모바일용
   - md: 이상에서 데스크톱 스타일 적용
   - 터치 영역 최소 44px 보장

---

## 📚 참고 자료

- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [React Router](https://reactrouter.com/)
- [Vite](https://vitejs.dev/)

---

**이 디자인 시스템으로 프리미엄 SaaS를 만들어보세요!** ✨

문의사항이나 개선 제안이 있다면 언제든지 연락주세요.
