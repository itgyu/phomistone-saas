/**
 * Phomistone Enterprise - DynamoDB Single Table Design
 * 11 Entity Types with 4 GSIs
 */

// ============================================
// Base Types & Enums
// ============================================

export type UserRole = 'Owner' | 'Editor' | 'Viewer';
export type JobStatus = 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED';
export type EntityType =
  | 'ORGANIZATION'
  | 'USER'
  | 'PROJECT'
  | 'PROJECT_IMAGE'
  | 'REGION'
  | 'STYLING_VERSION'
  | 'STYLING_REGION_MATERIAL'
  | 'SHARE_LINK'
  | 'MATERIAL'
  | 'RENDER_JOB';

// ============================================
// DynamoDB Key Structure
// ============================================

export interface DynamoDBKeys {
  PK: string;
  SK: string;
  GSI1PK?: string;
  GSI1SK?: string;
  GSI2PK?: string;
  GSI2SK?: string;
  GSI3PK?: string;
  GSI3SK?: string;
  GSI4PK?: string;
  GSI4SK?: string;
}

export interface BaseEntity extends DynamoDBKeys {
  entityType: EntityType;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// 1. Organization Entity
// PK: ORG#<id>, SK: META
// ============================================

export interface Organization extends BaseEntity {
  entityType: 'ORGANIZATION';
  id: string;
  name: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  maxProjects: number;
  maxUsers: number;
  storageQuotaGB: number;
  usedStorageBytes: number;
  billingEmail?: string;
  settings: OrganizationSettings;
}

export interface OrganizationSettings {
  defaultRenderQuality: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA';
  watermarkEnabled: boolean;
  customBrandingEnabled: boolean;
  brandLogoUrl?: string;
}

// ============================================
// 2. User Entity
// PK: ORG#<id>, SK: USER#<email>
// ============================================

export interface User extends BaseEntity {
  entityType: 'USER';
  id: string;
  organizationId: string;
  email: string;
  name: string;
  role: UserRole;
  profileImageUrl?: string;
  lastLoginAt?: string;
  isActive: boolean;
  cognitoSub?: string; // Cognito User Pool Sub
}

// ============================================
// 3. Project Entity
// PK: ORG#<id>, SK: PROJ#<id>
// GSI1: PK=ORG#<id>, SK=NAME#<projectName> (프로젝트명 검색)
// GSI4: PK=ORG#<id>, SK=CLIENT#<clientName> (고객명 검색)
// ============================================

export interface Project extends BaseEntity {
  entityType: 'PROJECT';
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  clientName: string;
  clientContact?: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'ARCHIVED';
  thumbnailUrl?: string;
  imageCount: number;
  versionCount: number;
  createdBy: string; // User ID
  lastModifiedBy: string;
  dueDate?: string;
  tags: string[];
}

// ============================================
// 4. ProjectImage Entity
// PK: PROJ#<id>, SK: IMG#<id>
// ============================================

export interface ProjectImage extends BaseEntity {
  entityType: 'PROJECT_IMAGE';
  id: string;
  projectId: string;
  organizationId: string;
  name: string;
  originalUrl: string;
  thumbnailUrl?: string;
  segmentedUrl?: string; // AI 세그멘테이션 완료 후
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
  segmentationStatus: JobStatus;
  regionCount: number;
  uploadedBy: string;
  processingMetadata?: {
    segmentationJobId?: string;
    processingStartedAt?: string;
    processingCompletedAt?: string;
    errorMessage?: string;
  };
}

// ============================================
// 5. Region Entity (세그멘테이션 영역)
// PK: IMG#<id>, SK: REG#<id>
// ============================================

export interface Region extends BaseEntity {
  entityType: 'REGION';
  id: string;
  imageId: string;
  projectId: string;
  name: string; // 자동 생성 또는 사용자 지정 (예: "벽면 1", "바닥")
  label: string; // AI 감지 라벨 (예: "wall", "floor", "ceiling")
  maskUrl: string; // 마스크 이미지 URL
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  area: number; // 픽셀 수
  confidence: number; // AI 신뢰도 (0-1)
  polygonPoints?: Array<{ x: number; y: number }>; // 정밀 폴리곤
}

// ============================================
// 6. StylingVersion Entity
// PK: IMG#<id>, SK: VER#<id>
// GSI3: PK=MAT#<id>, SK=VER#<id> (자재별 사용 버전 역조회)
// ============================================

export interface StylingVersion extends BaseEntity {
  entityType: 'STYLING_VERSION';
  id: string;
  imageId: string;
  projectId: string;
  organizationId: string;
  versionNumber: number;
  name: string; // 예: "시안 1", "고객 요청안"
  description?: string;
  resultImageUrl?: string;
  thumbnailUrl?: string;
  renderStatus: JobStatus;
  renderJobId?: string;
  createdBy: string;
  isDefault: boolean;
  materialIds: string[]; // 사용된 자재 ID 목록 (GSI3 조회용)
}

// ============================================
// 7. StylingRegionMaterial Entity (버전별 영역-자재 매핑)
// PK: VER#<id>, SK: REG#<id>
// ============================================

export interface StylingRegionMaterial extends BaseEntity {
  entityType: 'STYLING_REGION_MATERIAL';
  versionId: string;
  regionId: string;
  imageId: string;
  materialId: string;
  materialName: string; // Denormalized for display
  materialThumbnailUrl: string;
  transformSettings: {
    scale: number;
    rotation: number;
    offsetX: number;
    offsetY: number;
    opacity: number;
  };
}

// ============================================
// 8. ShareLink Entity
// PK: SHARE#<token>, SK: META
// GSI2: PK=PROJ#<id>, SK=SHARE#<token>
// ============================================

export interface ShareLink extends BaseEntity {
  entityType: 'SHARE_LINK';
  token: string;
  projectId: string;
  organizationId: string;
  createdBy: string;
  expiresAt?: string;
  accessCount: number;
  maxAccessCount?: number;
  password?: string; // Optional password protection (hashed)
  permissions: {
    canView: boolean;
    canComment: boolean;
    canDownload: boolean;
  };
  isActive: boolean;
  lastAccessedAt?: string;
  accessLog: Array<{
    accessedAt: string;
    ipAddress?: string;
    userAgent?: string;
  }>;
}

// ============================================
// 9. Material Entity (자재)
// PK: MAT#<id>, SK: META
// ============================================

export interface Material extends BaseEntity {
  entityType: 'MATERIAL';
  id: string;
  category: MaterialCategory;
  subcategory?: string;
  name: string;
  brand?: string;
  productCode?: string;
  description?: string;
  thumbnailUrl: string;
  textureUrl: string; // 고해상도 텍스처
  normalMapUrl?: string; // Normal map for 3D rendering
  roughnessMapUrl?: string;
  physicalSize: {
    widthMM: number;
    heightMM: number;
  };
  colorHex?: string;
  tags: string[];
  isPublic: boolean;
  organizationId?: string; // null = public material
  usageCount: number;
  price?: {
    amount: number;
    currency: string;
    unit: string; // "sqm", "piece", etc.
  };
}

export type MaterialCategory =
  | 'STONE'
  | 'TILE'
  | 'WOOD'
  | 'FABRIC'
  | 'WALLPAPER'
  | 'PAINT'
  | 'METAL'
  | 'GLASS'
  | 'CONCRETE'
  | 'BRICK'
  | 'COMPOSITE';

// ============================================
// 10. RenderJob Entity (렌더링 작업)
// PK: VER#<id>, SK: JOB#<id>
// TTL: expiresAt (FAILED/PENDING 24시간 후 자동 삭제)
// ============================================

export interface RenderJob extends BaseEntity {
  entityType: 'RENDER_JOB';
  id: string;
  versionId: string;
  imageId: string;
  projectId: string;
  organizationId: string;
  status: JobStatus;
  jobType: 'SEGMENTATION' | 'RENDER' | 'EXPORT';
  priority: 'LOW' | 'NORMAL' | 'HIGH';

