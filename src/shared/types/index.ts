export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    error_code: string;
    error_message: string;
    display_message: string;
  };
  timestamp: string;
}

export type CommandResult<T = unknown> = Promise<T>;
export type QueryResult<T = unknown> = Promise<T>;

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

export interface ImportSummary {
  total: number;
  imported: number;
  failed: number;
  errors: ValidationError[];
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
