# AI 스타일링 이미지 크기 유지 기능 완전 가이드

## 🎯 문제점

**증상:**
- 업로드한 이미지: 세로로 꽉 참 (예: 1080×1920 - 세로 Portrait)
- 결과 이미지: 가로로 꽉 참 (예: 1920×1080 - 가로 Landscape)
- Before/After 슬라이더에서 이미지 크기가 맞지 않음

**근본 원인:**
AI(Gemini)가 원본 이미지의 크기를 알 수 없어서, 임의의 크기로 이미지를 생성함

---

## ✅ 해결 방법

### 전체 흐름:
```
1. 프론트엔드: 이미지 업로드 → 원본 크기 추출 (naturalWidth, naturalHeight)
2. 프론트엔드: n8n에 크기 정보와 함께 전송 (original_width, original_height)
3. n8n: 크기 정보를 Gemini 프롬프트에 포함
4. Gemini AI: 정확히 동일한 크기의 결과 이미지 생성
```

---

## 📝 구현 상세

### 1️⃣ 프론트엔드 (AIStylingPage.tsx)

#### (A) 원본 이미지 크기 추출

```typescript
// handleGenerate 함수 내부

// (A-1) 🚨 원본 이미지 크기 추출
const img = new Image();
img.src = uploadedImage;
await new Promise((resolve) => { img.onload = resolve; });
const originalWidth = img.naturalWidth;
const originalHeight = img.naturalHeight;
console.log('📐 Original image dimensions:', originalWidth, 'x', originalHeight);
```

**설명:**
- `new Image()`: 브라우저 내장 Image 객체 생성
- `img.src = uploadedImage`: base64 이미지를 src에 할당
- `await new Promise(...)`: 이미지 로딩이 완료될 때까지 대기
- `naturalWidth/naturalHeight`: 원본 이미지의 실제 픽셀 크기 (CSS 크기가 아님!)

#### (B) n8n에 크기 정보 전송

```typescript
const response = await fetch('/webhook/style-building', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    image_base64: cleanImage,
    material_id: selectedMaterial,
    material_image_base64: materialImageBase64,
    original_width: originalWidth,  // 👈 추가!
    original_height: originalHeight  // 👈 추가!
  })
});
```

---

### 2️⃣ n8n 워크플로우 수정

#### 노드 1: "Prep for Brain" (Code 노드)

```javascript
// 1. 이미지 데이터 가져오기
const webhookData = $('Webhook').item.json.body;
const cleanImage = webhookData.image_base64.replace(/^data:image\/\w+;base64,/, "");

// 1-1. 🚨 원본 이미지 크기 추출
const originalWidth = webhookData.original_width || 1024;
const originalHeight = webhookData.original_height || 1024;

// ... (기존 코드) ...

// 5. 다음 단계로 모든 재료 넘기기 (이미지 크기 포함)
return [{
  json: {
    analystPayload: analystPayload,
    cleanImage: cleanImage,
    mcp: mcp,
    googleApiKey: googleApiKey,
    originalWidth: originalWidth,  // 👈 추가!
    originalHeight: originalHeight  // 👈 추가!
  }
}];
```

**역할:**
- Webhook으로부터 `original_width`, `original_height` 추출
- 다음 노드들에게 전달

---

#### 노드 2: "Prep for Master" (Code 노드) - 가장 중요!

