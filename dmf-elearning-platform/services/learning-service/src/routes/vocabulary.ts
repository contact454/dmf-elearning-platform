import express from 'express';
import { VocabularyController } from '../controllers/VocabularyController';

const router = express.Router();

/**
 * Vocabulary API Routes (Database-backed)
 * Serves German vocabulary data from PostgreSQL via Prisma
 */

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
