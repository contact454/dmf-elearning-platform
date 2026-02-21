import express from 'express';
import { ReadingController } from '../controllers/ReadingController';
import { ReadingPassageController } from '../controllers/ReadingPassageController';
import {
  attachAuthenticatedUserId,
  authMiddleware,
  ensureAuthenticatedUserProfile,
} from '../middlewares/auth';

const router = express.Router();

/**
 * Reading API Routes
 * Smart Library - i+1 Reading Content
 */

// ═══════════════════════════════════════════════════════════════
// PHASE 1: Reading Passages & Exercises
// ═══════════════════════════════════════════════════════════════

// Get passages with filters
router.get('/passages', ReadingPassageController.getPassages);

// Get single passage with exercises
router.get('/passages/:id', ReadingPassageController.getPassageById);

// Submit exercise answer
router.post(
  '/submit',
  authMiddleware,
  attachAuthenticatedUserId,
  ensureAuthenticatedUserProfile,
  ReadingPassageController.submitAnswer
);

// Get user progress
router.get(
  '/progress',
  authMiddleware,
  attachAuthenticatedUserId,
  ensureAuthenticatedUserProfile,
  ReadingPassageController.getProgress
);

// Save vocabulary word for SRS
router.post(
  '/vocabulary/save',
  authMiddleware,
  attachAuthenticatedUserId,
  ensureAuthenticatedUserProfile,
  ReadingPassageController.saveVocabulary
);

// ═══════════════════════════════════════════════════════════════
// Content Discovery
// ═══════════════════════════════════════════════════════════════

// Get recommended content for user (i+1 filtered)
router.get(
  '/recommended',
  authMiddleware,
  attachAuthenticatedUserId,
  ensureAuthenticatedUserProfile,
  ReadingController.recommended
);

// Get featured content
router.get('/featured', ReadingController.featured);

// Get reading statistics
router.get('/stats', ReadingController.stats);

// Get available levels
router.get('/levels', ReadingController.levels);

// Get available topics
router.get('/topics', ReadingController.topics);

// ═══════════════════════════════════════════════════════════════
// User Progress
// ═══════════════════════════════════════════════════════════════

// Get user's reading history
router.get(
  '/user/:userId/history',
  authMiddleware,
  attachAuthenticatedUserId,
  ensureAuthenticatedUserProfile,
  ReadingController.getUserHistory
);

// Get user's reading statistics
router.get(
  '/user/:userId/stats',
  authMiddleware,
  attachAuthenticatedUserId,
  ensureAuthenticatedUserProfile,
  ReadingController.getUserStats
);

// ═══════════════════════════════════════════════════════════════
// Content Management
// ═══════════════════════════════════════════════════════════════

// Seed sample content
router.post('/seed', ReadingController.seedContent);

// Generate new content using AI
router.post('/generate', ReadingController.generateContent);

// Create new content manually
router.post('/', ReadingController.createContent);

// ═══════════════════════════════════════════════════════════════
// Single Content Operations
// ═══════════════════════════════════════════════════════════════

// Get single content by ID (with optional user analysis)
router.get('/:id', ReadingController.getById);

// Start reading content
router.post(
  '/:id/start',
  authMiddleware,
  attachAuthenticatedUserId,
  ensureAuthenticatedUserProfile,
  ReadingController.startReading
);

// Update reading progress
router.put(
  '/:id/progress',
  authMiddleware,
  attachAuthenticatedUserId,
  ensureAuthenticatedUserProfile,
  ReadingController.updateProgress
);

// Mark reading as completed
router.post(
  '/:id/complete',
  authMiddleware,
  attachAuthenticatedUserId,
  ensureAuthenticatedUserProfile,
  ReadingController.completeReading
);

// Delete content
router.delete('/:id', ReadingController.deleteContent);

// ═══════════════════════════════════════════════════════════════
// List Content (must be last due to route matching)
// ═══════════════════════════════════════════════════════════════

// List all content with filters
router.get('/', ReadingController.list);

export default router;
