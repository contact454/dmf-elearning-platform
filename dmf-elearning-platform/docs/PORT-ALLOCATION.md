# DMF eLearning Platform - Port Allocation

This document defines the authoritative port allocation for all services in the DMF eLearning platform. Each service MUST use a unique port to avoid conflicts.

## Service Port Map

| Port | Service                    | Status       | Notes                                  |
|------|----------------------------|--------------|----------------------------------------|
| 3000 | web-learner (Next.js)      | Reserved     | Frontend application                   |
| 3001 | practice-service           | Active       | Learning practice commands             |
| 3002 | onboarding-service         | Active       | User registration and onboarding       |
| 3003 | learning-service           | Active       | Legacy learning API                    |
| 3004 | progress-service           | Active       | Learner progress and dashboard         |
| 3005 | motivation-progress-service| Active       | Mastery and motivation tracking        |
| 3006 | gamification-service       | Active       | Gamification features                  |
| 3007 | read-service               | Active       | Reading module                         |
| 3008 | speaking-service           | Active       | Speech analysis and pronunciation      |
| 3009 | writing-service            | Active       | Essay and grammar checking             |
| 3010 | ops-admin-service          | Active       | Operations admin panel                 |
| 3011 | evidence-service           | Active       | Evidence collection                    |
| 3012 | ops-service                | Active       | Operations service                     |
| 3013 | curriculum-service         | Active       | Course enrollment and curriculum       |
| 3014 | assessment-service         | Active       | Quiz and assessment engine             |

## Infrastructure Ports

| Port | Service    | Notes                          |
|------|------------|--------------------------------|
| 3030 | Grafana    | Monitoring dashboard (maps to internal 3000) |
| 5432 | PostgreSQL | Database                       |
| 6379 | Redis      | Cache and rate limiting        |
| 9090 | Prometheus | Metrics scraping               |

## Port Conflict History

The following conflicts were resolved on 2026-02-21:

| Old Port | Conflicting Services             | Resolution                              |
|----------|----------------------------------|-----------------------------------------|
| 3001     | practice-service, writing-service| writing-service moved to 3009           |
| 3002     | onboarding-service, speaking-service | speaking-service moved to 3008      |
| 3003     | learning-service, curriculum-service | curriculum-service moved to 3013    |
| 3006     | gamification-service, assessment-service | assessment-service moved to 3014 |

## Configuration Priority

Services read their port from environment variables in the following priority order:

1. Service-specific env var (e.g., `DMF_PORT_CURRICULUM`, `DMF_PORT_ASSESSMENT`)
2. Generic `PORT` environment variable
3. Hardcoded default in source code

When adding a new service, allocate the next available port (currently 3015+) and update this document.
