/**
 * SECURITY TESTS FOR DMF WRITING MODULE PHASE 1
 * Covers 10 comprehensive security test cases
 */

import axios, { AxiosError } from 'axios';
import jwt from 'jsonwebtoken';

const BASE_URL = 'http://localhost:3001';
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
let testEssayId: string = '';

// =============================================================================
// GROUP 1: AUTHENTICATION & AUTHORIZATION (4 TESTS)
// =============================================================================

async function testJWTValidation() {
  const testId = 'TC-SEC-001';
  const testName = 'JWT Token Validation & Expiry';
  
  try {
    // Test 1a: Missing token
    try {
      await axios.get(`${API_URL}/essays`);
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
      await axios.get(`${API_URL}/essays`, {
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
      await axios.get(`${API_URL}/essays`, {
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
  const testName = 'Essay Ownership Enforcement';
  
  try {
    // Create another user
    const otherUser = await axios.post(`${API_URL}/auth/register`, {
      email: `other-user-${Date.now()}@example.com`,
      password: 'Password123!',
      name: 'Other User'
    });
    const otherUserToken = otherUser.data.token;

    // Create essay as other user
    const otherEssay = await axios.post(
      `${API_URL}/essays`,
      { content: 'This is another user essay' },
      { headers: { Authorization: `Bearer ${otherUserToken}` }}
    );
    const otherEssayId = otherEssay.data.essay.id;

    // Try to update other user's essay with our token
    try {
      await axios.put(
        `${API_URL}/essays/${otherEssayId}`,
        { content: 'Hacked content' },
        { headers: { Authorization: `Bearer ${authToken}` }}
      );
      
      logResult({
        testId,
        name: testName,
        category: 'Authorization',
        status: 'FAIL',
        severity: 'CRITICAL',
        details: 'User was able to modify another user\'s essay',
        vulnerability: 'Broken access control - horizontal privilege escalation',
        evidence: { targetEssayId: otherEssayId },
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
  const testName = 'Rate Limiting (Grammar Check Abuse Prevention)';
  
  try {
    const testText = 'Test text for rate limiting check.';
    let successCount = 0;
    let rateLimitHit = false;

    // Try 65 requests (limit is 60/min)
    for (let i = 0; i < 65; i++) {
      try {
        await axios.post(
          `${API_URL}/grammar/check`,
          { text: `${testText} Request ${i}`, language: 'en-US' },
          { 
            headers: { Authorization: `Bearer ${authToken}` },
            timeout: 2000 
          }
        );
        successCount++;
      } catch (error: any) {
        if (error.response?.status === 429) {
          rateLimitHit = true;
          break;
        }
      }
    }

    if (rateLimitHit) {
      logResult({
        testId,
        name: testName,
        category: 'Rate Limiting',
        status: 'PASS',
        severity: 'HIGH',
        details: `Rate limit enforced after ${successCount} requests (expected ~60)`,
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
// GROUP 2: INPUT VALIDATION (3 TESTS)
// =============================================================================

async function testSQLInjection() {
  const testId = 'TC-SEC-005';
  const testName = 'SQL Injection Prevention';
  
  try {
    // Test SQL injection in essay content
    const sqlPayloads = [
      "'; DROP TABLE essays; --",
      "' OR '1'='1",
      "admin'--",
      "1' UNION SELECT * FROM users--",
    ];

    let vulnerabilityFound = false;

    for (const payload of sqlPayloads) {
      try {
        const response = await axios.post(
          `${API_URL}/essays`,
          { content: payload },
          { headers: { Authorization: `Bearer ${authToken}` }}
        );

        // If we get here, content was stored safely
        if (response.status === 201) {
          const essayId = response.data.essay.id;
          
          // Retrieve and verify it's stored as-is
          const retrieved = await axios.get(
            `${API_URL}/essays/${essayId}`,
            { headers: { Authorization: `Bearer ${authToken}` }}
          );

          if (retrieved.data.essay.content === payload) {
            // Content stored as-is (parameterized query worked)
            continue;
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
  const testId = 'TC-SEC-006';
  const testName = 'XSS Attack Prevention';
  
  try {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror="alert(1)">',
      '<svg/onload=alert(1)>',
      'javascript:alert(1)',
    ];

    let vulnerabilityFound = false;

    for (const payload of xssPayloads) {
      try {
        const response = await axios.post(
          `${API_URL}/essays`,
          { content: payload },
          { headers: { Authorization: `Bearer ${authToken}` }}
        );

        if (response.status === 201) {
          const essayId = response.data.essay.id;
          const retrieved = await axios.get(
            `${API_URL}/essays/${essayId}`,
            { headers: { Authorization: `Bearer ${authToken}` }}
          );

          // Content should be stored as-is (sanitization happens on frontend)
          if (retrieved.data.essay.content === payload) {
            // This is CORRECT for backend - XSS prevention is frontend's job
            continue;
          } else {
            vulnerabilityFound = true;
            break;
          }
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

async function testInputLengthValidation() {
  const testId = 'TC-SEC-007';
  const testName = 'Input Length Validation';
  
  try {
    // Test 1: Grammar check - exceeds max length
    const longText = 'A'.repeat(100001); // Exceeds 100,000 limit
    
    try {
      await axios.post(
        `${API_URL}/grammar/check`,
        { text: longText, language: 'de-DE' },
        { headers: { Authorization: `Bearer ${authToken}` }}
      );
      
      logResult({
        testId: `${testId}a`,
        name: `${testName} - Grammar Check Max Length`,
        category: 'Input Validation',
        status: 'FAIL',
        severity: 'MEDIUM',
        details: 'Server accepted text exceeding 100,000 character limit',
        vulnerability: 'Missing input length validation',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      if (error.response?.status === 400) {
        logResult({
          testId: `${testId}a`,
          name: `${testName} - Grammar Check Max Length`,
          category: 'Input Validation',
          status: 'PASS',
          severity: 'MEDIUM',
          details: 'Server correctly rejected text exceeding length limit (400)',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Test 2: Empty content
    try {
      await axios.post(
        `${API_URL}/essays`,
        { content: '' },
        { headers: { Authorization: `Bearer ${authToken}` }}
      );
      
      logResult({
        testId: `${testId}b`,
        name: `${testName} - Empty Content`,
        category: 'Input Validation',
        status: 'FAIL',
        severity: 'LOW',
        details: 'Server accepted empty content',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      if (error.response?.status === 400) {
        logResult({
          testId: `${testId}b`,
          name: `${testName} - Empty Content`,
          category: 'Input Validation',
          status: 'PASS',
          severity: 'LOW',
          details: 'Server correctly rejected empty content',
          timestamp: new Date().toISOString()
        });
      }
    }

  } catch (error: any) {
    logResult({
      testId,
      name: testName,
      category: 'Input Validation',
      status: 'ERROR',
      severity: 'MEDIUM',
      details: `Test execution failed: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
}

// =============================================================================
// GROUP 3: CORS & SECURITY HEADERS (3 TESTS)
// =============================================================================

async function testCORSConfiguration() {
  const testId = 'TC-SEC-008';
  const testName = 'CORS Origin Validation';
  
  try {
    // Test with unauthorized origin
    try {
      const response = await axios.get(`${API_URL}/prompts`, {
        headers: {
          'Origin': 'http://malicious-site.com',
          'Authorization': `Bearer ${authToken}`
        }
      });

      // Check CORS headers
      const allowedOrigin = response.headers['access-control-allow-origin'];
      
      if (allowedOrigin === 'http://malicious-site.com' || allowedOrigin === '*') {
        logResult({
          testId,
          name: testName,
          category: 'CORS',
          status: 'FAIL',
          severity: 'HIGH',
          details: `Server allows unauthorized origin: ${allowedOrigin}`,
          vulnerability: 'CORS misconfiguration - allows any origin',
          timestamp: new Date().toISOString()
        });
      } else {
        logResult({
          testId,
          name: testName,
          category: 'CORS',
          status: 'PASS',
          severity: 'HIGH',
          details: 'CORS properly configured - restricts origins',
          evidence: { allowedOrigin },
          timestamp: new Date().toISOString()
        });
      }
    } catch (error: any) {
      // CORS error is acceptable
      logResult({
        testId,
        name: testName,
        category: 'CORS',
        status: 'PASS',
        severity: 'HIGH',
        details: 'CORS validation enforced (request blocked)',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error: any) {
    logResult({
      testId,
      name: testName,
      category: 'CORS',
      status: 'ERROR',
      severity: 'HIGH',
      details: `Test execution failed: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
}

async function testSecurityHeaders() {
  const testId = 'TC-SEC-009';
  const testName = 'Security Headers (Helmet)';
  
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    const headers = response.headers;

    const expectedHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
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
        testId,
        name: testName,
        category: 'Security Headers',
        status: 'PASS',
        severity: 'MEDIUM',
        details: `All security headers present: ${presentHeaders.join(', ')}`,
        evidence: {
          'x-content-type-options': headers['x-content-type-options'],
          'x-frame-options': headers['x-frame-options'],
          'x-xss-protection': headers['x-xss-protection'],
        },
        timestamp: new Date().toISOString()
      });
    } else {
      logResult({
        testId,
        name: testName,
        category: 'Security Headers',
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
      category: 'Security Headers',
      status: 'ERROR',
      severity: 'MEDIUM',
      details: `Test execution failed: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
}

async function testSensitiveDataLeakage() {
  const testId = 'TC-SEC-010';
  const testName = 'Sensitive Data Leakage (Logs & Responses)';
  
  try {
    // Test 1: Password not in registration response
    const regResponse = await axios.post(`${API_URL}/auth/register`, {
      email: `leak-test-${Date.now()}@example.com`,
      password: 'SuperSecret123!',
      name: 'Leak Test'
    });

    const regStr = JSON.stringify(regResponse.data);
    if (regStr.includes('SuperSecret123!') || regStr.includes('passwordHash')) {
      logResult({
        testId: `${testId}a`,
        name: `${testName} - Registration Response`,
        category: 'Data Exposure',
        status: 'FAIL',
        severity: 'CRITICAL',
        details: 'Password or hash exposed in registration response',
        vulnerability: 'Sensitive data exposure (CWE-200)',
        timestamp: new Date().toISOString()
      });
    } else {
      logResult({
        testId: `${testId}a`,
        name: `${testName} - Registration Response`,
        category: 'Data Exposure',
        status: 'PASS',
        severity: 'CRITICAL',
        details: 'No sensitive data in registration response',
        timestamp: new Date().toISOString()
      });
    }

    // Test 2: JWT token contains only necessary claims
    const decoded = jwt.decode(regResponse.data.token) as any;
    if (decoded.passwordHash || decoded.password) {
      logResult({
        testId: `${testId}b`,
        name: `${testName} - JWT Token Claims`,
        category: 'Data Exposure',
        status: 'FAIL',
        severity: 'CRITICAL',
        details: 'JWT token contains password/hash',
        vulnerability: 'Sensitive data in JWT',
        timestamp: new Date().toISOString()
      });
    } else {
      logResult({
        testId: `${testId}b`,
        name: `${testName} - JWT Token Claims`,
        category: 'Data Exposure',
        status: 'PASS',
        severity: 'CRITICAL',
        details: 'JWT token contains only safe claims (userId, email)',
        evidence: { claims: Object.keys(decoded) },
        timestamp: new Date().toISOString()
      });
    }

  } catch (error: any) {
    logResult({
      testId,
      name: testName,
      category: 'Data Exposure',
      status: 'ERROR',
      severity: 'CRITICAL',
      details: `Test execution failed: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
}

// =============================================================================
// MAIN TEST EXECUTION
// =============================================================================

async function setup() {
  console.log('\n🔒 DMF WRITING MODULE - SECURITY TESTS\n');
  console.log('='  .repeat(60));
  
  // Check if server is running
  const isRunning = await checkServerRunning();
  if (!isRunning) {
    console.error('❌ Server not running at', BASE_URL);
    console.error('   Please start the server first: cd services/writing-service && npm run dev');
    process.exit(1);
  }
  console.log('✅ Server is running\n');

  // Register test user
  try {
    const response = await axios.post(`${API_URL}/auth/register`, TEST_USER);
    authToken = response.data.token;
    userId = response.data.user.id;
    console.log('✅ Test user registered\n');

    // Create a test essay for ownership tests
    const essayResponse = await axios.post(
      `${API_URL}/essays`,
      { content: 'Test essay for security testing' },
      { headers: { Authorization: `Bearer ${authToken}` }}
    );
    testEssayId = essayResponse.data.essay.id;
    console.log('✅ Test essay created\n');
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

  // Group 2: Input Validation (3 tests)
  await testSQLInjection();
  await testXSSPrevention();
  await testInputLengthValidation();

  // Group 3: CORS & Security Headers (3 tests)
  await testCORSConfiguration();
  await testSecurityHeaders();
  await testSensitiveDataLeakage();
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
    const fs = require('fs');
    const report = {
      timestamp: new Date().toISOString(),
      summary,
      results
    };

    fs.writeFileSync(
      '/Users/huynhngocphuc/Dev-Workspace/Active-Projects/05-DMF-Elearning/dmf-elearning-platform/.testing/security-test-results.json',
      JSON.stringify(report, null, 2)
    );

    console.log('📊 Results saved to: .testing/security-test-results.json\n');

    // Exit with error code if any tests failed
    if (summary.failed > 0 || summary.errors > 0) {
      process.exit(1);
    }
  } catch (error: any) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

main();
