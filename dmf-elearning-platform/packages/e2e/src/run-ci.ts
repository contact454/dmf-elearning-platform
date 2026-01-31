/**
 * CI E2E runner
 * Starts services, runs tests, collects logs, always shuts down
 */

import { startAllServices, stopAllServices } from './start-services.js';
import { waitForAllServices } from './utils/health-check.js';
import { spawn } from 'child_process';
import { mkdir, writeFile } from 'fs/promises';
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
  { name: 'assessment', url: 'http://localhost:3006' },
];

interface ServiceLogs {
  [serviceName: string]: string[];
}

const serviceLogs: ServiceLogs = {};

async function main(): Promise<void> {
  console.log('🚀 E2E CI Runner\n');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const artifactsDir = join(ROOT_DIR, 'artifacts', 'e2e-logs', timestamp);
  let servicesStarted = false;

  try {
    // Create artifacts directory
    await mkdir(artifactsDir, { recursive: true });

    // Step 1: Start services with log capture
    console.log('Step 1: Starting services...');
    const serviceProcesses = startAllServices();
    servicesStarted = true;

    // Capture logs
    serviceProcesses.forEach((svc) => {
      serviceLogs[svc.name] = [];
      svc.process.stdout?.on('data', (data) => {
        const log = data.toString();
        serviceLogs[svc.name].push(log);
      });
      svc.process.stderr?.on('data', (data) => {
        const log = data.toString();
        serviceLogs[svc.name].push(log);
      });
    });

    // Step 2: Wait for services to be ready
    console.log('\nStep 2: Waiting for services to be ready...');
    await waitForAllServices(SERVICES, {
      timeoutMs: 60000, // Longer timeout for CI
      intervalMs: 500,
      verbose: true,
    });

    // Step 3: Run E2E tests
    console.log('\nStep 3: Running E2E tests...\n');
    let testExitCode = 1;
    const testOutput: string[] = [];

    await new Promise<void>((resolve) => {
      const testProcess = spawn('tsx', ['src/run.ts'], {
        cwd: join(__dirname, '..'),
        stdio: 'pipe',
        env: {
          ...process.env,
          DMF_MODE: 'e2e',
        },
      });

      testProcess.stdout?.on('data', (data) => {
        const output = data.toString();
        process.stdout.write(output);
        testOutput.push(output);
      });

      testProcess.stderr?.on('data', (data) => {
        const output = data.toString();
        process.stderr.write(output);
        testOutput.push(output);
      });

      testProcess.on('exit', (code) => {
        testExitCode = code || 1;
        resolve();
      });

      testProcess.on('error', (error) => {
        testOutput.push(`Test process error: ${error.message}\n`);
        resolve();
      });
    });

    // Step 4: Save logs
    console.log('\nStep 4: Saving logs to artifacts...');
    for (const [serviceName, logs] of Object.entries(serviceLogs)) {
      const logFile = join(artifactsDir, `${serviceName}.log`);
      await writeFile(logFile, logs.join(''), 'utf-8');
    }

    const testLogFile = join(artifactsDir, 'e2e-test.log');
    await writeFile(testLogFile, testOutput.join(''), 'utf-8');

    console.log(`Logs saved to: ${artifactsDir}`);

    if (testExitCode !== 0) {
      throw new Error(`E2E tests failed with exit code ${testExitCode}`);
    }

    console.log('\n✅ E2E CI run completed successfully');
  } catch (error) {
    console.error('\n❌ E2E CI run failed:', error instanceof Error ? error.message : String(error));
    
    // Save error logs even on failure
    if (servicesStarted) {
      try {
        const errorLogFile = join(artifactsDir, 'error.log');
        await writeFile(
          errorLogFile,
          `Error: ${error instanceof Error ? error.message : String(error)}\n\n` +
            `Service logs:\n${JSON.stringify(serviceLogs, null, 2)}`,
          'utf-8'
        );
      } catch {
        // Ignore log save errors
      }
    }

    process.exit(1);
  } finally {
    // Always shutdown services
    if (servicesStarted) {
      console.log('\nStep 5: Shutting down services...');
      await stopAllServices();
    }
  }
}

main();
