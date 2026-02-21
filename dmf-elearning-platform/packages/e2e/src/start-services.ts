/**
 * Start services in E2E mode (non-watch)
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '../../..');

interface ServiceProcess {
  name: string;
  process: ReturnType<typeof spawn>;
}

const services: ServiceProcess[] = [];

/**
 * Start a single service in E2E mode
 */
function startService(name: string, port: number): ServiceProcess {
  const serviceProcess = spawn('pnpm', ['--filter', `@dmf/${name}`, 'dev:e2e'], {
    cwd: ROOT_DIR,
    stdio: 'pipe',
    env: {
      ...process.env,
      DMF_MODE: 'e2e',
      NODE_ENV: 'e2e',
      [`DMF_PORT_${name.toUpperCase().replace('-', '_')}`]: String(port),
    },
  });

  serviceProcess.stdout?.on('data', (data) => {
    process.stdout.write(`[${name}] ${data}`);
  });

  serviceProcess.stderr?.on('data', (data) => {
    process.stderr.write(`[${name}] ${data}`);
  });

  return { name, process: serviceProcess };
}

/**
 * Start all services
 */
export function startAllServices(): ServiceProcess[] {
  const serviceConfigs = [
    { name: 'onboarding-service', port: 3002 },
    { name: 'curriculum-service', port: 3013 },
    { name: 'practice-service', port: 3001 },
    { name: 'progress-service', port: 3004 },
    { name: 'motivation-progress-service', port: 3005 },
    { name: 'assessment-service', port: 3014 },
  ];

  console.log('Starting services in E2E mode...\n');

  for (const config of serviceConfigs) {
    const svc = startService(config.name, config.port);
    services.push(svc);
  }

  return services;
}

/**
 * Stop all services
 */
export function stopAllServices(): Promise<void> {
  return new Promise((resolve) => {
    console.log('\nStopping services...');

    let stopped = 0;
    const total = services.length;

    if (total === 0) {
      resolve();
      return;
    }

    for (const svc of services) {
      // Try graceful shutdown first
      svc.process.kill('SIGTERM');

      // Force kill after 5 seconds if still running
      setTimeout(() => {
        if (!svc.process.killed) {
          svc.process.kill('SIGKILL');
        }
      }, 5000);

      svc.process.on('exit', () => {
        stopped++;
        if (stopped === total) {
          console.log('All services stopped');
          resolve();
        }
      });
    }

    // Fallback timeout
    setTimeout(() => {
      if (stopped < total) {
        console.log(`Force stopping remaining services (${total - stopped} still running)`);
        services.forEach((svc) => {
          if (!svc.process.killed) {
            svc.process.kill('SIGKILL');
          }
        });
        resolve();
      }
    }, 10000);
  });
}

/**
 * Handle process signals
 */
process.on('SIGINT', async () => {
  await stopAllServices();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await stopAllServices();
  process.exit(0);
});
