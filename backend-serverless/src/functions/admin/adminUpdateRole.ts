/**
 * Admin Update Role Lambda
 * Owner-only endpoint to update user roles
 */

import type { APIGatewayProxyResult, Context } from 'aws-lambda';

import { createHandler, ExtendedAPIGatewayProxyEvent } from '../../lib/utils/handler';
import { success, getPathParam } from '../../lib/utils/response';
import { Errors } from '../../lib/utils/errors';
import { authMiddleware } from '../../lib/middleware/auth';
import { UserRepo } from '../../lib/db/repository';
import type { UserRole } from '../../types';

interface UpdateRoleRequest {
  role: UserRole;
}

interface AuthenticatedEvent extends ExtendedAPIGatewayProxyEvent {
  auth: {
    userId: string;
    email: string;
    organizationId: string;
    role: 'Owner' | 'Editor' | 'Viewer';
  };
}

const handler = async (
  event: AuthenticatedEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const { organizationId, role: currentUserRole, email: currentUserEmail } = event.auth;
  const targetEmail = getPathParam(event.pathParameters, 'email');
  const body = event.body as unknown as UpdateRoleRequest;

  // Only Owner can update roles
  if (currentUserRole !== 'Owner') {
    throw Errors.forbidden('Only organization owners can update user roles');
  }

  // Validate new role
  const validRoles: UserRole[] = ['Owner', 'Editor', 'Viewer'];
  if (!validRoles.includes(body.role)) {
    throw Errors.badRequest(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
  }

  // Prevent self-demotion of last Owner
  if (targetEmail === currentUserEmail && body.role !== 'Owner') {
    // Check if there are other owners
    const allUsers = await UserRepo.listByOrganization(organizationId);
    const owners = allUsers.filter(u => u.role === 'Owner');

    if (owners.length === 1) {
      throw Errors.badRequest('Cannot demote the last owner. Transfer ownership first.');
    }
  }

  // Get target user
  const targetUser = await UserRepo.getByEmail(organizationId, targetEmail);
  if (!targetUser) {
    throw Errors.notFound('User', targetEmail);
  }

  // Update the user's role using UpdateCommand
  const { UpdateCommand } = await import('@aws-sdk/lib-dynamodb');
  const { docClient, TABLE_NAME } = await import('../../lib/db/client');
  const { UserKeys } = await import('../../lib/db/keys');

  await docClient.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: UserKeys.pk(organizationId),
      SK: UserKeys.sk(targetEmail),
    },
    UpdateExpression: 'SET #role = :role, updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#role': 'role',
    },
    ExpressionAttributeValues: {
      ':role': body.role,
      ':updatedAt': new Date().toISOString(),
    },
  }));

  return success({
    message: `User role updated successfully`,
    user: {
      email: targetEmail,
      previousRole: targetUser.role,
      newRole: body.role,
    },
  });
};

export const main = createHandler(handler).use(authMiddleware({ requiredRoles: ['Owner'] }));
