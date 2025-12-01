/**
 * Delete Project Lambda
 * Soft delete - changes status to ARCHIVED
 */

import type { APIGatewayProxyResult, Context } from 'aws-lambda';

import { createHandler, ExtendedAPIGatewayProxyEvent } from '../../lib/utils/handler';
import { noContent, getPathParam } from '../../lib/utils/response';
import { Errors } from '../../lib/utils/errors';
import { authMiddleware } from '../../lib/middleware/auth';
import { ProjectRepo } from '../../lib/db/repository';

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

  // Verify project exists
  const existingProject = await ProjectRepo.getById(organizationId, projectId);
  if (!existingProject) {
    throw Errors.notFound('Project', projectId);
  }

  // Soft delete by archiving
  await ProjectRepo.update(organizationId, projectId, {
    status: 'ARCHIVED',
    lastModifiedBy: userId,
  });

  return noContent();
};

export const main = createHandler(handler).use(authMiddleware({ requiredRoles: ['Owner'] }));
