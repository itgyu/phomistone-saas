/**
 * Webhook Handler Lambda
 * Receives callbacks from n8n with job results
 *
 * Expected payload from n8n:
 * {
 *   jobId: string;
 *   success: boolean;
 *   result_url?: string;
 *   error?: string;
 *   metadata?: Record<string, unknown>;
 * }
 */

import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import crypto from 'crypto';

import { createWebhookHandler } from '../../lib/utils/handler';
import { success, error as errorResponse } from '../../lib/utils/response';
import { Errors } from '../../lib/utils/errors';
import {
  RenderJobRepo,
  ProjectImageRepo,
  StylingVersionRepo,
  RegionRepo,
} from '../../lib/db/repository';
import type { WebhookPayload, Region } from '../../types';

// Webhook secret for signature verification
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'phomistone-webhook-secret';

/**
 * Verify webhook signature
 */
const verifySignature = (body: string, signature: string | undefined): boolean => {
  if (!signature) return false;

  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

/**
 * Handle segmentation webhook callback
 */
const handleSegmentationCallback = async (
  payload: WebhookPayload & {
    regions?: Array<{
      label: string;
      maskUrl: string;
      boundingBox: { x: number; y: number; width: number; height: number };
      area: number;
      confidence: number;
      polygonPoints?: Array<{ x: number; y: number }>;
    }>;
  },
  job: Awaited<ReturnType<typeof RenderJobRepo.getById>>
): Promise<void> => {
  if (!job) throw Errors.notFound('Job');

  const { imageId, projectId } = job;

  if (payload.success) {
    // Update job status
    await RenderJobRepo.updateStatus(imageId, job.id, 'DONE', {
      resultUrl: payload.result_url,
    });

    // Update image with segmented result
    await ProjectImageRepo.updateStatus(projectId, imageId, 'DONE', payload.result_url);

    // Create region entities from AI results
    if (payload.regions && payload.regions.length > 0) {
      const regionData: Array<Omit<Region, 'PK' | 'SK' | 'createdAt' | 'updatedAt' | 'entityType' | 'id'>> = payload.regions.map((r, index) => ({
        imageId,
        projectId,
        name: `${r.label} ${index + 1}`,
        label: r.label,
        maskUrl: r.maskUrl,
        boundingBox: r.boundingBox,
        area: r.area,
        confidence: r.confidence,
        polygonPoints: r.polygonPoints,
      }));

      await RegionRepo.createBatch(regionData);

      console.log(`Created ${regionData.length} regions for image ${imageId}`);
    }
  } else {
    // Handle failure
    const errorMessage = payload.error || 'Segmentation failed';

    await RenderJobRepo.updateStatus(imageId, job.id, 'FAILED', {
      errorMessage,
      errorCode: 'SEGMENTATION_FAILED',
    });

    await ProjectImageRepo.updateStatus(projectId, imageId, 'FAILED', undefined, errorMessage);

    console.error(`Segmentation failed for image ${imageId}: ${errorMessage}`);
  }
};

/**
 * Handle rendering webhook callback
 */
const handleRenderCallback = async (
  payload: WebhookPayload,
  job: Awaited<ReturnType<typeof RenderJobRepo.getById>>
): Promise<void> => {
  if (!job) throw Errors.notFound('Job');

  const { versionId, imageId } = job;

  if (payload.success) {
    // Update job status
    await RenderJobRepo.updateStatus(versionId, job.id, 'DONE', {
      resultUrl: payload.result_url,
    });

    // Update version with rendered result
    await StylingVersionRepo.updateRenderStatus(imageId, versionId, 'DONE', payload.result_url);

    console.log(`Render completed for version ${versionId}: ${payload.result_url}`);
  } else {
    // Handle failure
    const errorMessage = payload.error || 'Rendering failed';

    await RenderJobRepo.updateStatus(versionId, job.id, 'FAILED', {
      errorMessage,
      errorCode: 'RENDER_FAILED',
    });

    await StylingVersionRepo.updateRenderStatus(imageId, versionId, 'FAILED');

    console.error(`Render failed for version ${versionId}: ${errorMessage}`);
  }
};

const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  // Verify webhook signature (optional but recommended)
  const signature = event.headers['x-webhook-signature'];
  if (WEBHOOK_SECRET && signature) {
    if (!verifySignature(event.body || '', signature)) {
      console.error('Invalid webhook signature');
      return errorResponse(401, 'INVALID_SIGNATURE', 'Invalid webhook signature');
    }
  }

  // Parse payload
  let payload: WebhookPayload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return errorResponse(400, 'INVALID_JSON', 'Invalid JSON payload');
  }

  // Validate required fields
  if (!payload.jobId) {
    return errorResponse(400, 'MISSING_JOB_ID', 'jobId is required');
  }

  if (typeof payload.success !== 'boolean') {
    return errorResponse(400, 'MISSING_SUCCESS', 'success field is required');
  }

  // Determine job type from path
  const path = event.path;
  const isSegmentation = path.includes('/segmentation');
  const isRender = path.includes('/render');

  console.log(`Webhook received for job ${payload.jobId}`, {
    type: isSegmentation ? 'segmentation' : 'render',
    success: payload.success,
    hasResultUrl: !!payload.result_url,
    hasError: !!payload.error,
  });

  try {
    // Find the job - we need to search since we don't know versionId
    // In a real system, you'd include versionId in the callback
    // For now, we'll extract it from the payload metadata
    const versionIdOrImageId = (payload.metadata as { versionId?: string; imageId?: string })?.versionId
      || (payload.metadata as { imageId?: string })?.imageId;

    if (!versionIdOrImageId) {
      return errorResponse(400, 'MISSING_VERSION_ID', 'versionId or imageId is required in metadata');
    }

    const job = await RenderJobRepo.getById(versionIdOrImageId, payload.jobId);

    if (!job) {
      console.error(`Job not found: ${payload.jobId}`);
      return errorResponse(404, 'JOB_NOT_FOUND', `Job ${payload.jobId} not found`);
    }

    // Handle based on job type
    if (job.jobType === 'SEGMENTATION') {
      await handleSegmentationCallback(payload as WebhookPayload & {
        regions?: Array<{
          label: string;
          maskUrl: string;
          boundingBox: { x: number; y: number; width: number; height: number };
          area: number;
          confidence: number;
        }>;
      }, job);
    } else if (job.jobType === 'RENDER') {
      await handleRenderCallback(payload, job);
    } else {
      console.warn(`Unknown job type: ${job.jobType}`);
    }

    return success({
      received: true,
      jobId: payload.jobId,
      status: payload.success ? 'DONE' : 'FAILED',
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    throw error;
  }
};

export const main = createWebhookHandler(handler);
