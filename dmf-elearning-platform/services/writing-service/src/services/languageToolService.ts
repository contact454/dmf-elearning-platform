import axios from 'axios';
import crypto from 'crypto';
import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

// Initialize Redis client
const initRedis = async () => {
  if (!redisClient) {
    redisClient = createClient({ 
      url: process.env.REDIS_URL || 'redis://localhost:6379' 
    });
    
    redisClient.on('error', (err) => console.error('❌ Redis error:', err));
    redisClient.on('connect', () => console.log('✅ Redis connected'));
    
    await redisClient.connect();
  }
  return redisClient;
};

export interface GrammarError {
  type: 'grammar' | 'spelling' | 'style';
  message: string;
  shortMessage: string;
  offset: number;
  length: number;
  context: {
    text: string;
    offset: number;
    length: number;
  };
  suggestions: Array<{ value: string }>;
  ruleId: string;
  category: string;
}

export class LanguageToolService {
  private apiUrl = process.env.LANGUAGETOOL_API_URL || 'https://api.languagetool.org/v2/check';

  async checkGrammar(text: string, language: string = 'de-DE'): Promise<{
    errors: GrammarError[];
    processingTimeMs: number;
  }> {
    const startTime = Date.now();

    // Generate cache key
    const cacheKey = this.getCacheKey(text, language);

    // Check cache first
    const redis = await initRedis();
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log('✅ Cache hit for grammar check');
      return {
        errors: JSON.parse(cached),
        processingTimeMs: Date.now() - startTime,
      };
    }

    // Call LanguageTool API
    try {
      const response = await axios.post(
        this.apiUrl,
        new URLSearchParams({
          text,
          language,
          enabledOnly: 'false',
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 10000, // 10 seconds
        }
      );

      const errors = this.parseErrors(response.data.matches || []);

      // Cache for 24 hours
      await redis.setEx(cacheKey, 86400, JSON.stringify(errors));

      return {
        errors,
        processingTimeMs: Date.now() - startTime,
      };
    } catch (error: any) {
      console.error('❌ LanguageTool API error:', error.message);
      throw new Error('Grammar check failed');
    }
  }

  private getCacheKey(text: string, language: string): string {
    return crypto
      .createHash('sha256')
      .update(`${text}:${language}`)
      .digest('hex');
  }

  private parseErrors(matches: any[]): GrammarError[] {
    return matches.map((match) => ({
      type: this.categorizeError(match.rule?.category?.id || 'GRAMMAR'),
      message: match.message,
      shortMessage: match.shortMessage || match.message,
      offset: match.offset,
      length: match.length,
      context: match.context,
      suggestions: (match.replacements || []).slice(0, 3).map((r: any) => ({ value: r.value })),
      ruleId: match.rule?.id || 'UNKNOWN',
      category: match.rule?.category?.id || 'GRAMMAR',
    }));
  }

  private categorizeError(categoryId: string): 'spelling' | 'grammar' | 'style' {
    const cat = categoryId.toUpperCase();
    if (cat.includes('TYPO') || cat.includes('SPELL')) {
      return 'spelling';
    }
    if (cat.includes('STYLE') || cat.includes('REDUNDANCY')) {
      return 'style';
    }
    return 'grammar';
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  if (redisClient) {
    await redisClient.quit();
  }
});
