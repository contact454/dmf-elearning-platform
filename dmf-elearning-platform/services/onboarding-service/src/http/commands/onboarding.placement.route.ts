/**
 * HTTP route: POST /api/onboarding/placement
 * Validates against existing onboarding JSON schema and emits placement event.
 */

import type { FastifyInstance } from 'fastify';
import Ajv from 'ajv';
import type { EventBus, Logger, AuditLogger, Database, IdempotencyStore, Outbox } from '@dmf/infra';
import { getHttpStatusCode, makeValidationError, type StandardError } from '@dmf/shared';
import { UserRepository } from '../../state/user.repository';
import {
  handleOnboardingPlacementSubmit,
  type SubmitPlacementTestCommand,
} from '../../application/onboarding.placement.submit.handler';
import inputSchema from '../../../../../contracts/commands/onboarding/submitPlacementTest.input.schema.json' assert { type: 'json' };

const ajv = new Ajv({ allErrors: true, strict: false });
const validatePlacementInput = ajv.compile(inputSchema);

export function registerOnboardingPlacementRoute(
  app: FastifyInstance,
  deps: {
    eventBus: EventBus;
    database: Database;
    logger: Logger;
    auditLogger: AuditLogger;
    idempotencyStore: IdempotencyStore;
    outbox: Outbox;
  }
): void {
  app.post('/api/onboarding/placement', async (request, reply) => {
    const requestId = `req-${Date.now()}`;

    try {
      const input = request.body as SubmitPlacementTestCommand;
      const valid = validatePlacementInput(input);
      if (!valid) {
        const validationError = makeValidationError({
          issues: validatePlacementInput.errors ?? [],
        });
        return reply.code(400).send({ error: validationError });
      }

      const userRepository = new UserRepository(deps.database);
      const result = await handleOnboardingPlacementSubmit(input, {
        userRepository,
        eventBus: deps.eventBus,
        idempotencyStore: deps.idempotencyStore,
        outbox: deps.outbox,
      });

      deps.auditLogger.logCommandReceived(
        'assessment.placement.take',
        input.userId,
        requestId,
        input.correlationId
      );

      return reply.code(201).send(result);
    } catch (error) {
      deps.logger.error('Placement submit failed', error as Error);
      const se = (error as { standardError?: StandardError }).standardError;
      if (se) {
        return reply.code(getHttpStatusCode(se)).send({ error: se });
      }
      return reply.code(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          category: 'TransientFailure',
          message: (error as Error).message || 'Internal server error',
        },
      });
    }
  });
}
