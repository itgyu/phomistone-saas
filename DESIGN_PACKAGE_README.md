# 📦 Phomistone Premium Design System Package

> 다른 프로젝트에 즉시 적용할 수 있는 완전한 디자인 시스템 패키지

---

## 📂 패키지 구성

이 폴더에는 다음 파일들이 포함되어 있습니다:

```
phomistone-saas/
├── DESIGN_SYSTEM.md          # 📘 완전한 디자인 시스템 가이드 (100+ 페이지)
├── QUICK_START.md             # 🚀 5분 빠른 시작 가이드
├── COMPONENTS_LIBRARY.tsx     # 🎨 10개 재사용 컴포넌트
├── frontend/
│   ├── tailwind.config.js    # ⚙️  Tailwind 설정 (색상, 폰트)
│   └── src/
│       └── index.css         # 🎨 글로벌 CSS (복사해서 사용)
└── DESIGN_PACKAGE_README.md  # 📄 이 파일
```

---

## 🚀 빠른 사용법

### 1️⃣ 완전 신규 프로젝트

**QUICK_START.md**를 따라하세요 (5분 소요)

```bash
# 1. 프로젝트 생성
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install

# 2. 패키지 설치
npm install react-router-dom lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 3. 파일 3개 복사
#    - tailwind.config.js
#    - src/index.css
#    - index.html (폰트 추가)

# 4. 실행
npm run dev
```

### 2️⃣ 기존 프로젝트에 적용

**DESIGN_SYSTEM.md**의 "설치 가이드" 섹션 참고

1. Tailwind CSS 설치 (아직 없다면)
2. `tailwind.config.js`에 색상/폰트 설정 추가
3. `src/index.css`에 스타일 추가
4. 컴포넌트들을 점진적으로 적용

### 3️⃣ 컴포넌트만 사용

**COMPONENTS_LIBRARY.tsx**에서 필요한 컴포넌트만 복사

```tsx
// 예: Button 컴포넌트만 복사
// src/components/Button.tsx 파일 생성하고 붙여넣기
import { Button } from '@/components/Button';

<Button variant="primary" icon={Plus}>
  버튼 텍스트
</Button>
```

---

## 📚 각 파일 설명

### 📘 DESIGN_SYSTEM.md

**가장 완벽한 가이드 (추천!)**

- 디자인 철학과 원칙
- 색상 시스템 전체
- 타이포그래피 가이드
- 레이아웃 패턴 (그리드, Flexbox)
- 컴포넌트 스타일 (카드, 버튼, 모달 등)
- 모바일 반응형 완벽 가이드
- 단계별 설치 방법
- Best practices

👉 **처음 사용한다면 여기서 시작하세요!**

---

### 🚀 QUICK_START.md

**5분 빠른 시작 가이드**

- 최소한의 단계로 프리미엄 디자인 적용
- 복사-붙여넣기만으로 완성
- 실행 가능한 예제 코드 포함
- 주요 클래스 치트시트

👉 **빠르게 프로토타입을 만들고 싶다면!**

---

### 🎨 COMPONENTS_LIBRARY.tsx

**10개의 재사용 가능한 프리미엄 컴포넌트**

1. **Button** - Primary, Secondary, Danger 변형
2. **Card** - 호버 효과, 다양한 패딩 옵션
3. **Modal** - 모바일 bottom sheet 스타일
4. **Input** - Label, Error, Helper text 지원
5. **Textarea** - 자동 리사이징, 에러 표시
6. **Badge** - 6가지 색상 변형
7. **Spinner** - 로딩 인디케이터
8. **EmptyState** - 빈 상태 화면
9. **StatCard** - 통계 카드 (프로그레스바 포함)
10. **Alert** - 4가지 알림 타입

각 컴포넌트는:
- ✅ TypeScript 완전 지원
- ✅ 모바일 반응형
- ✅ 접근성 고려
- ✅ 사용 예시 포함

👉 **프로덕션 레벨 컴포넌트가 필요하다면!**

---

