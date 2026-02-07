import express from 'express';
import { WritingController } from '../controllers/WritingController';

const router = express.Router();

/**
 * Writing API Routes
 * Writing Workshop - Writing practice and grammar feedback
 */

// ═══════════════════════════════════════════════════════════════
// Content Discovery
// ═══════════════════════════════════════════════════════════════

// Get featured prompts
router.get('/featured', WritingController.featured);

// Get statistics
router.get('/stats', WritingController.stats);

// Get available levels
router.get('/levels', WritingController.levels);

// Get available categories
router.get('/categories', WritingController.categories);

// ═══════════════════════════════════════════════════════════════
// User Progress
// ═══════════════════════════════════════════════════════════════

// Get user's writing history
router.get('/user/:userId/history', WritingController.getUserHistory);

// Get user's writing statistics
router.get('/user/:userId/stats', WritingController.getUserStats);

// ═══════════════════════════════════════════════════════════════
// Content Management
// ═══════════════════════════════════════════════════════════════

// Create new prompt
router.post('/', WritingController.createPrompt);

// Seed sample prompts
router.post('/seed', WritingController.seedPrompts);

// ═══════════════════════════════════════════════════════════════
// Single Prompt Operations
// ═══════════════════════════════════════════════════════════════

// Get submissions for a prompt
router.get('/:id/submissions', WritingController.getSubmissions);

// Submit writing
router.post('/:id/submit', WritingController.submitWriting);

// Get draft
router.get('/:id/draft', WritingController.getDraft);

// Save draft
router.post('/:id/draft', WritingController.saveDraft);

// Get single prompt by ID
router.get('/:id', WritingController.getById);

// ═══════════════════════════════════════════════════════════════
// List Prompts
// ═══════════════════════════════════════════════════════════════

// List all prompts with filters
router.get('/', WritingController.list);

export default router;
