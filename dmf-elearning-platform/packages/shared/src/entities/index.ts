import {
    UserId,
    EnrollmentId,
    CourseId,
    UnitId,
    LessonId,
    ActivityId,
    AttemptId,
    SubmissionId,
    AssessmentId,
    FeedbackId,
    MentorId,
    SRSItemId,
} from '../ids';
import {
    UserRole,
    LanguageCode,
    CEFRLevel,
    SkillType,
    AttemptStatus,
    EnrollmentStatus,
    AssessmentType,
    AssessmentStatus,
    ActivityType,
    FeedbackAuthor,
} from '../enums';

export interface User {
    id: UserId;
    email: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
    createdAt: string; // ISO 8601
}

export interface LearnerProfile {
    userId: UserId;
    targetLanguage: LanguageCode;
    cefrLevel: CEFRLevel;
    goals?: string[];
}

export interface Enrollment {
    id: EnrollmentId;
    userId: UserId;
    courseId: CourseId;
    status: EnrollmentStatus;
    currentUnit?: UnitId;
}

export interface Course {
    id: CourseId;
    title: string;
    level: CEFRLevel;
    language: LanguageCode;
    unitIds?: UnitId[];
}

export interface Unit {
    id: UnitId;
    courseId?: CourseId;
    title: string;
    order: number;
    lessonIds?: LessonId[];
}

export interface Lesson {
    id: LessonId;
    unitId?: UnitId;
    title: string;
    type: 'lecture' | 'practice' | 'quiz';
    contentReference?: string;
}

export interface Activity {
    id: ActivityId;
    lessonId?: LessonId;
    type: ActivityType;
    prompt: string;
    mediaUrl?: string;
}

export interface Attempt {
    id: AttemptId;
    userId: UserId;
    lessonId: LessonId;
    status: AttemptStatus;
    score?: number; // 0-100
    startedAt: string; // ISO 8601
    completedAt?: string; // ISO 8601
}

export interface Submission {
    id: SubmissionId;
    attemptId: AttemptId;
    activityId: ActivityId;
    answer: any; // Context specific payload
    isCorrect?: boolean;
    timestamp?: string; // ISO 8601
}

export interface SkillScore {
    userId: UserId;
    skill: SkillType;
    scoreVal: number; // 0.0 to 1.0
    updatedAt: string; // ISO 8601
}

export interface SRSItem {
    id: SRSItemId;
    userId: UserId;
    itemId: string; // Refers to Vocab/Grammar
    interval?: number; // Days
    easeFactor?: number;
    nextReview: string; // ISO 8601
}

export interface RubricScore {
    criteria: string;
    score: number;
    maxScore: number;
    comment?: string;
}

export interface Assessment {
    id: AssessmentId;
    userId: UserId;
    type: AssessmentType;
    status: AssessmentStatus;
    finalGrade?: number;
    rubricScores?: RubricScore[];
}

export interface ReadinessResult {
    userId: UserId;
    currentLevel: string; // CEFR level as string
    isReadyForNext: boolean;
    blockers?: string[];
}

export interface Feedback {
    id: FeedbackId;
    submissionId: SubmissionId;
    author?: FeedbackAuthor;
    text: string;
    corrections?: string[];
}

export interface MentoringReport {
    id: string;
    userId: UserId;
    mentorId: MentorId;
    period: string;
    summary?: string;
    actionItems?: string[];
}
