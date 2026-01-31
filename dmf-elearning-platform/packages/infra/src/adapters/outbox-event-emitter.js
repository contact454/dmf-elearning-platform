/**
 * Outbox Event Emitter (Bộ phát Sự kiện Outbox)
 *
 * Helper to safely emit events via outbox pattern (write-then-emit).
 * Ensures events are not emitted twice even on retry.
 */
/**
 * Safely emit event via outbox (Phát sự kiện an toàn qua outbox)
 *
 * Flow:
 * 1. Check if event already published (by eventId)
 * 2. If not, create outbox record as pending
 * 3. Publish event
 * 4. Mark outbox as published
 *
 * On retry: if eventId already published, skip emission.
 */
export async function emitViaOutbox(event, eventBus, outbox, commandKey) {
    const eventId = event.payload.eventId;
    // 1. Check if already published (Kiểm tra đã phát hành)
    const existingRecord = await outbox.findByEventId(eventId);
    if (existingRecord && existingRecord.status === 'published') {
        // Already published, skip (Đã phát hành, bỏ qua)
        return;
    }
    // 2. Create outbox record as pending (Tạo bản ghi outbox đang chờ)
    const outboxId = `outbox-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await outbox.create({
        outboxId,
        commandKey,
        eventId,
        eventName: event.eventName,
        payload: event.payload,
        status: 'pending',
        createdAt: new Date().toISOString(),
    });
    // 3. Publish event (Phát sự kiện)
    await eventBus.emit(event);
    // 4. Mark outbox as published (Đánh dấu outbox đã phát hành)
    await outbox.markPublished(outboxId);
}
//# sourceMappingURL=outbox-event-emitter.js.map