/**
 * Command and Event Registries (Đăng ký Lệnh và Sự kiện)
 *
 * These registries enforce contract-first approach.
 * Any command/event not in registry will cause build error.
 */
// Import all command schemas
import { learningLessonStartSchema, learningLessonCompleteSchema, learningLessonAbandonSchema, learningActivitySubmitSchema, } from './commands/learning.js';
import { assessmentQuizStartSchema, assessmentQuizSubmitSchema, assessmentPlacementTakeSchema, } from './commands/assessment.js';
import { mentoringFeedbackRequestSchema, mentoringFeedbackPublishSchema, } from './commands/mentoring.js';
import { curriculumCourseEnrollSchema, curriculumUnitAccessSchema, } from './commands/curriculum.js';
import { systemUserRegisterSchema, systemUserLoginSchema, systemProfileModifySchema, systemSrsScheduleSchema, } from './commands/system.js';
import { evidenceReviewClaimSchema, evidenceReviewApproveSchema, evidenceReviewRejectSchema, } from './commands/evidence.js';
import { policyHardGateSetSchema, policyHardGateBulkSetSchema, } from './commands/policy.js';
// Import all event schemas
import { learningLessonStartedSchema, learningLessonCompletedSchema, learningLessonAbandonedSchema, learningSubmissionCreatedSchema, } from './events/learning.js';
import { assessmentQuizStartedSchema, assessmentQuizSubmittedSchema, assessmentLevelTestCompletedSchema, } from './events/assessment.js';
import { mentoringFeedbackRequestedSchema, mentoringFeedbackPublishedSchema, } from './events/mentoring.js';
import { curriculumCourseEnrolledSchema, curriculumUnitUnlockedSchema, curriculumSrsItemsDueSchema, } from './events/curriculum.js';
import { systemUserRegisteredSchema, systemUserLoginSchema as systemUserLoginEventSchema, systemProfileUpdatedSchema, } from './events/system.js';
import { opsPolicyCreatedSchema, opsPolicyActivatedSchema, opsResourceRolledBackSchema, opsRbacDiffViewedSchema, policyHardGateUpdatedSchema, opsOverloadDetectedSchema, opsDegradeActivatedSchema, opsDegradeDeactivatedSchema, } from './events/ops.js';
import { evidenceCreatedSchema, evidenceValidatedSchema, evidenceRevokedSchema, evidenceSoftGateTriggeredSchema, evidenceHardGateBlockedSchema, evidencePolicyViolationDetectedSchema, evidenceReviewApprovedSchema, evidenceReviewRejectedSchema, evidenceReviewExpiredSchema, evidenceReviewEscalatedSchema, } from './events/evidence.js';
/**
 * Command Registry (Đăng ký Lệnh)
 *
 * Maps command names to Zod schemas for validation.
 * Build will fail if command not in registry.
 */
export const commandRegistry = {
    // Learning commands
    'learning.lesson.start': learningLessonStartSchema,
    'learning.lesson.complete': learningLessonCompleteSchema,
    'learning.lesson.abandon': learningLessonAbandonSchema,
    'learning.activity.submit': learningActivitySubmitSchema,
    // Assessment commands
    'assessment.quiz.start': assessmentQuizStartSchema,
    'assessment.quiz.submit': assessmentQuizSubmitSchema,
    'assessment.placement.take': assessmentPlacementTakeSchema,
    // Mentoring commands
    'mentoring.feedback.request': mentoringFeedbackRequestSchema,
    'mentoring.feedback.publish': mentoringFeedbackPublishSchema,
    // Curriculum commands
    'curriculum.course.enroll': curriculumCourseEnrollSchema,
    'curriculum.unit.access': curriculumUnitAccessSchema,
    // System commands
    'system.user.register': systemUserRegisterSchema,
    'system.user.login': systemUserLoginSchema,
    'system.profile.modify': systemProfileModifySchema,
    'system.srs.schedule': systemSrsScheduleSchema,
    // Evidence commands
    'evidence.review.claim': evidenceReviewClaimSchema,
    'evidence.review.approve': evidenceReviewApproveSchema,
    'evidence.review.reject': evidenceReviewRejectSchema,
    // Policy commands
    'policy.hard_gate.set': policyHardGateSetSchema,
    'policy.hard_gate.bulk_set': policyHardGateBulkSetSchema,
};
/**
 * Event Registry (Đăng ký Sự kiện)
 *
 * Maps event names to Zod schemas for validation.
 * Build will fail if event not in registry.
 */
export const eventRegistry = {
    // Learning events
    'learning.lesson.started': learningLessonStartedSchema,
    'learning.lesson.completed': learningLessonCompletedSchema,
    'learning.lesson.abandoned': learningLessonAbandonedSchema,
    'learning.submission.created': learningSubmissionCreatedSchema,
    // Assessment events
    'assessment.quiz.started': assessmentQuizStartedSchema,
    'assessment.quiz.submitted': assessmentQuizSubmittedSchema,
    'assessment.level_test.completed': assessmentLevelTestCompletedSchema,
    // Mentoring events
    'mentoring.feedback.requested': mentoringFeedbackRequestedSchema,
    'mentoring.feedback.published': mentoringFeedbackPublishedSchema,
    // Curriculum events
    'curriculum.course.enrolled': curriculumCourseEnrolledSchema,
    'curriculum.unit.unlocked': curriculumUnitUnlockedSchema,
    'curriculum.srs_items.due': curriculumSrsItemsDueSchema,
    // System events
    'system.user.registered': systemUserRegisteredSchema,
    'system.user.login': systemUserLoginEventSchema,
    'system.profile.updated': systemProfileUpdatedSchema,
    // Ops events
    'ops.policy.created': opsPolicyCreatedSchema,
    'ops.policy.activated': opsPolicyActivatedSchema,
    'ops.resource.rolled_back': opsResourceRolledBackSchema,
    'ops.rbac.diff.viewed': opsRbacDiffViewedSchema,
    'policy.hard_gate.updated': policyHardGateUpdatedSchema,
    'ops.overload.detected': opsOverloadDetectedSchema,
    'ops.degrade.activated': opsDegradeActivatedSchema,
    'ops.degrade.deactivated': opsDegradeDeactivatedSchema,
    // Evidence events
    'evidence.created': evidenceCreatedSchema,
    'evidence.validated': evidenceValidatedSchema,
    'evidence.revoked': evidenceRevokedSchema,
    'evidence.soft_gate_triggered': evidenceSoftGateTriggeredSchema,
    'evidence.hard_gate_blocked': evidenceHardGateBlockedSchema,
    'evidence.policy_violation_detected': evidencePolicyViolationDetectedSchema,
    'evidence.review.approved': evidenceReviewApprovedSchema,
    'evidence.review.rejected': evidenceReviewRejectedSchema,
    'evidence.review.expired': evidenceReviewExpiredSchema,
    'evidence.review.escalated': evidenceReviewEscalatedSchema,
};
//# sourceMappingURL=registries.js.map