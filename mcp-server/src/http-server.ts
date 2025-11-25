import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const materialsPath = path.join(__dirname, 'data', 'materials-schema.json');
const materials = JSON.parse(fs.readFileSync(materialsPath, 'utf-8'));

app.get('/materials', (req, res) => {
  res.json(materials);
});

app.post('/prompt', (req, res) => {
  const { material_id } = req.body;
  const material = materials.find((m: any) => m.material_id === material_id);

  if (!material) {
    return res.status(404).json({ error: 'Material not found' });
  }

  res.json(material);
});

app.listen(PORT, () => {
  console.log(`✅ MCP Server running on http://localhost:${PORT}`);
});
