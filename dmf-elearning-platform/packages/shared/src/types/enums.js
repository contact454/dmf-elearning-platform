/**
 * Enums (Liệt kê)
 *
 * These enums are defined based on frozen architecture docs.
 * Do not add new values without architecture approval.
 */
/**
 * User roles (Vai trò người dùng)
 * From STEP 8B (authz-matrix.md)
 */
export var UserRole;
(function (UserRole) {
    UserRole["LEARNER"] = "learner";
    UserRole["TEACHER"] = "teacher";
    UserRole["MENTOR"] = "mentor";
    UserRole["ADMIN"] = "admin";
    UserRole["SYSTEM"] = "system";
})(UserRole || (UserRole = {}));
/**
 * Skill types (Loại kỹ năng)
 * From frozen docs (referenced in read-model-inventory.md)
 */
export var SkillType;
(function (SkillType) {
    SkillType["GRAMMAR"] = "grammar";
    SkillType["VOCABULARY"] = "vocabulary";
    SkillType["SPEAKING"] = "speaking";
    SkillType["LISTENING"] = "listening";
    SkillType["READING"] = "reading";
    SkillType["WRITING"] = "writing";
})(SkillType || (SkillType = {}));
/**
 * Attempt status (Trạng thái nỗ lực)
 * From state-models.md
 */
export var AttemptStatus;
(function (AttemptStatus) {
    AttemptStatus["IN_PROGRESS"] = "in-progress";
    AttemptStatus["COMPLETED"] = "completed";
    AttemptStatus["ABANDONED"] = "abandoned";
})(AttemptStatus || (AttemptStatus = {}));
/**
 * Submission type (Loại nộp bài)
 * From state-models.md
 */
export var SubmissionType;
(function (SubmissionType) {
    SubmissionType["QUIZ"] = "quiz";
    SubmissionType["LISTENING"] = "listening";
    SubmissionType["SPEAKING"] = "speaking";
    SubmissionType["WRITING"] = "writing";
})(SubmissionType || (SubmissionType = {}));
/**
 * Assessment status (Trạng thái đánh giá)
 * From state-models.md
 */
export var AssessmentStatus;
(function (AssessmentStatus) {
    AssessmentStatus["IN_PROGRESS"] = "in-progress";
    AssessmentStatus["GRADED"] = "graded";
})(AssessmentStatus || (AssessmentStatus = {}));
/**
 * Feedback request status (Trạng thái yêu cầu phản hồi)
 * From state-models.md
 */
export var FeedbackRequestStatus;
(function (FeedbackRequestStatus) {
    FeedbackRequestStatus["PENDING"] = "pending";
    FeedbackRequestStatus["PROCESSING"] = "processing";
    FeedbackRequestStatus["COMPLETED"] = "completed";
})(FeedbackRequestStatus || (FeedbackRequestStatus = {}));
/**
 * Feedback author role (Vai trò tác giả phản hồi)
 * From command-contracts.md
 */
export var FeedbackAuthorRole;
(function (FeedbackAuthorRole) {
    FeedbackAuthorRole["TEACHER"] = "teacher";
    FeedbackAuthorRole["MENTOR"] = "mentor";
    FeedbackAuthorRole["AI"] = "ai";
})(FeedbackAuthorRole || (FeedbackAuthorRole = {}));
/**
 * CEFR Levels (Trình độ CEFR)
 */
export var CEFRLevel;
(function (CEFRLevel) {
    CEFRLevel["A1"] = "A1";
    CEFRLevel["A2"] = "A2";
    CEFRLevel["B1"] = "B1";
    CEFRLevel["B2"] = "B2";
    CEFRLevel["C1"] = "C1";
    CEFRLevel["C2"] = "C2";
})(CEFRLevel || (CEFRLevel = {}));
/**
 * Language codes (Mã ngôn ngữ)
 */
export var LanguageCode;
(function (LanguageCode) {
    LanguageCode["DE"] = "de";
    LanguageCode["EN"] = "en";
    LanguageCode["VI"] = "vi";
})(LanguageCode || (LanguageCode = {}));
//# sourceMappingURL=enums.js.map