### ⚙️ tailwind.config.js

**Tailwind 설정 파일**

```js
colors: {
  'phomi-gold': '#C59C6C',      // 골드 포인트 컬러
  'phomi-black': '#1a1a1a',     // 브랜드 블랙
  'phomi-gray': { /* 50-900 */ }  // 그레이 스케일
}
```

이 파일을 복사하거나, `extend.colors` 부분만 추가하세요.

---

### 🎨 frontend/src/index.css

**글로벌 CSS (가장 중요!)**

이 파일에는 다음이 포함되어 있습니다:

- 기본 리셋 스타일
- 타이포그래피 유틸리티 (.text-title, .text-body 등)
- 카드 스타일 (.card-base)
- 버튼 스타일 (.btn-primary, .btn-secondary)
- 스크롤바 스타일 (.scrollbar-thin, .scrollbar-gold)
- 모바일 유틸리티 (.touch-target, .pb-safe)
- 애니메이션

**⚠️ 이 파일을 반드시 복사하세요!**

---

## 🎯 사용 시나리오별 가이드

### 시나리오 1: 빠른 프로토타입

**목표**: 30분 안에 멋진 프로토타입 만들기

1. `QUICK_START.md` 따라하기
2. 예제 코드 복사해서 수정
3. 완료!

---

### 시나리오 2: 프로덕션 프로젝트

**목표**: 확장 가능한 디자인 시스템 구축

1. `DESIGN_SYSTEM.md` 전체 읽기
2. `tailwind.config.js` 프로젝트에 맞게 커스터마이즈
3. `COMPONENTS_LIBRARY.tsx`에서 컴포넌트 복사
4. 프로젝트 구조에 맞게 정리
5. Storybook 등으로 문서화 (선택)

---

### 시나리오 3: 기존 프로젝트 리디자인

**목표**: 기존 앱에 프리미엄 디자인 적용

1. `DESIGN_SYSTEM.md`의 "설치 가이드" 섹션 참고
2. `index.css`의 스타일 점진적으로 추가
3. 한 페이지씩 컴포넌트 교체
4. 모바일 반응형 테스트

---

### 시나리오 4: 컴포넌트 라이브러리만 필요

**목표**: 특정 컴포넌트만 가져오기

1. `COMPONENTS_LIBRARY.tsx` 열기
2. 필요한 컴포넌트 복사
3. `src/components/` 폴더에 별도 파일로 저장
4. import해서 사용

---

## 💡 주요 디자인 특징

