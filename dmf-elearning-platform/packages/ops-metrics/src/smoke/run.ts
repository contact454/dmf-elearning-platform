/**
 * Ops Smoke Check
 * 
 * Verifies that services are running and metrics are being collected.
 */

const SERVICES = [
  { name: 'practice', url: 'http://localhost:3001' },
  { name: 'onboarding', url: 'http://localhost:3002' },
  { name: 'curriculum', url: 'http://localhost:3003' },
];

async function checkHealth(service: { name: string; url: string }): Promise<boolean> {
  try {
    const response = await fetch(`${service.url}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function checkMetrics(service: { name: string; url: string }): Promise<{ hasMetrics: boolean; metricCount: number }> {
  try {
    const response = await fetch(`${service.url}/metrics`, {
      signal: AbortSignal.timeout(2000),
    });
    
    if (!response.ok) {
      return { hasMetrics: false, metricCount: 0 };
    }
    
    const text = await response.text();
    const lines = text.split('\n').filter((line) => line.trim() && !line.startsWith('#'));
    const metricCount = lines.length;
    
    // Check for expected metrics
    const hasHttpMetrics = text.includes('http_requests_total');
    const hasEventMetrics = text.includes('events_consumed_total') || text.includes('events_published_total');
    
    return {
      hasMetrics: hasHttpMetrics || hasEventMetrics,
      metricCount,
    };
  } catch {
    return { hasMetrics: false, metricCount: 0 };
  }
}

async function runSmokeCheck(): Promise<void> {
  console.log('🔍 Running Ops Smoke Check...\n');

  // Step 1: Check health
  console.log('Step 1: Checking service health...');
  const healthResults = await Promise.all(
    SERVICES.map(async (service) => {
      const healthy = await checkHealth(service);
      console.log(`  ${service.name}: ${healthy ? '✅' : '❌'}`);
      return { service, healthy };
    })
  );

  const unhealthy = healthResults.filter((r) => !r.healthy);
  if (unhealthy.length > 0) {
    console.error(`\n❌ ${unhealthy.length} service(s) not healthy:`);
    unhealthy.forEach((r) => console.error(`  - ${r.service.name} (${r.service.url})`));
    process.exit(1);
  }

  // Step 2: Check metrics
  console.log('\nStep 2: Checking metrics endpoints...');
  const metricsResults = await Promise.all(
    SERVICES.map(async (service) => {
      const result = await checkMetrics(service);
      console.log(`  ${service.name}: ${result.hasMetrics ? '✅' : '⚠️'} (${result.metricCount} metrics)`);
      return { service, ...result };
    })
  );

  const noMetrics = metricsResults.filter((r) => !r.hasMetrics);
  if (noMetrics.length > 0) {
    console.warn(`\n⚠️  ${noMetrics.length} service(s) have no metrics yet (may need traffic):`);
    noMetrics.forEach((r) => console.warn(`  - ${r.service.name}`));
  }

  // Step 3: Hit a few routes to generate metrics
  console.log('\nStep 3: Generating metrics by hitting routes...');
  
  try {
    // Health check (should increment http_requests_total)
    await fetch('http://localhost:3001/health');
    await fetch('http://localhost:3002/health');
    await fetch('http://localhost:3003/health');
    console.log('  ✅ Health checks completed');
  } catch (error) {
    console.error(`  ❌ Failed to hit health endpoints: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Step 4: Verify metrics after traffic
  console.log('\nStep 4: Verifying metrics after traffic...');
  await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay for metrics update
  
  const finalMetricsResults = await Promise.all(
    SERVICES.map(async (service) => {
      const result = await checkMetrics(service);
      return { service, ...result };
    })
  );

  const allHaveMetrics = finalMetricsResults.every((r) => r.hasMetrics);
  if (!allHaveMetrics) {
    console.warn('\n⚠️  Some services still have no metrics (may be normal if no events published yet)');
  } else {
    console.log('\n✅ All services have metrics');
  }

  console.log('\n✅ Ops smoke check completed');
}

runSmokeCheck().catch((error) => {
  console.error('❌ Smoke check failed:', error);
  process.exit(1);
});
