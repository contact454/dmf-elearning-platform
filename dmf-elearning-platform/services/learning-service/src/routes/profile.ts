import express from 'express';
import { z } from 'zod';
import {
  attachAuthenticatedUserId,
  authMiddleware,
  ensureAuthenticatedUserProfile,
} from '../middlewares/auth';
import * as profileService from '../services/profileService';

const router = express.Router();

const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  timezone: z.string().trim().min(1).max(120).optional(),
});

router.get(
  '/',
  authMiddleware,
  attachAuthenticatedUserId,
  ensureAuthenticatedUserProfile,
  async (req, res) => {
    try {
      const profile = await profileService.getProfile(req.user!.id, {
        email: req.user?.email,
      });

      return res.json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      console.error('[API] GET /profile failed:', error?.message ?? error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch profile',
        },
      });
    }
  }
);

router.patch(
  '/',
  authMiddleware,
  attachAuthenticatedUserId,
  ensureAuthenticatedUserProfile,
  async (req, res) => {
    try {
      const payload = updateProfileSchema.parse(req.body);
      const profile = await profileService.updateProfile(
        req.user!.id,
        { email: req.user?.email },
        payload
      );

      return res.json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid profile payload',
            details: error.errors,
          },
        });
      }

      console.error('[API] PATCH /profile failed:', error?.message ?? error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update profile',
        },
      });
    }
  }
);

export default router;
