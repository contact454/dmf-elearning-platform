/**
 * Database port interface (Giao diện Cổng Cơ sở dữ liệu)
 * 
 * This interface defines the contract for database implementations.
 * Services implement adapters (e.g., PostgreSQL, MongoDB, in-memory).
 */

/**
 * Database connection options (Tùy chọn Kết nối Cơ sở dữ liệu)
 */
export interface DatabaseConnectionOptions {
  host: string;
  port: number;
  database: string;
  username?: string;
  password?: string;
  [key: string]: unknown;
}

/**
 * Database port interface (Giao diện Cổng Cơ sở dữ liệu)
 * 
 * Services implement this interface with concrete adapters.
 * This is a minimal interface; services may extend it.
 */
export interface Database {
  /**
   * Connect to database (Kết nối cơ sở dữ liệu)
   * 
   * @param options - Connection options
   * @returns Promise that resolves when connected
   */
  connect(options: DatabaseConnectionOptions): Promise<void>;

  /**
   * Disconnect from database (Ngắt kết nối cơ sở dữ liệu)
   * 
   * @returns Promise that resolves when disconnected
   */
  disconnect(): Promise<void>;

  /**
   * Execute query (Thực thi truy vấn)
   * 
   * @param query - SQL query or query object
   * @param params - Query parameters
   * @returns Promise that resolves with query results
   */
  query<T = unknown>(query: string, params?: unknown[]): Promise<T[]>;

  /**
   * Execute transaction (Thực thi giao dịch)
   * 
   * @param callback - Transaction callback
   * @returns Promise that resolves with transaction result
   */
  transaction<T>(callback: () => Promise<T>): Promise<T>;
}
