# Data & Contracts

This document defines the high-level data model, source of truth rules, and event strategies.

## 1. Core Data Entities

| Entity | Description | Owner Module |
| :--- | :--- | :--- |
| **User** | Identity, Profile, Settings | `services/onboarding` |
| **Enrollment** | Association between User and Course (Language Level) | `services/onboarding` |
| **Course** | Hierarchy Root (e.g., German B1) | `data/content` (read-only) |
| **Unit/Lesson** | Structural components of a course | `data/content` (read-only) |
| **Attempt** | A single user session on a Lesson | `services/practice` |
| **Submission** | Raw answers provided in an attempt | `services/practice` |
| **SkillScore** | Granular proficiency (grammar, vocab, speech) | `services/assessment` |
| **SRS** | Spaced Repetition State (cards due, intervals) | `services/curriculum` |
| **Feedback** | Textual or structured critique of a submission | `services/mentoring` |
| **Assessment** | A formal test event | `services/assessment` |
| **Readiness** | Computed state of "Are they ready for next level?" | `education/readiness` |

## 2. Relationships (ERD Text View)

*   **User** has many **Enrollments**
*   **Enrollment** tracks **Progress** (Units unlocked)
*   **User** has many **Attempts**
*   **Attempt** belongs to a **Lesson**
*   **Attempt** has many **Submissions**
*   **Submission** has one **Feedback**
*   **User** has one **SRS State** per Language
*   **Assessment** aggregates **SkillScores**

## 3. Source of Truth Rules

### Static Content (`data/content`)
*   **Course Structure**: The file system in `data/content` is the MASTER.
*   **Database**: Runtime DB only stores references (IDs/slugs) to content. It does NOT copy lesson text.

### Runtime Data (`services/*`)
*   **Progress**: `services/curriculum` owns the "Unlock Graph".
*   **Performance**: `services/assessment` owns the scores.
*   **Identity**: `services/onboarding` owns the User Profile.

### Education & AI Rules
*   **Education (`education/*`)**: OWNS the rules (Rubrics, Readiness Logic). Does NOT own persistent data storage (stateless logic).
*   **AI (`ai/*`)**: Reads data to generate *suggestions*.
    *   *Example*: AI suggests a grade (Suggestion), but `services/assessment` persists the final grade (Decision).

## 4. Event Strategy

We use Domain Events to decouple services.

| Event Name | Trigger | Payload Info |
| :--- | :--- | :--- |
| `learning.lesson.completed` | User finishes a practice session | `lessonId`, `score`, `duration` |
| `learning.assessment.submitted` | User submits a quiz | `assessmentId`, `answers[]` |
| `education.mastery.updated` | CEFR Engine recalculates skill | `skill`, `newLevel` (0.0-1.0) |
| `mentoring.feedback.generated` | AI/Mentor provides feedback | `submissionId`, `text` |
| `system.user.registered` | New signup | `userId`, `language` |

## 5. Non-Goals (Out of Scope for V1)
*   **Payments**: No payment processing data model yet.
*   **Social**: No friending, leaderboards, or chat.
*   **Live Classrooms**: No real-time video session modeling.
