import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM에서 __dirname 정의
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 자재 데이터 로드
let materials: any[] = [];

const loadMaterials = () => {
  try {
    // 절대 경로로 직접 지정 (가장 확실한 방법)
    const materialsPath = path.join(__dirname, 'data', 'materials.json');

    console.log('📂 Trying to load from:', materialsPath);

    if (!fs.existsSync(materialsPath)) {
      console.error('❌ materials.json not found at:', materialsPath);
      console.log('📂 Current directory:', __dirname);
      console.log('📂 Files in current directory:');
      try {
        fs.readdirSync(__dirname).forEach(file => {
          console.log(`   - ${file}`);
        });
      } catch (err) {
        console.error('Cannot read directory:', err);
      }
      return;
    }

    const materialsData = fs.readFileSync(materialsPath, 'utf-8');
    materials = JSON.parse(materialsData);

    console.log(`✅ Loaded ${materials.length} materials`);
    console.log('First 3 material IDs:');
    materials.slice(0, 3).forEach(m => {
      console.log(`   - ${m.material_id}: ${m.name}`);
    });

  } catch (error) {
    console.error('❌ Failed to load materials:', error);
    materials = [];
  }
};

// 시작 시 로드
loadMaterials();

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    materials_count: materials.length,
    timestamp: new Date().toISOString()
  });
});

// 모든 자재 조회
app.get('/materials', (req, res) => {
  console.log('📦 GET /materials');
  res.json(materials);
});

// 특정 자재 조회
app.get('/materials/:id', (req, res) => {
  const { id } = req.params;
  console.log(`🔍 GET /materials/${id}`);

  const material = materials.find(m => m.material_id === id);

  if (!material) {
    console.log(`❌ Material not found: ${id}`);
    console.log('📋 Available material IDs (first 10):');
    materials.slice(0, 10).forEach(m => {
      console.log(`   - ${m.material_id}`);
    });

    return res.status(404).json({
      error: 'Material not found',
      requested_id: id,
      available_count: materials.length,
      sample_ids: materials.map(m => m.material_id).slice(0, 10)
    });
  }

  console.log(`✅ Material found: ${material.name}`);
  res.json(material);
});

// 자재 정보 조회 (n8n용 - POST 엔드포인트 유지)
app.post('/prompt', (req, res) => {
  const { material_id } = req.body;

  console.log(`📨 POST /prompt - material_id: ${material_id}`);

  if (!material_id) {
    return res.status(400).json({ error: 'material_id is required' });
  }

  const material = materials.find(m => m.material_id === material_id);

  if (!material) {
    console.error(`❌ Material not found: ${material_id}`);
    console.log('📋 Available material IDs (first 10):');
    materials.slice(0, 10).forEach(m => {
      console.log(`   - ${m.material_id}`);
    });

    return res.status(404).json({
      error: 'Material not found',
      material_id,
      available_count: materials.length,
      sample_ids: materials.map(m => m.material_id).slice(0, 10)
    });
  }

  console.log(`✅ Material requested: ${material.name}`);
  res.json(material);
});

// 서버 시작
app.listen(PORT, () => {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 Phomistone MCP Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 Server:    http://localhost:${PORT}`);
  console.log(`📦 Materials: ${materials.length} loaded`);
  console.log(`🔍 Health:    http://localhost:${PORT}/health`);
  console.log(`📚 List:      http://localhost:${PORT}/materials`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
});

export default app;
