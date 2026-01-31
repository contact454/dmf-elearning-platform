/**
 * Default Evidence Policies (Chính sách Bằng chứng Mặc định)
 * 
 * DRAFT policies - loaded from registry, not hardcoded.
 */

import type { EvidencePolicy } from '../enforcement/enforcement.types.js';

/**
 * Default policies for evidence enforcement
 */
export const DEFAULT_POLICIES: EvidencePolicy[] = [
  {
    id: 'lesson_start',
    scope: 'lesson',
    action: 'start',
    requiredEvidence: [
      {
        type: 'attendance',
        minCount: 1,
      },
    ],
    description: 'Lesson start requires attendance evidence',
  },
  {
    id: 'lesson_complete',
    scope: 'lesson',
    action: 'complete',
    requiredEvidence: [
      {
        type: 'attendance',
        minCount: 1,
      },
      {
        type: 'activity_submission',
        minCount: 1,
      },
    ],
    description: 'Lesson completion requires attendance and activity submission',
  },
  {
    id: 'b1_speaking',
    scope: 'lesson',
    action: 'complete',
    requiredEvidence: [
      {
        type: 'speaking',
        minCount: 1,
      },
      {
        type: 'teacher_validation',
        minCount: 1,
      },
    ],
    description: 'B1+ speaking level requires speaking evidence and teacher validation',
    gracePeriodDays: 7, // Grace period for B1+ validation
  },
];
