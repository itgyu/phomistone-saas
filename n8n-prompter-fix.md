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

## 🔧 수정 방법 (스크린샷 가이드)

### 1. n8n에서 "2. The Prompter" 노드 열기
- 워크플로우에서 "The Prompter" 노드를 더블클릭
- HTTP Request 노드 설정 화면이 열립니다

### 2. 상단 설정 확인
```
Authentication: None
Request Method: POST
```

### 3. URL 설정 확인
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={{ $json.googleApiKey }}
```
- `{{ $json.googleApiKey }}`에 중괄호가 2개씩 있는지 확인
- `?key=` 부분 확인

### 4. 🚨 가장 중요! Body 설정
아래로 스크롤하여 "Send Body" 섹션을 찾으세요:

**1단계**: "Send Body" 토글을 **ON**으로 설정

**2단계**: "Body Content Type" 드롭다운에서 **"JSON"** 선택

**3단계**: "Specify Body" 드롭다운에서 **"Using JSON"** 선택

**4단계**: JSON 입력창에 다음을 정확히 입력:
```
={{ $json.payload }}
```

**⚠️ 체크리스트:**
- [ ] `=` 기호로 시작하는가?
- [ ] `{{` 중괄호 2개인가?
- [ ] `}}` 중괄호 2개로 끝나는가?
- [ ] 띄어쓰기 없이 `$json.payload`인가?
- [ ] 다른 텍스트나 중괄호 `{}` 없는가?

**❌ 잘못된 예시:**
```
{{ $json.payload }}           (= 없음)
{ "payload": {{ $json.payload }} }  (불필요한 중괄호)
={{$json.payload}}            (띄어쓰기 필요)
```

**✅ 올바른 예시:**
```
={{ $json.payload }}
```

### 5. 저장 및 테스트

**1단계**: 노드 설정 창 우측 상단의 **"Execute Node"** 버튼 클릭하여 테스트

**2단계**: 에러 없이 실행되면 **"Save"** 버튼 클릭

**3단계**: 워크플로우 상단의 **"Save"** 버튼으로 워크플로우 저장

---

## 📝 전체 설정 요약

**Method**: `POST`

**URL**:
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={{ $json.googleApiKey }}
```

**Body Content Type**: `JSON`

**Body (JSON)**:
```json
={{ $json.payload }}
```

**🚨 중요**: Body에 `={{ $json.payload }}`를 입력하세요.
- **`=` 기호를 반드시 포함**해야 합니다!
- `=` 없이 `{{ $json.payload }}`만 쓰면 n8n이 문자열로 변환합니다
- `=` 있으면 n8n이 JavaScript 객체로 평가합니다

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
={{ $json.payload }}
```

**🚨 주의**: `=` 기호를 꼭 포함하세요!

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

### 1. "JSON parameter needs to be valid JSON" ⚠️ 가장 흔한 오류!
**증상**:
- 프론트엔드: "서버로부터 빈 응답을 받았습니다" (Response text length: 0)
- n8n: "JSON parameter needs to be valid JSON"

**원인**:
Body에 `{{ $json.payload }}`를 입력하면 n8n이 이를 **문자열**로 변환합니다.
```
잘못된 결과: "[object Object]" (문자열)
올바른 결과: { contents: [...], ... } (JSON 객체)
```

**해결**:
Body에 **`={{ $json.payload }}`** 입력 (= 기호 포함!)
```diff
- Body: {{ $json.payload }}  ❌ 문자열로 변환됨
+ Body: ={{ $json.payload }}  ✅ JSON 객체로 평가됨
```

### 2. "Unknown name" 오류
**원인**: Body에서 잘못된 필드명 사용 (예: materialImage, mcp_name)
**해결**: Body를 `={{ $json.payload }}`로만 설정

### 3. "API key not found" 오류
**원인**: URL에서 API 키를 잘못 참조
**해결**: URL 끝에 `?key={{ $json.googleApiKey }}` 확인

### 4. "Invalid JSON" 오류 (구조 문제)
**원인**: payload 구조가 잘못됨
**해결**: "The Formatter" 노드 코드 확인 (n8n-formatter-update.md 참조)

### 5. 빈 응답 (Response length: 0)
**원인**: 위의 오류들 중 하나로 인해 n8n이 제대로 실행되지 않음
**해결**: n8n 워크플로우 Execution 탭에서 각 노드의 에러 확인

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

---

## 🎯 빠른 참조 카드

### 문제:
```
n8n: JSON parameter needs to be valid JSON
프론트엔드: Response text length: 0
```

### 해결:
```
n8n "The Prompter" 노드 → Body → JSON 입력창:
={{ $json.payload }}
```

### 체크포인트:
- [x] `=` 기호로 시작
- [x] 중괄호 2개씩: `{{` `}}`
- [x] 띄어쓰기: `= { {` (공백 있음)
- [x] 다른 중괄호 `{}` 없음
- [x] 다른 텍스트 없음

### 전체 흐름:
1. Webhook → 데이터 수신
2. MCP Lookup → 자재 정보 조회
3. The Formatter → `payload` 객체 생성 (n8n-formatter-update.md)
4. **The Prompter** → `={{ $json.payload }}` 사용 👈 여기 수정!
5. Response Handler → 결과 반환
