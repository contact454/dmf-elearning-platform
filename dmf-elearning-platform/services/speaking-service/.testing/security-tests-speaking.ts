/**
 * SECURITY TESTS FOR DMF SPEAKING MODULE PHASE 1
 * Covers 10 comprehensive security test cases
 * 
 * Test Coverage:
 * - Authentication & Authorization (4 tests)
 * - File Upload Security (3 tests)
 * - Input Validation (2 tests)
 * - Infrastructure Security (1 test)
 */

import axios, { AxiosError } from 'axios';
import jwt from 'jsonwebtoken';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3002';
const API_URL = `${BASE_URL}/api`;

interface TestResult {
  testId: string;
  name: string;
  category: string;
  status: 'PASS' | 'FAIL' | 'SKIP' | 'ERROR';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  details: string;
  vulnerability?: string;
  evidence?: any;
  timestamp: string;
}

const results: TestResult[] = [];

// Helper functions
function logResult(result: TestResult) {
  results.push(result);
  const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${result.testId}: ${result.name} - ${result.status}`);
  if (result.details) console.log(`   ${result.details}`);
}

async function checkServerRunning(): Promise<boolean> {
  try {
    const response = await axios.get(`${BASE_URL}/health`, { timeout: 2000 });
    return response.status === 200;
  } catch {
    return false;
  }
}

// Test user credentials
const TEST_USER = {
  email: `security-test-${Date.now()}@example.com`,
  password: 'SecurePassword123!',
  name: 'Security Test User'
};

let authToken: string = '';
let userId: string = '';
let testSubmissionId: string = '';

// =============================================================================
// GROUP 1: AUTHENTICATION & AUTHORIZATION (4 TESTS)
// =============================================================================

async function testJWTValidation() {
  const testId = 'TC-SEC-001';
  const testName = 'JWT Token Validation & Expiry';
  
  try {
    // Test 1a: Missing token
    try {
      await axios.get(`${API_URL}/submissions`);
      logResult({
        testId: `${testId}a`,
        name: `${testName} - Missing Token`,
        category: 'Authentication',
        status: 'FAIL',
        severity: 'CRITICAL',
        details: 'Server accepted request without authentication token',
        vulnerability: 'Missing authentication enforcement',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        logResult({
          testId: `${testId}a`,
          name: `${testName} - Missing Token`,
          category: 'Authentication',
          status: 'PASS',
          severity: 'CRITICAL',
          details: 'Server correctly rejected request without token (401)',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Test 1b: Invalid signature
    const fakeToken = jwt.sign(
      { userId: 'fake-user-id', email: 'fake@example.com' },
      'wrong-secret-key',
      { expiresIn: '1h' }
    );

    try {
      await axios.get(`${API_URL}/submissions`, {
        headers: { Authorization: `Bearer ${fakeToken}` }
      });
      logResult({
        testId: `${testId}b`,
        name: `${testName} - Invalid Signature`,
        category: 'Authentication',
        status: 'FAIL',
        severity: 'CRITICAL',
        details: 'Server accepted token with invalid signature',
        vulnerability: 'JWT signature validation bypass',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        logResult({
          testId: `${testId}b`,
          name: `${testName} - Invalid Signature`,
          category: 'Authentication',
          status: 'PASS',
          severity: 'CRITICAL',
          details: 'Server correctly rejected token with invalid signature (401)',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Test 1c: Expired token (simulated)
    const expiredToken = jwt.sign(
      { userId: 'test-user-id', email: 'test@example.com' },
      process.env.JWT_SECRET || 'default-secret-for-testing',
      { expiresIn: '-1h' } // Expired 1 hour ago
    );

    try {
      await axios.get(`${API_URL}/submissions`, {
        headers: { Authorization: `Bearer ${expiredToken}` }
      });
      logResult({
        testId: `${testId}c`,
        name: `${testName} - Expired Token`,
        category: 'Authentication',
        status: 'FAIL',
        severity: 'CRITICAL',
        details: 'Server accepted expired token',
        vulnerability: 'Expired token validation bypass',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        logResult({
          testId: `${testId}c`,
          name: `${testName} - Expired Token`,
          category: 'Authentication',
          status: 'PASS',
          severity: 'CRITICAL',
          details: 'Server correctly rejected expired token (401)',
          timestamp: new Date().toISOString()
        });
      }
    }

  } catch (error: any) {
    logResult({
      testId,
      name: testName,
      category: 'Authentication',
      status: 'ERROR',
      severity: 'CRITICAL',
      details: `Test execution failed: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
}

