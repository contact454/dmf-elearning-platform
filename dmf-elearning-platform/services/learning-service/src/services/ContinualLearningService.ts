/**
 * Continual Learning Pipeline — Phase 6, Sprint 6.3
 * Model drift detection, incremental training, Titans/HoPE-inspired memory
 * Self-updating system based on user behavior shifts
 */

import { getStatements } from './LRSService';

// ─── Types ───

export interface ModelVersion {
    id: string;
    modelName: string;
    version: string;
    metrics: ModelMetrics;
    trainedOn: DatasetInfo;
    createdAt: Date;
    status: 'training' | 'evaluating' | 'deployed' | 'retired';
    parentVersion?: string;
}

interface ModelMetrics {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    auc: number;
    latencyP50Ms: number;
    latencyP99Ms: number;
    driftScore: number;    // 0= no drift, 1= complete drift
}

interface DatasetInfo {
    totalSamples: number;
    dateRange: { start: string; end: string };
    cefrDistribution: Record<string, number>;
    modules: string[];
}

export interface DriftReport {
    modelId: string;
    currentVersion: string;
    driftDetected: boolean;
    driftScore: number;      // 0-1
    driftType: 'gradual' | 'sudden' | 'recurring' | 'none';
    features: DriftFeature[];
    recommendation: 'retrain' | 'monitor' | 'none';
    reportedAt: Date;
}

interface DriftFeature {
    name: string;
    currentMean: number;
    baselineMean: number;
    deviation: number;
    significant: boolean;
}

export interface MemoryState {
    shortTerm: MemoryItem[];   // Recent interactions (Titans-inspired)
    longTerm: MemoryItem[];    // Consolidated knowledge (HoPE-inspired)
    workingCapacity: number;   // Max short-term items
    consolidationThreshold: number; // When to promote to long-term
}

interface MemoryItem {
    id: string;
    type: 'pattern' | 'error' | 'preference' | 'milestone';
    content: string;
    strength: number;      // 0-1 (decays over time)
    createdAt: Date;
    lastAccessed: Date;
    accessCount: number;
    surprise: number;      // Surprise-Gated Promotion score
}

// ─── Model Registry ───

const modelVersions = new Map<string, ModelVersion[]>();
const driftReports = new Map<string, DriftReport>();
const userMemories = new Map<string, MemoryState>();

// ─── Core Functions ───

/**
 * Register a new model version
 */
export function registerModelVersion(model: Omit<ModelVersion, 'createdAt' | 'status'>): ModelVersion {
    const version: ModelVersion = { ...model, createdAt: new Date(), status: 'evaluating' };
    const versions = modelVersions.get(model.modelName) || [];
    versions.push(version);
    modelVersions.set(model.modelName, versions);
    return version;
}

/**
 * Detect model drift by comparing current user behavior with training data baseline
 */
