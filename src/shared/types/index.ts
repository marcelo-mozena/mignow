export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export type CommandResult<T = any> = Promise<T>;
export type QueryResult<T = any> = Promise<T>;

/**
 * Validation error produced by import services.
 * Defined here (shared layer) so Domain, Infrastructure, and Presentation
 * can all reference it without violating the dependency rule.
 */
export interface ValidationError {
  row?: number;
  field: string;
  error: string;
}

/**
 * Represents a single API request log entry.
 * Defined here so Infrastructure (apiClient) and Presentation (stores, footer)
 * can share the type without a cross-layer dependency.
 */
export interface RequestLogEntry {
  method: string;
  url: string;
  status: 'pending' | 'success' | 'error';
  statusCode?: number;
  timestamp: number;
  requestBody?: unknown;
  responseBody?: unknown;
  requestHeaders?: Record<string, string>;
}
