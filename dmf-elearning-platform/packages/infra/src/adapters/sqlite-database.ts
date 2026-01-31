/**
 * SQLite Database adapter (Bộ chuyển đổi Cơ sở dữ liệu SQLite)
 * 
 * Implements Database interface using SQLite (better-sqlite3).
 * Supports migrations and transactions.
 */

import Database from 'better-sqlite3';
import type { Database as DatabaseInterface, DatabaseConnectionOptions } from '../database.js';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';

export class SQLiteDatabase implements DatabaseInterface {
  private db: Database.Database | null = null;
  private dbPath: string = '';

  /**
   * Connect to SQLite database
   */
  async connect(options: DatabaseConnectionOptions): Promise<void> {
    // Extract database name from options
    const dbName = options.database || 'default';
    const isE2E = process.env.DMF_MODE === 'e2e' || process.env.NODE_ENV === 'e2e';
    
    // Determine database path
    const dataDir = isE2E ? './data/e2e' : './data';
    this.dbPath = process.env.DMF_DB_PATH || join(process.cwd(), dataDir, `${dbName}.db`);

    // Ensure data directory exists
    const dbDir = dirname(this.dbPath);
    if (!existsSync(dbDir)) {
      const { mkdirSync } = await import('fs');
      mkdirSync(dbDir, { recursive: true });
    }

    // Open database
    this.db = new Database(this.dbPath);
    
    // Enable WAL mode for better concurrency
    this.db.pragma('journal_mode = WAL');
    
    // Run migrations
    await this.runMigrations();
  }

  /**
   * Disconnect from database
   */
  async disconnect(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Execute query
   */
  async query<T = unknown>(query: string, params?: unknown[]): Promise<T[]> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    try {
      const stmt = this.db.prepare(query);
      const result = params ? stmt.all(...params) : stmt.all();
      return result as T[];
    } catch (error: any) {
      throw new Error(`Query failed: ${error.message}`);
    }
  }

  /**
   * Execute transaction
   */
  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    return this.db.transaction(() => {
      return callback();
    })();
  }

  /**
   * Run migrations
   */
  private async runMigrations(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    // Create migrations table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        applied_at TEXT NOT NULL
      )
    `);

    // Get applied migrations
    const applied = this.db.prepare('SELECT name FROM migrations').all() as Array<{ name: string }>;
    const appliedNames = new Set(applied.map((m) => m.name));

    // Get migration files
    const migrationsPath = process.env.DMF_DB_MIGRATIONS_PATH || join(process.cwd(), 'migrations');
    
    if (!existsSync(migrationsPath)) {
      // No migrations directory - skip
      return;
    }

    const { readdirSync } = await import('fs');
    const files = readdirSync(migrationsPath)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    // Apply pending migrations
    for (const file of files) {
      if (!appliedNames.has(file)) {
        const migrationPath = join(migrationsPath, file);
        const sql = readFileSync(migrationPath, 'utf-8');
        
        // Execute migration
        this.db.exec(sql);
        
        // Record migration
        this.db.prepare('INSERT INTO migrations (name, applied_at) VALUES (?, ?)').run(
          file,
          new Date().toISOString()
        );
      }
    }
  }

  /**
   * Get database instance (for advanced operations)
   */
  getDatabase(): Database.Database {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db;
  }
}