  // Input
  inputPayload: Record<string, unknown>;

  // Output
  resultUrl?: string;
  resultMetadata?: Record<string, unknown>;

  // Error tracking
  errorMessage?: string;
  errorCode?: string;
  retryCount: number;
  maxRetries: number;

  // Timing
  queuedAt: string;
  startedAt?: string;
  completedAt?: string;

  // TTL for auto-deletion
  expiresAt?: number; // Unix timestamp for DynamoDB TTL

  // n8n Integration
  n8nExecutionId?: string;
  webhookCallbackUrl?: string;
}

// ============================================
// API Request/Response Types
// ============================================

export interface CreateProjectRequest {
  name: string;
  description?: string;
  clientName: string;
  clientContact?: string;
  dueDate?: string;
  tags?: string[];
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  clientName?: string;
  clientContact?: string;
  status?: Project['status'];
  dueDate?: string;
  tags?: string[];
}

export interface SearchProjectsRequest {
  type: 'project' | 'client';
  query: string;
  limit?: number;
  nextToken?: string;
}

export interface StartSegmentationRequest {
  imageId: string;
}

export interface StartRenderingRequest {
  versionId: string;
  quality?: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA';
}

export interface WebhookPayload {
  jobId: string;
  success: boolean;
  resultUrl?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateShareLinkRequest {
  projectId: string;
  expiresInDays?: number;
  maxAccessCount?: number;
  password?: string;
  permissions?: ShareLink['permissions'];
}

export interface ApplyMaterialRequest {
  versionId: string;
  regionId: string;
  materialId: string;
  transformSettings?: StylingRegionMaterial['transformSettings'];
}

// ============================================
// Pagination Types
// ============================================

export interface PaginatedResponse<T> {
  items: T[];
  nextToken?: string;
  count: number;
  scannedCount?: number;
}

// ============================================
// API Response Wrapper
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    requestId: string;
    timestamp: string;
    duration?: number;
  };
}
