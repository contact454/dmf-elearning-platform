/**
 * Advanced Technology Routes — Phase 6
 * Edge AI + Spatial AR + Continual Learning
 */
import { Router, Request, Response } from 'express';
import {
    getAvailableModels,
    getModel,
    simulateInference,
    getModelManifest,
} from '../services/EdgeAIService';
import {
    getARScenes,
    getARScene,
    matchDetectedObject,
    createARFlashcard,
    getAllARVocabulary,
} from '../services/SpatialARService';
import {
    registerModelVersion,
    detectDrift,
    updateMemory,
    getMemoryState,
    getModelVersions,
    getDriftReport,
    triggerIncrementalTraining,
} from '../services/ContinualLearningService';

const router = Router();

// ═══════════════ EDGE AI ═══════════════

/**
 * GET /api/advanced/edge/models
 */
router.get('/edge/models', (req: Request, res: Response) => {
    try {
        const capabilities = req.query.platform ? {
            platform: req.query.platform as any, hasGPU: req.query.gpu === 'true',
            hasNPU: req.query.npu === 'true', ramGB: parseInt(req.query.ram as string) || 4,
            storageAvailableMB: parseInt(req.query.storage as string) || 500,
            supportedFormats: (req.query.formats as string)?.split(',') || ['tflite', 'onnx'],
        } : undefined;
        res.json({ success: true, data: getAvailableModels(capabilities) });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'EDGE_ERROR', message: error.message } });
    }
});

/**
 * GET /api/advanced/edge/manifest/:platform
 */
router.get('/edge/manifest/:platform', (req: Request, res: Response) => {
    try {
        const manifest = getModelManifest(req.params.platform as any);
        res.json({ success: true, data: manifest });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'EDGE_ERROR', message: error.message } });
    }
});

/**
 * POST /api/advanced/edge/inference
 */
router.post('/edge/inference', (req: Request, res: Response) => {
    try {
        const { modelId, input, options } = req.body;
        if (!modelId || input === undefined) {
            return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'modelId and input required' } });
        }
        const result = simulateInference({ modelId, input, options });
        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'EDGE_ERROR', message: error.message } });
    }
});

// ═══════════════ SPATIAL AR ═══════════════

/**
 * GET /api/advanced/ar/scenes
 */
router.get('/ar/scenes', (req: Request, res: Response) => {
    try {
        const level = req.query.level as string | undefined;
        const scenes = getARScenes(level);
        res.json({ success: true, data: scenes.map(s => ({ id: s.id, name: s.name, nameVi: s.nameVi, description: s.description, difficulty: s.difficulty, objectCount: s.objects.length })) });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'AR_ERROR', message: error.message } });
    }
});

/**
 * GET /api/advanced/ar/scenes/:id
 */
router.get('/ar/scenes/:id', (req: Request, res: Response) => {
    try {
        const scene = getARScene(String(req.params.id));
        if (!scene) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Scene not found' } });
        res.json({ success: true, data: scene });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'AR_ERROR', message: error.message } });
    }
});

/**
 * POST /api/advanced/ar/detect
 */
router.post('/ar/detect', (req: Request, res: Response) => {
    try {
        const { label, sceneId } = req.body;
        if (!label) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'label required' } });
        const match = matchDetectedObject(label, sceneId);
        res.json({ success: true, data: { detected: label, match: match || null, found: !!match } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'AR_ERROR', message: error.message } });
    }
});

/**
 * GET /api/advanced/ar/flashcard/:objectId
 */
router.get('/ar/flashcard/:objectId', (req: Request, res: Response) => {
    try {
        const mode = (req.query.mode as string) || 'learn';
        const card = createARFlashcard(String(req.params.objectId), mode as any);
        if (!card) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Object not found' } });
        res.json({ success: true, data: card });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'AR_ERROR', message: error.message } });
    }
});

/**
 * GET /api/advanced/ar/vocabulary
 */
router.get('/ar/vocabulary', (_req: Request, res: Response) => {
    try {
        res.json({ success: true, data: getAllARVocabulary() });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'AR_ERROR', message: error.message } });
    }
});

// ═══════════════ CONTINUAL LEARNING ═══════════════

/**
 * POST /api/advanced/ml/drift/detect
 */
router.post('/ml/drift/detect', (req: Request, res: Response) => {
    try {
        const { modelName } = req.body;
        if (!modelName) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'modelName required' } });
        const report = detectDrift(modelName);
        res.json({ success: true, data: report });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'ML_ERROR', message: error.message } });
    }
});

/**
 * POST /api/advanced/ml/train
 */
router.post('/ml/train', (req: Request, res: Response) => {
    try {
        const { modelName } = req.body;
        if (!modelName) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'modelName required' } });
        const job = triggerIncrementalTraining(modelName);
        res.json({ success: true, data: job });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'ML_ERROR', message: error.message } });
    }
});

/**
 * POST /api/advanced/ml/memory/update
 */
router.post('/ml/memory/update', (req: Request, res: Response) => {
    try {
        const { userId, type, content, surprise } = req.body;
        if (!userId || !content) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'userId and content required' } });
        const state = updateMemory(userId, { type: type || 'pattern', content, surprise });
        res.json({ success: true, data: state });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'ML_ERROR', message: error.message } });
    }
});

/**
 * GET /api/advanced/ml/memory/:userId
 */
router.get('/ml/memory/:userId', (req: Request, res: Response) => {
    try {
        const state = getMemoryState(String(req.params.userId));
        res.json({ success: true, data: state });
    } catch (error: any) {
        res.status(500).json({ success: false, error: { code: 'ML_ERROR', message: error.message } });
    }
});

export default router;
