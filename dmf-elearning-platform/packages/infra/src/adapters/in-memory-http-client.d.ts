/**
 * In-memory HTTP Client adapter (Bộ chuyển đổi Khách HTTP trong bộ nhớ)
 *
 * Simple in-memory implementation for MVP.
 * Simulates read-only service-to-service calls.
 */
import type { HttpClient, HttpClientRequestOptions, HttpClientResponse } from '../http-client.js';
export declare class InMemoryHttpClient implements HttpClient {
    private responses;
    /**
     * Set mock response (for testing) (Đặt phản hồi giả - cho kiểm tra)
     */
    setResponse(url: string, response: any): void;
    request<T = unknown>(url: string, _options?: HttpClientRequestOptions): Promise<HttpClientResponse<T>>;
    get<T = unknown>(url: string, options?: Omit<HttpClientRequestOptions, 'method' | 'body'>): Promise<HttpClientResponse<T>>;
    post<T = unknown>(url: string, options?: HttpClientRequestOptions): Promise<HttpClientResponse<T>>;
}
//# sourceMappingURL=in-memory-http-client.d.ts.map