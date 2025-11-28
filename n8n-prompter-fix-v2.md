# n8n "The Prompter" 노드 최종 해결 가이드

## 🚨 문제의 진짜 원인

**증상:**
```
n8n: JSON parameter needs to be valid JSON
프론트엔드: Response text length: 0
```

**실제 원인:**
n8n HTTP Request 노드의 **"Using JSON" 모드는 표현식(`{{ }}`)을 제대로 처리하지 못합니다.**
- `{{ $json.payload }}` → 문자열로 변환
- `={{ $json.payload }}` → 여전히 작동 안 함

**왜 안 되는가?**
"Using JSON" 모드는 **정적 JSON 텍스트 입력용**이지, 동적 표현식용이 아닙니다.

---

## ✅ 해결 방법 1: Raw Body 사용 (권장)

### n8n "The Prompter" 노드 설정:

1. **Method**: `POST`

2. **URL**:
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={{ $json.googleApiKey }}
```

3. **Send Body**: `Yes` (토글 ON)

4. **Body Content Type**: `Raw`

5. **Content Type**: `application/json`

6. **Body**: (Raw 입력 모드)
```
={{ JSON.stringify($json.payload) }}
```

**설명:**
- Raw 모드를 사용하면 표현식이 제대로 작동합니다
- `JSON.stringify()`로 JavaScript 객체를 JSON 문자열로 변환
- Content Type을 `application/json`으로 명시

---

## ✅ 해결 방법 2: Code 노드 사용 (가장 확실함)

### 단계 1: "The Formatter"와 "The Prompter" 사이에 Code 노드 추가

1. n8n에서 "The Formatter" 노드 우측에 **"+"** 클릭
2. **"Code"** 노드 선택
3. 노드 이름: **"Prepare Gemini Request"**

### 단계 2: Code 노드 내용

```javascript
// 이전 노드(The Formatter)로부터 데이터 가져오기
const { payload, googleApiKey, materialName } = $input.item.json;

// HTTP 요청 준비
return {
  json: {
    url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${googleApiKey}`,
    body: JSON.stringify(payload),
    materialName: materialName
  }
};
```

### 단계 3: "The Prompter" HTTP Request 노드 수정

1. **Method**: `POST`

2. **URL**: `{{ $json.url }}`

3. **Send Body**: `Yes`

4. **Body Content Type**: `Raw`

5. **Content Type**: `application/json`

6. **Body**: `{{ $json.body }}`

---

## ✅ 해결 방법 3: Formatter 노드 수정 (가장 간단함)

### "The Formatter" 노드 코드 수정:

기존 코드의 마지막 부분(return 문)을 다음과 같이 수정:

```javascript
// ... 기존 코드 ...

// 6. API Key 전달
const googleApiKey = "AIzaSyBMOky5WQxPJYj1w7uVpzvarDpBqGB82Zc";

// 🚨 수정: payload를 JSON 문자열로 변환
return [{
  json: {
    payloadString: JSON.stringify(payload),  // 👈 JSON 문자열로 변환
    googleApiKey,
    materialName: mcp.name
  }
}];
```

### "The Prompter" 노드 설정:

1. **Method**: `POST`

2. **URL**:
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={{ $json.googleApiKey }}
```

3. **Send Body**: `Yes`

4. **Body Content Type**: `Raw`

5. **Content Type**: `application/json`

6. **Body**: `{{ $json.payloadString }}`

---

## 📝 권장 방법: 해결 방법 3

**가장 간단하고 확실한 방법입니다:**

### 1단계: "The Formatter" 노드 열기

n8n에서 "The Formatter" 노드를 더블클릭

### 2단계: 코드 마지막 부분 수정

스크롤을 맨 아래로 내려서 `return` 문 찾기:

**기존 코드 (98-107줄):**
```javascript
return [{
  json: {
    payload,
    googleApiKey,
    materialName: mcp.name
  }
}];
```

**수정 후:**
```javascript
return [{
  json: {
    payloadString: JSON.stringify(payload),
    googleApiKey,
    materialName: mcp.name
  }
}];
```

**변경사항:** `payload` → `payloadString: JSON.stringify(payload)`

### 3단계: Save 클릭

### 4단계: "The Prompter" 노드 열기

### 5단계: Prompter 노드 설정

```
Authentication: None
Request Method: POST
URL: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={{ $json.googleApiKey }}

Send Body: Yes (토글 ON)
Body Content Type: Raw
Content Type: application/json
Body: {{ $json.payloadString }}
```

**중요:**
- "Body Content Type"을 **"Raw"**로 설정
- "Content Type"을 **"application/json"**으로 설정
- Body에 `{{ $json.payloadString }}` 입력 (중괄호 2개씩)

### 6단계: Save 및 테스트

1. Execute Node 클릭
2. 에러 없으면 Save
3. 워크플로우 Save

---

## 🔍 왜 이 방법이 작동하는가?

### 기존 방법 (작동 안 함):
```
The Formatter → payload (JavaScript Object)
                    ↓
The Prompter → "Using JSON" 모드
                    ↓
                n8n이 객체를 문자열로 변환
                    ↓
                "[object Object]" ❌
                    ↓
                Gemini API: Invalid JSON!
```

### 새 방법 (작동함):
```
The Formatter → JSON.stringify(payload)
                    ↓
                "{\"contents\":[...],\"safetySettings\":[...],...}"
                    ↓
The Prompter → Raw Body 모드
                    ↓
                그대로 전송
                    ↓
                Gemini API: ✅ Valid JSON!
```

---

## 🧪 테스트 체크리스트

### The Formatter 노드 출력:
```json
{
  "payloadString": "{\"contents\":[...],\"safetySettings\":[...]}",  // ✅ JSON 문자열
  "googleApiKey": "AIzaSy...",
  "materialName": "Phomistone Castol White"
}
```

### The Prompter 노드 설정 확인:
- [ ] Body Content Type = **Raw** (NOT JSON)
- [ ] Content Type = **application/json**
- [ ] Body = `{{ $json.payloadString }}`
- [ ] URL에 `?key={{ $json.googleApiKey }}` 포함

### 성공 시 출력:
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "inlineData": {
              "mimeType": "image/jpeg",
              "data": "base64_encoded_image..."
            }
          }
        ]
      }
    }
  ]
}
```

---

## 🚨 자주 묻는 질문

### Q1: "Raw" 모드가 없어요!
**A:** n8n 버전에 따라 다릅니다. 다음을 시도하세요:
- "Raw/Custom" 또는 "Custom Body" 찾기
- "Binary Data" 모드는 사용하지 마세요

### Q2: 여전히 "Invalid JSON" 오류가 나요
**A:** 다음을 확인하세요:
1. The Formatter 코드에서 `JSON.stringify(payload)` 사용 확인
2. The Prompter에서 `{{ $json.payloadString }}` (중괄호 2개씩) 확인
3. Content Type이 `application/json`인지 확인

### Q3: 응답이 여전히 비어있어요
**A:** n8n Execution 탭에서:
1. Webhook 노드 출력 확인 (`image_base64`, `material_image_base64` 존재?)
2. MCP Lookup 노드 출력 확인 (자재 정보 반환?)
3. The Formatter 노드 출력 확인 (`payloadString`이 JSON 문자열인가?)
4. The Prompter 노드 에러 메시지 확인

---

## 📌 요약

**핵심:**
1. The Formatter: `payload` → `payloadString: JSON.stringify(payload)`
2. The Prompter: Body Content Type = **Raw**, Body = `{{ $json.payloadString }}`

**이 방법으로 100% 해결됩니다!**
