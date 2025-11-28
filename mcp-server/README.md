# Phomistone MCP Server

Material Control Platform (MCP) server for Phomistone AI Styling system.

## 🚀 실행 방법

### 1. 의존성 설치
```bash
cd mcp-server
npm install
```

### 2. 서버 실행

**개발 모드 (자동 재시작):**
```bash
npm run dev
```

**프로덕션 모드:**
```bash
npm start
```

**빌드:**
```bash
npm run build
```

### 3. 테스트

**자동 테스트 스크립트:**
```bash
./test-mcp.sh
```

**수동 테스트:**
```bash
# Health Check
curl http://localhost:3001/health

# 모든 자재 조회
curl http://localhost:3001/materials

# 특정 자재 조회 (GET)
curl http://localhost:3001/materials/castol_white_01

# 특정 자재 조회 (POST - n8n용)
curl -X POST http://localhost:3001/prompt \
  -H "Content-Type: application/json" \
  -d '{"material_id": "castol_white_01"}'
```

## 📂 파일 구조

```
mcp-server/
├── src/
│   ├── http-server.ts         # 메인 서버
│   └── data/
│       ├── materials.json     # 자재 데이터 (33개)
│       └── materials-schema.json  # 자재 스키마
├── package.json
├── tsconfig.json
├── test-mcp.sh               # 테스트 스크립트
└── README.md                 # 이 파일
```

## 🔌 API 엔드포인트

### GET /health
서버 상태 확인

**응답:**
```json
{
  "status": "ok",
  "materials_count": 33,
  "timestamp": "2025-11-28T02:00:00.000Z"
}
```

### GET /materials
모든 자재 목록 조회

**응답:**
```json
[
  {
    "material_id": "castol_white_01",
    "name": "Phomistone Castol White",
    "series": "Castol",
    "positive_prompt": "...",
    ...
  },
  ...
]
```

### GET /materials/:id
특정 자재 조회

**파라미터:**
- `id`: 자재 ID (예: castol_white_01)

**응답:**
```json
{
  "material_id": "castol_white_01",
  "name": "Phomistone Castol White",
  "series": "Castol",
  "positive_prompt": "...",
  ...
}
```

**오류 (404):**
```json
{
  "error": "Material not found",
  "requested_id": "invalid_id",
  "available_count": 33,
  "sample_ids": ["castol_white_01", "veil_gray_02", ...]
}
```

### POST /prompt
자재 정보 조회 (n8n 워크플로우용)

**요청 바디:**
```json
{
  "material_id": "castol_white_01"
}
```

**응답:** GET /materials/:id와 동일

## 🔍 문제 해결

### "Material not found" 오류

1. **materials.json 파일 위치 확인:**
   ```bash
   ls -la src/data/materials.json
   ```

2. **서버 재시작:**
   ```bash
   npm run dev
   ```

3. **사용 가능한 자재 ID 확인:**
   ```bash
   curl http://localhost:3001/materials | jq '.[].material_id'
   ```

4. **로그 확인:**
   서버 시작 시 다음과 같은 로그가 보여야 합니다:
   ```
   ✅ Found materials.json at: /path/to/materials.json
   ✅ Loaded 33 materials
   First 5 material IDs:
      - castol_white_01: Phomistone Castol White
      - veil_gray_02: Phomistone Veil Gray
      ...
   ```

### 서버가 시작되지 않음

**tsx 설치 확인:**
```bash
npm install -D tsx
```

**포트 충돌 확인:**
```bash
# 3001 포트 사용 중인 프로세스 확인
lsof -i :3001

# 프로세스 종료
kill -9 <PID>
```

**의존성 재설치:**
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### 자재 ID 불일치

프론트엔드와 MCP 서버의 자재 ID가 일치하는지 확인:

```bash
# MCP 서버 자재 ID
jq '.[].material_id' src/data/materials.json

# 프론트엔드 자재 ID (frontend 폴더에서)
grep "material_id:" ../frontend/src/data/materials.ts
```

## 📊 자재 데이터 구조

각 자재는 다음 정보를 포함합니다:

```typescript
interface Material {
  material_id: string;        // 고유 ID
  name: string;               // 자재명
  series: string;             // 시리즈명
  positive_prompt: string;    // AI 생성용 positive 프롬프트
  negative_prompt?: string;   // AI 생성용 negative 프롬프트
  lora_weight?: number;       // LoRA 가중치
  texture_scale?: string;     // 텍스처 스케일
  recommended_denoising?: number; // 권장 노이즈 제거 강도
  color_code?: string;        // 색상 코드
}
```

## 🚦 서버 상태 확인

서버가 정상적으로 실행 중이면 다음과 같은 출력이 표시됩니다:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Phomistone MCP Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Server:    http://localhost:3001
📦 Materials: 33 loaded
🔍 Health:    http://localhost:3001/health
📚 List:      http://localhost:3001/materials
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🔗 연동

### n8n 워크플로우

n8n에서 POST /prompt 엔드포인트 사용:

```
HTTP Request Node:
- Method: POST
- URL: http://localhost:3001/prompt
- Body: { "material_id": "{{ $json.material_id }}" }
```

### 프론트엔드 (React)

```typescript
// 자재 정보 조회
const response = await fetch(
  `http://localhost:3001/materials/${materialId}`
);
const material = await response.json();
```

## 📝 개발 노트

- 포트: 3001 (하드코딩)
- CORS: 모든 origin 허용 (개발 환경)
- 타입스크립트: ES modules 사용
- 핫 리로드: tsx watch 사용

## 🔄 업데이트 이력

### v2.0.0 (2025-11-28)
- 향상된 에러 핸들링 및 로깅
- 여러 경로에서 materials.json 자동 탐색
- 다양한 JSON 구조 지원
- 상세한 에러 메시지 및 디버깅 정보
- 테스트 스크립트 추가
- README 문서화

### v1.0.0
- 초기 MCP 서버 구현
- 기본 자재 조회 API
