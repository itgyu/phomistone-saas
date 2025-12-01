/**
 * Update Project Lambda
 */

import type { APIGatewayProxyResult, Context } from 'aws-lambda';

import { createHandler, ExtendedAPIGatewayProxyEvent } from '../../lib/utils/handler';
import { success, getPathParam } from '../../lib/utils/response';
import { Errors } from '../../lib/utils/errors';
import { authMiddleware } from '../../lib/middleware/auth';
import { ProjectRepo } from '../../lib/db/repository';
import type { UpdateProjectRequest } from '../../types';

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
  const body = event.body as unknown as UpdateProjectRequest;

  // Verify project exists
  const existingProject = await ProjectRepo.getById(organizationId, projectId);
  if (!existingProject) {
    throw Errors.notFound('Project', projectId);
  }

  // Build update object
  const updates: Partial<typeof existingProject> = {
    lastModifiedBy: userId,
  };

  if (body.name !== undefined) {
    if (!body.name.trim()) {
      throw Errors.badRequest('Project name cannot be empty');
    }
    updates.name = body.name.trim();
  }

  if (body.description !== undefined) {
    updates.description = body.description?.trim();
  }

  if (body.clientName !== undefined) {
    if (!body.clientName.trim()) {
      throw Errors.badRequest('Client name cannot be empty');
    }
    updates.clientName = body.clientName.trim();
  }

  if (body.clientContact !== undefined) {
    updates.clientContact = body.clientContact?.trim();
  }

  if (body.status !== undefined) {
    const validStatuses = ['DRAFT', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'ARCHIVED'];
    if (!validStatuses.includes(body.status)) {
      throw Errors.badRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    updates.status = body.status;
  }

  if (body.dueDate !== undefined) {
    updates.dueDate = body.dueDate;
  }

  if (body.tags !== undefined) {
    updates.tags = body.tags;
  }

  const updatedProject = await ProjectRepo.update(organizationId, projectId, updates);

  return success(updatedProject);
};

export const main = createHandler(handler).use(authMiddleware({ requiredRoles: ['Owner', 'Editor'] }));
