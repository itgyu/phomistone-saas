/**
 * DynamoDB Repository Layer
 * Centralized data access with Single Table Design
 */

import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  BatchWriteCommand,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

import { docClient, TABLE_NAME, GSI1_NAME, GSI2_NAME, GSI3_NAME, GSI4_NAME } from './client';
import {
  OrganizationKeys,
  UserKeys,
  ProjectKeys,
  ProjectImageKeys,
  RegionKeys,
  StylingVersionKeys,
  StylingRegionMaterialKeys,
  ShareLinkKeys,
  MaterialKeys,
  RenderJobKeys,
  KeyPrefix,
} from './keys';

import type {
  Organization,
  User,
  Project,
  ProjectImage,
  Region,
  StylingVersion,
  StylingRegionMaterial,
  ShareLink,
  Material,
  RenderJob,
  PaginatedResponse,
  JobStatus,
} from '../../types';

// ============================================
// Helper Functions
// ============================================

const now = () => new Date().toISOString();

const generateId = () => uuidv4();

// TTL: 24 hours from now
const generateTTL = (hoursFromNow: number = 24): number => {
  return Math.floor(Date.now() / 1000) + hoursFromNow * 3600;
};

// ============================================
// Organization Repository
// ============================================

export const OrganizationRepo = {
  async create(data: Omit<Organization, 'PK' | 'SK' | 'createdAt' | 'updatedAt' | 'entityType'>): Promise<Organization> {
    const timestamp = now();
    const item: Organization = {
      ...data,
      PK: OrganizationKeys.pk(data.id),
      SK: OrganizationKeys.sk(),
      entityType: 'ORGANIZATION',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
      ConditionExpression: 'attribute_not_exists(PK)',
    }));

    return item;
  },

  async getById(orgId: string): Promise<Organization | null> {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: OrganizationKeys.pk(orgId),
        SK: OrganizationKeys.sk(),
      },
    }));

    return (result.Item as Organization) || null;
  },

  async update(orgId: string, updates: Partial<Organization>): Promise<Organization> {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};

    Object.entries(updates).forEach(([key, value]) => {
      if (['PK', 'SK', 'entityType', 'createdAt'].includes(key)) return;
      updateExpressions.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = value;
    });

    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = now();

    const result = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: OrganizationKeys.pk(orgId),
        SK: OrganizationKeys.sk(),
      },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    }));

    return result.Attributes as Organization;
  },
};

// ============================================
// User Repository
// ============================================

export const UserRepo = {
  async create(data: Omit<User, 'PK' | 'SK' | 'createdAt' | 'updatedAt' | 'entityType' | 'id'>): Promise<User> {
    const timestamp = now();
    const item: User = {
      ...data,
      id: generateId(),
      PK: UserKeys.pk(data.organizationId),
      SK: UserKeys.sk(data.email),
      entityType: 'USER',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
      ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
    }));

    return item;
  },

  async getByEmail(orgId: string, email: string): Promise<User | null> {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: UserKeys.pk(orgId),
        SK: UserKeys.sk(email),
      },
    }));

    return (result.Item as User) || null;
  },

  async listByOrganization(orgId: string): Promise<User[]> {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': UserKeys.pk(orgId),
        ':skPrefix': KeyPrefix.USER,
      },
    }));

    return (result.Items as User[]) || [];
  },
};

// ============================================
// Project Repository
// ============================================

