import type { ValidationError, ImportSummary } from '@/shared/types';
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
  let service: IImportService;
  try {
    service = getService(dataType);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Tipo de importação desconhecido.';
    return [{ field: 'Configuração', error: msg }];
  }

  let records: Record<string, unknown>[];
  try {
    records = await parseFile(file);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Não foi possível ler o arquivo.';
    return [
      {
        field: 'Arquivo',
        error: `Erro ao processar o arquivo: ${msg}. Verifique se o formato é CSV (separador , ou ;) e se o cabeçalho está correto.`,
      },
    ];
  }

  if (records.length === 0) {
    return [
      {
        field: 'Arquivo',
        error:
          'O arquivo não contém registros. Verifique se há dados abaixo da linha de cabeçalho.',
      },
    ];
  }

  // Validate header: check if the first record has the expected keys
  const firstRecord = records[0];
  const keys = Object.keys(firstRecord);
  if (keys.length === 1 && keys[0].includes(';')) {
    return [
      {
        field: 'Arquivo',
        error: `O separador do CSV não foi detectado corretamente. Use vírgula (,) ou ponto e vírgula (;) como separador de colunas. Colunas encontradas: "${keys[0]}"`,
      },
    ];
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
): Promise<ImportSummary> {
  const service = getService(dataType);

  let records: Record<string, unknown>[];
  try {
    records = await parseFile(file);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Não foi possível ler o arquivo.';
    return {
      total: 0,
      imported: 0,
      failed: 1,
      errors: [
        {
          field: 'Arquivo',
          error: `Erro ao processar o arquivo: ${msg}. Verifique se o formato é CSV (separador , ou ;) e se o cabeçalho está correto.`,
        },
      ],
    };
  }

  const summary: ImportSummary = {
    total: records.length,
    imported: 0,
    failed: 0,
    errors: [],
  };

  for (let i = 0; i < records.length; i++) {
    try {
      await service.importRecord(ctx, records[i]);
      summary.imported++;
    } catch (err: unknown) {
      summary.failed++;
      summary.errors.push({
        row: i + 1,
        field: 'API',
        error: err instanceof Error ? err.message : 'Erro desconhecido ao importar registro.',
      });
    }
  }

  return summary;
}
