#!/usr/bin/env node
/**
 * Database Migration CLI
 * 
 * Phase 2 Sprint 1: SQLite Persistence (Opt-in)
 * 
 * Usage:
 *   pnpm db:migrate [--db-path <path>]
 *   pnpm db:reset [--db-path <path>] (dev only)
 */

import Database from 'better-sqlite3';
import { readdirSync, readFileSync, existsSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { mkdirSync } from 'fs';

const MIGRATIONS_DIR = join(process.cwd(), 'packages/infra/migrations');
const DEFAULT_DB_PATH = process.env.DMF_DB_PATH || join(process.cwd(), 'data', 'app.db');

function ensureDataDir(dbPath: string): void {
  const dbDir = dirname(dbPath);
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
  }
}

function runMigrations(dbPath: string): void {
  ensureDataDir(dbPath);
  
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  // Create migrations table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL
    )
  `);

  // Get applied migrations
  const applied = db.prepare('SELECT name FROM migrations').all() as Array<{ name: string }>;
  const appliedNames = new Set(applied.map((m) => m.name));

  // Get migration files
  if (!existsSync(MIGRATIONS_DIR)) {
    console.log(`Migrations directory not found: ${MIGRATIONS_DIR}`);
    console.log('No migrations to apply.');
    db.close();
    return;
  }

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  let appliedCount = 0;

  for (const file of files) {
    if (!appliedNames.has(file)) {
      console.log(`Applying migration: ${file}`);
      const migrationPath = join(MIGRATIONS_DIR, file);
      const sql = readFileSync(migrationPath, 'utf-8');
      
      // Execute migration
      db.exec(sql);
      
      // Record migration
      db.prepare('INSERT INTO migrations (name, applied_at) VALUES (?, ?)').run(
        file,
        new Date().toISOString()
      );
      
      appliedCount++;
    }
  }

  db.close();

  if (appliedCount === 0) {
    console.log('No new migrations to apply.');
  } else {
    console.log(`Applied ${appliedCount} migration(s).`);
  }
}

function resetDatabase(dbPath: string): void {
  if (process.env.NODE_ENV === 'production') {
    console.error('ERROR: db:reset is not allowed in production');
    process.exit(1);
  }

  if (existsSync(dbPath)) {
    console.log(`Deleting database: ${dbPath}`);
    unlinkSync(dbPath);
  }

  console.log('Database reset. Run db:migrate to recreate schema.');
}

function main(): void {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'migrate') {
    const dbPathIndex = args.indexOf('--db-path');
    const dbPath = dbPathIndex >= 0 && args[dbPathIndex + 1] 
      ? args[dbPathIndex + 1] 
      : DEFAULT_DB_PATH;
    
    console.log(`Running migrations on: ${dbPath}`);
    runMigrations(dbPath);
  } else if (command === 'reset') {
    const dbPathIndex = args.indexOf('--db-path');
    const dbPath = dbPathIndex >= 0 && args[dbPathIndex + 1] 
      ? args[dbPathIndex + 1] 
      : DEFAULT_DB_PATH;
    
    resetDatabase(dbPath);
  } else {
    console.log('Usage:');
    console.log('  pnpm db:migrate [--db-path <path>]');
    console.log('  pnpm db:reset [--db-path <path>] (dev only)');
    process.exit(1);
  }
}

main();
