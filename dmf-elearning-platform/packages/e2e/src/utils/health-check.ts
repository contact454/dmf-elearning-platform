/**
 * Health check utilities for E2E runner
 */

export interface ServiceHealth {
  service: string;
  url: string;
  healthy: boolean;
  status?: number;
  error?: string;
}

export interface HealthCheckOptions {
  timeoutMs?: number;
  intervalMs?: number;
  verbose?: boolean;
  perServiceTimeoutMs?: Record<string, number>;
}

const DEFAULT_TIMEOUT_MS = 30000; // 30 seconds
const DEFAULT_INTERVAL_MS = 500; // 500ms

/**
 * Check if a single service is healthy
 */
export async function checkServiceHealth(
  serviceName: string,
  baseUrl: string,
  options: HealthCheckOptions = {}
): Promise<ServiceHealth> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, intervalMs = DEFAULT_INTERVAL_MS, verbose = false } = options;
  const startTime = Date.now();
  const healthUrl = `${baseUrl}/health`;

  while (Date.now() - startTime < timeoutMs) {
    try {
      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(2000), // 2s per request timeout
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        const statusValue = typeof data.status === 'string' ? data.status.toLowerCase() : '';
        if (data.ok === true || statusValue === 'ok') {
          return {
            service: serviceName,
            url: baseUrl,
            healthy: true,
            status: response.status,
          };
        }
      }

      if (verbose) {
        console.log(`[HealthCheck] ${serviceName} not ready: ${response.status}`);
      }
    } catch (error) {
      if (verbose) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`[HealthCheck] ${serviceName} error: ${errorMessage}`);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return {
    service: serviceName,
    url: baseUrl,
    healthy: false,
    error: `Timeout after ${timeoutMs}ms`,
  };
}

/**
 * Wait for all services to be healthy
 */
export async function waitForAllServices(
  services: Array<{ name: string; url: string }>,
  options: HealthCheckOptions = {}
): Promise<void> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, verbose = true, perServiceTimeoutMs } = options;
  const startTime = Date.now();

  if (verbose) {
    console.log(`\n[HealthCheck] Waiting for ${services.length} services to be ready...`);
  }

  while (Date.now() - startTime < timeoutMs) {
    const results = await Promise.all(
      services.map((svc) =>
        checkServiceHealth(svc.name, svc.url, {
          ...options,
          timeoutMs: perServiceTimeoutMs?.[svc.name] ?? timeoutMs,
          verbose: false,
        })
      )
    );
    const healthy = results.filter((r) => r.healthy);
    const unhealthy = results.filter((r) => !r.healthy);

    if (unhealthy.length === 0) {
      if (verbose) {
        console.log(`[HealthCheck] ✅ All services ready (${healthy.length}/${services.length})`);
      }
      return;
    }

    if (verbose) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      console.log(
        `[HealthCheck] Waiting... (${elapsed}s/${Math.floor(timeoutMs / 1000)}s) - ` +
          `Ready: ${healthy.length}/${services.length}, ` +
          `Pending: ${unhealthy.map((r) => r.service).join(', ')}`
      );
    }

    await new Promise((resolve) => setTimeout(resolve, options.intervalMs || DEFAULT_INTERVAL_MS));
  }

  // Final check
  const finalResults = await Promise.all(
    services.map((svc) =>
      checkServiceHealth(svc.name, svc.url, {
        ...options,
        timeoutMs: perServiceTimeoutMs?.[svc.name] ?? timeoutMs,
        verbose: false,
      })
    )
  );
  const unhealthy = finalResults.filter((r) => !r.healthy);

  if (unhealthy.length > 0) {
    const errors = unhealthy.map((r) => `  - ${r.service} (${r.url}): ${r.error || 'not ready'}`).join('\n');
    throw new Error(
      `Services not ready after ${timeoutMs}ms:\n${errors}\n\n` +
        `Make sure services are running:\n` +
        `  pnpm dev:e2e\n` +
        `Or check individual health endpoints:\n` +
        unhealthy.map((r) => `  curl ${r.url}/health`).join('\n')
    );
  }
}
