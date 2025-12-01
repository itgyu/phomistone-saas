/**
 * Create Styling Version Lambda
 */

import type { APIGatewayProxyResult, Context } from 'aws-lambda';

import { createHandler, ExtendedAPIGatewayProxyEvent } from '../../lib/utils/handler';
import { created, getPathParam } from '../../lib/utils/response';
import { Errors } from '../../lib/utils/errors';
import { authMiddleware } from '../../lib/middleware/auth';
import { ProjectRepo, ProjectImageRepo, StylingVersionRepo } from '../../lib/db/repository';

interface CreateVersionRequest {
  name: string;
  description?: string;
  isDefault?: boolean;
}

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
  const body = event.body as unknown as CreateVersionRequest;

  // Validate request
  if (!body.name || !body.name.trim()) {
    throw Errors.badRequest('Version name is required');
  }

  // Verify project exists
  const project = await ProjectRepo.getById(organizationId, projectId);
  if (!project) {
    throw Errors.notFound('Project', projectId);
  }

  // Verify image exists
  const image = await ProjectImageRepo.getById(projectId, imageId);
  if (!image) {
    throw Errors.notFound('Image', imageId);
  }

  // Get existing versions to determine version number
  const existingVersions = await StylingVersionRepo.listByImage(imageId);
  const versionNumber = existingVersions.length + 1;

  // Create version
  const version = await StylingVersionRepo.create({
    imageId,
    projectId,
    organizationId,
    versionNumber,
    name: body.name.trim(),
    description: body.description?.trim(),
    renderStatus: 'PENDING',
    createdBy: userId,
    isDefault: body.isDefault || existingVersions.length === 0,
    materialIds: [],
  });

  // Update project version count
  await ProjectRepo.update(organizationId, projectId, {
    versionCount: project.versionCount + 1,
  });

  return created(version);
};

export const main = createHandler(handler).use(authMiddleware({ requiredRoles: ['Owner', 'Editor'] }));
