# STEP 4.3 — Command → Handler → Event Flow (MVP)
## Luồng Lệnh → Xử lý → Sự kiện

This document defines how each command is handled by its service and which domain events are emitted after successful handling. This step answers: "When a command is received, which service handles it, what does it check, and which domain event(s) does it emit?"

---

## Learning / Practice Domain Commands

--------------------------------------------------
### Command: learning.lesson.start

**Handled by**: `practice-service`

**Handler Responsibility**:
- Creates a new Attempt entity for tracking the lesson session
- Validates that the user can start this lesson (unlock eligibility)
- Decides success (attempt created) or rejection (validation failed)
- Does NOT compute scores, mastery, or progress (these are outcomes, not intent)

**Preconditions (Checked synchronously)**:
- User exists (read from onboarding-service)
- Lesson exists (read from curriculum-service)
- Lesson is unlocked for user (query progress-service for ProgressState, then curriculum-service for unlock rules)
- No active attempt exists for this lesson (or allow resume of existing attempt)
- If `correlationId` provided, check for existing attempt with same correlationId (idempotency)

**Processing Steps (High level)**:
1. Validate user exists (read-only query to onboarding-service)
2. Validate lesson exists (read-only query to curriculum-service)
3. Check unlock eligibility (read ProgressState from progress-service, query unlock rules from curriculum-service)
4. Check for existing active attempt (or existing attempt with correlationId)
5. Create Attempt entity with status 'in-progress'
6. Emit `learning.lesson.started` event

**Emitted Events**:
- `learning.lesson.started` (past tense)
- Emitted immediately after Attempt entity is created
- Key payload fields: `attemptId`, `userId`, `lessonId`

**Notes**:
- If `correlationId` provided and attempt already exists, return existing attempt (idempotent)
- Unlock eligibility check is read-only (queries foreign services, does not mutate their state)
- Attempt creation is synchronous (state mutation happens before event emission)
- Event is emitted only after successful Attempt creation

--------------------------------------------------
### Command: learning.lesson.complete

**Handled by**: `practice-service`

**Handler Responsibility**:
- Updates Attempt entity status to 'completed' or 'abandoned'
- Validates that the attempt exists and is in progress
- Decides success (attempt updated) or rejection (validation failed)
- Does NOT compute lesson score (score is computed by service logic, not in command)
- Does NOT update MasteryState or ProgressState (these are updated via event reactions)

**Preconditions (Checked synchronously)**:
- Attempt exists
- Attempt is in 'in-progress' status
- Attempt belongs to authenticated user (authorization check)
- If `correlationId` provided, check idempotency

**Processing Steps (High level)**:
1. Validate attempt exists and is in 'in-progress' status
2. Validate attempt ownership (authorization check)
3. Compute lesson score (if status is 'completed', based on submissions)
4. Update Attempt entity: set status to 'completed' or 'abandoned', set score if completed
5. Emit `learning.lesson.completed` event (if status is 'completed') OR `learning.lesson.abandoned` event (if status is 'abandoned')

**Emitted Events**:
- `learning.lesson.completed` (past tense) - if status is 'completed'
- `learning.lesson.abandoned` (past tense) - if status is 'abandoned'
- Emitted immediately after Attempt entity is updated
- Key payload fields: `attemptId`, `userId`, `lessonId`, `score` (if completed)

**Notes**:
- Score is computed by service (not provided in command payload)
- Command is idempotent: completing an already-completed attempt returns success
- Event type depends on status field ('completed' vs 'abandoned')
- MasteryState and ProgressState updates happen via event reactions (not directly in handler)

--------------------------------------------------
### Command: learning.lesson.abandon

**Handled by**: `practice-service`

**Handler Responsibility**:
- Updates Attempt entity status to 'abandoned'
- Validates that the attempt exists and is in progress
- Decides success (attempt updated) or rejection (validation failed)
- Does NOT update MasteryState or ProgressState (abandoned attempts do not affect progress)

**Preconditions (Checked synchronously)**:
- Attempt exists
- Attempt is in 'in-progress' status
- Attempt belongs to authenticated user (authorization check)

