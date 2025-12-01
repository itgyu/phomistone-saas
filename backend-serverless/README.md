# Phomistone SaaS - Enterprise Backend

AWS Serverless 아키텍처 기반의 엔터프라이즈급 백엔드 시스템

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         API Gateway                              │
└───────────────────────────────┬─────────────────────────────────┘
                                │
    ┌───────────────────────────┼───────────────────────────┐
    │                           │                           │
    ▼                           ▼                           ▼
┌─────────┐             ┌─────────────┐             ┌─────────────┐
│ Projects │             │ AI Pipeline │             │   Export    │
│  CRUD    │             │ Segmentation│             │    PDF      │
│  Search  │             │  Rendering  │             └─────────────┘
└────┬─────┘             └──────┬──────┘
     │                          │
     │                          ▼
     │                   ┌─────────────┐
     │                   │    n8n      │
     │                   │  Webhooks   │
     │                   └──────┬──────┘
     │                          │
     ▼                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DynamoDB (Single Table)                       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │  GSI1   │ │  GSI2   │ │  GSI3   │ │  GSI4   │ │   TTL   │   │
│  │ ProjName│ │  Share  │ │Material │ │ Client  │ │ Cleanup │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
backend-serverless/
├── src/
│   ├── functions/           # Lambda 함수
│   │   ├── ai-pipeline/     # AI 처리 (세그멘테이션, 렌더링)
│   │   ├── projects/        # 프로젝트 CRUD & 검색
│   │   ├── materials/       # 자재 관리
│   │   ├── admin/           # 관리자 기능
│   │   └── export/          # PDF 내보내기
│   ├── lib/
│   │   ├── db/              # DynamoDB 클라이언트 & Repository
│   │   ├── middleware/      # 인증 미들웨어
│   │   └── utils/           # 유틸리티 함수
│   └── types/               # TypeScript 타입 정의
├── scripts/                 # 배포 스크립트
├── serverless.ts            # Serverless Framework 설정
├── package.json
└── tsconfig.json
```

## 🗄️ DynamoDB Schema (Single Table Design)

### Key Strategy

| Entity | PK | SK |
|--------|----|----|
| Organization | `ORG#<id>` | `META` |
| User | `ORG#<id>` | `USER#<email>` |
| Project | `ORG#<id>` | `PROJ#<id>` |
| ProjectImage | `PROJ#<id>` | `IMG#<id>` |
| Region | `IMG#<id>` | `REG#<id>` |
| StylingVersion | `IMG#<id>` | `VER#<id>` |
| StylingRegionMaterial | `VER#<id>` | `REG#<id>` |
| ShareLink | `SHARE#<token>` | `META` |
| Material | `MAT#<id>` | `META` |
| RenderJob | `VER#<id>` | `JOB#<id>` |

### Global Secondary Indexes

| Index | Purpose | Key |
|-------|---------|-----|
| GSI1 | 프로젝트명 검색 | `PK=ORG#<id>, SK=NAME#<name>` |
| GSI2 | 공유 링크 조회 | `PK=PROJ#<id>, SK=SHARE#<token>` |
| GSI3 | 자재별 버전 역조회 | `PK=MAT#<id>, SK=VER#<id>` |
| GSI4 | 고객명 검색 ★ | `PK=ORG#<id>, SK=CLIENT#<name>` |

## 🚀 Deployment Guide

### Prerequisites

1. AWS CLI configured
2. Node.js 18+
3. Serverless Framework 3.x

### Step 1: Install Dependencies

```bash
cd backend-serverless
npm install
```

### Step 2: Configure Secrets (SSM Parameter Store)

```bash
# JWT Secret (required)
aws ssm put-parameter \
  --name '/phomistone/dev/jwt-secret' \
  --value 'your-super-secret-jwt-key-change-in-production' \
  --type SecureString

# n8n Webhook URLs (required for AI features)
aws ssm put-parameter \
  --name '/phomistone/dev/n8n-segment-webhook-url' \
  --value 'https://your-n8n-instance.com/webhook/segment' \
  --type String

aws ssm put-parameter \
  --name '/phomistone/dev/n8n-render-webhook-url' \
  --value 'https://your-n8n-instance.com/webhook/render' \
  --type String

# Webhook secret (optional, for signature verification)
aws ssm put-parameter \
  --name '/phomistone/dev/webhook-secret' \
  --value 'your-webhook-secret' \
  --type SecureString
```

### Step 3: Deploy

