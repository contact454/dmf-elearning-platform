/**
 * Recommendation Routes — Phase 4
 * Content embeddings + personalized recommendations
 */
import { Router, Request, Response } from 'express';
import {
    embedContent,
    batchEmbedContent,
    findSimilar,
    findSimilarToItem,
    getEmbeddingStats,
    getEmbedded,
    type ContentItem,
} from '../services/ContentEmbeddingService';
import {
    getRecommendations,
} from '../services/RecommendationService';

const router = Router();

// ═══════════════ EMBEDDINGS ═══════════════

/**
 * POST /api/recommend/embed
 * Embed a single content item
 */
router.post('/embed', (req: Request, res: Response) => {
    try {
        const item: ContentItem = req.body;
        if (!item.id || !item.text || !item.type) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'id, text, and type are required' },
            });
        }
        const embedded = embedContent(item);
        res.json({ success: true, data: { id: embedded.id, dimension: embedded.embedding.length, embeddedAt: embedded.embeddedAt } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'EMBED_ERROR', message: error.message } });
    }
});

/**
 * POST /api/recommend/embed/batch
 * Batch embed multiple content items
 */
router.post('/embed/batch', (req: Request, res: Response) => {
    try {
        const { items } = req.body;
        if (!Array.isArray(items)) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'items array is required' },
            });
        }
        const result = batchEmbedContent(items);
        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'EMBED_ERROR', message: error.message } });
    }
});

/**
 * GET /api/recommend/embed/stats
 * Get embedding store statistics
 */
router.get('/embed/stats', (_req: Request, res: Response) => {
    try {
        const stats = getEmbeddingStats();
        res.json({ success: true, data: stats });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'EMBED_ERROR', message: error.message } });
    }
});

/**
 * POST /api/recommend/similar
 * Find content similar to query text
 */
router.post('/similar', (req: Request, res: Response) => {
    try {
        const { query, topK, minScore, filterType, filterLevel, excludeIds } = req.body;
        if (!query) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'query is required' },
            });
        }
        const results = findSimilar(query, { topK, minScore, filterType, filterLevel, excludeIds });
        res.json({ success: true, data: { count: results.length, results } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'SEARCH_ERROR', message: error.message } });
    }
});

/**
 * GET /api/recommend/similar/:itemId
 * Find content similar to an existing item
 */
router.get('/similar/:itemId', (req: Request, res: Response) => {
    try {
        const itemId = String(req.params.itemId);
        const topK = req.query.topK ? parseInt(req.query.topK as string) : 5;
        const results = findSimilarToItem(itemId, topK);
        res.json({ success: true, data: { count: results.length, results } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'SEARCH_ERROR', message: error.message } });
    }
});

// ═══════════════ RECOMMENDATIONS ═══════════════

/**
 * POST /api/recommend/personalized
 * Get personalized recommendations with CoT reasoning
 */
router.post('/personalized', (req: Request, res: Response) => {
    try {
        const { userId, count, context, excludeIds, preferredTypes } = req.body;
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'userId is required' },
            });
        }
        const result = getRecommendations({ userId, count, context, excludeIds, preferredTypes });
        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'RECOMMEND_ERROR', message: error.message } });
    }
});

export default router;
