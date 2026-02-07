import express from 'express';
import { ReadingPassageController } from '../controllers/ReadingPassageController';

const router = express.Router();

/**
 * Reading Passages API Routes
 * Phase 1: Core endpoints for reading comprehension exercises
 */

// ═══════════════════════════════════════════════════════════════
// Content Endpoints
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/reading/passages
 * Fetch passages with filters (level, topic, search, pagination)
 */
router.get('/passages', ReadingPassageController.getPassages);

/**
 * GET /api/reading/passages/:id
 * Get single passage with exercises
 */
router.get('/passages/:id', ReadingPassageController.getPassageById);

// ═══════════════════════════════════════════════════════════════
// Exercise & Progress Endpoints
// ═══════════════════════════════════════════════════════════════

/**
 * POST /api/reading/submit
 * Submit exercise answer with validation
 */
router.post('/submit', ReadingPassageController.submitAnswer);

/**
 * GET /api/reading/progress
 * Get user reading progress (requires userId query param)
 */
router.get('/progress', ReadingPassageController.getProgress);

// ═══════════════════════════════════════════════════════════════
// Vocabulary Endpoints
// ═══════════════════════════════════════════════════════════════

/**
 * POST /api/reading/vocabulary/save
 * Save vocabulary word for SRS
 */
router.post('/vocabulary/save', ReadingPassageController.saveVocabulary);

export default router;