export const ProjectRepo = {
  async create(data: Omit<Project, 'PK' | 'SK' | 'GSI1PK' | 'GSI1SK' | 'GSI4PK' | 'GSI4SK' | 'createdAt' | 'updatedAt' | 'entityType' | 'id'>): Promise<Project> {
    const timestamp = now();
    const id = generateId();

    const item: Project = {
      ...data,
      id,
      PK: ProjectKeys.pk(data.organizationId),
      SK: ProjectKeys.sk(id),
      GSI1PK: ProjectKeys.gsi1pk(data.organizationId),
      GSI1SK: ProjectKeys.gsi1sk(data.name),
      GSI4PK: ProjectKeys.gsi4pk(data.organizationId),
      GSI4SK: ProjectKeys.gsi4sk(data.clientName),
      entityType: 'PROJECT',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }));

    return item;
  },

  async getById(orgId: string, projectId: string): Promise<Project | null> {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: ProjectKeys.pk(orgId),
        SK: ProjectKeys.sk(projectId),
      },
    }));

    return (result.Item as Project) || null;
  },

  async listByOrganization(orgId: string, limit: number = 50, nextToken?: string): Promise<PaginatedResponse<Project>> {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': ProjectKeys.pk(orgId),
        ':skPrefix': KeyPrefix.PROJ,
      },
      Limit: limit,
      ExclusiveStartKey: nextToken ? JSON.parse(Buffer.from(nextToken, 'base64').toString()) : undefined,
    }));

    return {
      items: (result.Items as Project[]) || [],
      count: result.Count || 0,
      scannedCount: result.ScannedCount,
      nextToken: result.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
        : undefined,
    };
  },

  /**
   * Search projects by name using GSI1
   */
  async searchByName(orgId: string, namePrefix: string, limit: number = 20): Promise<Project[]> {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: GSI1_NAME,
      KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': ProjectKeys.gsi1pk(orgId),
        ':sk': ProjectKeys.gsi1sk(namePrefix),
      },
      Limit: limit,
    }));

    return (result.Items as Project[]) || [];
  },

  /**
   * Search projects by client name using GSI4
   */
  async searchByClient(orgId: string, clientNamePrefix: string, limit: number = 20): Promise<Project[]> {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: GSI4_NAME,
      KeyConditionExpression: 'GSI4PK = :pk AND begins_with(GSI4SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': ProjectKeys.gsi4pk(orgId),
        ':sk': ProjectKeys.gsi4sk(clientNamePrefix),
      },
      Limit: limit,
    }));

    return (result.Items as Project[]) || [];
  },

  async update(orgId: string, projectId: string, updates: Partial<Project>): Promise<Project> {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};

    Object.entries(updates).forEach(([key, value]) => {
      if (['PK', 'SK', 'GSI1PK', 'GSI1SK', 'GSI4PK', 'GSI4SK', 'entityType', 'createdAt', 'id'].includes(key)) return;
      updateExpressions.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = value;
    });

    // Update GSI keys if name or clientName changed
    if (updates.name) {
      updateExpressions.push('#gsi1sk = :gsi1sk');
      expressionAttributeNames['#gsi1sk'] = 'GSI1SK';
      expressionAttributeValues[':gsi1sk'] = ProjectKeys.gsi1sk(updates.name);
    }

    if (updates.clientName) {
      updateExpressions.push('#gsi4sk = :gsi4sk');
      expressionAttributeNames['#gsi4sk'] = 'GSI4SK';
      expressionAttributeValues[':gsi4sk'] = ProjectKeys.gsi4sk(updates.clientName);
    }

    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = now();

    const result = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: ProjectKeys.pk(orgId),
        SK: ProjectKeys.sk(projectId),
      },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    }));

    return result.Attributes as Project;
  },

  async delete(orgId: string, projectId: string): Promise<void> {
    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: ProjectKeys.pk(orgId),
        SK: ProjectKeys.sk(projectId),
      },
    }));
  },
};

// ============================================
// ProjectImage Repository
// ============================================

