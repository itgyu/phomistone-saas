# Phomistone SaaS - NanoBanana Pro Edition

완전히 새로 구축된 단순화 버전입니다.

## 🏗️ Architecture

**단일 모델 파이프라인**:
```
Frontend → n8n → MCP Server
              ↓
         NanoBanana Pro (Gemini 3 Pro Image Preview)
              ↓
         Result Image
```

## 📦 Structure

```
~/Desktop/phomistone-saas/
├── mcp-server/               # Express 서버 (Port 3001)
│   └── src/
│       ├── http-server.ts
│       └── data/
│           └── materials-schema.json
├── n8n-workflows/
│   └── phomistone-reset.json # NanoBanana Pro 워크플로우
└── frontend/                 # Vite + React (Port 5173)
    └── src/
        ├── App.tsx
        └── pages/ai/
            └── AIStylingPage.tsx
```

## 🚀 실행 순서

### Terminal 1: MCP Server
```bash
cd ~/Desktop/phomistone-saas/mcp-server
npm install
npm run dev
```

**예상 출력**:
```
✅ MCP Server running on http://localhost:3001
```

---

### Terminal 2: n8n (Docker)
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  --add-host=host.docker.internal:host-gateway \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

**브라우저 접속**: http://localhost:5678

**워크플로우 Import**:
1. Workflows → Import from File
2. 파일 선택: `n8n-workflows/phomistone-reset.json`
3. Active 토글 **ON** ⭐

---

### Terminal 3: Frontend
```bash
cd ~/Desktop/phomistone-saas/frontend
npm install
npm run dev
```

**브라우저 접속**: http://localhost:5173

---

## 🎯 사용 방법

1. http://localhost:5173 접속
2. **자재 선택** (Sahara Light Grey / Veil Dark Grey / Travertine)
3. **건물 이미지 업로드**
4. **"Generate AI Styling" 클릭**
5. 30-60초 대기 → 결과 확인

---

## 🔑 API Key

워크플로우에 하드코딩됨:
```
AIzaSyBLK7Oas8ShOHWnyT5WpL5cRyTMoLwunCg
```

**모델**: `gemini-3-pro-image-preview` (NanoBanana Pro)

---

## ⚡ 핵심 변경사항

### 이전 버전 (복잡)
- Brain (구조 분석) + Formatter + Hand (이미지 생성)
- Replicate API 필요
- 다단계 파이프라인

### 현재 버전 (단순)
- **NanoBanana Pro 단일 모델**
- 이미지 입력 + 텍스트 프롬프트 → 이미지 출력
- API Key 하드코딩 (사용자 입력 불필요)
- 심플한 UI (마스킹 없음)

---

## 📋 체크리스트

- [ ] Terminal 1: MCP Server 실행 (Port 3001)
- [ ] Terminal 2: n8n 실행 및 워크플로우 Import
- [ ] Terminal 3: Frontend 실행 (Port 5173)
- [ ] 브라우저에서 테스트

---

## 🐛 트러블슈팅

### MCP 서버 에러
```bash
cd mcp-server
npm install -g tsx
npm run dev
```

### n8n 연결 실패
- Docker `--add-host=host.docker.internal:host-gateway` 확인
- MCP 서버 3001 포트 확인

### Frontend 에러
- Vite proxy 설정 확인 (`vite.config.ts`)
- n8n 5678 포트 확인

---

## ✅ 완료!

모든 파일이 생성되었습니다. 위 순서대로 실행하세요.

**버전**: 2.0 (Reset)
**날짜**: 2025-11-25
