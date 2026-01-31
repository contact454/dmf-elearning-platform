# UX Flow: German A1 Learner Journey

This document defines the end-to-end experience for a Learner starting their German A1 journey on the DMF platform.

## 1. First Login & Setup
*   **User Goal**: Access the platform and establish an identity.
*   **System Response**: Welcome user, initialize profile, and offer placement assessment.
*   **Data Read**: System config (default language levels).
*   **Data Written**: `User`, `LearnerProfile` (initial state).
*   **Services Involved**: `services/onboarding`.

## 2. Placement / Initial Assessment
*   **User Goal**: Determine starting point to avoid redundant content.
*   **System Response**: Present a short adaptive test (Vocabulary & Grammar).
*   **Data Read**: `data/content/de/_meta/tagging.rules.md` (for selection), `Assessment` schema.
*   **Data Written**: `Assessment` (Placement type), `Submission` (raw answers).
*   **Services Involved**: `services/onboarding`, `services/assessment`.

## 3. First Lesson Discovery
*   **User Goal**: Start learning active content.
*   **System Response**: Based on assessment, show the first recommended unit/lesson.
*   **Data Read**: `Enrollment`, `Course`, `Unit`, `Lesson` (static structure).
*   **Data Written**: `Attempt` (status: `started`).
*   **Services Involved**: `services/curriculum`, `services/practice`.

## 4. Practice Session (The "Loop")
Inside a single Lesson Attempt:

| Phase | User Goal | System Response | Service |
| :--- | :--- | :--- | :--- |
| **Vocab** | Learn new words | Present flashcards/word-match | `services/practice` |
| **Listening** | Hear natural speech | Play audio, ask for comprehension check | `services/practice` |
| **Speaking** | Produce language | Record user audio | `services/practice` |

*   **Data Read**: `Activity` (content definitions).
*   **Data Written**: `Submission` (for each activity).
*   **AI Integration**: `ai/speech-analysis` (async transcription/scoring).

## 5. Feedback & Correction
*   **User Goal**: Understand mistakes and improve.
*   **System Response**: Display structural feedback and rubric scores.
*   **Data Read**: `education/rubric` (rules).
*   **Data Written**: `Feedback`, `RubricScore`.
*   **Services Involved**: `services/assessment`, `services/mentoring`.

## 6. Progress & Next Action
*   **User Goal**: See growth and know where to go next.
*   **System Response**: Show updated mastery bar and unlock next lesson.
*   **Data Read**: `SkillScore` (aggregated).
*   **Data Written**: `Enrollment` (updated `currentUnit`), `SRS` (updated intervals).
*   **Services Involved**: `services/curriculum`.

---

## Technical Summary of Flow
1.  `Onboarding` -> `Assessment`
2.  `Assessment` + `Education/Readiness` -> `Enrollment`
3.  `Enrollment` -> `Curriculum`
4.  `Curriculum` -> `Practice` -> `AI Analysis` -> `Success Event`
5.  `Success Event` -> `Curriculum (Unlock next)`
