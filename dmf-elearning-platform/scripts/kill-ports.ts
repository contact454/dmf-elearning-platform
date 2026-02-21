#!/usr/bin/env tsx
/**
 * Kill processes on specified ports (macOS/Linux compatible)
 * 
 * Usage: tsx scripts/kill-ports.ts [port1] [port2] ...
 * Default: kills ports 3001-3006 (all DMF services)
 */

import { execSync } from 'child_process';

const DEFAULT_PORTS = [3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010, 3011, 3012, 3013, 3014];
const ports = process.argv.slice(2).map(Number).filter(Boolean).length > 0
  ? process.argv.slice(2).map(Number).filter(Boolean)
  : DEFAULT_PORTS;

function killPort(port: number): void {
  try {
    // Find process using port (macOS/Linux compatible)
    const pid = execSync(`lsof -ti:${port}`, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    
    if (pid) {
      console.log(`Killing process ${pid} on port ${port}`);
      execSync(`kill -9 ${pid}`, { stdio: 'inherit' });
    } else {
      console.log(`No process found on port ${port}`);
    }
  } catch (error: any) {
    // lsof exits with non-zero if no process found - this is expected
    if (error.status === 1) {
      console.log(`No process found on port ${port}`);
    } else {
      console.error(`Error killing port ${port}:`, error.message);
    }
  }
}

console.log(`Killing processes on ports: ${ports.join(', ')}`);
ports.forEach(killPort);
console.log('Done');
