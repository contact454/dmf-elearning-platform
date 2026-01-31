# Metrics Dictionary (Từ điển Metrics)

## Overview

This document maps domain events and HTTP routes to metrics counters and histograms.

## Event → Metric Mapping

### Learning Events

| Event Name | Metric Name | Type | Labels | Alert Threshold |
|------------|-------------|------|--------|-----------------|
| `learning.lesson.started` | `lessons_started_total` | Counter | `service` | Rate > 100/min |
| `learning.lesson.completed` | `lessons_completed_total` | Counter | `service` | Rate < 10/min (low completion) |
| `learning.lesson.abandoned` | `lessons_abandoned_total` | Counter | `service` | Rate > 50% of started |
| `learning.submission.created` | `submissions_created_total` | Counter | `service` | Rate > 500/min |

### Assessment Events

| Event Name | Metric Name | Type | Labels | Alert Threshold |
|------------|-------------|------|--------|-----------------|
| `assessment.quiz.started` | `quizzes_started_total` | Counter | `service` | Rate > 50/min |
| `assessment.quiz.submitted` | `quizzes_submitted_total` | Counter | `service` | Rate < 80% of started |

### System Events

| Event Name | Metric Name | Type | Labels | Alert Threshold |
|------------|-------------|------|--------|-----------------|
| `system.user.registered` | `users_registered_total` | Counter | `service` | Rate > 20/min |

### Curriculum Events

| Event Name | Metric Name | Type | Labels | Alert Threshold |
|------------|-------------|------|--------|-----------------|
| `curriculum.course.enrolled` | `course_enrollments_total` | Counter | `service` | Rate > 30/min |

## HTTP Route → Metric Mapping

### Request Counters

**Metric**: `http_requests_total`

**Labels**:
- `service`: Service name (onboarding-service, curriculum-service, etc.)
- `route`: HTTP route path (e.g., `/api/learning/lesson/start`)
- `method`: HTTP method (GET, POST, etc.)
- `status`: HTTP status code (200, 400, 404, 500, etc.)

**Alert Thresholds**:
- 5xx errors > 1% of total requests
- 4xx errors > 10% of total requests (may indicate client issues)

### Request Duration Histograms

**Metric**: `http_request_duration_ms`

**Labels**:
- `service`: Service name
- `route`: HTTP route path
- `method`: HTTP method
- `le`: Bucket boundary (10, 50, 100, 250, 500, 1000, 2500, 5000, 10000, +Inf)

**Alert Thresholds**:
- p95 latency > 1000ms
- p99 latency > 2500ms

## Event Processing Metrics

### Events Consumed

**Metric**: `events_consumed_total`

**Labels**:
- `service`: Service name consuming the event
- `eventName`: Event name

**Alert Thresholds**:
- Consumption lag > 5 seconds (if using event bus with lag tracking)

### Events Published

**Metric**: `events_published_total`

**Labels**:
- `service`: Service name publishing the event
- `eventName`: Event name

**Alert Thresholds**:
- Publish failures > 1% of attempts

## Commands Processed

**Metric**: `commands_processed_total`

**Labels**:
- `service`: Service name
- `commandName`: Command name
- `result`: `success` or `failure`

**Alert Thresholds**:
- Failure rate > 5% for any command

## Example Queries

### Learning Completion Rate
```
rate(lessons_completed_total[5m]) / rate(lessons_started_total[5m])
```

### HTTP Error Rate
```
sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))
```

### Average Request Duration
```
rate(http_request_duration_ms_sum[5m]) / rate(http_request_duration_ms_count[5m])
```

## Alert Rules (Simple)

1. **High Error Rate**: `sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.01`
2. **High Latency**: `histogram_quantile(0.95, rate(http_request_duration_ms_bucket[5m])) > 1000`
3. **Low Lesson Completion**: `rate(lessons_completed_total[5m]) / rate(lessons_started_total[5m]) < 0.5`
4. **High Abandonment Rate**: `rate(lessons_abandoned_total[5m]) / rate(lessons_started_total[5m]) > 0.5`
