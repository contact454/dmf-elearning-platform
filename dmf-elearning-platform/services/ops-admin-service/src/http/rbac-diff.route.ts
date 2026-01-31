/**
 * RBAC Diff Route
 * 
 * GET /api/ops/rbac/diff?from=teacher&to=mentor
 */

import type { FastifyInstance } from 'fastify';
import type { Logger } from '@dmf/infra';
import { diffRoles, getAllRoles, getRole } from '@dmf/ops-admin';
import { StandardError, getHttpStatusCode } from '@dmf/shared';

export function registerRbacDiffRoute(app: FastifyInstance, deps: { logger: Logger }) {
  app.get('/api/ops/rbac/diff', async (request, reply) => {
    const fromRole = (request.query as any).from as string;
    const toRole = (request.query as any).to as string;

    if (!fromRole || !toRole) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          category: 'ClientError',
          message: 'from and to query parameters are required',
        },
      });
    }

    try {
      // Validate roles exist
      const allRoles = getAllRoles();
      if (!allRoles.includes(fromRole as any) || !allRoles.includes(toRole as any)) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            category: 'ClientError',
            message: `Invalid role. Valid roles: ${allRoles.join(', ')}`,
          },
        });
      }

      const diff = diffRoles(fromRole as any, toRole as any);
      const fromRoleDef = getRole(fromRole as any);
      const toRoleDef = getRole(toRole as any);

      return reply.code(200).send({
        from: {
          role: fromRoleDef.id,
          name: fromRoleDef.name,
          permissions: fromRoleDef.permissions,
        },
        to: {
          role: toRoleDef.id,
          name: toRoleDef.name,
          permissions: toRoleDef.permissions,
        },
        diff: {
          added: diff.added,
          removed: diff.removed,
          unchanged: diff.unchanged,
        },
      });
    } catch (error: any) {
      deps.logger.error('RBAC diff query failed', error);

      const standardError: StandardError | undefined = error.standardError;
      if (standardError) {
        const statusCode = getHttpStatusCode(standardError);
        return reply.code(statusCode).send({ error: standardError });
      }

      return reply.code(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          category: 'TransientFailure',
          message: error.message || 'Internal server error',
        },
      });
    }
  });
}
