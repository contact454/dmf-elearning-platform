/**
 * k6 Load Test — M8 S24-05
 * Target: 1000 concurrent users, <200ms p95 latency
 *
 * Run: k6 run infrastructure/load-tests/smoke.js
 */
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const vocabDuration = new Trend('vocab_duration');
const readingDuration = new Trend('reading_duration');
const gamificationDuration = new Trend('gamification_duration');

const BASE_URL = __ENV.API_URL || 'http://localhost:3001/api';

export const options = {
    stages: [
        { duration: '30s', target: 50 },    // ramp up
        { duration: '1m', target: 200 },     // sustained load
        { duration: '2m', target: 500 },     // high load
        { duration: '1m', target: 1000 },    // peak
        { duration: '30s', target: 0 },      // ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<200', 'p(99)<500'],
        errors: ['rate<0.01'],
        vocab_duration: ['p(95)<150'],
        reading_duration: ['p(95)<200'],
        gamification_duration: ['p(95)<100'],
    },
};

export default function () {
    group('Health Check', () => {
        const res = http.get(`${BASE_URL}/health`);
        check(res, { 'health OK': (r) => r.status === 200 });
        errorRate.add(res.status !== 200);
    });

    group('Vocabulary', () => {
        const start = Date.now();
        const res = http.get(`${BASE_URL}/vocabulary?level=A1`);
        vocabDuration.add(Date.now() - start);
        check(res, {
            'vocab 200': (r) => r.status === 200,
            'vocab has data': (r) => JSON.parse(r.body).success === true,
        });
        errorRate.add(res.status !== 200);
    });

    group('Reading', () => {
        const start = Date.now();
        const res = http.get(`${BASE_URL}/reading?level=A1`);
        readingDuration.add(Date.now() - start);
        check(res, { 'reading 200': (r) => r.status === 200 });
        errorRate.add(res.status !== 200);
    });

    group('Gamification', () => {
        const start = Date.now();
        const res = http.get(`${BASE_URL}/gamification/leaderboard`);
        gamificationDuration.add(Date.now() - start);
        check(res, { 'leaderboard 200': (r) => r.status === 200 });
        errorRate.add(res.status !== 200);
    });

    sleep(1);
}

export function handleSummary(data) {
    return {
        'load-test-results.json': JSON.stringify(data, null, 2),
        stdout: textSummary(data, { indent: ' ', enableColors: true }),
    };
}

function textSummary(data, opts) {
    const p95 = data.metrics?.http_req_duration?.values?.['p(95)'] || 0;
    const p99 = data.metrics?.http_req_duration?.values?.['p(99)'] || 0;
    const errRate = data.metrics?.errors?.values?.rate || 0;
    return `
═══════════════════════════════════════
  DMF Load Test Results
═══════════════════════════════════════
  Total requests: ${data.metrics?.http_reqs?.values?.count || 0}
  p95 latency:    ${p95.toFixed(1)}ms ${p95 < 200 ? '✅' : '❌'}
  p99 latency:    ${p99.toFixed(1)}ms ${p99 < 500 ? '✅' : '❌'}
  Error rate:     ${(errRate * 100).toFixed(2)}% ${errRate < 0.01 ? '✅' : '❌'}
═══════════════════════════════════════
`;
}
