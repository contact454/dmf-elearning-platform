import fs from 'fs/promises';
import path from 'path';
import NodeCache from 'node-cache';
import { VocabularyItem, TopicData, LevelSummary } from '../types';

export class ResourceService {
  private cache: NodeCache;
  private resourceHubPath: string;
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor() {
    this.cache = new NodeCache({ stdTTL: this.CACHE_TTL, checkperiod: 60 });
    this.resourceHubPath = path.join(__dirname, '../../storage/resource-hub');
  }

  /**
   * Get list of available CEFR levels
   */
  async getLevels(): Promise<string[]> {
    const cacheKey = 'levels';
    const cached = this.cache.get<string[]>(cacheKey);
    if (cached) return cached;

    try {
      const entries = await fs.readdir(this.resourceHubPath, { withFileTypes: true });
      const levels = entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .filter(name => /^[ABC][12]$/.test(name)) // Only A1, A2, B1, B2, C1, C2
        .sort();

      this.cache.set(cacheKey, levels);
      return levels;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Get list of topics for a specific level
   */
  async getTopics(level: string): Promise<string[]> {
    const cacheKey = `topics_${level}`;
    const cached = this.cache.get<string[]>(cacheKey);
    if (cached) return cached;

    const levelPath = path.join(this.resourceHubPath, level);

    try {
      const files = await fs.readdir(levelPath);
      const topics = files
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''))
        .sort();

      this.cache.set(cacheKey, topics);
      return topics;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`Level "${level}" not found`);
      }
      throw error;
    }
  }

  /**
   * Get vocabulary data for a specific level and topic
   */
  async getTopicData(level: string, topic: string): Promise<TopicData> {
    const cacheKey = `data_${level}_${topic}`;
    const cached = this.cache.get<TopicData>(cacheKey);
    if (cached) return cached;

    const filePath = path.join(this.resourceHubPath, level, `${topic}.json`);

    try {
      // Read file with retry logic (in case factory is writing)
      const content = await this.readFileWithRetry(filePath, 3, 100);
      const vocabulary: VocabularyItem[] = JSON.parse(content);

      const topicData: TopicData = {
        topic: topic.replace(/_/g, ' '), // Convert underscores back to spaces
        level,
        vocabulary,
        count: vocabulary.length
      };

      this.cache.set(cacheKey, topicData);
      return topicData;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`Topic "${topic}" not found in level "${level}"`);
      }
      throw error;
    }
  }

  /**
   * Get summary statistics for a level
   */
  async getLevelSummary(level: string): Promise<LevelSummary> {
    const topics = await this.getTopics(level);
    return {
      level,
      topicCount: topics.length,
      topics
    };
  }

  /**
   * Read file with retry logic to handle concurrent writes
   */
  private async readFileWithRetry(
    filePath: string,
    maxRetries: number = 3,
    delayMs: number = 100
  ): Promise<string> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fs.readFile(filePath, 'utf-8');
      } catch (error) {
        if (attempt === maxRetries) throw error;

        // If file is being written, wait and retry
        if ((error as NodeJS.ErrnoException).code === 'EBUSY') {
          await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
          continue;
        }

        throw error;
      }
    }
    throw new Error('Failed to read file after retries');
  }

  /**
   * Clear cache for a specific key or all cache
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.del(key);
    } else {
      this.cache.flushAll();
    }
  }
}