export const ProjectImageRepo = {
  async create(data: Omit<ProjectImage, 'PK' | 'SK' | 'createdAt' | 'updatedAt' | 'entityType' | 'id'>): Promise<ProjectImage> {
    const timestamp = now();
    const id = generateId();

    const item: ProjectImage = {
      ...data,
      id,
      PK: ProjectImageKeys.pk(data.projectId),
      SK: ProjectImageKeys.sk(id),
      entityType: 'PROJECT_IMAGE',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }));

    return item;
  },

  async getById(projectId: string, imageId: string): Promise<ProjectImage | null> {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: ProjectImageKeys.pk(projectId),
        SK: ProjectImageKeys.sk(imageId),
      },
    }));

    return (result.Item as ProjectImage) || null;
  },

  async listByProject(projectId: string): Promise<ProjectImage[]> {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': ProjectImageKeys.pk(projectId),
        ':skPrefix': KeyPrefix.IMG,
      },
    }));

    return (result.Items as ProjectImage[]) || [];
  },

  async updateStatus(projectId: string, imageId: string, status: JobStatus, resultUrl?: string, errorMessage?: string): Promise<void> {
    const updates: Record<string, unknown> = {
      segmentationStatus: status,
      updatedAt: now(),
    };

    if (resultUrl) updates.segmentedUrl = resultUrl;
    if (status === 'DONE') updates['processingMetadata.processingCompletedAt'] = now();
    if (errorMessage) updates['processingMetadata.errorMessage'] = errorMessage;

    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: ProjectImageKeys.pk(projectId),
        SK: ProjectImageKeys.sk(imageId),
      },
      UpdateExpression: 'SET segmentationStatus = :status, updatedAt = :updatedAt' +
        (resultUrl ? ', segmentedUrl = :resultUrl' : '') +
        (errorMessage ? ', #pm.#em = :errorMessage' : ''),
      ExpressionAttributeNames: errorMessage ? {
        '#pm': 'processingMetadata',
        '#em': 'errorMessage',
      } : undefined,
      ExpressionAttributeValues: {
        ':status': status,
        ':updatedAt': now(),
        ...(resultUrl && { ':resultUrl': resultUrl }),
        ...(errorMessage && { ':errorMessage': errorMessage }),
      },
    }));
  },
};

// ============================================
// Region Repository
// ============================================

export const RegionRepo = {
  async createBatch(regions: Array<Omit<Region, 'PK' | 'SK' | 'createdAt' | 'updatedAt' | 'entityType' | 'id'>>): Promise<Region[]> {
    const timestamp = now();
    const items: Region[] = regions.map(region => ({
      ...region,
      id: generateId(),
      PK: RegionKeys.pk(region.imageId),
      SK: RegionKeys.sk(generateId()),
      entityType: 'REGION',
      createdAt: timestamp,
      updatedAt: timestamp,
    }));

    // Batch write in chunks of 25
    for (let i = 0; i < items.length; i += 25) {
      const batch = items.slice(i, i + 25);
      await docClient.send(new BatchWriteCommand({
        RequestItems: {
          [TABLE_NAME]: batch.map(item => ({
            PutRequest: { Item: item },
          })),
        },
      }));
    }

    return items;
  },

  async listByImage(imageId: string): Promise<Region[]> {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': RegionKeys.pk(imageId),
        ':skPrefix': KeyPrefix.REG,
      },
    }));

    return (result.Items as Region[]) || [];
  },
};

// ============================================
// StylingVersion Repository
// ============================================

export const StylingVersionRepo = {
  async create(data: Omit<StylingVersion, 'PK' | 'SK' | 'GSI3PK' | 'GSI3SK' | 'createdAt' | 'updatedAt' | 'entityType' | 'id'>): Promise<StylingVersion> {
    const timestamp = now();
    const id = generateId();

    // GSI3 entries for each material used
    const gsi3Keys = data.materialIds.length > 0 ? {
      GSI3PK: StylingVersionKeys.gsi3pk(data.materialIds[0]),
      GSI3SK: StylingVersionKeys.gsi3sk(id),
    } : {};

    const item: StylingVersion = {
      ...data,
      id,
      PK: StylingVersionKeys.pk(data.imageId),
      SK: StylingVersionKeys.sk(id),
      ...gsi3Keys,
      entityType: 'STYLING_VERSION',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }));

    return item;
  },

  async getById(imageId: string, versionId: string): Promise<StylingVersion | null> {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: StylingVersionKeys.pk(imageId),
        SK: StylingVersionKeys.sk(versionId),
      },
    }));

    return (result.Item as StylingVersion) || null;
  },

  async listByImage(imageId: string): Promise<StylingVersion[]> {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': StylingVersionKeys.pk(imageId),
        ':skPrefix': KeyPrefix.VER,
      },
    }));

    return (result.Items as StylingVersion[]) || [];
  },

  /**
   * Find versions using a specific material (via GSI3)
   */
  async findByMaterial(materialId: string, limit: number = 50): Promise<StylingVersion[]> {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: GSI3_NAME,
      KeyConditionExpression: 'GSI3PK = :pk',
      ExpressionAttributeValues: {
        ':pk': StylingVersionKeys.gsi3pk(materialId),
      },
      Limit: limit,
    }));

    return (result.Items as StylingVersion[]) || [];
  },

  async updateRenderStatus(imageId: string, versionId: string, status: JobStatus, resultUrl?: string): Promise<void> {
    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: StylingVersionKeys.pk(imageId),
        SK: StylingVersionKeys.sk(versionId),
      },
      UpdateExpression: 'SET renderStatus = :status, updatedAt = :updatedAt' +
        (resultUrl ? ', resultImageUrl = :resultUrl' : ''),
      ExpressionAttributeValues: {
        ':status': status,
        ':updatedAt': now(),
        ...(resultUrl && { ':resultUrl': resultUrl }),
      },
    }));
  },
};

