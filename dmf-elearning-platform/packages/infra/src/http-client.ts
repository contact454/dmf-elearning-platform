/**
 * HTTP Client interface (Giao diện Khách HTTP)
 * 
 * This interface defines the contract for read-only service-to-service HTTP calls.
 * Services use this to fetch data from other services (not direct DB access).
 */

/**
 * HTTP request options (Tùy chọn Yêu cầu HTTP)
 */
export interface HttpClientRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

/**
 * HTTP response (Phản hồi HTTP)
 */
export interface HttpClientResponse<T = unknown> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
}

/**
 * HTTP Client interface (Giao diện Khách HTTP)
 * 
 * Services implement this interface with concrete adapters (e.g., axios, fetch).
 * Used for read-only service-to-service calls.
 */
export interface HttpClient {
  /**
   * Send HTTP request (Gửi yêu cầu HTTP)
   * 
   * @param url - Request URL
   * @param options - Request options
   * @returns Promise that resolves with response
   */
  request<T = unknown>(
    url: string,
    options?: HttpClientRequestOptions
  ): Promise<HttpClientResponse<T>>;

  /**
   * GET request (Yêu cầu GET)
   * 
   * @param url - Request URL
   * @param options - Request options
   * @returns Promise that resolves with response
   */
  get<T = unknown>(
    url: string,
    options?: Omit<HttpClientRequestOptions, 'method' | 'body'>
  ): Promise<HttpClientResponse<T>>;

  /**
   * POST request (Yêu cầu POST)
   * 
   * @param url - Request URL
   * @param options - Request options
   * @returns Promise that resolves with response
   */
  post<T = unknown>(
    url: string,
    options?: HttpClientRequestOptions
  ): Promise<HttpClientResponse<T>>;
}
