import type { ValidationError } from '@/shared/types';

/**
 * Context for import operations — carries auth + org info.
 */
export interface ImportContext {
  baseUrl: string;
  authToken: string;
  organizationId: string;
  companyId: string;
}

/**
 * Generic import service interface.
 * Each entity type (veiculos, clientes, etc.) implements this.
 */
export interface IImportService {
  /**
   * Validate a single record before importing.
   * Returns an array of validation errors (empty = valid).
   */
  validateRecord(record: Record<string, unknown>, index: number): ValidationError[];

  /**
   * Import a single record to the API.
   */
  importRecord(ctx: ImportContext, record: Record<string, unknown>): Promise<void>;
}