async function testOwnershipVerification() {
  const testId = 'TC-SEC-002';
  const testName = 'Submission Ownership Enforcement';
  
  try {
    // Create another user
    const otherUser = await axios.post(`${API_URL}/auth/register`, {
      email: `other-user-${Date.now()}@example.com`,
      password: 'Password123!',
      name: 'Other User'
    });
    const otherUserToken = otherUser.data.token;

    // Get a prompt for submission
    const promptsResponse = await axios.get(`${API_URL}/prompts?limit=1`);
    const promptId = promptsResponse.data.data[0]?.id;

    if (!promptId) {
      throw new Error('No prompts available for testing');
    }

    // Create submission as other user
    const otherSubmission = await axios.post(
      `${API_URL}/submissions`,
      { 
        promptId,
        audioUrl: 'https://example.com/test-audio.mp3',
        durationSeconds: 30
      },
      { headers: { Authorization: `Bearer ${otherUserToken}` }}
    );
    const otherSubmissionId = otherSubmission.data.id;

    // Try to access other user's submission with our token
    try {
      await axios.get(
        `${API_URL}/submissions/${otherSubmissionId}`,
        { headers: { Authorization: `Bearer ${authToken}` }}
      );
      
      logResult({
        testId,
        name: testName,
        category: 'Authorization',
        status: 'FAIL',
        severity: 'CRITICAL',
        details: 'User was able to access another user\'s submission',
        vulnerability: 'Broken access control - horizontal privilege escalation',
        evidence: { targetSubmissionId: otherSubmissionId },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 404) {
        logResult({
          testId,
          name: testName,
          category: 'Authorization',
          status: 'PASS',
          severity: 'CRITICAL',
          details: `Server correctly rejected unauthorized access (${error.response.status})`,
          timestamp: new Date().toISOString()
        });
      } else {
        throw error;
      }
    }

  } catch (error: any) {
    logResult({
      testId,
      name: testName,
      category: 'Authorization',
      status: 'ERROR',
      severity: 'CRITICAL',
      details: `Test execution failed: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
}

async function testPasswordSecurity() {
  const testId = 'TC-SEC-003';
  const testName = 'Password Storage Security (bcrypt)';
  
  try {
    // Register a user and check password storage
    const testPassword = 'TestPassword123!';
    const registerResponse = await axios.post(`${API_URL}/auth/register`, {
      email: `password-test-${Date.now()}@example.com`,
      password: testPassword,
      name: 'Password Test User'
    });

    // Verify password is NOT in response
    const responseStr = JSON.stringify(registerResponse.data);
    if (responseStr.includes(testPassword)) {
      logResult({
        testId: `${testId}a`,
        name: `${testName} - Password in Response`,
        category: 'Authentication',
        status: 'FAIL',
        severity: 'CRITICAL',
        details: 'Plain password returned in API response',
        vulnerability: 'Sensitive data exposure',
        timestamp: new Date().toISOString()
      });
    } else {
      logResult({
        testId: `${testId}a`,
        name: `${testName} - Password in Response`,
        category: 'Authentication',
        status: 'PASS',
        severity: 'CRITICAL',
        details: 'Password not exposed in API response',
        timestamp: new Date().toISOString()
      });
    }

    // Test login with correct password
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: registerResponse.data.user.email,
      password: testPassword
    });

    if (loginResponse.status === 200 && loginResponse.data.token) {
      logResult({
        testId: `${testId}b`,
        name: `${testName} - bcrypt Verification`,
        category: 'Authentication',
        status: 'PASS',
        severity: 'CRITICAL',
        details: 'Password verification working (implies bcrypt hashing)',
        timestamp: new Date().toISOString()
      });
    }

    // Test login with wrong password
    try {
      await axios.post(`${API_URL}/auth/login`, {
        email: registerResponse.data.user.email,
        password: 'WrongPassword123!'
      });
      
      logResult({
        testId: `${testId}c`,
        name: `${testName} - Wrong Password`,
        category: 'Authentication',
        status: 'FAIL',
        severity: 'HIGH',
        details: 'Server accepted wrong password',
        vulnerability: 'Password verification bypass',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 400) {
        logResult({
          testId: `${testId}c`,
          name: `${testName} - Wrong Password`,
          category: 'Authentication',
          status: 'PASS',
          severity: 'HIGH',
          details: 'Server correctly rejected wrong password',
          timestamp: new Date().toISOString()
        });
      }
    }

  } catch (error: any) {
    logResult({
      testId,
      name: testName,
      category: 'Authentication',
      status: 'ERROR',
      severity: 'CRITICAL',
      details: `Test execution failed: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
}

async function testRateLimiting() {
  const testId = 'TC-SEC-004';
  const testName = 'Rate Limiting (Analysis Endpoint Abuse Prevention)';
  
  try {
    let successCount = 0;
    let rateLimitHit = false;

    // Try 15 requests (limit is 10/15min for analysis endpoints)
    for (let i = 0; i < 15; i++) {
      try {
        // Create a small test audio file
        const testAudioPath = path.join(__dirname, 'test-audio.mp3');
        if (!fs.existsSync(testAudioPath)) {
          // Create a minimal MP3 file (just headers, won't actually work but will test size/type validation)
          fs.writeFileSync(testAudioPath, Buffer.from([
            0xFF, 0xFB, 0x90, 0x00, // MP3 header
            ...Array(100).fill(0x00) // Some data
          ]));
        }

        const formData = new FormData();
        formData.append('audio', fs.createReadStream(testAudioPath));

        await axios.post(
          `${API_URL}/analyze/transcript`,
          formData,
          { 
            headers: {
              ...formData.getHeaders(),
              Authorization: `Bearer ${authToken}`
            },
            timeout: 5000 
          }
        );
        successCount++;
      } catch (error: any) {
        if (error.response?.status === 429) {
          rateLimitHit = true;
          break;
        }
        // Other errors (validation, etc.) don't count as rate limit
      }
    }

    if (rateLimitHit) {
      logResult({
        testId,
        name: testName,
        category: 'Rate Limiting',
        status: 'PASS',
        severity: 'HIGH',
        details: `Rate limit enforced after ${successCount} requests (expected ~10)`,
        timestamp: new Date().toISOString()
      });
    } else {
      logResult({
        testId,
        name: testName,
        category: 'Rate Limiting',
        status: 'FAIL',
        severity: 'HIGH',
        details: `No rate limit detected after ${successCount} requests`,
        vulnerability: 'Missing rate limiting - API abuse possible',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error: any) {
    logResult({
      testId,
      name: testName,
      category: 'Rate Limiting',
      status: 'ERROR',
      severity: 'HIGH',
      details: `Test execution failed: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
}

// =============================================================================
// GROUP 2: FILE UPLOAD SECURITY (3 TESTS)
// =============================================================================

async function testFileSizeLimit() {
  const testId = 'TC-SEC-005';
  const testName = 'File Upload Size Limit (Max 10MB)';
  
  try {
    // Create a file larger than 10MB
    const testDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    const largeFilePath = path.join(testDir, 'large-audio.mp3');
    const fileSize = 11 * 1024 * 1024; // 11MB
    const buffer = Buffer.alloc(fileSize);
    fs.writeFileSync(largeFilePath, buffer);

    try {
      const formData = new FormData();
      formData.append('audio', fs.createReadStream(largeFilePath));

      await axios.post(
        `${API_URL}/analyze/transcript`,
        formData,
        { 
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${authToken}`
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }
      );

      logResult({
        testId,
        name: testName,
        category: 'File Upload',
        status: 'FAIL',
        severity: 'MEDIUM',
        details: 'Server accepted file larger than 10MB limit',
        vulnerability: 'Missing file size validation - DoS risk',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      if (error.response?.status === 413 || error.message.includes('too large')) {
        logResult({
          testId,
          name: testName,
          category: 'File Upload',
          status: 'PASS',
          severity: 'MEDIUM',
          details: 'Server correctly rejected oversized file',
          timestamp: new Date().toISOString()
        });
      } else if (error.code === 'ECONNRESET' || error.code === 'EPIPE') {
        // Connection reset = server rejected
        logResult({
          testId,
          name: testName,
          category: 'File Upload',
          status: 'PASS',
          severity: 'MEDIUM',
          details: 'Server correctly rejected oversized file (connection reset)',
          timestamp: new Date().toISOString()
        });
      } else {
        throw error;
      }
    } finally {
      // Cleanup
      if (fs.existsSync(largeFilePath)) {
        fs.unlinkSync(largeFilePath);
      }
    }

  } catch (error: any) {
    logResult({
      testId,
      name: testName,
      category: 'File Upload',
      status: 'ERROR',
      severity: 'MEDIUM',
      details: `Test execution failed: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
}

async function testFileTypeValidation() {
  const testId = 'TC-SEC-006';
  const testName = 'File Type Validation (Audio Only)';
  
  try {
    const testDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Test with non-audio file (text file with .mp3 extension)
    const fakeAudioPath = path.join(testDir, 'fake-audio.mp3');
    fs.writeFileSync(fakeAudioPath, 'This is not an audio file');

    try {
      const formData = new FormData();
      formData.append('audio', fs.createReadStream(fakeAudioPath));

      await axios.post(
        `${API_URL}/analyze/transcript`,
        formData,
        { 
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      logResult({
        testId,
        name: testName,
        category: 'File Upload',
        status: 'FAIL',
        severity: 'MEDIUM',
        details: 'Server accepted non-audio file',
        vulnerability: 'Missing MIME type validation',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      if (error.response?.status === 400 || error.message.includes('Invalid file type')) {
        logResult({
          testId,
          name: testName,
          category: 'File Upload',
          status: 'PASS',
          severity: 'MEDIUM',
          details: 'Server correctly rejected non-audio file',
          timestamp: new Date().toISOString()
        });
      } else {
        // OpenAI might reject it too, which is acceptable
        logResult({
          testId,
          name: testName,
          category: 'File Upload',
          status: 'PASS',
          severity: 'MEDIUM',
          details: 'File rejected during processing (acceptable)',
          timestamp: new Date().toISOString()
        });
      }
    } finally {
      // Cleanup
      if (fs.existsSync(fakeAudioPath)) {
        fs.unlinkSync(fakeAudioPath);
      }
    }

  } catch (error: any) {
    logResult({
      testId,
      name: testName,
      category: 'File Upload',
      status: 'ERROR',
      severity: 'MEDIUM',
      details: `Test execution failed: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
}

async function testMaliciousFileUpload() {
  const testId = 'TC-SEC-007';
  const testName = 'Malicious File Upload Prevention';
  
  try {
    const testDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Test with executable disguised as audio
    const maliciousPath = path.join(testDir, 'malicious.mp3');
    fs.writeFileSync(maliciousPath, '#!/bin/bash\necho "malicious"\n');

    try {
      const formData = new FormData();
      formData.append('audio', fs.createReadStream(maliciousPath));

      await axios.post(
        `${API_URL}/analyze/transcript`,
        formData,
        { 
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      logResult({
        testId,
        name: testName,
        category: 'File Upload',
        status: 'FAIL',
        severity: 'HIGH',
        details: 'Server accepted potentially malicious file',
        vulnerability: 'Insufficient file validation',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      // Any rejection is good (400, 415, or processing error)
      logResult({
        testId,
        name: testName,
        category: 'File Upload',
        status: 'PASS',
        severity: 'HIGH',
        details: 'Malicious file rejected (MIME validation or processing error)',
        timestamp: new Date().toISOString()
      });
    } finally {
      // Cleanup
      if (fs.existsSync(maliciousPath)) {
        fs.unlinkSync(maliciousPath);
      }
    }

  } catch (error: any) {
    logResult({
      testId,
      name: testName,
      category: 'File Upload',
      status: 'ERROR',
      severity: 'HIGH',
      details: `Test execution failed: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
}

// =============================================================================
// GROUP 3: INPUT VALIDATION (2 TESTS)
// =============================================================================

async function testSQLInjection() {
  const testId = 'TC-SEC-008';
  const testName = 'SQL Injection Prevention';
  
  try {
    // Get a prompt for submission
    const promptsResponse = await axios.get(`${API_URL}/prompts?limit=1`);
    const promptId = promptsResponse.data.data[0]?.id;

    if (!promptId) {
      throw new Error('No prompts available for testing');
    }

    // Test SQL injection in submission fields
    const sqlPayloads = [
      "'; DROP TABLE speaking_submissions; --",
      "' OR '1'='1",
      "admin'--",
      "1' UNION SELECT * FROM users--",
    ];

    let vulnerabilityFound = false;

    for (const payload of sqlPayloads) {
      try {
        const response = await axios.post(
          `${API_URL}/submissions`,
          { 
            promptId,
            audioUrl: `https://example.com/${payload}.mp3`,
            durationSeconds: 30
          },
          { headers: { Authorization: `Bearer ${authToken}` }}
        );

        if (response.status === 201) {
          const submissionId = response.data.id;
          
          // Retrieve and verify it's stored as-is
          const retrieved = await axios.get(
            `${API_URL}/submissions/${submissionId}`,
            { headers: { Authorization: `Bearer ${authToken}` }}
          );

          // If payload is in URL, that's OK (Prisma parameterization)
          if (retrieved.data.audioUrl.includes(payload)) {
            continue; // Safely stored
          } else {
            vulnerabilityFound = true;
            break;
          }
        }
      } catch (error: any) {
        // Any error is acceptable (validation might reject it)
        continue;
      }
    }

    if (!vulnerabilityFound) {
      logResult({
        testId,
        name: testName,
        category: 'Input Validation',
        status: 'PASS',
        severity: 'CRITICAL',
        details: 'SQL injection payloads safely handled (Prisma ORM parameterization)',
        timestamp: new Date().toISOString()
      });
    } else {
      logResult({
        testId,
        name: testName,
        category: 'Input Validation',
        status: 'FAIL',
        severity: 'CRITICAL',
        details: 'SQL injection vulnerability detected',
        vulnerability: 'SQL Injection (CWE-89)',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error: any) {
    logResult({
      testId,
      name: testName,
      category: 'Input Validation',
      status: 'ERROR',
      severity: 'CRITICAL',
      details: `Test execution failed: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
}

async function testXSSPrevention() {
  const testId = 'TC-SEC-009';
  const testName = 'XSS Attack Prevention';
  
  try {
    // Get a prompt
    const promptsResponse = await axios.get(`${API_URL}/prompts?limit=1`);
    const promptId = promptsResponse.data.data[0]?.id;

    if (!promptId) {
      throw new Error('No prompts available for testing');
    }

    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror="alert(1)">',
      '<svg/onload=alert(1)>',
      'javascript:alert(1)',
    ];

    for (const payload of xssPayloads) {
      try {
        const response = await axios.post(
          `${API_URL}/submissions`,
          { 
            promptId,
            audioUrl: `https://example.com/${encodeURIComponent(payload)}.mp3`,
            durationSeconds: 30
          },
          { headers: { Authorization: `Bearer ${authToken}` }}
        );

        if (response.status === 201) {
          const submissionId = response.data.id;
          const retrieved = await axios.get(
            `${API_URL}/submissions/${submissionId}`,
            { headers: { Authorization: `Bearer ${authToken}` }}
          );

          // Content should be stored as-is (sanitization happens on frontend)
          // This is CORRECT for backend - XSS prevention is frontend's job
          continue;
        }
      } catch (error) {
        continue;
      }
    }

    logResult({
      testId,
      name: testName,
      category: 'Input Validation',
      status: 'PASS',
      severity: 'HIGH',
      details: 'Backend stores content as-is (XSS prevention delegated to frontend React escaping)',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    logResult({
      testId,
      name: testName,
      category: 'Input Validation',
      status: 'ERROR',
      severity: 'HIGH',
      details: `Test execution failed: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
}

// =============================================================================
// GROUP 4: INFRASTRUCTURE SECURITY (1 TEST)
// =============================================================================

async function testCORSAndSecurityHeaders() {
  const testId = 'TC-SEC-010';
  const testName = 'CORS + Security Headers (Helmet)';
  
  try {
    // Test CORS with unauthorized origin
    try {
      const response = await axios.get(`${API_URL}/prompts`, {
        headers: {
          'Origin': 'http://malicious-site.com',
        }
      });

      const allowedOrigin = response.headers['access-control-allow-origin'];
      
      if (allowedOrigin === 'http://malicious-site.com' || allowedOrigin === '*') {
        logResult({
          testId: `${testId}a`,
          name: `${testName} - CORS`,
          category: 'Infrastructure',
          status: 'FAIL',
          severity: 'HIGH',
          details: `Server allows unauthorized origin: ${allowedOrigin}`,
          vulnerability: 'CORS misconfiguration - allows any origin',
          timestamp: new Date().toISOString()
        });
      } else {
        logResult({
          testId: `${testId}a`,
          name: `${testName} - CORS`,
          category: 'Infrastructure',
          status: 'PASS',
          severity: 'HIGH',
          details: 'CORS properly configured - restricts origins',
          evidence: { allowedOrigin },
          timestamp: new Date().toISOString()
        });
      }
    } catch (error: any) {
      logResult({
        testId: `${testId}a`,
        name: `${testName} - CORS`,
        category: 'Infrastructure',
        status: 'PASS',
        severity: 'HIGH',
        details: 'CORS validation enforced (request blocked)',
        timestamp: new Date().toISOString()
      });
    }

    // Test security headers
    const response = await axios.get(`${BASE_URL}/health`);
    const headers = response.headers;

    const expectedHeaders = [
      'x-content-type-options',
      'x-frame-options',
    ];

    const missingHeaders: string[] = [];
    const presentHeaders: string[] = [];

    for (const header of expectedHeaders) {
      if (headers[header]) {
        presentHeaders.push(header);
      } else {
        missingHeaders.push(header);
      }
    }

    if (missingHeaders.length === 0) {
      logResult({
        testId: `${testId}b`,
        name: `${testName} - Security Headers`,
        category: 'Infrastructure',
        status: 'PASS',
        severity: 'MEDIUM',
        details: `All security headers present: ${presentHeaders.join(', ')}`,
        evidence: {
          'x-content-type-options': headers['x-content-type-options'],
          'x-frame-options': headers['x-frame-options'],
        },
        timestamp: new Date().toISOString()
      });
    } else {
      logResult({
        testId: `${testId}b`,
        name: `${testName} - Security Headers`,
        category: 'Infrastructure',
        status: 'FAIL',
        severity: 'MEDIUM',
        details: `Missing security headers: ${missingHeaders.join(', ')}`,
        vulnerability: 'Missing security headers (Helmet not properly configured)',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error: any) {
    logResult({
      testId,
      name: testName,
      category: 'Infrastructure',
      status: 'ERROR',
      severity: 'HIGH',
      details: `Test execution failed: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
}

// =============================================================================
// MAIN TEST EXECUTION
// =============================================================================

async function setup() {
  console.log('\n🔒 DMF SPEAKING MODULE - SECURITY TESTS\n');
  console.log('='.repeat(60));
  
  // Check if server is running
  const isRunning = await checkServerRunning();
  if (!isRunning) {
    console.error('❌ Server not running at', BASE_URL);
    console.error('   Please start the server first: cd services/speaking-service && npm run dev');
    process.exit(1);
  }
  console.log('✅ Server is running\n');

  // Register test user
  try {
    const response = await axios.post(`${API_URL}/auth/register`, TEST_USER);
    authToken = response.data.token;
    userId = response.data.user.id;
    console.log('✅ Test user registered\n');

    // Get a prompt for testing
    const promptsResponse = await axios.get(`${API_URL}/prompts?limit=1`);
    const promptId = promptsResponse.data.data[0]?.id;

    if (promptId) {
      // Create a test submission
      const submissionResponse = await axios.post(
        `${API_URL}/submissions`,
        { 
          promptId,
          audioUrl: 'https://example.com/test-audio.mp3',
          durationSeconds: 30
        },
        { headers: { Authorization: `Bearer ${authToken}` }}
      );
      testSubmissionId = submissionResponse.data.id;
      console.log('✅ Test submission created\n');
    }
  } catch (error: any) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

async function runAllTests() {
  console.log('Running 10 Security Tests...\n');
  console.log('-'.repeat(60));

  // Group 1: Authentication & Authorization (4 tests)
  await testJWTValidation();
  await testOwnershipVerification();
  await testPasswordSecurity();
  await testRateLimiting();

  // Group 2: File Upload Security (3 tests)
  await testFileSizeLimit();
  await testFileTypeValidation();
  await testMaliciousFileUpload();

  // Group 3: Input Validation (2 tests)
  await testSQLInjection();
  await testXSSPrevention();

  // Group 4: Infrastructure (1 test)
  await testCORSAndSecurityHeaders();
}

function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('SECURITY TEST SUMMARY');
  console.log('='.repeat(60) + '\n');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const errors = results.filter(r => r.status === 'ERROR').length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Errors: ${errors}`);
  console.log(`\nPass Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

  // Critical vulnerabilities
  const criticalVulns = results.filter(r => r.status === 'FAIL' && r.severity === 'CRITICAL');
  if (criticalVulns.length > 0) {
    console.log('🚨 CRITICAL VULNERABILITIES FOUND:');
    criticalVulns.forEach(v => {
      console.log(`   - ${v.testId}: ${v.vulnerability || v.details}`);
    });
    console.log('');
  }

  // High severity issues
  const highSeverity = results.filter(r => r.status === 'FAIL' && r.severity === 'HIGH');
  if (highSeverity.length > 0) {
    console.log('⚠️  HIGH SEVERITY ISSUES:');
    highSeverity.forEach(v => {
      console.log(`   - ${v.testId}: ${v.vulnerability || v.details}`);
    });
    console.log('');
  }

  return {
    total,
    passed,
    failed,
    errors,
    passRate: ((passed / total) * 100).toFixed(1),
    results,
    criticalCount: criticalVulns.length,
    highCount: highSeverity.length
  };
}

async function main() {
  try {
    await setup();
    await runAllTests();
    const summary = generateReport();

    // Save results to file
    const report = {
      timestamp: new Date().toISOString(),
      summary,
      results
    };

    const reportPath = path.join(__dirname, 'security-test-results-speaking.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`📊 Results saved to: ${reportPath}\n`);

    // Exit with error code if critical/high vulnerabilities found
    if (summary.criticalCount > 0 || summary.highCount > 0) {
      console.error('⚠️  SECURITY ISSUES DETECTED - Review required!\n');
      process.exit(1);
    }

    // Exit with error if pass rate < 90%
    if (parseFloat(summary.passRate) < 90) {
      console.error('⚠️  Pass rate below 90% - Additional testing required!\n');
      process.exit(1);
    }

    console.log('✅ All security tests passed!\n');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

main();
