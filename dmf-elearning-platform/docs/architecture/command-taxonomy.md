# STEP 4.1 — Command Taxonomy (MVP)
## Phân loại Lệnh (Phía Ghi)

This document defines the command taxonomy (write-side intentions) for DMF Hybrid Language Learning Platform MVP. Commands represent user/system intent to perform actions, not outcomes or state mutations.

---

## 1. Command Naming Principles (Nguyên tắc Đặt tên Lệnh)

**Format**: `<domain>.<entity>.<action>`

**Rules**:
- **Action verb MUST be present tense** (động từ hiện tại): `start`, `complete`, `submit`, `enroll`, `request`
- **Commands represent INTENT** (ý định), not outcome (kết quả)
- **No result-oriented verbs**: Avoid `unlock`, `master`, `score`, `calculate` (these are outcomes, not intents)
- **No generic verbs**: Avoid `update`, `process`, `handle` (too vague)
- **Domain separation**: Each domain has clear ownership boundaries

**Examples**:
- ✅ `learning.lesson.start` (intent to start)
- ❌ `learning.lesson.unlock` (outcome, not intent)
- ✅ `assessment.quiz.submit` (intent to submit)
- ❌ `assessment.quiz.score` (outcome, not intent)

---

## 2. Command List by Domain (Danh sách Lệnh theo Miền)

### 2.1 Learning / Practice Domain

| Command Name | Sender | Handling Service | Business Meaning |
|--------------|--------|------------------|------------------|
| `learning.lesson.start` | User (via app) | `practice-service` | User intends to start learning a lesson (bắt đầu học bài) |
| `learning.lesson.complete` | User (via app) | `practice-service` | User intends to finish/complete a lesson (hoàn thành bài học) |
| `learning.lesson.abandon` | User (via app) | `practice-service` | User intends to quit/abandon a lesson mid-session (bỏ dở bài học) |
| `learning.activity.submit` | User (via app) | `practice-service` | User intends to submit an answer to an activity (nộp câu trả lời) |

**Notes**:
- All commands handled by `practice-service` (owns Attempt and Submission state)
- Commands represent user intent; service determines outcome and emits events
- `learning.activity.submit` covers both speaking and writing submissions

---

### 2.2 Assessment Domain

| Command Name | Sender | Handling Service | Business Meaning |
|--------------|--------|------------------|------------------|
| `assessment.quiz.start` | User (via app) | `assessment-service` | User intends to start a quiz attempt (bắt đầu làm quiz) |
| `assessment.quiz.submit` | User (via app) | `assessment-service` | User intends to submit quiz answers (nộp đáp án quiz) |
| `assessment.placement.take` | User (via app) | `assessment-service` | User intends to take placement test (làm bài kiểm tra định vị) |

**Notes**:
- All commands handled by `assessment-service` (owns Assessment state)
- `assessment.placement.take` is a special case of level test
- Commands may trigger readiness computation (read-only, no state mutation)
- **Note**: `assessment.placement.take` represents the user's intent to enter the placement test flow. The assessment-service determines completion and emits `assessment.level_test.completed` only after the full test is finished.

---

### 2.3 Mentoring / Feedback Domain

| Command Name | Sender | Handling Service | Business Meaning |
|--------------|--------|------------------|------------------|
| `mentoring.feedback.request` | User (via app) | `mentoring-service` | User intends to request feedback on a submission (yêu cầu phản hồi) |
| `mentoring.feedback.publish` | Teacher/Mentor (via app) | `mentoring-service` | Teacher/Mentor intends to publish feedback (xuất bản phản hồi) |

**Notes**:
- `mentoring.feedback.request` handled by `mentoring-service` (may trigger AI analysis)
- `mentoring.feedback.publish` handled by `mentoring-service` (owns Feedback state)
- Feedback may affect mastery (indirect, via event reactions)

---

### 2.4 Progress / Curriculum Domain

| Command Name | Sender | Handling Service | Business Meaning |
|--------------|--------|------------------|------------------|
| `curriculum.course.enroll` | User (via app) | `curriculum-service` | User intends to enroll in a course (ghi danh khóa học) |
| `curriculum.unit.access` | System (event-triggered) | `progress-service` | System intends to check/access unit eligibility (kiểm tra điều kiện truy cập đơn vị) |

**Notes**:
- `curriculum.course.enroll` handled by `curriculum-service` (owns Enrollment state)
- `curriculum.unit.access` is internal command triggered by events (progress-service queries curriculum-service for unlock eligibility)
- `curriculum.unit.access` is an internal system command representing intent to evaluate unit access eligibility. It does not directly mutate curriculum or progress state and is not exposed to client applications.
- No direct "unlock" command (unlock is outcome, not intent)

---

### 2.5 System / Automation Domain