### 색상
- **블랙 헤더** (#000000) - 프리미엄 느낌
- **밝은 배경** (#FAFAFA) - 깔끔하고 현대적
- **골드 포인트** (#C59C6C) - 하이엔드 브랜딩
- **뉴트럴 스케일** (50-900) - 세밀한 계층 구조

### 타이포그래피
- **Inter + Pretendard** - 현대적이고 가독성 좋은 폰트
- **3단계 시스템** - Title, Body, Caption
- **Wide Tracking** - 고급스러운 자간
- **Uppercase Labels** - 미니멀하고 세련된 레이블

### 레이아웃
- **넓은 간격** - 여유로운 패딩과 마진
- **7xl 컨테이너** (1280px) - 넓은 화면 활용
- **모바일 우선** - 완벽한 반응형

### 상호작용
- **부드러운 전환** - 300ms duration
- **섬세한 호버** - 미묘한 배경/그림자 변화
- **그룹 효과** - 아이콘과 텍스트 동시 변화

---

## 📱 모바일 최적화

이 디자인 시스템은 **모바일 우선**으로 설계되었습니다:

✅ iOS Safe Area 지원
✅ 44px 최소 터치 영역
✅ 16px 입력 필드 (iOS 줌 방지)
✅ Bottom sheet 스타일 모달
✅ 햄버거 메뉴
✅ 반응형 그리드
✅ 터치 친화적 인터랙션

---

## 🔧 커스터마이징

### 색상 변경

`tailwind.config.js`에서:

```js
colors: {
  'phomi-gold': '#YOUR_COLOR',  // 브랜드 컬러로 변경
  'phomi-black': '#YOUR_DARK',
  // ...
}
```

### 폰트 변경

`tailwind.config.js`에서:

```js
fontFamily: {
  sans: ['Your Font', 'system-ui', 'sans-serif'],
}
```

### 간격 조정

`index.css`에서 유틸리티 클래스 수정:

```css
.card-base {
  @apply bg-white rounded-xl p-4; /* 기존: rounded-2xl p-6 */
}
```

---

## 📊 포함된 내용

### 컴포넌트 (10개)
- ✅ Button (3 variants, 3 sizes)
- ✅ Card (호버, 패딩 옵션)
- ✅ Modal (bottom sheet)
- ✅ Input (label, error)
- ✅ Textarea
- ✅ Badge (6 variants)
- ✅ Spinner
- ✅ EmptyState
- ✅ StatCard
- ✅ Alert (4 types)

### 페이지 예시
- ✅ 대시보드 (통계 카드, 프로젝트 그리드)
- ✅ 로그인/회원가입
- ✅ 프로필
- ✅ 상세 페이지

### 레이아웃
- ✅ 헤더 (모바일 햄버거 메뉴)
- ✅ 푸터
- ✅ 모달
- ✅ 사이드바 (옵션)

### 유틸리티
- ✅ 스크롤바 스타일
- ✅ iOS Safe Area
- ✅ 터치 타겟
- ✅ 애니메이션

---

## 🎓 학습 자료

### 초급
1. `QUICK_START.md` - 빠른 시작
2. 예제 코드 실행해보기
3. 색상과 간격 조정해보기

### 중급
1. `DESIGN_SYSTEM.md` - 전체 가이드 읽기
2. 컴포넌트 커스터마이징
3. 새로운 페이지 만들기

### 고급
1. `COMPONENTS_LIBRARY.tsx` - 컴포넌트 분석
2. 디자인 시스템 확장
3. 재사용 패턴 추출

---

## 💬 자주 묻는 질문

### Q: TypeScript가 필수인가요?
A: 아니요. JavaScript로도 사용 가능합니다. 타입만 제거하면 됩니다.

### Q: Tailwind를 이미 사용 중인데?
A: `tailwind.config.js`의 `colors`와 `fontFamily`만 추가하고, `index.css`를 복사하세요.

### Q: React 외 다른 프레임워크에서도 사용 가능한가요?
A: 네! Vue, Svelte, Angular 등에서도 Tailwind만 있으면 사용 가능합니다. 컴포넌트는 해당 프레임워크 문법으로 변환하세요.

### Q: 모바일 앱(React Native)에서도 사용할 수 있나요?
A: Tailwind는 웹 전용이지만, 색상과 디자인 원칙은 그대로 적용할 수 있습니다.

### Q: 상업적 프로젝트에서 사용해도 되나요?
A: 네! 자유롭게 사용하세요.

---

## 🛠️ 기술 스택

- **React 18** + TypeScript
- **Vite** - 빠른 개발 서버
- **Tailwind CSS 3** - 유틸리티 CSS
- **Lucide React** - 아이콘
- **React Router** - 라우팅

---

## 📈 다음 단계

1. ✅ 디자인 시스템 적용 완료
2. ⬜ 더 많은 컴포넌트 추가 (Table, Tabs, Dropdown 등)
3. ⬜ Storybook 문서화
4. ⬜ 다크 모드 지원
5. ⬜ 애니메이션 라이브러리 통합

---

## 📞 지원

문제가 발생하거나 질문이 있으면:

1. `DESIGN_SYSTEM.md`의 "문제 해결" 섹션 참고
2. 예제 코드와 비교
3. Tailwind CSS 공식 문서 참고

---

## 🎉 완성!

이제 다른 프로젝트에서 이 디자인 시스템을 자유롭게 사용하세요!

**프리미엄 SaaS를 만들어보세요!** ✨

---

**Created with ❤️ by Phomistone Team**
