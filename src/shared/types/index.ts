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
