# n8n "The Formatter" 노드 업데이트 가이드

## 🎯 목적
1. AI가 자재 이름만 보고 상상하는 대신, **실제 자재 사진**을 참조하여 정확한 질감/색상을 재현
2. **원본 이미지 비율 유지** - Before/After 슬라이더에서 자연스럽게 비교 가능

---

## 📍 업데이트할 노드
**"The Formatter (노란색 노드)"**
- n8n 워크플로우에서 찾기
- 노드를 더블클릭하여 코드 편집기 열기

---

## 🔄 전체 코드 교체

### 기존 코드 삭제 후, 아래 코드를 복사하여 붙여넣기:

```javascript
const mcp = items[0].json;
const webhookBody = $('Webhook').item.json.body;

// 1. 건물 이미지 (Structure/Geometry 유지용)
const buildingImage = webhookBody.image_base64.replace(/^data:image\/\w+;base64,/, "");

// 2. 🚨 자재 이미지 (Style/Texture Reference 용) - 새로 추가!
const materialImage = webhookBody.material_image_base64 || "";

// 3. MIME Type 감지
let mimeType = "image/jpeg";
if (webhookBody.image_base64.includes("image/png")) {
  mimeType = "image/png";
}

// 4. 🚨 개선된 Prompt (자재 참조 + 해상도 유지)
const parts = [
  {
    text: `High-fidelity Architectural Material Transfer Task.

[INPUT IMAGES]
- Image 1 (Building): Target structure to modify
- Image 2 (Material): Reference texture to apply

[CRITICAL REQUIREMENTS]
1. OUTPUT IMAGE MUST MATCH EXACT DIMENSIONS OF IMAGE 1
2. Preserve original aspect ratio and resolution
3. Do NOT crop, resize, or change composition
4. Apply texture from Image 2 only to the building walls

[INSTRUCTIONS]
1. Analyze the building facade/wall in Image 1
2. Apply the EXACT texture, color, and pattern from Image 2 to the walls
3. Preserve original lighting, shadows, geometry, and background
4. Keep all windows, doors, and other elements unchanged
5. The result must look like real construction of "${mcp.name}"
6. MAINTAIN ORIGINAL IMAGE DIMENSIONS AND ASPECT RATIO

[OUTPUT]
Generate the modified image with IDENTICAL dimensions to Image 1.`
  },
  // 이미지 1: 건물 (구조 유지)
  {
    inline_data: {
      mime_type: mimeType,
      data: buildingImage
    }
  }
];

// 🚨 자재 이미지가 있으면 추가 (Style Reference)
if (materialImage) {
  parts.push({
    inline_data: {
      mime_type: "image/png",
      data: materialImage
    }
  });
}

// 5. Gemini API Payload 구성
const payload = {
  contents: [{ parts: parts }],
  safetySettings: [
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
  ],
  generationConfig: {
    temperature: 0.2,  // 더 낮춤 (창의성 ↓ = 원본 충실도 ↑)
    topK: 20,
    topP: 0.9,
    maxOutputTokens: 8192  // 더 높은 해상도 지원
  }
};

// 6. API Key 전달
const googleApiKey = "AIzaSyBMOky5WQxPJYj1w7uVpzvarDpBqGB82Zc";

return [{
  json: {
    payload,
    googleApiKey,
    materialName: mcp.name
  }
}];
```

---

## 📝 주요 변경사항

### 1. 자재 이미지 추출 (새로 추가)
```javascript
const materialImage = webhookBody.material_image_base64 || "";
```
- 프론트엔드에서 보낸 `material_image_base64` 필드 읽기
- 없으면 빈 문자열 (하위 호환성 유지)

### 2. 개선된 Prompt
```javascript
[INPUT IMAGES]
- Image 1 (Building): Target structure to modify
- Image 2 (Material): Reference texture to apply

[INSTRUCTIONS]
1. Analyze the building facade/wall in Image 1
2. Apply the EXACT texture, color, and pattern from Image 2 to the walls
3. Preserve original lighting, shadows, and geometry from Image 1
```
- AI에게 **두 이미지의 역할**을 명확히 설명
- Image 1 (건물): 구조 유지 대상
- Image 2 (자재): 텍스처 참조 대상