**Processing Steps (High level)**:
1. Validate attempt exists and is in 'in-progress' status
2. Validate attempt ownership (authorization check)
3. Update Attempt entity: set status to 'abandoned'
4. Emit `learning.lesson.abandoned` event

**Emitted Events**:
- `learning.lesson.abandoned` (past tense)
- Emitted immediately after Attempt entity is updated
- Key payload fields: `attemptId`, `userId`, `lessonId`

**Notes**:
- Semantically equivalent to `learning.lesson.complete` with `status: 'abandoned'`, but provided as separate command for clarity
- Command is idempotent: abandoning an already-abandoned attempt returns success
- Abandoned attempts do not trigger progress or mastery updates (no score computed)

--------------------------------------------------
### Command: learning.activity.submit

**Handled by**: `practice-service`

**Handler Responsibility**:
- Creates a new Submission entity for the activity answer
- Validates that the attempt exists and activity belongs to the lesson
- Validates submission type and required fields (speaking requires audioUrl, writing requires text, quiz/listening require answer)
- Decides success (submission created) or rejection (validation failed)
- Does NOT compute correctness or score (these are computed by service logic, not in command)

**Preconditions (Checked synchronously)**:
- Attempt exists and is in 'in-progress' status
- Activity exists and belongs to the lesson in the attempt
- Submission type matches activity type
- Required fields present based on type (audioUrl for speaking, text for writing, answer for quiz/listening)
- If `correlationId` provided, check for existing submission with same correlationId (idempotency)

**Processing Steps (High level)**:
1. Validate attempt exists and is in 'in-progress' status
2. Validate activity exists and belongs to lesson (read from curriculum-service)
3. Validate submission type and required fields match activity type
4. Check for existing submission with correlationId (if provided, idempotency)
5. Create Submission entity with type, answer/audioUrl/text based on type
6. Emit `learning.submission.created` event

**Emitted Events**:
- `learning.submission.created` (past tense)
- Emitted immediately after Submission entity is created
- Key payload fields: `submissionId`, `attemptId`, `activityId`, `lessonId`, `type`

**Notes**:
- Supports multiple activity types: quiz, listening, speaking, writing
- Correctness and score computation happen in service logic (not in command)
- Command is idempotent: if `correlationId` provided and submission exists, return existing submission
- Event includes `type` field to indicate submission type (speaking, writing, quiz, listening)

---

## Assessment Domain Commands

--------------------------------------------------
### Command: assessment.quiz.start

**Handled by**: `assessment-service`

**Handler Responsibility**:
- Creates or updates Assessment entity with status 'in-progress'
- Validates that the assessment is available for the user
- Decides success (assessment started) or rejection (validation failed)
- Does NOT compute scores or readiness (these are outcomes, not intent)

**Preconditions (Checked synchronously)**:
- User exists (read from onboarding-service)
- Assessment exists
- Assessment is available for user (not already completed, not expired)
- If `correlationId` provided, check for existing assessment attempt with same correlationId (idempotency)

**Processing Steps (High level)**:
1. Validate user exists (read-only query to onboarding-service)
2. Validate assessment exists
3. Check assessment availability (not completed, not expired)
4. Check for existing assessment attempt with correlationId (if provided, idempotency)
5. Create or update Assessment entity: set status to 'in-progress'
6. Emit `assessment.quiz.started` event

**Emitted Events**:
- `assessment.quiz.started` (past tense)
- Emitted immediately after Assessment entity is created/updated
- Key payload fields: `assessmentId`, `userId`, `attemptId` (if applicable)

**Notes**:
- Command is idempotent: if `correlationId` provided and assessment attempt exists, return existing attempt
- Assessment availability check is synchronous (no async operations)
- Event is emitted only after successful Assessment state update

--------------------------------------------------
### Command: assessment.quiz.submit

**Handled by**: `assessment-service`

**Handler Responsibility**:
- Updates Assessment entity with submitted answers and status 'graded'
- Validates that the assessment is in progress
- Computes score based on answers (service logic, not in command)
- Decides success (assessment submitted) or rejection (validation failed)
- Does NOT update MasteryState or ReadinessState (these are updated via event reactions)

