/**
 * One-command local E2E runner
 * Starts services, waits for readiness, runs tests, shuts down cleanly
 */

import { startAllServices, stopAllServices } from './start-services.js';
import { waitForAllServices } from './utils/health-check.js';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '../../..');

const SERVICES = [
  { name: 'onboarding', url: 'http://localhost:3002' },
  { name: 'curriculum', url: 'http://localhost:3003' },
  { name: 'practice', url: 'http://localhost:3001' },
  { name: 'progress', url: 'http://localhost:3004' },
  { name: 'motivation-progress', url: 'http://localhost:3005' },
  { name: 'assessment', url: 'http://localhost:3006' },
];

async function main(): Promise<void> {
  console.log('🚀 E2E Local Runner\n');

  let servicesStarted = false;

  try {
    // Step 1: Start services
    console.log('Step 1: Starting services...');
    const serviceProcesses = startAllServices();
    servicesStarted = true;

    // Step 2: Wait for services to be ready
    console.log('\nStep 2: Waiting for services to be ready...');
    await waitForAllServices(SERVICES, {
      timeoutMs: 120000,
      perServiceTimeoutMs: {
        'motivation-progress': 120000,
      },
      intervalMs: 500,
      verbose: true,
    });

    // Step 3: Run E2E tests
    console.log('\nStep 3: Running E2E tests...\n');
    await new Promise<void>((resolve, reject) => {
      const testProcess = spawn('tsx', ['src/run.ts'], {
        cwd: join(__dirname, '..'),
        stdio: 'inherit',
        env: {
          ...process.env,
          DMF_MODE: 'e2e',
        },
      });

      testProcess.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`E2E tests failed with exit code ${code}`));
        }
      });

      testProcess.on('error', reject);
    });

    console.log('\n✅ E2E local run completed successfully');
  } catch (error) {
    console.error('\n❌ E2E local run failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    // Step 4: Shutdown services
    if (servicesStarted) {
      console.log('\nStep 4: Shutting down services...');
      await stopAllServices();
    }
  }
}

main();
