#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 MCP Server Test Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Health Check
echo "1️⃣ Health Check"
curl -s http://localhost:3001/health | jq .
echo ""

# 2. All Materials
echo "2️⃣ All Materials (first 3)"
curl -s http://localhost:3001/materials | jq '.[0:3]'
echo ""

# 3. Specific Material
echo "3️⃣ Specific Material (castol_white_01)"
curl -s http://localhost:3001/materials/castol_white_01 | jq .
echo ""

# 4. Test POST endpoint (for n8n)
echo "4️⃣ POST /prompt endpoint"
curl -s -X POST http://localhost:3001/prompt \
  -H "Content-Type: application/json" \
  -d '{"material_id": "castol_white_01"}' | jq .
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Test Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