### 3. 조건부 이미지 추가
```javascript
if (materialImage) {
  parts.push({
    inline_data: {
      mime_type: "image/png",
      data: materialImage
    }
  });
}
```
- 자재 이미지가 있을 때만 Gemini에 전송
- 없으면 기존 방식대로 작동 (하위 호환성)

### 4. 낮은 Temperature 설정
```javascript
temperature: 0.3,  // 낮은 창의성 = 높은 재현율
```
- 창의성보다 정확한 재현에 집중
- 자재 이미지를 충실히 따르도록 유도

---

## ✅ 업데이트 후 저장 방법

1. **코드 복사 완료 확인**
2. **"Save" 버튼 클릭** (또는 Ctrl+S / Cmd+S)
3. **워크플로우 저장** (상단 Save 버튼)
4. **테스트 실행** (Execute Workflow 버튼)

---

## 🧪 테스트 방법

### 프론트엔드에서 테스트:
1. 건물 사진 업로드
2. 자재 선택 (예: Castol White)
3. "AI 스타일링 생성" 버튼 클릭
4. 브라우저 콘솔에서 확인:
   ```
   ✅ 자재 이미지 변환 완료
   🚀 Sending request to n8n...
   📦 Payload: {
     material_id: "castol_white_01",
     building_image_size: 123456,
     material_image_size: 78910  // 👈 0보다 커야 함!
   }
   ```

### n8n에서 확인:
1. "Execute Workflow" 클릭
2. "Webhook" 노드 → Input 탭
3. `material_image_base64` 필드 확인
4. "The Formatter" 노드 → Output 탭
5. `payload.contents[0].parts` 배열 확인
   - `parts[0]`: text (프롬프트)
   - `parts[1]`: inline_data (건물 이미지)
   - `parts[2]`: inline_data (자재 이미지) // 👈 새로 추가됨!

---

## 🎯 기대 효과

### Before (이전):
```
AI: "사하라 라이트 그레이? 대충 회색 벽돌 그려야지~"
→ 가짜 질감, 상상으로 그린 무늬
```

### After (수정 후):
```
AI: "아, 이 사진(자재 이미지)이랑 똑같이 그려야 하는구나!"
→ 실제 포미스톤 제품 사진의 질감/색상/무늬 정확히 재현
```

### 결과:
✅ 포미스톤 실제 제품과 동일한 질감/색상/무늬 재현
✅ "번개 무늬", "거친 질감", "미묘한 색상" 등 정확한 표현
✅ 고객에게 보여줄 수 있는 실제 시공 결과물 품질

---

## 🚨 문제 해결

### 1. "material_image_base64" 필드가 없다고 나오면?
- 프론트엔드가 최신 버전인지 확인 (git pull)
- 브라우저 캐시 삭제 후 새로고침

### 2. 이미지가 3개 전송되어야 하는데 2개만 전송되면?
- `material_image_base64`가 빈 문자열인지 확인
- 자재 이미지 파일이 `public/materials/` 폴더에 있는지 확인
- 브라우저 콘솔에서 "자재 이미지 변환 실패" 오류 확인

### 3. AI 결과물이 여전히 이상하면?
- Gemini API 콘솔에서 실제 전송된 이미지 확인
- Prompt가 제대로 전달되었는지 확인
- Temperature 값이 0.3으로 설정되었는지 확인

---

## 📌 체크리스트

- [ ] "The Formatter" 노드 찾기
- [ ] 전체 코드 복사하여 붙여넣기
- [ ] Save 버튼 클릭
- [ ] 워크플로우 저장
- [ ] Execute Workflow로 테스트
- [ ] 프론트엔드에서 실제 테스트
- [ ] 결과 이미지 품질 확인

---

**업데이트 완료 후 반드시 테스트하세요!** 🚀
