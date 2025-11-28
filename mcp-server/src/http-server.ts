import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 자재 데이터 로드
let materials: any[] = [];

const loadMaterials = () => {
  try {
    // 여러 경로 시도
    const possiblePaths = [
      path.join(__dirname, 'data/materials.json'),
      path.join(__dirname, '../data/materials.json'),
      path.join(__dirname, 'materials.json'),
      path.join(__dirname, '../materials.json'),
      path.join(__dirname, '../../materials.json'),
      path.join(process.cwd(), 'src/data/materials.json'),
      path.join(process.cwd(), 'data/materials.json'),
      path.join(process.cwd(), 'materials.json')
    ];

    let materialsPath = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        materialsPath = p;
        break;
      }
    }

    if (!materialsPath) {
      console.error('❌ materials.json not found in any of these paths:');
      possiblePaths.forEach(p => console.error(`   - ${p}`));
      return;
    }

    console.log('✅ Found materials.json at:', materialsPath);

    const materialsData = fs.readFileSync(materialsPath, 'utf-8');
    const parsed = JSON.parse(materialsData);

    // Handle different JSON structures
    if (Array.isArray(parsed)) {
      materials = parsed;
    } else if (parsed.materials && Array.isArray(parsed.materials)) {
      materials = parsed.materials;
    } else if (parsed.default) {
      if (Array.isArray(parsed.default)) {
        materials = parsed.default;
      } else if (parsed.default.materials && Array.isArray(parsed.default.materials)) {
        materials = parsed.default.materials;
      }
    }

    console.log(`✅ Loaded ${materials.length} materials`);
    console.log('First 5 material IDs:');
    materials.slice(0, 5).forEach(m => {
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
