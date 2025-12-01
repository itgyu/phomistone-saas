/**
 * Create Project Lambda
 */

import type { APIGatewayProxyResult, Context } from 'aws-lambda';

import { createHandler, ExtendedAPIGatewayProxyEvent } from '../../lib/utils/handler';
import { created } from '../../lib/utils/response';
import { Errors } from '../../lib/utils/errors';
import { authMiddleware } from '../../lib/middleware/auth';
import { ProjectRepo, OrganizationRepo } from '../../lib/db/repository';
import type { CreateProjectRequest } from '../../types';

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
  const body = event.body as unknown as CreateProjectRequest;

  // Validate request body
  if (!body.name || body.name.trim().length === 0) {
    throw Errors.badRequest('Project name is required');
  }

  if (!body.clientName || body.clientName.trim().length === 0) {
    throw Errors.badRequest('Client name is required');
  }

  // Check organization quota
  const org = await OrganizationRepo.getById(organizationId);
  if (!org) {
    throw Errors.notFound('Organization', organizationId);
  }

  // Get current project count
  const { count } = await ProjectRepo.listByOrganization(organizationId, 1);
  if (count >= org.maxProjects) {
    throw Errors.quotaExceeded('Project limit');
  }

  // Create project
  const project = await ProjectRepo.create({
    organizationId,
    name: body.name.trim(),
    description: body.description?.trim(),
    clientName: body.clientName.trim(),
    clientContact: body.clientContact?.trim(),
    status: 'DRAFT',
    imageCount: 0,
    versionCount: 0,
    createdBy: userId,
    lastModifiedBy: userId,
    dueDate: body.dueDate,
    tags: body.tags || [],
  });

  return created(project);
};

export const main = createHandler(handler).use(authMiddleware({ requiredRoles: ['Owner', 'Editor'] }));