// ============================================
// StylingRegionMaterial Repository
// ============================================

export const StylingRegionMaterialRepo = {
  async upsert(data: Omit<StylingRegionMaterial, 'PK' | 'SK' | 'createdAt' | 'updatedAt' | 'entityType'>): Promise<StylingRegionMaterial> {
    const timestamp = now();

    const item: StylingRegionMaterial = {
      ...data,
      PK: StylingRegionMaterialKeys.pk(data.versionId),
      SK: StylingRegionMaterialKeys.sk(data.regionId),
      entityType: 'STYLING_REGION_MATERIAL',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }));

    return item;
  },

  async listByVersion(versionId: string): Promise<StylingRegionMaterial[]> {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': StylingRegionMaterialKeys.pk(versionId),
        ':skPrefix': KeyPrefix.REG,
      },
    }));

    return (result.Items as StylingRegionMaterial[]) || [];
  },
};

// ============================================
// ShareLink Repository
// ============================================

export const ShareLinkRepo = {
  async create(data: Omit<ShareLink, 'PK' | 'SK' | 'GSI2PK' | 'GSI2SK' | 'createdAt' | 'updatedAt' | 'entityType'>): Promise<ShareLink> {
    const timestamp = now();

    const item: ShareLink = {
      ...data,
      PK: ShareLinkKeys.pk(data.token),
      SK: ShareLinkKeys.sk(),
      GSI2PK: ShareLinkKeys.gsi2pk(data.projectId),
      GSI2SK: ShareLinkKeys.gsi2sk(data.token),
      entityType: 'SHARE_LINK',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }));

    return item;
  },

  async getByToken(token: string): Promise<ShareLink | null> {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: ShareLinkKeys.pk(token),
        SK: ShareLinkKeys.sk(),
      },
    }));

    return (result.Item as ShareLink) || null;
  },

  async listByProject(projectId: string): Promise<ShareLink[]> {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: GSI2_NAME,
      KeyConditionExpression: 'GSI2PK = :pk',
      ExpressionAttributeValues: {
        ':pk': ShareLinkKeys.gsi2pk(projectId),
      },
    }));

    return (result.Items as ShareLink[]) || [];
  },

  async incrementAccessCount(token: string): Promise<void> {
    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: ShareLinkKeys.pk(token),
        SK: ShareLinkKeys.sk(),
      },
      UpdateExpression: 'SET accessCount = accessCount + :inc, lastAccessedAt = :now',
      ExpressionAttributeValues: {
        ':inc': 1,
        ':now': now(),
      },
    }));
  },
};

// ============================================
// Material Repository
// ============================================

export const MaterialRepo = {
  async create(data: Omit<Material, 'PK' | 'SK' | 'createdAt' | 'updatedAt' | 'entityType'>): Promise<Material> {
    const timestamp = now();

    const item: Material = {
      ...data,
      PK: MaterialKeys.pk(data.id),
      SK: MaterialKeys.sk(),
      entityType: 'MATERIAL',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }));

    return item;
  },

  async createBatch(materials: Array<Omit<Material, 'PK' | 'SK' | 'createdAt' | 'updatedAt' | 'entityType'>>): Promise<void> {
    const timestamp = now();

    const items: Material[] = materials.map(mat => ({
      ...mat,
      PK: MaterialKeys.pk(mat.id),
      SK: MaterialKeys.sk(),
      entityType: 'MATERIAL',
      createdAt: timestamp,
      updatedAt: timestamp,
    }));

    // Batch write in chunks of 25
    for (let i = 0; i < items.length; i += 25) {
      const batch = items.slice(i, i + 25);
      await docClient.send(new BatchWriteCommand({
        RequestItems: {
          [TABLE_NAME]: batch.map(item => ({
            PutRequest: { Item: item },
          })),
        },
      }));
    }
  },

  async getById(materialId: string): Promise<Material | null> {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: MaterialKeys.pk(materialId),
        SK: MaterialKeys.sk(),
      },
    }));

    return (result.Item as Material) || null;
  },

  async incrementUsageCount(materialId: string): Promise<void> {
    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: MaterialKeys.pk(materialId),
        SK: MaterialKeys.sk(),
      },
      UpdateExpression: 'SET usageCount = usageCount + :inc',
      ExpressionAttributeValues: {
        ':inc': 1,
      },
    }));
  },
};

