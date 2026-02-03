import express from 'express';
import { ListeningController } from '../controllers/ListeningController';

const router = express.Router();

/**
 * Listening API Routes
 * Listening Lab - Audio content and dictation exercises
 */

// ═══════════════════════════════════════════════════════════════
// Content Discovery
// ═══════════════════════════════════════════════════════════════

// Get featured content
router.get('/featured', ListeningController.featured);

// Get statistics
router.get('/stats', ListeningController.stats);

// Get available levels
router.get('/levels', ListeningController.levels);

// ═══════════════════════════════════════════════════════════════
// User Progress
// ═══════════════════════════════════════════════════════════════

// Get user's listening history
router.get('/user/:userId/history', ListeningController.getUserHistory);

// Get user's listening statistics
router.get('/user/:userId/stats', ListeningController.getUserStats);

// ═══════════════════════════════════════════════════════════════
// Exercise Endpoints
// ═══════════════════════════════════════════════════════════════

// Get single exercise
router.get('/exercise/:exerciseId', ListeningController.getExercise);

// Submit dictation attempt
router.post('/exercise/:exerciseId/attempt', ListeningController.submitAttempt);

// ═══════════════════════════════════════════════════════════════
// Content Management
// ═══════════════════════════════════════════════════════════════

// Create new content
router.post('/', ListeningController.createContent);

// ═══════════════════════════════════════════════════════════════
// Single Content Operations
// ═══════════════════════════════════════════════════════════════

// Get exercises for content
router.get('/:id/exercises', ListeningController.getExercises);

// Generate exercises from segments
router.post('/:id/exercises/generate', ListeningController.generateExercises);

// Start listening
router.post('/:id/start', ListeningController.startListening);

// Update progress
router.put('/:id/progress', ListeningController.updateProgress);

// Get single content by ID
router.get('/:id', ListeningController.getById);

// ═══════════════════════════════════════════════════════════════
// List Content
// ═══════════════════════════════════════════════════════════════

// List all content with filters
router.get('/', ListeningController.list);

export default router;
