import { DomainEventUnion } from '@dmf/shared';

/**
 * Event handler type (Kiểu hàm xử lý sự kiện)
 */
export type EventHandler = (event: DomainEventUnion) => Promise<void> | void;

/**
 * Emit options to support idempotency/correlation (Tùy chọn phát để hỗ trợ idempotency/correlation)
 */
export interface EmitOptions {
    idempotencyKey?: string;
    correlationId?: string;
    maxRetries?: number; // default 3
}

/**
 * EventBus Interface
 * Interface for emitting domain events
 * Giao diện để phát domain events
 */
export interface EventBus {
    /** Emit a domain event (Phát một domain event) */
    emit(event: DomainEventUnion, options?: EmitOptions): Promise<void>;
    /** Subscribe to specific event name or wildcard (Đăng ký tên sự kiện cụ thể hoặc wildcard) */
    subscribe(eventName: string, handler: EventHandler): Promise<void>;
    /** Unsubscribe a handler (Hủy đăng ký handler) */
    unsubscribe(eventName: string, handler: EventHandler): Promise<void>;
}

/**
 * InMemoryEventBus
 * Minimal in-memory pub/sub with idempotency-key dedupe + retry (at-least-once-ish)
 * Bus trong bộ nhớ tối giản với dedupe theo idempotency key + retry (gần với at-least-once)
 */
export class InMemoryEventBus implements EventBus {
    private handlers = new Map<string, Set<EventHandler>>();
    private processedKeys = new Set<string>();

    async subscribe(eventName: string, handler: EventHandler): Promise<void> {
        if (!this.handlers.has(eventName)) {
            this.handlers.set(eventName, new Set());
        }
        this.handlers.get(eventName)!.add(handler);
    }

    async unsubscribe(eventName: string, handler: EventHandler): Promise<void> {
        const set = this.handlers.get(eventName);
        if (set) set.delete(handler);
    }

    async emit(event: DomainEventUnion, options?: EmitOptions): Promise<void> {
        const key = options?.idempotencyKey ?? `${event.event_name}:${event.timestamp}:${event.user_id}`;
        if (this.processedKeys.has(key)) {
            return; // deduped
        }
        this.processedKeys.add(key);

        const handlers = this.matchingHandlers(event.event_name);
        const maxRetries = options?.maxRetries ?? 3;

        for (const handler of handlers) {
            let attempt = 0;
            // retry loop for best-effort at-least-once delivery
            // vòng lặp retry để cố gắng giao tối thiểu 1 lần
            while (attempt < maxRetries) {
                try {
                    await handler(event);
                    break;
                } catch (err) {
                    attempt += 1;
                    if (attempt >= maxRetries) {
                        console.error('[InMemoryEventBus] Handler failed after retries', {
                            event: event.event_name,
                            handler: handler.name || 'anonymous',
                            error: err,
                        });
                        break;
                    }
                }
            }
        }
    }

    /**
     * Find handlers for exact or wildcard patterns
     * Tìm handler khớp chính xác hoặc wildcard
     */
    private matchingHandlers(eventName: string): EventHandler[] {
        const collected: EventHandler[] = [];

        // exact match
        const exact = this.handlers.get(eventName);
        if (exact) collected.push(...exact);

        // wildcard support: pattern with *
        for (const [pattern, set] of this.handlers.entries()) {
            if (pattern.includes('*') && this.matches(pattern, eventName)) {
                collected.push(...set);
            }
        }

        return collected;
    }

    private matches(pattern: string, eventName: string): boolean {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(eventName);
    }
}

/**
 * NoOpEventBus retained for compatibility; logs events.
 * Bus NoOp giữ lại cho tương thích; chỉ log sự kiện.
 */
export class NoOpEventBus implements EventBus {
    async emit(event: DomainEventUnion): Promise<void> {
        console.log('[NoOpEventBus] Event would be emitted:', event.event_name);
    }
    async subscribe(): Promise<void> {/* noop */}
    async unsubscribe(): Promise<void> {/* noop */}
}
