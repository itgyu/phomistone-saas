import express from 'express';
import cors from 'cors';
import materialsDataRaw from './data/materials-schema.json';

const app = express();
const PORT = 3001;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 데이터 가져오기 (안전장치: 포장지가 있든 없든 알맹이(배열)만 꺼냄)
// 1. 그냥 배열인 경우
let materialsList = materialsDataRaw;
// 2. { materials: [...] } 객체인 경우 (현재 상황)
if (!Array.isArray(materialsList) && (materialsList as any).materials) {
  materialsList = (materialsList as any).materials;
}
// 3. ESM import로 인해 .default 안에 있는 경우
if (!Array.isArray(materialsList) && (materialsList as any).default) {
    materialsList = (materialsList as any).default;
    if (!Array.isArray(materialsList) && (materialsList as any).materials) {
        materialsList = (materialsList as any).materials;
    }
}

// 타입 정의
interface MaterialData {
  material_id: string;
  name: string;
  category: string;
  positive_prompt: string;
  negative_prompt: string;
  lora_weight: number;
  texture_scale: string;
  recommended_denoising: number;
  color_code: string;
}

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', count: Array.isArray(materialsList) ? materialsList.length : 0 });
});

// 자재 정보 조회 (n8n용)
app.post('/prompt', (req, res) => {
  const { material_id } = req.body;
  
  if (!material_id) {
    return res.status(400).json({ error: 'material_id is required' });
  }

  // 안전하게 추출한 배열에서 검색
  const material = (materialsList as any[]).find(
    (m: MaterialData) => m.material_id === material_id
  );

  if (!material) {
    console.error(`Material not found: ${material_id}`);
    return res.status(404).json({ error: 'Material not found', material_id });
  }

  console.log(`✅ Material requested: ${material.name}`);
  res.json(material);
});

// 자재 리스트 조회 (프론트엔드용)
app.get('/materials', (req, res) => {
  res.json({ materials: materialsList });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`✅ MCP Server running on http://localhost:${PORT}`);
});