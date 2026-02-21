import express from 'express';
import { VocabularyController } from '../controllers/VocabularyController';
import {
  attachAuthenticatedUserId,
  authMiddleware,
  ensureAuthenticatedUserProfile,
} from '../middlewares/auth';

const router = express.Router();

/**
 * Vocabulary API Routes (Database-backed)
 * Serves German vocabulary data from PostgreSQL via Prisma
 */

// ═══════════════════════════════════════════════════════════════
// SRS (Spaced Repetition System) Routes
// ═══════════════════════════════════════════════════════════════

// Get vocabulary cards due for review
router.get(
  '/srs/due',
  authMiddleware,
  attachAuthenticatedUserId,
  ensureAuthenticatedUserProfile,
  VocabularyController.getDueCards
);

// Submit a review and update SRS parameters
router.post(
  '/srs/review',
  authMiddleware,
  attachAuthenticatedUserId,
  ensureAuthenticatedUserProfile,
  VocabularyController.submitReview
);

// Get user's learning progress statistics
router.get(
  '/srs/progress/:userId',
  authMiddleware,
  attachAuthenticatedUserId,
  ensureAuthenticatedUserProfile,
  VocabularyController.getUserProgress
);

// Get vocabulary with user progress
router.get(
  '/with-progress',
  authMiddleware,
  attachAuthenticatedUserId,
  ensureAuthenticatedUserProfile,
  VocabularyController.listWithProgress
);

// ═══════════════════════════════════════════════════════════════
// Standard Vocabulary Routes
// ═══════════════════════════════════════════════════════════════

// Get vocabulary statistics
router.get('/stats', VocabularyController.stats);

// Get random vocabulary for flashcards
router.get('/random', VocabularyController.random);

// Get all CEFR levels
router.get('/levels', VocabularyController.levels);

// Get all topics (optional ?level=A1 filter)
router.get('/topics', VocabularyController.topics);

// Get vocabulary by German word
router.get('/word/:word', VocabularyController.getByWord);

// Get single vocabulary by ID
router.get('/:id', VocabularyController.getById);

// Delete multiple vocabulary by IDs (batch delete)
router.post('/delete-many', VocabularyController.deleteMany);

// Delete single vocabulary by ID
router.delete('/:id', VocabularyController.deleteById);

// List vocabulary with filters (?level=A1&topic=food&pos=noun&search=brot&limit=20&offset=0)
router.get('/', VocabularyController.list);

export default router;
