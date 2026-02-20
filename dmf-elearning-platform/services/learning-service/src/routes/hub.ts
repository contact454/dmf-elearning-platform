import express from 'express';
import { HubController } from '../controllers/HubController';
import {
  attachAuthenticatedUserId,
  authMiddleware,
  ensureAuthenticatedUserProfile,
} from '../middlewares/auth';

const router = express.Router();

// GET /api/hub/:userId - Get comprehensive hub data
router.get(
  '/:userId',
  authMiddleware,
  attachAuthenticatedUserId,
  ensureAuthenticatedUserProfile,
  HubController.getHubData
);

// GET /api/hub/:userId/skills - Get skill progress only
router.get(
  '/:userId/skills',
  authMiddleware,
  attachAuthenticatedUserId,
  ensureAuthenticatedUserProfile,
  HubController.getSkillProgress
);

// GET /api/hub/:userId/daily-goals - Get daily goals with progress
router.get(
  '/:userId/daily-goals',
  authMiddleware,
  attachAuthenticatedUserId,
  ensureAuthenticatedUserProfile,
  HubController.getDailyGoals
);

// PATCH /api/hub/:userId/daily-goals - Update daily goal targets
router.patch(
  '/:userId/daily-goals',
  authMiddleware,
  attachAuthenticatedUserId,
  ensureAuthenticatedUserProfile,
  HubController.updateDailyGoals
);

// GET /api/hub/:userId/recommendation - Get recommended next activity
router.get(
  '/:userId/recommendation',
  authMiddleware,
  attachAuthenticatedUserId,
  ensureAuthenticatedUserProfile,
  HubController.getRecommendation
);

export default router;