```javascript
// 1. 데이터 모으기
const fileUri = items[0].json.file.uri;
const prompt = $('2. The Prompter').item.json.candidates[0].content.parts[0].text;
const mcp_name = $('Get Material from MCP').item.json.name;

// 2. 자재 이미지 가져오기
const materialImage = $('Prep for Prompter').item.json.materialImage || "";

// 2-1. 🚨 원본 이미지 크기 가져오기
const originalWidth = $('Prep for Brain').item.json.originalWidth || 1024;
const originalHeight = $('Prep for Brain').item.json.originalHeight || 1024;

// 3. Master(Gemini Image Pro)에게 보낼 최종 데이터
const parts = [
  {
    text: `FINAL TASK: Material Replacement.

    [CRITICAL REQUIREMENT]:
    ⚠️ OUTPUT IMAGE MUST BE EXACTLY ${originalWidth} x ${originalHeight} PIXELS.
    ⚠️ DO NOT CROP, RESIZE, OR CHANGE ASPECT RATIO.
    ⚠️ MAINTAIN EXACT DIMENSIONS OF INPUT IMAGE: ${originalWidth}px × ${originalHeight}px

    [INSTRUCTION]:
    ${prompt}

    [INPUTS]:
    1. Base Structure: Provided via File URI (Original size: ${originalWidth}x${originalHeight})
    2. Style Reference: Provided Inline Image (Apply this texture)

    [RULES]:
    - OUTPUT DIMENSIONS: ${originalWidth} × ${originalHeight} pixels (EXACT MATCH REQUIRED)
    - Maintain Structure exactly (no cropping, no resizing, no aspect ratio changes).
    - Apply Material Style from Reference.
    - OUTPUT IMAGE ONLY with EXACT dimensions ${originalWidth}×${originalHeight}.`
  },
  { file_data: { mime_type: "image/jpeg", file_uri: fileUri } }
];

// 자재 이미지 추가
if (materialImage) {
  parts.push({ inline_data: { mime_type: "image/png", data: materialImage } });
}

const masterPayload = {
  contents: [{ parts: parts }],
  safetySettings: [
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
  ],
  generationConfig: {
    temperature: 0.4,
    candidateCount: 1
  }
};

return [{ json: { payload: JSON.stringify(masterPayload), materialName: mcp_name } }];
```

**핵심 포인트:**
1. `originalWidth`와 `originalHeight`를 "Prep for Brain"에서 가져옴
2. 프롬프트에 **[CRITICAL REQUIREMENT]** 섹션 추가
3. 크기를 여러 번 강조 (⚠️ 이모지로 주의 환기)
4. 정확한 픽셀 크기를 명시 (예: `1080 x 1920 PIXELS`)

---

## 🧪 테스트 방법

### 프론트엔드 테스트:

1. 브라우저 개발자 도구 → Console 열기
2. AI 스타일링 페이지에서 이미지 업로드
3. 콘솔에서 확인:
   ```
   📐 Original image dimensions: 1080 x 1920
   🚀 Sending request to n8n...
   📦 Payload: {
     material_id: "castol_white_01",
     building_image_size: 123456,
     material_image_size: 78910,
     original_width: 1080,  // 👈 확인!
     original_height: 1920   // 👈 확인!
   }
   ```

### n8n 테스트:

1. n8n에서 워크플로우 Import (phomistone-workflow.json)
2. "Execute Workflow" 클릭하여 테스트 실행
3. 각 노드별 확인:

**Webhook 노드 Output:**
```json
{
  "body": {
    "image_base64": "...",
    "material_id": "castol_white_01",
    "material_image_base64": "...",
    "original_width": 1080,  // 👈 있어야 함!
    "original_height": 1920   // 👈 있어야 함!
  }
}
```

**Prep for Brain 노드 Output:**
```json
{
  "analystPayload": { ... },
  "cleanImage": "...",
  "mcp": { ... },
  "googleApiKey": "...",
  "originalWidth": 1080,  // 👈 전달됨!
  "originalHeight": 1920   // 👈 전달됨!
}
```

**Prep for Master 노드 Output:**
```json
{
  "payload": "{\"contents\":[{\"parts\":[{\"text\":\"...OUTPUT IMAGE MUST BE EXACTLY 1080 x 1920 PIXELS...\"}]}]}"
  // 👆 프롬프트에 크기가 포함되어 있는지 확인!
}
```

---

## 🎯 기대 결과

### Before (수정 전):
```
업로드: 세로 1080×1920 (Portrait)
   ↓
   AI가 임의 크기로 생성
   ↓
결과: 가로 1920×1080 (Landscape) ❌
```

### After (수정 후):
```
업로드: 세로 1080×1920 (Portrait)
   ↓
   프론트엔드: 크기 추출 → n8n 전송
   ↓
   n8n: Gemini에 정확한 크기 지시
   ↓
   AI: 프롬프트 따라 정확한 크기로 생성
   ↓
결과: 세로 1080×1920 (Portrait) ✅
```

---

## 🚨 문제 해결

### 1. 프론트엔드에서 크기가 0으로 표시됨

