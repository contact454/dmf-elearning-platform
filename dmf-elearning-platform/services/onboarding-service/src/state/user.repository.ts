/**
 * User Repository (Kho lưu trữ User)
 */

import type { UserId, LanguageCode } from '@dmf/shared';
import { UserRole } from '@dmf/shared';
import type { Database } from '@dmf/infra';

export interface User {
  id: UserId;
  email: string;
  passwordHash: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  targetLanguage?: LanguageCode;
  createdAt: Date;
  updatedAt: Date;
}

export class UserRepository {
  constructor(private db: Database) {}

  async create(data: Omit<User, 'updatedAt'>): Promise<User> {
    const user: User = {
      ...data,
      updatedAt: new Date(),
    };

    await this.db.query(
      'INSERT INTO users VALUES ?',
      [user]
    );

    return user;
  }

  async findById(id: UserId): Promise<User | null> {
    const results = await this.db.query<User>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return results[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    // Simple lookup for MVP (Tìm kiếm đơn giản cho MVP)
    const results = await this.db.query<User>('SELECT * FROM users', []);
    return results.find((u) => u.email === email) || null;
  }

  async update(id: UserId, data: Partial<User>): Promise<User> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error('User not found');
    }

    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };

    await this.db.query('UPDATE users SET ? WHERE id = ?', [updated, id]);
    return updated;
  }
}
