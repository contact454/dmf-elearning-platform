import express from 'express';
import { SpeakingController } from '../controllers/SpeakingController';

const router = express.Router();

/**
 * Speaking API Routes
 * Speaking Studio - Pronunciation and speaking practice
 */

// ═══════════════════════════════════════════════════════════════
// Content Discovery
// ═══════════════════════════════════════════════════════════════

// Get featured prompts
router.get('/featured', SpeakingController.featured);

// Get statistics
router.get('/stats', SpeakingController.stats);

// Get available levels
router.get('/levels', SpeakingController.levels);

// Get available categories
router.get('/categories', SpeakingController.categories);

// ═══════════════════════════════════════════════════════════════
// User Progress
// ═══════════════════════════════════════════════════════════════

// Get user's speaking history
router.get('/user/:userId/history', SpeakingController.getUserHistory);

// Get user's speaking statistics
router.get('/user/:userId/stats', SpeakingController.getUserStats);

// ═══════════════════════════════════════════════════════════════
// Content Management
// ═══════════════════════════════════════════════════════════════

// Seed sample prompts
router.post('/seed', SpeakingController.seedContent);

// Create new prompt
router.post('/', SpeakingController.createPrompt);

// ═══════════════════════════════════════════════════════════════
// Single Prompt Operations
// ═══════════════════════════════════════════════════════════════

// Get attempts for a prompt
router.get('/:id/attempts', SpeakingController.getAttempts);

// Submit speaking attempt
router.post('/:id/attempt', SpeakingController.submitAttempt);

// Get single prompt by ID
router.get('/:id', SpeakingController.getById);

// ═══════════════════════════════════════════════════════════════
// List Prompts
// ═══════════════════════════════════════════════════════════════

// List all prompts with filters
router.get('/', SpeakingController.list);

export default router;
