import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { AuthService } from '../authService';
import { prisma } from '../../database/connection';

const authService = new AuthService();

describe('AuthService', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  let testUserId: string;

  afterAll(async () => {
    // Cleanup test user
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const result = await authService.register(testEmail, testPassword, 'Test User');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(testEmail);
      expect(result.user.name).toBe('Test User');
      expect(result.user.tier).toBe('free');
      expect(typeof result.token).toBe('string');

      testUserId = result.user.id;
    });

    it('should throw error if email already exists', async () => {
      await expect(
        authService.register(testEmail, testPassword)
      ).rejects.toThrow('Email already exists');
    });

    it('should hash the password', async () => {
      const user = await prisma.user.findUnique({ where: { email: testEmail } });
      expect(user?.passwordHash).not.toBe(testPassword);
      expect(user?.passwordHash).toMatch(/^\$2[ab]\$/); // bcrypt hash pattern
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const result = await authService.login(testEmail, testPassword);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(testEmail);
      expect(typeof result.token).toBe('string');
    });

    it('should throw error with invalid email', async () => {
      await expect(
        authService.login('nonexistent@example.com', testPassword)
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error with invalid password', async () => {
      await expect(
        authService.login(testEmail, 'WrongPassword')
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', async () => {
      const { token } = await authService.login(testEmail, testPassword);
      const decoded = authService.verifyToken(token);

      expect(decoded).toHaveProperty('userId');
      expect(decoded).toHaveProperty('email');
      expect(decoded.email).toBe(testEmail);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        authService.verifyToken('invalid-token');
      }).toThrow('Invalid or expired token');
    });
  });
});
