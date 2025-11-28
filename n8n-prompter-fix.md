# n8n "The Prompter" 노드 수정 가이드

## 🚨 오류 내용
```
Problem in node '2. The Prompter'
Bad request - please check your parameters
Invalid JSON payload received. Unknown name "materialImage": Cannot find field.
Invalid JSON payload received. Unknown name "mcp_name": Cannot find field.
```

## 📍 수정할 노드
**"2. The Prompter"** - Gemini API를 호출하는 HTTP Request 노드

---

## 🔧 수정 방법

### 1. n8n에서 "2. The Prompter" 노드 열기
- 워크플로우에서 "The Prompter" 노드를 더블클릭
- HTTP Request 설정 확인

### 2. Body Parameters 확인
현재 잘못된 필드명을 사용하고 있다면 아래와 같이 수정:

**❌ 잘못된 예시:**
```json
{
  "materialImage": "...",
  "mcp_name": "..."
}
```

**✅ 올바른 예시:**
이 노드는 이전 노드("The Formatter")의 출력을 그대로 사용해야 합니다.

### 3. 올바른 설정

**Method**: `POST`

**URL**:
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={{ $json.googleApiKey }}
```

**Body Content Type**: `JSON`

**Body (JSON)**:
```json
{{ $json.payload }}
```

**중요**: Body는 단순히 `{{ $json.payload }}`만 사용합니다.
이전 노드("The Formatter")에서 이미 완전한 payload를 만들어서 보내기 때문입니다.

---

## 📝 전체 워크플로우 확인

### 노드 순서:
1. **Webhook** → 프론트엔드로부터 데이터 수신
   - `image_base64` (건물 이미지)
   - `material_id` (자재 ID)
   - `material_image_base64` (자재 참조 이미지)

2. **MCP Lookup** → MCP 서버에서 자재 정보 조회
   ```
   POST http://localhost:3001/prompt
   Body: { "material_id": "{{ $json.body.material_id }}" }
   ```

3. **The Formatter** → Gemini API용 payload 구성
   - 이전에 업데이트한 코드 사용 (n8n-formatter-update.md 참조)
   - 출력: `{ payload: {...}, googleApiKey: "...", materialName: "..." }`

4. **The Prompter** → Gemini API 호출
   ```
   POST https://generativelanguage.googleapis.com/.../generateContent?key={{ $json.googleApiKey }}
   Body: {{ $json.payload }}
   ```

5. **Response Handler** → 결과 처리 및 반환

---

## 🔍 "The Prompter" 노드 상세 설정

### HTTP Request 노드 전체 설정:

**Authentication**: None

**Request Method**: POST

**URL**:
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={{ $json.googleApiKey }}
```

**Send Body**: Yes

**Body Content Type**: JSON

**Specify Body**: Using JSON

**JSON**:
```
{{ $json.payload }}
```

**Options** (선택사항):
- Timeout: 300000 (5분)
- Response: Include Response Headers and Status

---

## ✅ 확인 사항

### The Formatter 노드 출력 확인:
"The Formatter" 노드 실행 후 Output을 확인하면 다음과 같은 구조여야 합니다:

```json
{
  "payload": {
    "contents": [
      {
        "parts": [
          {
            "text": "High-fidelity Architectural Material Transfer Task..."
          },
          {
            "inline_data": {
              "mime_type": "image/jpeg",
              "data": "base64_building_image..."
            }
          },
          {
            "inline_data": {
              "mime_type": "image/png",
              "data": "base64_material_image..."
            }
          }
        ]
      }
    ],
    "safetySettings": [...],
    "generationConfig": {...}
  },
  "googleApiKey": "AIzaSy...",
  "materialName": "Phomistone Castol White"
}
```

### The Prompter 노드가 받는 입력:
- `{{ $json.payload }}`: 위의 `payload` 객체 전체
- `{{ $json.googleApiKey }}`: API 키

---

## 🚨 자주 발생하는 오류

### 1. "Unknown name" 오류
**원인**: Body에서 잘못된 필드명 사용
**해결**: Body를 `{{ $json.payload }}`로만 설정

### 2. "API key not found" 오류
**원인**: URL에서 API 키를 잘못 참조
**해결**: URL 끝에 `?key={{ $json.googleApiKey }}` 확인

### 3. "Invalid JSON" 오류
**원인**: payload 구조가 잘못됨
**해결**: "The Formatter" 노드 코드 확인 (n8n-formatter-update.md 참조)

---

## 🧪 테스트 방법

1. **Execute Workflow** 버튼 클릭
2. 각 노드의 Output 탭에서 데이터 확인:
   - Webhook: `image_base64`, `material_id`, `material_image_base64` 존재 확인
   - MCP Lookup: 자재 정보 정상 반환 확인
   - The Formatter: `payload` 객체 구조 확인
   - The Prompter: Gemini API 응답 확인 (200 OK)

3. 프론트엔드에서 실제 테스트

---

## 📌 참고 링크

- Gemini API 문서: https://ai.google.dev/docs
- n8n HTTP Request 노드: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/

---

**수정 완료 후 반드시 워크플로우를 저장하세요!** 🚀