| Command Name | Sender | Handling Service | Business Meaning |
|--------------|--------|------------------|------------------|
| `system.user.register` | User (via app) | `onboarding-service` | User intends to register/create account (đăng ký tài khoản) |
| `system.user.login` | User (via app) | `onboarding-service` | User intends to log in (đăng nhập) |
| `system.profile.modify` | User (via app) | `onboarding-service` | User intends to modify profile information (sửa thông tin hồ sơ) |
| `system.srs.schedule` | System (automated) | `curriculum-service` | System intends to schedule SRS review items (lên lịch ôn tập) |

**Notes**:
- `system.user.register` and `system.user.login` handled by `onboarding-service` (owns User state)
- `system.profile.modify` handled by `onboarding-service` (may trigger state reset if learningLanguage changes)
- `system.srs.schedule` is automated command (triggers `curriculum.srs_items.due` event)

---

## 3. Explicitly Forbidden Commands (Lệnh Bị Cấm)

| Forbidden Command Pattern | Reason |
|---------------------------|--------|
| `*.entity.unlock` | Unlock is an outcome, not an intent. Use `curriculum.unit.access` (check eligibility) instead. |
| `*.entity.master` | Mastery is a computed outcome, not an intent. Mastery eligibility is determined by scoring rules. |
| `*.entity.score` | Scoring is a computed outcome, not an intent. Scores are derived from activities/assessments. |
| `*.entity.calculate` | Calculation is an internal operation, not a user intent. |
| `*.entity.update` | Too generic. Use specific action verbs (e.g., `modify`, `complete`, `submit`). |
| `*.entity.process` | Too generic. Use specific action verbs. |
| `*.entity.handle` | Too generic. Use specific action verbs. |
| `progress.*` | Progress is state, not a domain. Use `curriculum.*` or `learning.*` instead. |
| `mastery.*` | Mastery is state, not a domain. Mastery is computed from learning/assessment events. |

**Principle**: Commands must represent user/system intent to perform an action, not the computed outcome of that action.

---

## 4. Ownership Rules Summary (Tóm tắt Quy tắc Sở hữu)

| Domain | Primary Service Owner | Owns State |
|--------|---------------------|------------|
| Learning / Practice | `practice-service` | Attempt, Submission |
| Assessment | `assessment-service` | Assessment |
| Mentoring / Feedback | `mentoring-service` | Feedback |
| Progress / Curriculum | `curriculum-service` | Enrollment, Course, Unit, Lesson |
| Progress / Curriculum | `progress-service` | ProgressState (learner progress) |
| System / Automation | `onboarding-service` | User, LearnerProfile |
| System / Automation | `curriculum-service` | SRS scheduling |

**Notes**:
- `curriculum-service` owns curriculum rules (luật học) and provides read-only unlock eligibility checks
- `progress-service` owns ProgressState (trạng thái người học) and queries curriculum-service for unlock eligibility
- `motivation-progress-service` owns MasteryState (computed from events, not commands)
- No command may directly mutate state owned by another service

---

## 5. Command → Event Mapping (Ánh xạ Lệnh → Sự kiện)

Commands are handled by services, which then emit domain events (past tense) representing the outcome:

| Command | Handling Service | Emits Event |
|---------|------------------|-------------|
| `learning.lesson.start` | `practice-service` | `learning.lesson.started` |
| `learning.lesson.complete` | `practice-service` | `learning.lesson.completed` |
| `learning.lesson.abandon` | `practice-service` | `learning.lesson.abandoned` |
| `learning.activity.submit` | `practice-service` | `learning.submission.created` |
| `assessment.quiz.start` | `assessment-service` | `assessment.quiz.started` |
| `assessment.quiz.submit` | `assessment-service` | `assessment.quiz.submitted` |
| `assessment.placement.take` | `assessment-service` | `assessment.level_test.completed` |
| `mentoring.feedback.request` | `mentoring-service` | `mentoring.feedback.requested` |
| `mentoring.feedback.publish` | `mentoring-service` | `mentoring.feedback.published` |
| `curriculum.course.enroll` | `curriculum-service` | `curriculum.course.enrolled` |
| `system.user.register` | `onboarding-service` | `system.user.registered` |
| `system.user.login` | `onboarding-service` | `system.user.login` |
| `system.profile.modify` | `onboarding-service` | `system.profile.updated` |

**Note**: `curriculum.unit.access` and `system.srs.schedule` are internal commands that may trigger events indirectly via service logic.

---

**Last Updated**: 2024-12-19  
**Status**: ✅ Complete - Command taxonomy defined for MVP  
**Related Documents**: 
- `docs/architecture/contract-inventory.md` (Command contracts)
- `docs/architecture/state-ownership.md` (State ownership rules)
- `contracts/events/events.catalog.md` (Domain events)
