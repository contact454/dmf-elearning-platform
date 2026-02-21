/**
 * Edge AI Service — Phase 6, Sprint 6.1
 * On-device inference for pronunciation analysis + vocabulary review
 * Designed for Liquid Foundation Models (LFM) and TensorFlow Lite
 * Provides offline-capable lightweight models
 */

// ─── Types ───

export interface EdgeModel {
    id: string;
    name: string;
    version: string;
    size: number;          // bytes
    format: 'tflite' | 'onnx' | 'coreml' | 'gguf';
    task: EdgeTask;
    inputShape: number[];
    outputShape: number[];
    cefrLevels: string[];  // Which CEFR levels this model supports
    createdAt: Date;
    downloadUrl?: string;
}

type EdgeTask =
    | 'pronunciation_scoring'   // On-device pronunciation analysis
    | 'vocab_embedding'         // Lightweight word embeddings
    | 'grammar_check'           // Basic grammar error detection
    | 'speech_recognition'      // On-device STT
    | 'text_classification'     // Content difficulty classification
    | 'sentiment_analysis';     // Detect frustration/engagement

export interface EdgeInferenceRequest {
    modelId: string;
    input: number[] | string;
    options?: {
        temperature?: number;
        topK?: number;
        maxTokens?: number;
    };
}

export interface EdgeInferenceResult {
    output: number[] | string;
    confidence: number;
    latencyMs: number;
    modelId: string;
    runOnDevice: boolean;
}

export interface DeviceCapabilities {
    platform: 'ios' | 'android' | 'web';
    hasGPU: boolean;
    hasNPU: boolean;
    ramGB: number;
    storageAvailableMB: number;
    supportedFormats: string[];
}

// ─── Model Registry ───

const models = new Map<string, EdgeModel>();

// Register default models
const DEFAULT_MODELS: EdgeModel[] = [
    {
        id: 'pronunciation-de-v1',
        name: 'German Pronunciation Scorer',
        version: '1.0.0',
        size: 12_000_000, // 12MB
        format: 'tflite',
        task: 'pronunciation_scoring',
        inputShape: [1, 16000], // 1 second of 16kHz audio
        outputShape: [1, 5],    // [pitch, rhythm, stress, phonetics, overall]
        cefrLevels: ['A1', 'A2', 'B1', 'B2'],
        createdAt: new Date(),
    },
    {
        id: 'vocab-embed-de-v1',
        name: 'German Vocabulary Embeddings',
        version: '1.0.0',
        size: 5_000_000, // 5MB
        format: 'tflite',
        task: 'vocab_embedding',
        inputShape: [1, 64], // Token IDs
        outputShape: [1, 128], // 128-dim embedding
        cefrLevels: ['A1', 'A2', 'B1', 'B2', 'C1'],
        createdAt: new Date(),
    },
    {
        id: 'grammar-check-de-v1',
        name: 'German Grammar Checker',
        version: '1.0.0',
        size: 20_000_000, // 20MB
        format: 'onnx',
        task: 'grammar_check',
        inputShape: [1, 128], // Token IDs
        outputShape: [1, 10],  // [case, gender, number, verb_position, ...]
        cefrLevels: ['A1', 'A2', 'B1'],
        createdAt: new Date(),
    },
    {
        id: 'sentiment-de-v1',
        name: 'Learning Sentiment Analyzer',
        version: '1.0.0',
        size: 3_000_000, // 3MB
        format: 'tflite',
        task: 'sentiment_analysis',
        inputShape: [1, 64],
        outputShape: [1, 4], // [engaged, confused, frustrated, bored]
        cefrLevels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
        createdAt: new Date(),
    },
];

// Initialize models
DEFAULT_MODELS.forEach(m => models.set(m.id, m));

// ─── Core Functions ───

/**
 * Get available models for a device
 */
export function getAvailableModels(capabilities?: DeviceCapabilities): EdgeModel[] {
    const allModels = [...models.values()];
    if (!capabilities) return allModels;

    return allModels.filter(m => {
        // Check format compatibility
        if (!capabilities.supportedFormats.includes(m.format)) return false;
        // Check storage
        if (m.size / 1_000_000 > capabilities.storageAvailableMB) return false;
        // Large models need GPU/NPU
        if (m.size > 15_000_000 && !capabilities.hasGPU && !capabilities.hasNPU) return false;
        return true;
    });
}

/**
 * Get model by ID
 */
export function getModel(modelId: string): EdgeModel | undefined {
    return models.get(modelId);
}

/**
 * Simulate on-device inference (production: runs on device via TFLite/ONNX Runtime)
 */
export function simulateInference(request: EdgeInferenceRequest): EdgeInferenceResult {
    const model = models.get(request.modelId);
    if (!model) throw new Error(`Model ${request.modelId} not found`);

    const startTime = Date.now();

    // Simulate inference based on task
    let output: number[] | string;
    let confidence: number;

    switch (model.task) {
        case 'pronunciation_scoring':
            // [pitch, rhythm, stress, phonetics, overall]
            output = [75 + Math.random() * 25, 70 + Math.random() * 30, 65 + Math.random() * 35, 80 + Math.random() * 20, 72 + Math.random() * 28];
            confidence = 0.85 + Math.random() * 0.1;
            break;

        case 'vocab_embedding':
            // 128-dim embedding
            output = Array.from({ length: 128 }, () => (Math.random() - 0.5) * 2);
            confidence = 0.95;
            break;

        case 'grammar_check':
            // [case_correct, gender_correct, number_correct, verb_position_correct, ...]
            output = Array.from({ length: 10 }, () => Math.random() > 0.3 ? 1 : 0);
            confidence = 0.78 + Math.random() * 0.15;
            break;

        case 'sentiment_analysis':
            // [engaged, confused, frustrated, bored]
            const engaged = 0.5 + Math.random() * 0.5;
            output = [engaged, (1 - engaged) * 0.4, (1 - engaged) * 0.3, (1 - engaged) * 0.3];
            confidence = 0.82 + Math.random() * 0.1;
            break;

        default:
            output = [0];
            confidence = 0.5;
    }

    const latencyMs = Date.now() - startTime + Math.round(Math.random() * 50); // Simulate 10-50ms

    return {
        output,
        confidence: Math.round(confidence * 100) / 100,
        latencyMs,
        modelId: request.modelId,
        runOnDevice: true,
    };
}

/**
 * Get model download manifest (for mobile app to download models)
 */
export function getModelManifest(platform: 'ios' | 'android' | 'web'): {
    models: Array<{ id: string; name: string; size: number; format: string; task: string; downloadUrl: string }>;
    totalSize: number;
} {
    const formatMap: Record<string, string[]> = {
        ios: ['tflite', 'coreml'],
        android: ['tflite', 'onnx'],
        web: ['tflite', 'onnx'],
    };
    const supported = formatMap[platform] || ['tflite'];

    const available = [...models.values()].filter(m => supported.includes(m.format));
    const totalSize = available.reduce((s, m) => s + m.size, 0);

    return {
        models: available.map(m => ({
            id: m.id,
            name: m.name,
            size: m.size,
            format: m.format,
            task: m.task,
            downloadUrl: m.downloadUrl || `/api/advanced/edge/models/${m.id}/download`,
        })),
        totalSize,
    };
}

/**
 * Register a new model
 */
export function registerModel(model: EdgeModel): void {
    models.set(model.id, model);
}
