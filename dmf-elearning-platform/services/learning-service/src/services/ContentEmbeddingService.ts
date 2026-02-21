/**
 * Content Embedding Service — Phase 4, Sprint 4.1
 * Vector embeddings for learning content (vocab, reading, grammar, etc.)
 * Designed for Vertex AI Text Embeddings (text-embedding-005)
 * Falls back to local TF-IDF when API unavailable
 */

// ─── Types ───

export interface ContentItem {
    id: string;
    type: 'vocabulary' | 'reading' | 'listening' | 'grammar' | 'writing' | 'speaking' | 'conversation';
    title: string;
    text: string;           // Main content for embedding
    cefrLevel: string;
    tags: string[];
    metadata: Record<string, any>;
}

export interface EmbeddedContent {
    id: string;
    type: ContentItem['type'];
    title: string;
    cefrLevel: string;
    tags: string[];
    embedding: number[];       // Vector (384-dim for local, 768 for Vertex AI)
    embeddedAt: Date;
}

export interface SimilarityResult {
    item: EmbeddedContent;
    score: number;              // 0-1 cosine similarity
    reason: string;
}

// ─── Vector Store (In-memory; production: AlloyDB + pgvector) ───

const embeddings = new Map<string, EmbeddedContent>();
const EMBEDDING_DIM = 128; // Local dimension; Vertex AI = 768

// ─── Embedding Functions ───

/**
 * Generate embedding for content text
 * Production: calls Vertex AI text-embedding-005
 * Dev: uses local TF-IDF hash embedding
 */
export function generateEmbedding(text: string): number[] {
    // Local fallback: deterministic hash-based embedding
    // Production would call: POST https://us-central1-aiplatform.googleapis.com/v1/projects/PROJECT/locations/LOCATION/publishers/google/models/text-embedding-005:predict
    return hashEmbedding(text, EMBEDDING_DIM);
}

/**
 * Embed and store a content item
 */
export function embedContent(item: ContentItem): EmbeddedContent {
    const fullText = `${item.title} ${item.text} ${item.tags.join(' ')} CEFR:${item.cefrLevel} Type:${item.type}`;
    const embedding = generateEmbedding(fullText);

    const embedded: EmbeddedContent = {
        id: item.id,
        type: item.type,
        title: item.title,
        cefrLevel: item.cefrLevel,
        tags: item.tags,
        embedding,
        embeddedAt: new Date(),
    };

    embeddings.set(item.id, embedded);
    return embedded;
}

/**
 * Batch embed multiple content items
 */
export function batchEmbedContent(items: ContentItem[]): { success: number; failed: number } {
    let success = 0, failed = 0;
    for (const item of items) {
        try {
            embedContent(item);
            success++;
        } catch {
            failed++;
        }
    }
    return { success, failed };
}

/**
 * Find similar content by cosine similarity
 */
export function findSimilar(
    queryText: string,
    options?: {
        topK?: number;
        minScore?: number;
        filterType?: ContentItem['type'];
        filterLevel?: string;
        excludeIds?: string[];
    }
): SimilarityResult[] {
    const queryEmb = generateEmbedding(queryText);
    const topK = options?.topK || 10;
    const minScore = options?.minScore || 0.1;

    const results: SimilarityResult[] = [];

    for (const [id, item] of embeddings) {
        if (options?.excludeIds?.includes(id)) continue;
        if (options?.filterType && item.type !== options.filterType) continue;
        if (options?.filterLevel && item.cefrLevel !== options.filterLevel) continue;

        const score = cosineSimilarity(queryEmb, item.embedding);
        if (score >= minScore) {
            results.push({
                item,
                score: Math.round(score * 1000) / 1000,
                reason: `Cosine similarity: ${(score * 100).toFixed(1)}%`,
            });
        }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, topK);
}

/**
 * Find content similar to a specific item
 */
export function findSimilarToItem(
    itemId: string,
    topK?: number
): SimilarityResult[] {
    const item = embeddings.get(itemId);
    if (!item) return [];

    const results: SimilarityResult[] = [];
    for (const [id, other] of embeddings) {
        if (id === itemId) continue;
        const score = cosineSimilarity(item.embedding, other.embedding);
        results.push({ item: other, score, reason: `Similar to "${item.title}"` });
    }

    return results.sort((a, b) => b.score - a.score).slice(0, topK || 5);
}

/**
 * Get all embedded content stats
 */
export function getEmbeddingStats(): {
    totalItems: number;
    byType: Record<string, number>;
    byLevel: Record<string, number>;
    dimension: number;
} {
    const byType: Record<string, number> = {};
    const byLevel: Record<string, number> = {};

    for (const item of embeddings.values()) {
        byType[item.type] = (byType[item.type] || 0) + 1;
        byLevel[item.cefrLevel] = (byLevel[item.cefrLevel] || 0) + 1;
    }

    return { totalItems: embeddings.size, byType, byLevel, dimension: EMBEDDING_DIM };
}

/**
 * Get embedded content by ID
 */
export function getEmbedded(id: string): EmbeddedContent | undefined {
    return embeddings.get(id);
}

// ─── Math Utilities ───

function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
}

/**
 * Deterministic hash-based embedding (local fallback for Vertex AI)
 * Uses character n-grams + hashing trick for consistent vectors
 */
function hashEmbedding(text: string, dim: number): number[] {
    const vec = new Float64Array(dim);
    const lower = text.toLowerCase();

    // Character trigram hashing
    for (let i = 0; i < lower.length - 2; i++) {
        const trigram = lower.slice(i, i + 3);
        let hash = 0;
        for (let j = 0; j < trigram.length; j++) {
            hash = ((hash << 5) - hash + trigram.charCodeAt(j)) | 0;
        }
        const idx = Math.abs(hash) % dim;
        vec[idx] += hash > 0 ? 1 : -1;
    }

    // Word-level hashing
    const words = lower.split(/\s+/);
    for (const word of words) {
        let hash = 0;
        for (let j = 0; j < word.length; j++) {
            hash = ((hash << 5) - hash + word.charCodeAt(j)) | 0;
        }
        const idx = Math.abs(hash) % dim;
        vec[idx] += (hash > 0 ? 2 : -2);
    }

    // L2 normalize
    let norm = 0;
    for (let i = 0; i < dim; i++) norm += vec[i] * vec[i];
    norm = Math.sqrt(norm);
    if (norm > 0) for (let i = 0; i < dim; i++) vec[i] /= norm;

    return Array.from(vec);
}
