/**
 * Start Segmentation Lambda
 * Initiates AI segmentation process via n8n webhook
 */

import type { APIGatewayProxyResult, Context } from 'aws-lambda';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import { createHandler, ExtendedAPIGatewayProxyEvent } from '../../lib/utils/handler';
import { success, accepted, parseBody, getPathParam } from '../../lib/utils/response';
import { Errors } from '../../lib/utils/errors';
import { authMiddleware } from '../../lib/middleware/auth';
import { ProjectImageRepo, RenderJobRepo, ProjectRepo } from '../../lib/db/repository';
import type { StartSegmentationRequest, RenderJob } from '../../types';

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

  // Check if already processing
  if (image.segmentationStatus === 'PROCESSING') {
    throw Errors.conflict('Segmentation is already in progress for this image');
  }

  // Create render job
  const jobId = uuidv4();
  const callbackUrl = `${process.env.API_GATEWAY_URL}/webhook/segmentation`;

  const job = await RenderJobRepo.create({
    versionId: imageId, // Using imageId as versionId for segmentation jobs
    imageId,
    projectId,
    organizationId,
    status: 'PENDING',
    jobType: 'SEGMENTATION',
    priority: 'NORMAL',
    maxRetries: 3,
    inputPayload: {
      imageId,
      imageUrl: image.originalUrl,
      projectId,
    },
    webhookCallbackUrl: callbackUrl,
  });

  // Update image status
  await ProjectImageRepo.updateStatus(projectId, imageId, 'PROCESSING');

  // Call n8n webhook
  const n8nUrl = process.env.N8N_SEGMENT_WEBHOOK_URL;
  if (!n8nUrl) {
    throw Errors.internalError('N8N_SEGMENT_WEBHOOK_URL not configured');
  }

  try {
    const n8nResponse = await axios.post(n8nUrl, {
      jobId: job.id,
      imageId,
      imageUrl: image.originalUrl,
      projectId,
      organizationId,
      callbackUrl,
      metadata: {
        imageName: image.name,
        width: image.width,
        height: image.height,
      },
    }, {
      timeout: 10000, // 10 second timeout for webhook call
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': context.awsRequestId,
      },
    });

    // Update job with n8n execution ID if available
    if (n8nResponse.data?.executionId) {
      await RenderJobRepo.updateStatus(imageId, job.id, 'PROCESSING', {
        n8nExecutionId: n8nResponse.data.executionId,
      });
    }
  } catch (error) {
    // Mark job as failed if n8n call fails
    const errorMessage = error instanceof Error ? error.message : 'Failed to call n8n webhook';
    await RenderJobRepo.updateStatus(imageId, job.id, 'FAILED', {
      errorMessage,
      errorCode: 'N8N_WEBHOOK_ERROR',
    });
    await ProjectImageRepo.updateStatus(projectId, imageId, 'FAILED', undefined, errorMessage);

    throw Errors.serviceUnavailable('Segmentation service');
  }

  return accepted({
    jobId: job.id,
    imageId,
    status: 'PROCESSING',
    message: 'Segmentation job started successfully',
  });
};

export const main = createHandler(handler).use(authMiddleware({ requiredRoles: ['Owner', 'Editor'] }));
