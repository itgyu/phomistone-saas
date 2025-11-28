# 🚀 Phomistone 디자인 5분 빠른 시작

> 새 프로젝트에 Phomistone 디자인을 즉시 적용하는 방법

---

## 1단계: 프로젝트 생성 (1분)

```bash
# React + TypeScript + Vite 프로젝트 생성
npm create vite@latest my-premium-app -- --template react-ts
cd my-premium-app

# 패키지 설치
npm install

# 필수 패키지 추가
npm install react-router-dom lucide-react
npm install -D tailwindcss postcss autoprefixer

# Tailwind 초기화
npx tailwindcss init -p
```

---

## 2단계: 3개 파일만 복사 (2분)

### ① `tailwind.config.js` (전체 교체)

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'phomi-gold': '#C59C6C',
        'phomi-black': '#1a1a1a',
        'phomi-gray': {
          50: '#fafafa', 100: '#f5f5f5', 200: '#e5e5e5', 300: '#d4d4d4',
          400: '#a3a3a3', 500: '#737373', 600: '#525252', 700: '#404040',
          800: '#262626', 900: '#171717',
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

### ② `src/index.css` (전체 교체)

**파일 위치**: `/Users/taegyulee/Desktop/phomistone-saas/frontend/src/index.css`

👆 **이 파일을 그대로 복사하세요!**

### ③ `index.html`의 `<head>` 안에 폰트 추가

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
```

---

## 3단계: 첫 페이지 만들기 (2분)

### `src/App.tsx`

```tsx
import { Minus, Plus, ArrowRight } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* 헤더 */}
      <header className="bg-black text-white border-b border-neutral-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            <div className="flex items-center gap-3 md:gap-6">
              <Minus className="w-3 h-3 md:w-4 md:h-4 text-[#C59C6C]" />
              <span className="text-xs md:text-sm font-normal tracking-[0.2em] md:tracking-[0.25em] uppercase">
                My Premium App
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        {/* 페이지 제목 */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-lg md:text-xl lg:text-2xl text-phomi-black mb-1 flex items-center gap-2 md:gap-3 font-medium tracking-wider uppercase">
            <Minus className="w-4 h-4 md:w-5 md:h-5 text-phomi-black" />
            Welcome
          </h1>
          <p className="text-xs md:text-sm font-medium tracking-wider text-neutral-500">
            프리미엄 디자인이 적용되었습니다
          </p>
        </div>

        {/* 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
          {/* 카드 1 */}
          <div className="card-base group p-4 md:p-5 lg:p-6 hover:bg-neutral-50 transition-all duration-300 cursor-pointer">
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className="p-2 md:p-3 group-hover:bg-gray-900 group-hover:text-white transition-all duration-300">
                <Plus className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="text-right">
                <p className="text-lg md:text-xl lg:text-2xl mb-1 font-medium tracking-wider text-neutral-900">
                  42
                </p>
                <p className="text-xs md:text-caption font-medium tracking-wider uppercase text-neutral-500">
                  Total Items
                </p>
              </div>
            </div>
            <div className="h-1 bg-gray-100 overflow-hidden">
              <div className="h-full bg-gray-900 w-full transition-all duration-500"></div>
            </div>
          </div>

          {/* 카드 2 */}
          <div className="card-base p-4 md:p-5 lg:p-6">
            <h3 className="text-base md:text-lg font-medium tracking-wider text-neutral-900 mb-2">
              Simple Card
            </h3>
            <p className="text-sm md:text-body text-neutral-600 font-normal tracking-wider">
              카드 내용을 여기에 작성하세요
            </p>
          </div>

          {/* 카드 3 - 다크 */}
          <div className="bg-neutral-900 p-4 md:p-5 lg:p-6 text-white hover:bg-neutral-800 transition-all duration-300 cursor-pointer shadow-sm border border-gray-200">
            <h3 className="text-base md:text-lg font-medium tracking-wider mb-2">
              Dark Card
            </h3>
            <p className="text-sm md:text-body text-white/90 font-normal tracking-wider">
              다크 스타일 카드
            </p>
          </div>
        </div>

        {/* 버튼 예시 */}
        <div className="mt-6 md:mt-8 flex flex-wrap gap-3">
          <button className="whitespace-nowrap bg-neutral-900 text-white px-4 py-2.5 md:px-6 md:py-3 hover:bg-neutral-800 transition-all duration-300 flex items-center justify-center gap-2 group font-medium tracking-wider uppercase text-xs md:text-sm touch-target">
            <Plus className="w-4 h-4 flex-shrink-0" />
            <span>Primary Button</span>
            <ArrowRight className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0 group-hover:translate-x-1 transition-transform duration-300" />
          </button>

          <button className="whitespace-nowrap px-4 py-2.5 md:px-6 md:py-3 bg-gray-100 hover:bg-gray-200 text-neutral-700 transition-all font-medium tracking-wider uppercase text-xs md:text-sm touch-target">
            Secondary Button
          </button>
        </div>
      </div>

      {/* 푸터 */}
      <footer className="bg-neutral-50 border-t border-neutral-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex items-center justify-center gap-2 md:gap-3">
            <Minus className="w-2 h-2 md:w-3 md:h-3 text-neutral-700" />
            <p className="text-center text-neutral-700 text-[9px] md:text-[10px] font-medium tracking-[0.15em] md:tracking-[0.2em] uppercase">
              © 2024 My Premium App. All rights reserved.
            </p>
            <Minus className="w-2 h-2 md:w-3 md:h-3 text-neutral-700" />
          </div>
        </div>
      </footer>
    </div>
  );
}
```

---

## 4단계: 실행 & 확인

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 열기

✅ **완료!** 프리미엄 디자인이 적용되었습니다.

---

## 🎨 주요 클래스 치트시트

### 색상
```tsx
text-neutral-900      // 진한 텍스트
text-neutral-700      // 일반 텍스트
text-neutral-500      // 보조 텍스트
text-phomi-gold       // 골드 포인트

bg-black              // 헤더 배경
bg-[#FAFAFA]          // 페이지 배경
bg-white              // 카드 배경
bg-neutral-900        // 버튼 배경
```

### 반응형 패딩
```tsx
px-4 md:px-6 lg:px-8     // 좌우 패딩
py-4 md:py-6 lg:py-8     // 상하 패딩
p-4 md:p-5 lg:p-6        // 전체 패딩
gap-3 md:gap-4 lg:gap-6  // 간격
```

### 카드
```tsx
className="card-base p-4 md:p-6"
```

### 버튼
```tsx
// Primary
className="bg-neutral-900 text-white px-6 py-3 hover:bg-neutral-800 transition-all"

// Secondary
className="bg-gray-100 text-neutral-700 px-6 py-3 hover:bg-gray-200 transition-all"
```

### 그리드
```tsx
// 1열 → 2열 → 3열
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"

// 2열 → 4열
className="grid grid-cols-2 lg:grid-cols-4 gap-4"
```

---

## 📚 더 자세한 내용은?

`DESIGN_SYSTEM.md` 파일을 참고하세요!

- 전체 컴포넌트 라이브러리
- 모바일 최적화 가이드
- 상세한 사용 예시
- Best practices

---

**5분 만에 프리미엄 디자인 완성!** ✨
