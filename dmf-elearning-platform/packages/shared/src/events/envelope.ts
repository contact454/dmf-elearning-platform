import { UserId, AttemptId } from '../ids';

/**
 * Event context metadata (device, app, locale, traceId)
 */
export interface EventContext {
    app?: string; // e.g., 'web-learner', 'mobile'
    locale?: string; // e.g., 'en-US', 'de-DE'
    device?: string; // e.g., 'desktop', 'mobile', 'tablet'
    traceId?: string; // Distributed tracing ID
    [key: string]: unknown; // Allow additional context fields
}

/**
 * Generic Domain Event envelope
 * Aligned with contracts/events/events.schema.json
 */
export interface DomainEvent<TName extends string, TPayload = unknown> {
    event_name: TName;
    timestamp: string; // ISO 8601 date-time
    user_id: UserId;
    session_id?: string | AttemptId; // Optional correlation ID
    payload: TPayload;
    context?: EventContext;
    version?: string; // Optional version for future evolution
}
