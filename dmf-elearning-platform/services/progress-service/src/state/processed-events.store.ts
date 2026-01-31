/**
 * In-memory processed-events store (Set eventId) for consumer deduplication.
 * Prevents double-apply when the same event is delivered more than once.
 */

const processed = new Set<string>();

export function hasProcessedEvent(eventId: string): boolean {
  return processed.has(eventId);
}

export function markProcessedEvent(eventId: string): void {
  processed.add(eventId);
}

export function clearProcessedEvents(): void {
  processed.clear();
}
