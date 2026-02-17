import type { ValidationError } from '@/presentation/components/features/import/ImportTab';
import type { IImportService, ImportContext } from '@/domain/interfaces/IImportService';
import { parseFile } from '@/shared/utils/fileParser';

/**
 * Registry mapping import data types to their service implementations.
 * New entity types should be registered here.
 */
const serviceRegistry = new Map<string, IImportService>();

export function registerImportService(dataType: string, service: IImportService) {
  serviceRegistry.set(dataType, service);
}

function getService(dataType: string): IImportService {
  const service = serviceRegistry.get(dataType);
  if (!service) {
    throw new Error(`Serviço de importação não encontrado para: "${dataType}"`);
  }
  return service;
}

/**
 * Validate all records in a file using the registered service.
 */
export async function validateImport(dataType: string, file: File): Promise<ValidationError[]> {
  const service = getService(dataType);
  const records = await parseFile(file);

  if (records.length === 0) {
    return [{ field: 'Arquivo', error: 'O arquivo não contém registros.' }];
  }

  const allErrors: ValidationError[] = [];
  for (let i = 0; i < records.length; i++) {
    const errors = service.validateRecord(records[i], i);
    allErrors.push(...errors);
  }

  return allErrors;
}

/**
 * Import all records in a file using the registered service.
 * Records are sent one by one sequentially.
 */
export async function executeImport(
  dataType: string,
  file: File,
  ctx: ImportContext
): Promise<void> {
  const service = getService(dataType);
  const records = await parseFile(file);

  for (const record of records) {
    await service.importRecord(ctx, record);
  }
}
