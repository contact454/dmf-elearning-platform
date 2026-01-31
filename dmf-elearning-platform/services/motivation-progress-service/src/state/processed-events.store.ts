/**
 * In-memory processed-events store for consumer deduplication.
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
