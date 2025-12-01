/**
 * DynamoDB Key Builders for Single Table Design
 *
 * Key Strategy:
 * - PK/SK: Primary access patterns
 * - GSI1: Project name search (PK=ORG#<id>, SK=NAME#<name>)
 * - GSI2: Share links (PK=PROJ#<id>, SK=SHARE#<token>)
 * - GSI3: Material version lookup (PK=MAT#<id>, SK=VER#<id>)
 * - GSI4: Client name search (PK=ORG#<id>, SK=CLIENT#<name>)
 */

// ============================================
// Key Prefixes
// ============================================

export const KeyPrefix = {
  ORG: 'ORG#',
  USER: 'USER#',
  PROJ: 'PROJ#',
  IMG: 'IMG#',
  REG: 'REG#',
  VER: 'VER#',
  SHARE: 'SHARE#',
  MAT: 'MAT#',
  JOB: 'JOB#',
  META: 'META',
  NAME: 'NAME#',
  CLIENT: 'CLIENT#',
} as const;

// ============================================
// Organization Keys
// ============================================

export const OrganizationKeys = {
  pk: (orgId: string) => `${KeyPrefix.ORG}${orgId}`,
  sk: () => KeyPrefix.META,
};

// ============================================
// User Keys
// ============================================

export const UserKeys = {
  pk: (orgId: string) => `${KeyPrefix.ORG}${orgId}`,
  sk: (email: string) => `${KeyPrefix.USER}${email}`,
};

// ============================================
// Project Keys
// ============================================

export const ProjectKeys = {
  pk: (orgId: string) => `${KeyPrefix.ORG}${orgId}`,
  sk: (projectId: string) => `${KeyPrefix.PROJ}${projectId}`,

  // GSI1: Project name search
  gsi1pk: (orgId: string) => `${KeyPrefix.ORG}${orgId}`,
  gsi1sk: (projectName: string) => `${KeyPrefix.NAME}${projectName.toLowerCase()}`,

  // GSI4: Client name search
  gsi4pk: (orgId: string) => `${KeyPrefix.ORG}${orgId}`,
  gsi4sk: (clientName: string) => `${KeyPrefix.CLIENT}${clientName.toLowerCase()}`,
};

// ============================================
// ProjectImage Keys
// ============================================

export const ProjectImageKeys = {
  pk: (projectId: string) => `${KeyPrefix.PROJ}${projectId}`,
  sk: (imageId: string) => `${KeyPrefix.IMG}${imageId}`,
};

// ============================================
// Region Keys
// ============================================

export const RegionKeys = {
  pk: (imageId: string) => `${KeyPrefix.IMG}${imageId}`,
  sk: (regionId: string) => `${KeyPrefix.REG}${regionId}`,
};

// ============================================
// StylingVersion Keys
// ============================================

export const StylingVersionKeys = {
  pk: (imageId: string) => `${KeyPrefix.IMG}${imageId}`,
  sk: (versionId: string) => `${KeyPrefix.VER}${versionId}`,

  // GSI3: Material usage lookup
  gsi3pk: (materialId: string) => `${KeyPrefix.MAT}${materialId}`,
  gsi3sk: (versionId: string) => `${KeyPrefix.VER}${versionId}`,
};

// ============================================
// StylingRegionMaterial Keys
// ============================================

export const StylingRegionMaterialKeys = {
  pk: (versionId: string) => `${KeyPrefix.VER}${versionId}`,
  sk: (regionId: string) => `${KeyPrefix.REG}${regionId}`,
};

// ============================================
// ShareLink Keys
// ============================================

export const ShareLinkKeys = {
  pk: (token: string) => `${KeyPrefix.SHARE}${token}`,
  sk: () => KeyPrefix.META,

  // GSI2: Project share links
  gsi2pk: (projectId: string) => `${KeyPrefix.PROJ}${projectId}`,
  gsi2sk: (token: string) => `${KeyPrefix.SHARE}${token}`,
};

// ============================================
// Material Keys
// ============================================

export const MaterialKeys = {
  pk: (materialId: string) => `${KeyPrefix.MAT}${materialId}`,
  sk: () => KeyPrefix.META,
};

// ============================================
// RenderJob Keys
// ============================================

export const RenderJobKeys = {
  pk: (versionId: string) => `${KeyPrefix.VER}${versionId}`,
  sk: (jobId: string) => `${KeyPrefix.JOB}${jobId}`,
};

// ============================================
// Key Extractors (reverse parsing)
// ============================================

export const extractId = (key: string, prefix: string): string => {
  if (!key.startsWith(prefix)) {
    throw new Error(`Invalid key format: expected prefix ${prefix}`);
  }
  return key.slice(prefix.length);
};

export const extractOrgId = (pk: string): string => extractId(pk, KeyPrefix.ORG);
export const extractProjectId = (key: string): string => extractId(key, KeyPrefix.PROJ);
export const extractImageId = (key: string): string => extractId(key, KeyPrefix.IMG);
export const extractVersionId = (key: string): string => extractId(key, KeyPrefix.VER);
export const extractMaterialId = (key: string): string => extractId(key, KeyPrefix.MAT);
