import express from 'express';
import { ReadingController } from '../controllers/ReadingController';

const router = express.Router();

/**
 * Reading API Routes
 * Smart Library - i+1 Reading Content
 */

// ═══════════════════════════════════════════════════════════════
// Content Discovery
// ═══════════════════════════════════════════════════════════════

// Get recommended content for user (i+1 filtered)
router.get('/recommended', ReadingController.recommended);

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
router.get('/user/:userId/history', ReadingController.getUserHistory);

// Get user's reading statistics
router.get('/user/:userId/stats', ReadingController.getUserStats);

// ═══════════════════════════════════════════════════════════════
// Content Management
// ═══════════════════════════════════════════════════════════════

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
router.post('/:id/start', ReadingController.startReading);

// Update reading progress
router.put('/:id/progress', ReadingController.updateProgress);

// Mark reading as completed
router.post('/:id/complete', ReadingController.completeReading);

// Delete content
router.delete('/:id', ReadingController.deleteContent);

// ═══════════════════════════════════════════════════════════════
// List Content (must be last due to route matching)
// ═══════════════════════════════════════════════════════════════

// List all content with filters
router.get('/', ReadingController.list);

export default router;