```bash
# Development
npm run deploy

# Production
npm run deploy:prod

# Or using script
chmod +x scripts/deploy.sh
./scripts/deploy.sh dev
```

### Step 4: Seed Materials (Required - Run Once)

```bash
# After first deployment, seed the 33 default materials
npm run invoke:seed

# Or manually
npx serverless invoke -f seedMaterials --stage dev
```

## 📡 API Endpoints

### Projects

| Method | Path | Description |
|--------|------|-------------|
| POST | `/projects` | Create project |
| GET | `/projects` | List projects |
| GET | `/projects/{id}` | Get project |
| PUT | `/projects/{id}` | Update project |
| DELETE | `/projects/{id}` | Delete (archive) |
| GET | `/projects/search?type=project&query=xxx` | Search by name |
| GET | `/projects/search?type=client&query=xxx` | Search by client |

### AI Pipeline

| Method | Path | Description |
|--------|------|-------------|
| POST | `/projects/{pId}/images/{iId}/segment` | Start segmentation |
| POST | `/projects/{pId}/images/{iId}/versions/{vId}/render` | Start rendering |
| POST | `/webhook/segmentation` | n8n callback |
| POST | `/webhook/render` | n8n callback |

### Export

| Method | Path | Description |
|--------|------|-------------|
| GET | `/projects/{id}/export/pdf` | Generate PDF report |

### Admin

| Method | Path | Description |
|--------|------|-------------|
| PUT | `/admin/users/{email}/role` | Update user role (Owner only) |

## 🔐 Authentication

JWT 기반 인증 사용. Authorization 헤더에 Bearer 토큰 필요.

```typescript
// Request Header
Authorization: Bearer <jwt_token>

// JWT Payload
{
  userId: string;
  email: string;
  organizationId: string;
  role: 'Owner' | 'Editor' | 'Viewer';
}
```

## 🔄 n8n Webhook Integration

### Segmentation Callback Payload

```json
{
  "jobId": "uuid",
  "success": true,
  "result_url": "https://s3.../segmented.png",
  "metadata": {
    "imageId": "uuid"
  },
  "regions": [
    {
      "label": "wall",
      "maskUrl": "https://s3.../mask.png",
      "boundingBox": { "x": 0, "y": 0, "width": 100, "height": 100 },
      "area": 10000,
      "confidence": 0.95
    }
  ]
}
```

### Rendering Callback Payload

```json
{
  "jobId": "uuid",
  "success": true,
  "result_url": "https://s3.../rendered.png",
  "metadata": {
    "versionId": "uuid"
  }
}
```

### Error Payload

```json
{
  "jobId": "uuid",
  "success": false,
  "error": "Error message describing what went wrong"
}
```

## 📦 Included Materials (33 Types)

- **Stone (5)**: Carrara White, Nero Marquina, Beige Travertine, Gray Granite, Honey Onyx
- **Tile (6)**: Subway White, Hexagon Black, Terrazzo Gray, Porcelain Wood Oak, Moroccan Blue, Large Porcelain White
- **Wood (5)**: Walnut, Natural Oak, White Ash, Vintage Teak, Herringbone Oak
- **Fabric (4)**: Natural Linen, Emerald Velvet, Gray Wool, White Cotton
- **Wallpaper (4)**: Beige Grasscloth, Gold Damask, Navy Stripe, Pink Floral
- **Paint (3)**: Ivory White, Charcoal Gray, Sage Green
- **Metal (3)**: Brushed Stainless, Antique Brass, Black Steel
- **Concrete/Brick (3)**: Exposed Concrete, Red Brick, White Brick

## 🛠️ Local Development

```bash
# Start local server
npm run offline

# Available at http://localhost:3001
```

## 📊 Monitoring

- CloudWatch Logs: `/aws/lambda/phomistone-backend-{stage}-*`
- CloudWatch Metrics: Lambda invocations, DynamoDB consumed capacity
- X-Ray: Distributed tracing (enable in serverless.ts)

## 🔒 Security Features

- JWT token authentication
- Role-based access control (Owner/Editor/Viewer)
- Webhook signature verification
- S3 bucket with blocked public access
- DynamoDB encryption at rest
- SSM Parameter Store for secrets

## 📈 Cost Optimization

- DynamoDB PAY_PER_REQUEST (no provisioned capacity)
- Lambda 512MB default memory
- TTL on RenderJob for automatic cleanup
- S3 lifecycle policies (configure separately)
