import express from 'express';
import { HubController } from '../controllers/HubController';

const router = express.Router();

// GET /api/hub/:userId - Get comprehensive hub data
router.get('/:userId', HubController.getHubData);

// GET /api/hub/:userId/skills - Get skill progress only
router.get('/:userId/skills', HubController.getSkillProgress);

// GET /api/hub/:userId/daily-goals - Get daily goals with progress
router.get('/:userId/daily-goals', HubController.getDailyGoals);

// GET /api/hub/:userId/recommendation - Get recommended next activity
router.get('/:userId/recommendation', HubController.getRecommendation);

export default router;
