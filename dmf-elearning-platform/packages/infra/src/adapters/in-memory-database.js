/**
 * In-memory Database adapter (Bộ chuyển đổi Cơ sở dữ liệu trong bộ nhớ)
 *
 * Simple in-memory key-value store for MVP.
 * Services use this for state persistence.
 */
export class InMemoryDatabase {
    store = new Map();
    outbox = new Map(); // Outbox store (Kho Outbox)
    connected = false;
    /**
     * Connect to database (Kết nối cơ sở dữ liệu)
     */
    async connect(_options) {
        this.connected = true;
    }
    /**
     * Disconnect from database (Ngắt kết nối cơ sở dữ liệu)
     */
    async disconnect() {
        this.connected = false;
    }
    /**
     * Execute query (Thực thi truy vấn)
     *
     * Simple key-value operations for MVP.
     * Format: "SELECT * FROM table WHERE id = ?" or "INSERT INTO table VALUES ?"
     */
    async query(query, params) {
        if (!this.connected) {
            throw new Error('Database not connected');
        }
        // Simple query parsing for MVP (Phân tích truy vấn đơn giản cho MVP)
        if (query.includes('SELECT')) {
            return this.handleSelect(query, params);
        }
        else if (query.includes('INSERT')) {
            return this.handleInsert(query, params);
        }
        else if (query.includes('UPDATE')) {
            return this.handleUpdate(query, params);
        }
        else if (query.includes('DELETE')) {
            return this.handleDelete(query, params);
        }
        return [];
    }
    /**
     * Execute transaction (Thực thi giao dịch)
     */
    async transaction(callback) {
        // Simple transaction simulation (Mô phỏng giao dịch đơn giản)
        return callback();
    }
    /**
     * Handle SELECT query (Xử lý truy vấn SELECT)
     */
    handleSelect(query, params) {
        const tableMatch = query.match(/FROM\s+(\w+)/i);
        if (!tableMatch)
            return [];
        const tableName = tableMatch[1];
        const table = this.store.get(tableName) || new Map();
        if (query.includes('WHERE id = ?') && params && params[0]) {
            const id = params[0];
            const record = table.get(id);
            return record ? [record] : [];
        }
        // Return all records (Trả về tất cả bản ghi)
        return Array.from(table.values());
    }
    /**
     * Handle INSERT query (Xử lý truy vấn INSERT)
     */
    handleInsert(query, params) {
        const tableMatch = query.match(/INTO\s+(\w+)/i);
        if (!tableMatch || !params || params.length === 0)
            return [];
        const tableName = tableMatch[1];
        if (!this.store.has(tableName)) {
            this.store.set(tableName, new Map());
        }
        const table = this.store.get(tableName);
        const record = params[0];
        table.set(record.id, record);
        return [record];
    }
    /**
     * Handle UPDATE query (Xử lý truy vấn UPDATE)
     */
    handleUpdate(query, params) {
        const tableMatch = query.match(/UPDATE\s+(\w+)/i);
        if (!tableMatch || !params || params.length < 2)
            return [];
        const tableName = tableMatch[1];
        const table = this.store.get(tableName);
        if (!table)
            return [];
        const id = params[0];
        const updates = params[1];
        const existing = table.get(id);
        if (!existing)
            return [];
        const updated = { ...existing, ...updates };
        table.set(id, updated);
        return [updated];
    }
    /**
     * Handle DELETE query (Xử lý truy vấn DELETE)
     */
    handleDelete(query, params) {
        const tableMatch = query.match(/FROM\s+(\w+)/i);
        if (!tableMatch || !params || params.length === 0)
            return [];
        const tableName = tableMatch[1];
        const table = this.store.get(tableName);
        if (!table)
            return [];
        const id = params[0];
        const record = table.get(id);
        if (record) {
            table.delete(id);
            return [record];
        }
        return [];
    }
    /**
     * Get table (for testing) (Lấy bảng - cho kiểm tra)
     */
    getTable(tableName) {
        return this.store.get(tableName);
    }
    /**
     * Clear all data (for testing) (Xóa tất cả dữ liệu - cho kiểm tra)
     */
    clear() {
        this.store.clear();
        this.outbox.clear();
    }
    /**
     * Create outbox record (Tạo bản ghi outbox)
     *
     * Stores event in outbox as pending before publishing.
     */
    async createOutboxRecord(record) {
        this.outbox.set(record.outboxId, record);
        return record;
    }
    /**
     * Find outbox record by eventId (Tìm bản ghi outbox theo eventId)
     */
    async findOutboxByEventId(eventId) {
        for (const record of this.outbox.values()) {
            if (record.eventId === eventId) {
                return record;
            }
        }
        return null;
    }
    /**
     * Find outbox records by commandKey (Tìm bản ghi outbox theo commandKey)
     */
    async findOutboxByCommandKey(commandKey) {
        const records = [];
        for (const record of this.outbox.values()) {
            if (record.commandKey === commandKey && record.status === 'published') {
                records.push(record);
            }
        }
        return records;
    }
    /**
     * Mark outbox record as published (Đánh dấu bản ghi outbox đã phát hành)
     */
    async markOutboxPublished(outboxId) {
        const record = this.outbox.get(outboxId);
        if (record) {
            record.status = 'published';
            record.publishedAt = new Date().toISOString();
            this.outbox.set(outboxId, record);
        }
    }
    /**
     * Get pending outbox records (Lấy bản ghi outbox đang chờ)
     */
    async getPendingOutboxRecords() {
        const records = [];
        for (const record of this.outbox.values()) {
            if (record.status === 'pending') {
                records.push(record);
            }
        }
        return records;
    }
}
//# sourceMappingURL=in-memory-database.js.map