// ============================================
// RenderJob Repository
// ============================================

export const RenderJobRepo = {
  async create(data: Omit<RenderJob, 'PK' | 'SK' | 'createdAt' | 'updatedAt' | 'entityType' | 'id' | 'queuedAt' | 'retryCount'>): Promise<RenderJob> {
    const timestamp = now();
    const id = generateId();

    const item: RenderJob = {
      ...data,
      id,
      PK: RenderJobKeys.pk(data.versionId),
      SK: RenderJobKeys.sk(id),
      entityType: 'RENDER_JOB',
      queuedAt: timestamp,
      retryCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      // TTL: 24 hours for PENDING/FAILED jobs
      expiresAt: data.status === 'PENDING' ? generateTTL(24) : undefined,
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }));

    return item;
  },

  async getById(versionId: string, jobId: string): Promise<RenderJob | null> {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: RenderJobKeys.pk(versionId),
        SK: RenderJobKeys.sk(jobId),
      },
    }));

    return (result.Item as RenderJob) || null;
  },

  async updateStatus(
    versionId: string,
    jobId: string,
    status: JobStatus,
    resultData?: { resultUrl?: string; errorMessage?: string; errorCode?: string; n8nExecutionId?: string }
  ): Promise<void> {
    const timestamp = now();

    let updateExpression = 'SET #status = :status, updatedAt = :updatedAt';
    const expressionAttributeNames: Record<string, string> = { '#status': 'status' };
    const expressionAttributeValues: Record<string, unknown> = {
      ':status': status,
      ':updatedAt': timestamp,
    };

    if (status === 'PROCESSING') {
      updateExpression += ', startedAt = :startedAt';
      expressionAttributeValues[':startedAt'] = timestamp;
    }

    if (status === 'DONE' || status === 'FAILED') {
      updateExpression += ', completedAt = :completedAt';
      expressionAttributeValues[':completedAt'] = timestamp;

      // Remove TTL on completion
      updateExpression += ' REMOVE expiresAt';
    }

    if (resultData?.resultUrl) {
      updateExpression += ', resultUrl = :resultUrl';
      expressionAttributeValues[':resultUrl'] = resultData.resultUrl;
    }

    if (resultData?.errorMessage) {
      updateExpression += ', errorMessage = :errorMessage';
      expressionAttributeValues[':errorMessage'] = resultData.errorMessage;
    }

    if (resultData?.errorCode) {
      updateExpression += ', errorCode = :errorCode';
      expressionAttributeValues[':errorCode'] = resultData.errorCode;
    }

    if (resultData?.n8nExecutionId) {
      updateExpression += ', n8nExecutionId = :n8nExecutionId';
      expressionAttributeValues[':n8nExecutionId'] = resultData.n8nExecutionId;
    }

    // Set TTL for FAILED jobs
    if (status === 'FAILED') {
      updateExpression += ', expiresAt = :expiresAt';
      expressionAttributeValues[':expiresAt'] = generateTTL(24);
    }

    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: RenderJobKeys.pk(versionId),
        SK: RenderJobKeys.sk(jobId),
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    }));
  },

  async listByVersion(versionId: string): Promise<RenderJob[]> {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': RenderJobKeys.pk(versionId),
        ':skPrefix': KeyPrefix.JOB,
      },
    }));

    return (result.Items as RenderJob[]) || [];
  },
};
