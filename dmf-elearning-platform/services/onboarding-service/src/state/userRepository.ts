/**
 * User Repository (Kho lưu trữ User)
 * Owned by onboarding-service
 */

import type { User, UserId } from '../domain/user';

interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  save(user: User): Promise<User>;
  delete(id: UserId): Promise<void>;
  create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
}

class InMemoryUserRepository implements UserRepository {
  private users: Map<UserId, User> = new Map();

  async findById(id: UserId): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async save(user: User): Promise<User> {
    user.updatedAt = new Date();
    this.users.set(user.id, user);
    return user;
  }

  async delete(id: UserId): Promise<void> {
    this.users.delete(id);
  }

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      ...data,
      id: crypto.randomUUID() as UserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }
}

export const userRepository = new InMemoryUserRepository();
