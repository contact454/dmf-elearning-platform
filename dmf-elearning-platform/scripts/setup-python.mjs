#!/usr/bin/env node
/**
 * Setup node-gyp Python for pnpm on macOS arm64.
 *
 * No dependencies; safe to run before pnpm install.
 *
 * Note: In some environments (e.g. sandboxed CI/agents), `pnpm config set` may fail
 * due to permissions. In that case, use:
 *   npm_config_python=/opt/homebrew/opt/python@3.11/bin/python3.11 pnpm install
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';

const py311 = '/opt/homebrew/opt/python@3.11/bin/python3.11';

function run(command) {
  execSync(command, { stdio: 'inherit' });
}

if (!fs.existsSync(py311)) {
  console.error(`Python 3.11 not found at: ${py311}`);
  console.error('');
  console.error('Install it via Homebrew:');
  console.error('  brew install python@3.11');
  console.error('');
  console.error('Then rerun:');
  console.error('  pnpm run setup:python');
  process.exit(1);
}

console.log(`Setting pnpm python to: ${py311}`);
console.log('');

try {
  run(`pnpm config set python ${py311}`);
  console.log('✓ pnpm config set python');
} catch {
  console.warn('pnpm config set failed (is pnpm installed/available in PATH?)');
}

try {
  run(`npm config set python ${py311}`);
  console.log('✓ npm config set python');
} catch {
  console.warn('npm config set failed (npm may not be installed or accessible)');
}

console.log('');
console.log('Done. Verify with:');
console.log('  pnpm config get python');
console.log('  npm config get python');
console.log('');