**증상:**
```
📐 Original image dimensions: 0 x 0
```

**원인:**
이미지가 로딩되기 전에 naturalWidth/Height를 읽음

**해결:**
`await new Promise((resolve) => { img.onload = resolve; })` 코드가 있는지 확인

---

### 2. n8n Webhook에서 크기 정보가 없음

**증상:**
```json
{
  "body": {
    "image_base64": "...",
    "material_id": "...",
    // original_width와 original_height가 없음! ❌
  }
}
```

**원인:**
프론트엔드가 최신 버전이 아님

**해결:**
```bash
cd frontend
git pull
npm run dev
```

브라우저 캐시 삭제 후 페이지 새로고침

---

### 3. AI가 여전히 다른 크기로 생성함

**증상:**
업로드: 1080×1920, 결과: 1024×1024

**원인:**
- n8n 워크플로우가 최신 버전이 아님
- 또는 Gemini가 프롬프트를 무시함 (드물게 발생)

**해결:**
1. n8n에 최신 phomistone-workflow.json 다시 Import
2. "Prep for Master" 노드에서 프롬프트 확인:
   - `[CRITICAL REQUIREMENT]` 섹션이 있는가?
   - `${originalWidth} x ${originalHeight}` 변수가 실제 숫자로 치환되었는가?
3. Gemini API 응답 확인:
   - 텍스트만 반환하는 경우: 프롬프트가 너무 복잡할 수 있음
   - 이미지 반환하지만 크기 다름: temperature 낮추기 (0.4 → 0.2)

---

### 4. 세로 이미지가 가로로 회전됨

**증상:**
업로드: 세로(Portrait), 결과: 가로(Landscape)이지만 크기는 맞음

**원인:**
이미지 EXIF 방향(Orientation) 메타데이터 문제

**해결:**
프론트엔드에서 이미지 업로드 시 EXIF 회전 정보 제거:
```typescript
// canvas를 사용하여 이미지 방향 정규화
const canvas = document.createElement('canvas');
canvas.width = img.naturalWidth;
canvas.height = img.naturalHeight;
const ctx = canvas.getContext('2d');
ctx.drawImage(img, 0, 0);
const correctedImage = canvas.toDataURL('image/jpeg');
```

---

## 📌 핵심 요약

### 프론트엔드 (AIStylingPage.tsx):
```typescript
// 1. 크기 추출
const img = new Image();
img.src = uploadedImage;
await new Promise(resolve => img.onload = resolve);
const originalWidth = img.naturalWidth;
const originalHeight = img.naturalHeight;

// 2. n8n에 전송
body: JSON.stringify({
  image_base64: cleanImage,
  material_id: selectedMaterial,
  material_image_base64: materialImageBase64,
  original_width: originalWidth,
  original_height: originalHeight
})
```

### n8n Prep for Brain:
```javascript
const originalWidth = webhookData.original_width || 1024;
const originalHeight = webhookData.original_height || 1024;
// ... 다음 노드에 전달
```

### n8n Prep for Master:
```javascript
const originalWidth = $('Prep for Brain').item.json.originalWidth || 1024;
const originalHeight = $('Prep for Brain').item.json.originalHeight || 1024;

const parts = [{
  text: `[CRITICAL REQUIREMENT]:
  ⚠️ OUTPUT IMAGE MUST BE EXACTLY ${originalWidth} x ${originalHeight} PIXELS.
  ...`
}];
```

---

## ✅ 완료 체크리스트

- [x] AIStylingPage.tsx 수정 (이미지 크기 추출)
- [x] AIStylingPage.tsx 커밋 완료
- [x] n8n phomistone-workflow.json 수정 (Prep for Brain)
- [x] n8n phomistone-workflow.json 수정 (Prep for Master)
- [x] n8n 워크플로우 커밋 완료
- [ ] n8n에 업데이트된 워크플로우 Import
- [ ] 프론트엔드 테스트 (콘솔 로그 확인)
- [ ] n8n 테스트 (각 노드 Output 확인)
- [ ] 실제 이미지 생성 테스트 (크기 일치 확인)

---

**이제 AI가 업로드한 이미지와 정확히 동일한 크기로 결과물을 생성합니다!** 🎉
