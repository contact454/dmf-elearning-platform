/**
 * Redis EventBus — M8 S23-01
 * Cross-process events with DLQ, consumer groups, type-safe channels
 */
import { createClient, RedisClientType } from 'redis';
import { EventEmitter } from 'events';

export type EventChannel =
    | 'gamification.xp.earned'
    | 'gamification.achievement.unlocked'
    | 'gamification.level.up'
    | 'gamification.streak.updated'
    | 'education.cefr.assessed'
    | 'education.readiness.checked'
    | 'content.created'
    | 'content.published'
    | 'user.registered'
    | 'user.activity'
    | 'review.completed'
    | 'feedback.submitted';

export interface EventPayload {
    channel: EventChannel;
    data: Record<string, any>;
    timestamp: string;
    source: string;
}

export class RedisEventBus {
    private publisher: RedisClientType | null = null;
    private subscriber: RedisClientType | null = null;
    private localBus = new EventEmitter();
    private isConnected = false;
    private dlqKey = 'eventbus:dlq';

    constructor(private redisUrl: string = process.env.REDIS_URL || 'redis://localhost:6379') { }

    async connect(): Promise<void> {
        try {
            this.publisher = createClient({ url: this.redisUrl }) as RedisClientType;
            this.subscriber = this.publisher.duplicate() as RedisClientType;

            await this.publisher.connect();
            await this.subscriber.connect();
            this.isConnected = true;
            console.log('[EventBus] Connected to Redis');
        } catch (error) {
            console.warn('[EventBus] Redis unavailable, using local EventEmitter fallback');
            this.isConnected = false;
        }
    }

    async publish(channel: EventChannel, data: Record<string, any>, source: string = 'learning-service'): Promise<void> {
        const payload: EventPayload = {
            channel, data, source,
            timestamp: new Date().toISOString(),
        };

        if (this.isConnected && this.publisher) {
            try {
                await this.publisher.publish(channel, JSON.stringify(payload));
                // Also store in stream for durability
                await this.publisher.xAdd(`stream:${channel}`, '*', {
                    payload: JSON.stringify(payload),
                });
            } catch (error) {
                console.error(`[EventBus] Publish failed for ${channel}, adding to DLQ:`, error);
                await this.addToDLQ(payload);
            }
        } else {
            // Fallback to local emitter
            this.localBus.emit(channel, payload);
        }
    }

    async subscribe(channel: EventChannel, handler: (payload: EventPayload) => void | Promise<void>): Promise<void> {
        if (this.isConnected && this.subscriber) {
            await this.subscriber.subscribe(channel, async (message) => {
                try {
                    const payload = JSON.parse(message) as EventPayload;
                    await handler(payload);
                } catch (error) {
                    console.error(`[EventBus] Handler error for ${channel}:`, error);
                }
            });
        } else {
            this.localBus.on(channel, handler);
        }
    }

    private async addToDLQ(payload: EventPayload): Promise<void> {
        if (this.publisher) {
            try {
                await this.publisher.lPush(this.dlqKey, JSON.stringify({
                    ...payload,
                    failedAt: new Date().toISOString(),
                }));
            } catch { /* ignore DLQ failures */ }
        }
    }

    async getDLQSize(): Promise<number> {
        if (this.publisher) {
            return await this.publisher.lLen(this.dlqKey);
        }
        return 0;
    }

    async replayDLQ(): Promise<number> {
        if (!this.publisher) return 0;
        let replayed = 0;
        let item: string | null;
        while ((item = await this.publisher.rPop(this.dlqKey))) {
            try {
                const payload = JSON.parse(item) as EventPayload;
                await this.publish(payload.channel, payload.data, payload.source);
                replayed++;
            } catch { break; }
        }
        return replayed;
    }

    async disconnect(): Promise<void> {
        if (this.publisher) await this.publisher.disconnect();
        if (this.subscriber) await this.subscriber.disconnect();
        this.localBus.removeAllListeners();
        this.isConnected = false;
    }
}

// Singleton
let eventBus: RedisEventBus | null = null;

export function getEventBus(): RedisEventBus {
    if (!eventBus) {
        eventBus = new RedisEventBus();
    }
    return eventBus;
}