**Preconditions (Checked synchronously)**:
- Assessment exists and is in 'in-progress' status
- Answers array is non-empty and matches question count
- Answer format matches assessment type
- If `attemptId` provided, it matches assessment's current attempt
- If `correlationId` provided, check idempotency

**Processing Steps (High level)**:
1. Validate assessment exists and is in 'in-progress' status
2. Validate answers array (non-empty, count matches questions, format valid)
3. Validate attemptId if provided (must match assessment's current attempt)
4. Compute score based on answers (service logic)
5. Update Assessment entity: set answers, set score, set status to 'graded'
6. Emit `assessment.quiz.submitted` event with score

**Emitted Events**:
- `assessment.quiz.submitted` (past tense)
- Emitted immediately after Assessment entity is updated
- Key payload fields: `assessmentId`, `userId`, `score`

**Notes**:
- Score is computed by service (not provided in command payload)
- Command is idempotent: if `correlationId` provided and submission already processed, return existing result
- Readiness computation may be triggered (read-only, no state mutation)
- MasteryState and ReadinessState updates happen via event reactions (not directly in handler)

--------------------------------------------------
### Command: assessment.placement.take

**Handled by**: `assessment-service`

**Handler Responsibility**:
- Creates Assessment entity for placement test
- Validates that the user can take placement test (no recent result, or allow retake)
- Decides success (placement test created) or rejection (validation failed)
- Does NOT emit completion event immediately (event emitted only after full test is finished)
- Does NOT include CEFR result in command (result is computed after completion)

**Preconditions (Checked synchronously)**:
- User exists (read from onboarding-service)
- Target language is valid LanguageCode enum value
- User does not have recent placement test result (or allow retake)
- If `correlationId` provided, check for existing placement test with same correlationId (idempotency)

**Processing Steps (High level)**:
1. Validate user exists (read-only query to onboarding-service)
2. Validate target language is valid
3. Check for recent placement test result (if retake not allowed)
4. Check for existing placement test with correlationId (if provided, idempotency)
5. Create Assessment entity with type 'placement' and status 'in-progress'
6. Do NOT emit event immediately (event emitted only after full test completion)

**Emitted Events**:
- `assessment.level_test.completed` (past tense)
- Emitted only after the full placement test is finished (not immediately after command)
- Key payload fields: `assessmentId`, `userId`, `cefrLevel` (computed after completion)

**Notes**:
- This command represents user's intent to enter placement test flow, not completion
- Event is emitted later when test is fully completed (via assessment.quiz.submit or similar)
- CEFR level is computed after completion (not in command payload)
- Command is idempotent: if `correlationId` provided and placement test in progress, return existing assessment

---

## Mentoring / Feedback Domain Commands

--------------------------------------------------
### Command: mentoring.feedback.request

**Handled by**: `mentoring-service`

**Handler Responsibility**:
- Creates FeedbackRequest entity for tracking feedback request
- Validates that the submission exists and belongs to the user
- Validates that submission type supports feedback (speaking or writing, not quiz)
- Decides success (request created) or rejection (validation failed)
- May trigger AI analysis (read-only operation, no state mutation)

**Preconditions (Checked synchronously)**:
- Submission exists (read from practice-service)
- User ID matches submission's attempt owner
- Submission type is 'speaking' or 'writing' (feedback not applicable to quiz items)
- Priority is valid enum value if provided
- If submission already has pending request, return existing request (idempotency)

**Processing Steps (High level)**:
1. Validate submission exists (read-only query to practice-service)
2. Validate submission ownership (userId matches attempt owner)
3. Validate submission type (must be 'speaking' or 'writing')
4. Check for existing feedback request (idempotency)
5. Create FeedbackRequest entity with priority
6. Optionally trigger AI analysis (read-only, async operation)
7. Emit `mentoring.feedback.requested` event

**Emitted Events**:
- `mentoring.feedback.requested` (past tense)
- Emitted immediately after FeedbackRequest entity is created
- Key payload fields: `submissionId`, `userId`, `priority` (if provided)

**Notes**:
- Command is idempotent: requesting feedback on submission that already has pending request returns existing request
- AI analysis is optional and asynchronous (does not block event emission)
- Feedback request does not create Feedback entity (that happens via mentoring.feedback.publish)

--------------------------------------------------
### Command: mentoring.feedback.publish

**Handled by**: `mentoring-service`

**Handler Responsibility**:
- Creates Feedback entity with feedback content and rubric scores
- Validates that the submission exists and author is valid
- Validates rubric scores match submission type and are in valid range
- Decides success (feedback published) or rejection (validation failed)
- Does NOT update MasteryState directly (updated via event reactions)

**Preconditions (Checked synchronously)**:
- Submission exists (read from practice-service)
- Author ID exists if authorRole is 'teacher' or 'mentor'
- Author role is valid enum value ('teacher', 'mentor', or 'ai')
- Text is non-empty
- Rubric scores are in range 0.0-1.0 if provided
- Rubric structure matches submission type
- If `correlationId` provided, check for existing feedback with same correlationId (idempotency)

**Processing Steps (High level)**:
1. Validate submission exists (read-only query to practice-service)
2. Validate author exists (if authorRole is 'teacher' or 'mentor')
3. Validate author role is valid
4. Validate text is non-empty
5. Validate rubric scores (range 0.0-1.0, structure matches submission type)
6. Check for existing feedback with correlationId (if provided, idempotency)
7. Create Feedback entity with authorRole, text, corrections, rubricScores
8. Emit `mentoring.feedback.published` event

**Emitted Events**:
- `mentoring.feedback.published` (past tense)
- Emitted immediately after Feedback entity is created
- Key payload fields: `feedbackId`, `submissionId`, `authorRole`, `authorId`

**Notes**:
- Command is idempotent: if `correlationId` provided and feedback already published, return existing feedback
- Rubric scores are optional but validated if provided
- MasteryState updates happen via event reactions (not directly in handler)
- Event includes `authorRole` field to indicate feedback source (teacher, mentor, or ai)

---

## Progress / Curriculum Domain Commands

--------------------------------------------------
### Command: curriculum.course.enroll

**Handled by**: `curriculum-service`

**Handler Responsibility**:
- Creates Enrollment entity linking user to course
- Validates that the user exists and course is available
- Validates that user is not already enrolled (or allow re-enrollment)
- Decides success (enrollment created) or rejection (validation failed)
- Does NOT initialize ProgressState or MasteryState (initialized via event reactions)

**Preconditions (Checked synchronously)**:
- User exists (read from onboarding-service)
- Course exists
- Course is available for enrollment (not archived, not full capacity)
- User is not already enrolled (or allow re-enrollment)
- If `correlationId` provided, check for existing enrollment with same correlationId (idempotency)

**Processing Steps (High level)**:
1. Validate user exists (read-only query to onboarding-service)
2. Validate course exists
3. Check course availability (not archived, not full capacity)
4. Check for existing enrollment (if re-enrollment not allowed)
5. Check for existing enrollment with correlationId (if provided, idempotency)
6. Create Enrollment entity with status 'active'
7. Emit `curriculum.course.enrolled` event

**Emitted Events**:
- `curriculum.course.enrolled` (past tense)
- Emitted immediately after Enrollment entity is created
- Key payload fields: `enrollmentId`, `userId`, `courseId`

**Notes**:
- Command is idempotent: if `correlationId` provided and enrollment exists, return existing enrollment
- ProgressState and MasteryState initialization happen via event reactions (not directly in handler)
- Enrollment creation is synchronous (state mutation happens before event emission)

--------------------------------------------------
### Command: curriculum.unit.access

**Handled by**: `progress-service`

**Handler Responsibility**:
- Evaluates unit access eligibility based on progress and mastery state
- Queries curriculum-service for unlock eligibility rules (read-only)
- May update ProgressState if unit becomes eligible (via internal logic)
- Decides success (eligibility evaluated, possibly unlocked) or rejection (validation failed)
- Does NOT directly mutate curriculum state (read-only queries only)
- This is an INTERNAL system command, not exposed to client applications

**Preconditions (Checked synchronously)**:
- User exists (read from onboarding-service)
- Unit exists (read from curriculum-service)
- Course exists (read from curriculum-service)
- Unit belongs to the specified course
- Reason is valid enum value ('mastery', 'assessment', 'manual', 'srs')

**Processing Steps (High level)**:
1. Validate user exists (read-only query to onboarding-service)
2. Validate unit and course exist (read-only queries to curriculum-service)
3. Validate unit belongs to course
4. Read ProgressState (from progress-service)
5. Read MasteryState (read-only query to motivation-progress-service)
6. Query curriculum-service for unlock eligibility rules (read-only)
7. Evaluate eligibility based on progress, mastery, and unlock rules
8. If eligible, update ProgressState (unlock unit)
9. If unlock occurred, emit `curriculum.unit.unlocked` event (informational)

**Emitted Events**:
- `curriculum.unit.unlocked` (past tense) - only if unit becomes eligible and unlocked
- Emitted after ProgressState update if unlock occurred
- Key payload fields: `userId`, `unitId`, `courseId`, `reason`

**Notes**:
- This is an INTERNAL system command (not exposed to client applications)
- Command is idempotent: checking access multiple times returns same eligibility result
- May emit no event if unit is not eligible (eligibility check only)
- Event is emitted only if unlock actually occurs (not for every access check)
- All curriculum state queries are read-only (no mutation of curriculum-service state)

---

## System / Automation Domain Commands

--------------------------------------------------
### Command: system.user.register

**Handled by**: `onboarding-service`

**Handler Responsibility**:
- Creates User entity with email, password (hashed), and role
- Creates LearnerProfile entity if role is 'learner'
- Validates that email is unique and password meets security requirements
- Decides success (user created) or rejection (validation failed)
- Does NOT initialize ProgressState, MasteryState, or ReadinessState (initialized via event reactions)

**Preconditions (Checked synchronously)**:
- Email is valid format and unique (not already registered)
- Password meets security requirements (min length, complexity)
- Role is valid UserRole enum value
- Target language is valid LanguageCode enum value if provided
- If `correlationId` provided, check for existing user with same correlationId (idempotency)

**Processing Steps (High level)**:
1. Validate email format and uniqueness
2. Validate password meets security requirements
3. Validate role is valid enum value
4. Validate target language if provided
5. Check for existing user with correlationId (if provided, idempotency)
6. Hash password
7. Create User entity
8. Create LearnerProfile entity if role is 'learner'
9. Emit `system.user.registered` event

**Emitted Events**:
- `system.user.registered` (past tense)
- Emitted immediately after User entity is created
- Key payload fields: `userId`, `email`, `role`

**Notes**:
- Command is idempotent: if `correlationId` provided and user exists, return existing user
- Password hashing happens synchronously before entity creation
- ProgressState, MasteryState, and ReadinessState initialization happen via event reactions (not directly in handler)
- LearnerProfile creation is conditional (only if role is 'learner')

--------------------------------------------------
### Command: system.user.login

**Handled by**: `onboarding-service`

**Handler Responsibility**:
- Authenticates user credentials (email and password)
- Creates Session entity for tracking login session
- Validates that user account is active
- Decides success (session created) or rejection (authentication failed)
- Does NOT include authentication result in command (result is computed by service)
- Does NOT mutate User state (login is read-only operation)

**Preconditions (Checked synchronously)**:
- Email exists in User entity
- Password matches stored password hash
- User account is active (not suspended, not deleted)
- If `correlationId` provided, check idempotency

**Processing Steps (High level)**:
1. Validate email exists in User entity
2. Verify password matches stored hash
3. Validate user account is active (not suspended, not deleted)
4. Check for existing session with correlationId (if provided, idempotency)
5. Create Session entity with deviceId if provided
6. Generate authentication token (not in command payload)
7. Emit `system.user.login` event

**Emitted Events**:
- `system.user.login` (past tense)
- Emitted immediately after Session entity is created
- Key payload fields: `userId`, `deviceId` (if provided)

**Notes**:
- Command is idempotent: logging in multiple times creates new sessions (idempotent at session level)
- Authentication result (token) is generated by service, not in command payload
- User state is read-only (login does not mutate user entity)
- Event is emitted only after successful authentication and session creation

--------------------------------------------------
### Command: system.profile.modify

**Handled by**: `onboarding-service`

**Handler Responsibility**:
- Updates User entity and/or LearnerProfile entity with new profile fields
- Validates that user is authorized to modify profile (userId matches authenticated user)
- Validates that at least one field is provided for update
- Decides success (profile updated) or rejection (validation failed)
- May trigger learning state reset if targetLanguage changed (via event reactions, not directly)

**Preconditions (Checked synchronously)**:
- User exists
- User ID matches authenticated user (authorization check)
- At least one optional field is provided (cannot submit empty update)
- Target language is valid LanguageCode enum value if provided
- Avatar URL is valid URL format if provided
- If `correlationId` provided, check idempotency

**Processing Steps (High level)**:
1. Validate user exists
2. Validate authorization (userId matches authenticated user)
3. Validate at least one field is provided
4. Validate field formats (targetLanguage enum, avatarUrl format)
5. Check for existing profile update with correlationId (if provided, idempotency)
6. Update User entity with provided fields
7. Update LearnerProfile entity if applicable
8. Emit `system.profile.updated` event

**Emitted Events**:
- `system.profile.updated` (past tense)
- Emitted immediately after User/LearnerProfile entities are updated
- Key payload fields: `userId`, `updatedFields` (list of updated field names)

**Notes**:
- Command is idempotent: modifying profile with same values returns success
- If `targetLanguage` (learningLanguage) changes, this may trigger reset/recomputation of ProgressState, MasteryState, and ReadinessState via event reactions (not directly in handler)
- Other profile changes (firstName, lastName, avatarUrl, notificationPreferences) do NOT affect learning states
- Event includes `updatedFields` to indicate which fields were changed

--------------------------------------------------
### Command: system.srs.schedule

**Handled by**: `curriculum-service`

**Handler Responsibility**:
- Determines which SRS items are due for review based on scheduling time
- Reads SRSItem state and Enrollment state (read-only)
- Decides success (due items determined) or rejection (validation failed)
- Does NOT mutate SRSItem state (SRS items are updated when review is completed)
- This is an automated system command, not user-facing

**Preconditions (Checked synchronously)**:
- User exists (read from onboarding-service)
- Course exists if courseId provided (read from curriculum-service)
- ScheduledAt is valid ISO 8601 timestamp
- User has active enrollment(s) if courseId not provided

**Processing Steps (High level)**:
1. Validate user exists (read-only query to onboarding-service)
2. Validate course exists if courseId provided (read-only query to curriculum-service)
3. Validate scheduledAt is valid ISO 8601 timestamp
4. Read SRSItem state (read-only, from curriculum-service)
5. Read Enrollment state (read-only, from curriculum-service)
6. Determine which SRS items are due based on scheduling time and SRS rules
7. Emit `curriculum.srs_items.due` event with list of due items

**Emitted Events**:
- `curriculum.srs_items.due` (past tense)
- Emitted after due items are determined
- Key payload fields: `userId`, `courseId` (if provided), `dueItemIds` (array of SRS item IDs)

**Notes**:
- This is an automated system command (not user-facing, triggered by scheduler)
- Command is idempotent: scheduling SRS items multiple times returns same due items
- No state mutation (read-only operation, informational event only)
- SRS review affects mastery via `learning.lesson.completed` event when review is completed (not in this handler)
- Event is informational only (no state mutation in this handler)

---

**Last Updated**: 2024-12-19  
**Status**: ✅ Complete - Command handler event flow defined for MVP  
**Related Documents**: 
- `docs/architecture/command-taxonomy.md` (STEP 4.1 - Command taxonomy)
- `docs/architecture/command-contracts.md` (STEP 4.2 - Command contracts)
- `docs/architecture/state-ownership.md` (State ownership rules)
- `contracts/events/events.catalog.md` (Domain events)
