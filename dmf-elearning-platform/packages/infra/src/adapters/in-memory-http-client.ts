/**
 * In-memory HTTP Client adapter (Bộ chuyển đổi Khách HTTP trong bộ nhớ)
 * 
 * Simple in-memory implementation for MVP.
 * Simulates read-only service-to-service calls.
 */

import type { HttpClient, HttpClientRequestOptions, HttpClientResponse } from '../http-client.js';

export class InMemoryHttpClient implements HttpClient {
  private responses: Map<string, any> = new Map();

  /**
   * Set mock response (for testing) (Đặt phản hồi giả - cho kiểm tra)
   */
  setResponse(url: string, response: any): void {
    this.responses.set(url, response);
  }

  async request<T = unknown>(
    url: string,
    _options?: HttpClientRequestOptions
  ): Promise<HttpClientResponse<T>> {
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
      data: null as T,
    };
  }

  async get<T = unknown>(
    url: string,
    options?: Omit<HttpClientRequestOptions, 'method' | 'body'>
  ): Promise<HttpClientResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async post<T = unknown>(
    url: string,
    options?: HttpClientRequestOptions
  ): Promise<HttpClientResponse<T>> {
    return this.request<T>(url, { ...options, method: 'POST' });
  }
}
