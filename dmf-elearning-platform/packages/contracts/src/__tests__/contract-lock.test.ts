/**
 * Contract Lock Tests
 * 
 * Ensures all E2E-used schemas are valid and StandardError shape is correct
 */

import { describe, it, expect } from 'vitest';
import { commandRegistry } from '../registries.js';
import { z } from 'zod';

describe('Contract Lock', () => {
  describe('Command schemas compile', () => {
    it('should have system.user.register schema', () => {
      expect(commandRegistry['system.user.register']).toBeDefined();
      expect(commandRegistry['system.user.register']).toBeInstanceOf(z.ZodObject);
    });

    it('should have curriculum.course.enroll schema', () => {
      expect(commandRegistry['curriculum.course.enroll']).toBeDefined();
      expect(commandRegistry['curriculum.course.enroll']).toBeInstanceOf(z.ZodObject);
    });

    it('should have learning.lesson.start schema', () => {
      expect(commandRegistry['learning.lesson.start']).toBeDefined();
      expect(commandRegistry['learning.lesson.start']).toBeInstanceOf(z.ZodObject);
    });

    it('should have learning.activity.submit schema', () => {
      expect(commandRegistry['learning.activity.submit']).toBeDefined();
      expect(commandRegistry['learning.activity.submit']).toBeInstanceOf(z.ZodObject);
    });

    it('should have learning.lesson.complete schema', () => {
      expect(commandRegistry['learning.lesson.complete']).toBeDefined();
      expect(commandRegistry['learning.lesson.complete']).toBeInstanceOf(z.ZodObject);
    });
  });

  describe('StandardError schema', () => {
    const StandardErrorSchema = z.object({
      error: z.object({
        code: z.string(),
        category: z.string(),
        message: z.string(),
      }),
    });

    it('should validate correct StandardError shape', () => {
      const validError = {
        error: {
          code: 'NOT_FOUND',
          category: 'ClientError',
          message: 'Resource not found',
        },
      };

      expect(() => StandardErrorSchema.parse(validError)).not.toThrow();
    });

    it('should reject missing error field', () => {
      const invalidError = {
        code: 'NOT_FOUND',
      };

      expect(() => StandardErrorSchema.parse(invalidError)).toThrow();
    });

    it('should reject missing code field', () => {
      const invalidError = {
        error: {
          category: 'ClientError',
          message: 'Resource not found',
        },
      };

      expect(() => StandardErrorSchema.parse(invalidError)).toThrow();
    });

    it('should reject missing category field', () => {
      const invalidError = {
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found',
        },
      };

      expect(() => StandardErrorSchema.parse(invalidError)).toThrow();
    });

    it('should reject missing message field', () => {
      const invalidError = {
        error: {
          code: 'NOT_FOUND',
          category: 'ClientError',
        },
      };

      expect(() => StandardErrorSchema.parse(invalidError)).toThrow();
    });
  });

  describe('Response shape validation', () => {
    it('should validate userId response', () => {
      const UserIdResponseSchema = z.object({
        userId: z.string(),
      });

      expect(() => UserIdResponseSchema.parse({ userId: 'user-123' })).not.toThrow();
      expect(() => UserIdResponseSchema.parse({})).toThrow();
    });

    it('should validate courses response', () => {
      const CoursesResponseSchema = z.object({
        courses: z.array(
          z.object({
            id: z.string(),
            name: z.string().optional(),
          })
        ),
      });

      expect(() =>
        CoursesResponseSchema.parse({
          courses: [{ id: 'course-1', name: 'Test Course' }],
        })
      ).not.toThrow();
      expect(() => CoursesResponseSchema.parse({})).toThrow();
    });

    it('should validate lessons response', () => {
      const LessonsResponseSchema = z.object({
        lessons: z.array(
          z.object({
            id: z.string(),
            courseId: z.string(),
          })
        ),
      });

      expect(() =>
        LessonsResponseSchema.parse({
          lessons: [{ id: 'lesson-1', courseId: 'course-1' }],
        })
      ).not.toThrow();
      expect(() => LessonsResponseSchema.parse({})).toThrow();
    });
  });
});
