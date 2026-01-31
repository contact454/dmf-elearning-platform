#!/usr/bin/env node
/**
 * Repo Doctor (macOS arm64 friendly)
 *
 * Goal: detect common local dev blockers (node-gyp + Python distutils removal)
 * and print actionable steps. No dependencies (runs before pnpm install).
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';

function cmd(command) {
  try {
    return execSync(command, { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
  } catch (e) {
    return null;
  }
}

function exists(p) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

const nodeVersion = cmd('node --version');
const pnpmVersion = cmd('pnpm --version');
const python3Version = cmd('python3 --version');
const pnpmPython = cmd('pnpm config get python');
const npmPython = cmd('npm config get python');

const brewPy311 = '/opt/homebrew/opt/python@3.11/bin/python3.11';
const brewPy312 = '/opt/homebrew/opt/python@3.12/bin/python3.12';
const brewPy313 = '/opt/homebrew/opt/python@3.13/bin/python3.13';
const brewPy314 = '/opt/homebrew/opt/python@3.14/bin/python3.14';

console.log('=== DMF Monorepo Doctor ===');
console.log('');
console.log(`node:   ${nodeVersion ?? '(not found)'}`);
console.log(`pnpm:   ${pnpmVersion ?? '(not found)'}`);
console.log(`python3:${python3Version ?? '(not found)'}`);
console.log('');
console.log(`pnpm config python: ${pnpmPython ?? '(unset)'}`);
console.log(`npm  config python: ${npmPython ?? '(unset)'}`);
console.log('');

const isNode25Plus = nodeVersion ? /^v(\d+)\./.test(nodeVersion) && Number(nodeVersion.match(/^v(\d+)\./)?.[1]) >= 25 : false;
const isPython314Plus = python3Version ? /Python 3\.(\d+)\./.test(python3Version) && Number(python3Version.match(/Python 3\.(\d+)\./)?.[1]) >= 14 : false;

if (isNode25Plus) {
  console.log('!! Node 25+ detected.');
  console.log('   - This repo supports Node 22 LTS (preferred) or Node 20 LTS.');
  console.log('   - Node 25 commonly breaks native deps (e.g. better-sqlite3) due to node-gyp + Python distutils changes.');
  console.log('');
}

if (isPython314Plus) {
  console.log('!! Python 3.14+ detected.');
  console.log("   - Python 3.14 removed 'distutils' which node-gyp may still import.");
  console.log('   - Prefer Python 3.11 for node-gyp on macOS arm64.');
  console.log('');
}

console.log('--- Recommended fix (macOS arm64) ---');
if (exists(brewPy311)) {
  console.log(`✓ Found Python 3.11 at: ${brewPy311}`);
  console.log('');
  console.log('Run:');
  console.log(`  pnpm run setup:python`);
  console.log('');
  console.log('Or manually:');
  console.log(`  pnpm config set python ${brewPy311}`);
  console.log(`  npm config set python ${brewPy311}`);
} else {
  console.log('Python 3.11 not found at the Homebrew default path.');
  console.log('');
  console.log('Install it:');
  console.log('  brew install python@3.11');
  console.log('');
  console.log('Then set it for pnpm/npm:');
  console.log(`  pnpm config set python ${brewPy311}`);
  console.log(`  npm config set python ${brewPy311}`);
}

console.log('');
console.log('--- Optional notes ---');
console.log('- If better-sqlite3 has no prebuild for Node 22 on your exact platform, use Node 20 LTS for local dev.');
console.log(`- Other Homebrew python paths (for reference):`);
console.log(`  - ${brewPy312} ${exists(brewPy312) ? '(present)' : '(missing)'}`);
console.log(`  - ${brewPy313} ${exists(brewPy313) ? '(present)' : '(missing)'}`);
console.log(`  - ${brewPy314} ${exists(brewPy314) ? '(present)' : '(missing)'}`);
console.log('');