export function detectDrift(modelName: string): DriftReport {
    const versions = modelVersions.get(modelName) || [];
    const current = versions.find(v => v.status === 'deployed');

    // Get recent xAPI data for behavioral analysis
    const recentStatements = getStatements({ limit: 1000 });

    // Compute feature distributions
    const features: DriftFeature[] = [];

    // Feature 1: Session length distribution
    const sessionLengths = recentStatements
        .filter(s => s.result?.duration)
        .map(s => parseInt(s.result!.duration!.replace(/\D/g, '')) || 0);
    const avgSessionLength = sessionLengths.length > 0 ? sessionLengths.reduce((a, b) => a + b, 0) / sessionLengths.length : 0;
    features.push({
        name: 'avg_session_length',
        currentMean: avgSessionLength,
        baselineMean: 30, // baseline: 30 seconds
        deviation: avgSessionLength > 0 ? Math.abs(avgSessionLength - 30) / 30 : 0,
        significant: Math.abs(avgSessionLength - 30) > 15,
    });

    // Feature 2: Accuracy distribution
    const scores = recentStatements
        .filter(s => s.result?.score?.scaled != null)
        .map(s => s.result!.score!.scaled!);
    const avgAccuracy = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    features.push({
        name: 'avg_accuracy',
        currentMean: avgAccuracy,
        baselineMean: 0.7,
        deviation: Math.abs(avgAccuracy - 0.7),
        significant: Math.abs(avgAccuracy - 0.7) > 0.15,
    });

    // Feature 3: Module usage distribution shift
    const moduleCounts = new Map<string, number>();
    recentStatements.forEach(s => {
        const mod = s.context?.extensions?.['https://dmf.edu/extensions/module'] || 'unknown';
        moduleCounts.set(mod, (moduleCounts.get(mod) || 0) + 1);
    });
    const topModule = [...moduleCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    const moduleConcentration = topModule ? topModule[1] / Math.max(recentStatements.length, 1) : 0;
    features.push({
        name: 'module_concentration',
        currentMean: moduleConcentration,
        baselineMean: 0.3, // Expected even distribution
        deviation: Math.abs(moduleConcentration - 0.3),
        significant: moduleConcentration > 0.5,
    });

    // Calculate overall drift score
    const sigFeatures = features.filter(f => f.significant).length;
    const driftScore = Math.min(1, sigFeatures / features.length + features.reduce((s, f) => s + f.deviation, 0) / features.length);

    const driftType = driftScore > 0.7 ? 'sudden' : driftScore > 0.3 ? 'gradual' : 'none';
    const recommendation = driftScore > 0.5 ? 'retrain' : driftScore > 0.2 ? 'monitor' : 'none';

    const report: DriftReport = {
        modelId: current?.id || modelName,
        currentVersion: current?.version || '0.0.0',
        driftDetected: driftScore > 0.3,
        driftScore: Math.round(driftScore * 100) / 100,
        driftType,
        features,
        recommendation,
        reportedAt: new Date(),
    };

    driftReports.set(modelName, report);
    return report;
}

/**
 * Titans-inspired memory management
 * Short-term memory with Surprise-Gated Promotion to long-term
 */
export function updateMemory(
    userId: string,
    item: { type: MemoryItem['type']; content: string; surprise?: number }
): MemoryState {
    let memory = userMemories.get(userId);
    if (!memory) {
        memory = {
            shortTerm: [],
            longTerm: [],
            workingCapacity: 7,  // Miller's Law: 7 ± 2
            consolidationThreshold: 0.7,
        };
    }

    const memItem: MemoryItem = {
        id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 4)}`,
        type: item.type,
        content: item.content,
        strength: 1.0,
        createdAt: new Date(),
        lastAccessed: new Date(),
        accessCount: 1,
        surprise: item.surprise || Math.random() * 0.5,
    };

    // Add to short-term
    memory.shortTerm.push(memItem);

    // Surprise-Gated Promotion: high surprise items go to long-term
    if (memItem.surprise > memory.consolidationThreshold) {
        memory.longTerm.push({ ...memItem, strength: 0.8 });
    }

    // Capacity management: evict weakest short-term items
    if (memory.shortTerm.length > memory.workingCapacity) {
        memory.shortTerm.sort((a, b) => b.strength - a.strength);
        const evicted = memory.shortTerm.splice(memory.workingCapacity);

        // HoPE-inspired: consolidate evicted items with moderate strength
        for (const e of evicted) {
            if (e.strength > 0.4) {
                const existing = memory.longTerm.find(lt => lt.content === e.content);
                if (existing) {
                    existing.strength = Math.min(1, existing.strength + 0.1);
                    existing.accessCount++;
                } else {
                    memory.longTerm.push({ ...e, strength: e.strength * 0.6 });
                }
            }
        }
    }

    // Decay: reduce strength of old items
    const now = Date.now();
    for (const item of memory.shortTerm) {
        const ageHours = (now - item.lastAccessed.getTime()) / (1000 * 60 * 60);
        item.strength *= Math.exp(-0.1 * ageHours); // Exponential decay
    }

    // Prune: remove very weak long-term items (HoPE self-restructuring)
    memory.longTerm = memory.longTerm.filter(lt => lt.strength > 0.05);

    // Sort long-term by strength
    memory.longTerm.sort((a, b) => b.strength - a.strength);

    // Keep max 50 long-term items
    if (memory.longTerm.length > 50) memory.longTerm = memory.longTerm.slice(0, 50);

    userMemories.set(userId, memory);
    return memory;
}

/**
 * Get user's memory state
 */
export function getMemoryState(userId: string): MemoryState {
    return userMemories.get(userId) || {
        shortTerm: [], longTerm: [],
        workingCapacity: 7, consolidationThreshold: 0.7,
    };
}

/**
 * Get model versions
 */
export function getModelVersions(modelName: string): ModelVersion[] {
    return modelVersions.get(modelName) || [];
}

/**
 * Get latest drift report
 */
export function getDriftReport(modelName: string): DriftReport | undefined {
    return driftReports.get(modelName);
}

/**
 * Simulate incremental training (production: triggers Cloud AI Platform job)
 */
export function triggerIncrementalTraining(modelName: string): {
    jobId: string;
    status: 'queued';
    estimatedMinutes: number;
} {
    return {
        jobId: `train_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        status: 'queued',
        estimatedMinutes: 15 + Math.round(Math.random() * 30),
    };
}
