/**
 * State barrel (Tổng hợp state)
 *
 * Export repositories and shared stores from a single module so all imports
 * use the same ESM specifier and therefore the same module instance.
 */

export { AttemptRepository } from './attempt.repository';
export type { Attempt } from './attempt.repository';

export { attemptStore, getAttemptStore, getAttemptStoreInstanceId, getAttemptStoreSize } from './attempt.store';

export { SubmissionRepository } from './submission.repository';

