/**
 * Start Rendering Lambda
 * Initiates AI rendering process via n8n webhook
 */

import type { APIGatewayProxyResult, Context } from 'aws-lambda';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import { createHandler, ExtendedAPIGatewayProxyEvent } from '../../lib/utils/handler';
import { accepted, getPathParam } from '../../lib/utils/response';
import { Errors } from '../../lib/utils/errors';
import { authMiddleware } from '../../lib/middleware/auth';
import {
  ProjectRepo,
  ProjectImageRepo,
  StylingVersionRepo,
  StylingRegionMaterialRepo,
  RenderJobRepo,
  RegionRepo,
  MaterialRepo,
} from '../../lib/db/repository';
import type { StartRenderingRequest } from '../../types';

interface AuthenticatedEvent extends ExtendedAPIGatewayProxyEvent {
  auth: {
    userId: string;
    organizationId: string;
    role: 'Owner' | 'Editor' | 'Viewer';
  };
}

const handler = async (
  event: AuthenticatedEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const { organizationId, userId } = event.auth;
  const projectId = getPathParam(event.pathParameters, 'projectId');
  const imageId = getPathParam(event.pathParameters, 'imageId');
  const versionId = getPathParam(event.pathParameters, 'versionId');

  const body = event.body as unknown as StartRenderingRequest;
  const quality = body?.quality || 'HIGH';

  // Verify project ownership
  const project = await ProjectRepo.getById(organizationId, projectId);
  if (!project) {
    throw Errors.notFound('Project', projectId);
  }

  // Get the image
  const image = await ProjectImageRepo.getById(projectId, imageId);
  if (!image) {
    throw Errors.notFound('Image', imageId);
  }

  // Ensure image is segmented
  if (image.segmentationStatus !== 'DONE') {
    throw Errors.badRequest('Image must be segmented before rendering');
  }

  // Get the styling version
  const version = await StylingVersionRepo.getById(imageId, versionId);
  if (!version) {
    throw Errors.notFound('StylingVersion', versionId);
  }

  // Check if already rendering
  if (version.renderStatus === 'PROCESSING') {
    throw Errors.conflict('Rendering is already in progress for this version');
  }

  // Get region-material mappings
  const regionMaterials = await StylingRegionMaterialRepo.listByVersion(versionId);
  if (regionMaterials.length === 0) {
    throw Errors.badRequest('No materials applied to any region');
  }

  // Get all regions for the image
  const regions = await RegionRepo.listByImage(imageId);

  // Build render payload with material details
  const renderRegions = await Promise.all(
    regionMaterials.map(async (rm) => {
      const region = regions.find(r => r.id === rm.regionId);
      const material = await MaterialRepo.getById(rm.materialId);

      return {
        regionId: rm.regionId,
        regionName: region?.name || 'Unknown',
        maskUrl: region?.maskUrl,
        materialId: rm.materialId,
        materialName: rm.materialName,
        textureUrl: material?.textureUrl,
        normalMapUrl: material?.normalMapUrl,
        physicalSize: material?.physicalSize,
        transformSettings: rm.transformSettings,
      };
    })
  );

  // Create render job
  const callbackUrl = `${process.env.API_GATEWAY_URL}/webhook/render`;

  const job = await RenderJobRepo.create({
    versionId,
    imageId,
    projectId,
    organizationId,
    status: 'PENDING',
    jobType: 'RENDER',
    priority: quality === 'ULTRA' ? 'HIGH' : 'NORMAL',
    maxRetries: 3,
    inputPayload: {
      versionId,
      imageId,
      projectId,
      originalImageUrl: image.originalUrl,
      segmentedImageUrl: image.segmentedUrl,
      quality,
      regions: renderRegions,
    },
    webhookCallbackUrl: callbackUrl,
  });

  // Update version status
  await StylingVersionRepo.updateRenderStatus(imageId, versionId, 'PROCESSING');

  // Call n8n webhook
  const n8nUrl = process.env.N8N_RENDER_WEBHOOK_URL;
  if (!n8nUrl) {
    throw Errors.internalError('N8N_RENDER_WEBHOOK_URL not configured');
  }

  try {
    const n8nResponse = await axios.post(n8nUrl, {
      jobId: job.id,
      versionId,
      imageId,
      projectId,
      organizationId,
      callbackUrl,
      quality,
      originalImageUrl: image.originalUrl,
      segmentedImageUrl: image.segmentedUrl,
      regions: renderRegions,
      metadata: {
        versionName: version.name,
        versionNumber: version.versionNumber,
        imageName: image.name,
        width: image.width,
        height: image.height,
      },
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': context.awsRequestId,
      },
    });

    // Update job with n8n execution ID if available
    if (n8nResponse.data?.executionId) {
      await RenderJobRepo.updateStatus(versionId, job.id, 'PROCESSING', {
        n8nExecutionId: n8nResponse.data.executionId,
      });
    }
  } catch (error) {
    // Mark job as failed if n8n call fails
    const errorMessage = error instanceof Error ? error.message : 'Failed to call n8n webhook';
    await RenderJobRepo.updateStatus(versionId, job.id, 'FAILED', {
      errorMessage,
      errorCode: 'N8N_WEBHOOK_ERROR',
    });
    await StylingVersionRepo.updateRenderStatus(imageId, versionId, 'FAILED');

    throw Errors.serviceUnavailable('Rendering service');
  }

  return accepted({
    jobId: job.id,
    versionId,
    imageId,
    status: 'PROCESSING',
    message: 'Rendering job started successfully',
    estimatedTime: quality === 'ULTRA' ? '3-5 minutes' : '1-2 minutes',
  });
};

export const main = createHandler(handler).use(authMiddleware({ requiredRoles: ['Owner', 'Editor'] }));
