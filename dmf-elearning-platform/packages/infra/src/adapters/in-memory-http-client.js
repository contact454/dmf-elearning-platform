/**
 * In-memory HTTP Client adapter (Bộ chuyển đổi Khách HTTP trong bộ nhớ)
 *
 * Simple in-memory implementation for MVP.
 * Simulates read-only service-to-service calls.
 */
export class InMemoryHttpClient {
    responses = new Map();
    /**
     * Set mock response (for testing) (Đặt phản hồi giả - cho kiểm tra)
     */
    setResponse(url, response) {
        this.responses.set(url, response);
    }
    async request(url, _options) {
        // For MVP: return mock data if set, otherwise 404 (Cho MVP: trả về dữ liệu giả nếu đã đặt, nếu không thì 404)
        const mockResponse = this.responses.get(url);
        if (mockResponse) {
            return {
                status: 200,
                statusText: 'OK',
                headers: {},
                data: mockResponse,
            };
        }
        return {
            status: 404,
            statusText: 'Not Found',
            headers: {},
            data: null,
        };
    }
    async get(url, options) {
        return this.request(url, { ...options, method: 'GET' });
    }
    async post(url, options) {
        return this.request(url, { ...options, method: 'POST' });
    }
}
//# sourceMappingURL=in-memory-http-client.js.map