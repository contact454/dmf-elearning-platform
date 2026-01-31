/**
 * Contract Lock Script
 * 
 * Generates and validates contract lock file.
 * CI fails if schemas change without updating lock.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import { globSync } from 'glob';

const CONTRACTS_DIR = join(process.cwd(), 'packages/contracts/src');
const LOCK_FILE = join(process.cwd(), '.contracts-lock.json');

interface ContractLock {
  version: string;
  schemas: Record<string, string>; // file path -> hash
  generatedAt: string;
}

function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

function generateLock(): ContractLock {
  const schemaFiles = globSync('**/*.ts', {
    cwd: CONTRACTS_DIR,
    ignore: ['**/*.d.ts', '**/*.js', '**/index.ts'],
  });

  const schemas: Record<string, string> = {};
  
  for (const file of schemaFiles) {
    const filePath = join(CONTRACTS_DIR, file);
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf-8');
      schemas[file] = hashContent(content);
    }
  }

  return {
    version: '1.0.0',
    schemas,
    generatedAt: new Date().toISOString(),
  };
}

function validateLock(): boolean {
  if (!existsSync(LOCK_FILE)) {
    console.error('Contract lock file not found. Run: pnpm contract-lock:generate');
    return false;
  }

  const lock: ContractLock = JSON.parse(readFileSync(LOCK_FILE, 'utf-8'));
  const current = generateLock();

  // Check if schemas changed
  const lockFiles = new Set(Object.keys(lock.schemas));
  const currentFiles = new Set(Object.keys(current.schemas));

  // Check for new files
  for (const file of currentFiles) {
    if (!lockFiles.has(file)) {
      console.error(`New contract file detected: ${file}`);
      console.error('Run: pnpm contract-lock:generate');
      return false;
    }
  }

  // Check for removed files
  for (const file of lockFiles) {
    if (!currentFiles.has(file)) {
      console.error(`Contract file removed: ${file}`);
      console.error('Run: pnpm contract-lock:generate');
      return false;
    }
  }

  // Check for changed files
  for (const file of currentFiles) {
    if (lock.schemas[file] !== current.schemas[file]) {
      console.error(`Contract file changed: ${file}`);
      console.error('Run: pnpm contract-lock:generate');
      return false;
    }
  }

  return true;
}

const command = process.argv[2];

if (command === 'generate') {
  const lock = generateLock();
  writeFileSync(LOCK_FILE, JSON.stringify(lock, null, 2));
  console.log(`Contract lock generated: ${LOCK_FILE}`);
  console.log(`Locked ${Object.keys(lock.schemas).length} schema files`);
} else if (command === 'validate') {
  const valid = validateLock();
  if (!valid) {
    process.exit(1);
  }
  console.log('Contract lock validation passed');
} else {
  console.error('Usage: tsx scripts/contract-lock.ts [generate|validate]');
  process.exit(1);
}
