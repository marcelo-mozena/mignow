import type { ValidationError } from '@/shared/types';
import type { IImportService, ImportContext } from '@/domain/interfaces/IImportService';
import { apiRequest, buildAuthHeaders } from '@/infrastructure/api/apiClient';

// --- Fields for Veículo Fabricante ---

const REQUIRED_FIELDS: Array<{ field: string; label: string }> = [
  { field: 'nome', label: 'Nome' },
  { field: 'ativo', label: 'Ativo' },
];

const VALID_ATIVO = ['true', 'false'];

// --- Service ---

export class VeiculoFabricanteImportService implements IImportService {
  validateRecord(record: Record<string, unknown>, index: number): ValidationError[] {
    const errors: ValidationError[] = [];
    const row = index + 1;

    // Required fields
    for (const { field, label } of REQUIRED_FIELDS) {
      const val = record[field];
      if (val === undefined || val === null || String(val).trim() === '') {
        errors.push({
          row,
          field: label,
          error: `Campo obrigatório "${label}" não informado.`,
        });
      }
    }

    // "ativo" must be true or false
    if (record.ativo !== undefined && record.ativo !== null && String(record.ativo).trim() !== '') {
      const ativoStr = String(record.ativo).trim().toLowerCase();
      if (!VALID_ATIVO.includes(ativoStr)) {
        errors.push({
          row,
          field: 'Ativo',
          error: `Valor "${record.ativo}" inválido para "Ativo". Permitidos: true, false`,
        });
      }
    }

    return errors;
  }

  async importRecord(ctx: ImportContext, record: Record<string, unknown>): Promise<void> {
    const headers = buildAuthHeaders(ctx.authToken, ctx.organizationId, ctx.companyId);

    // Normalize ativo to boolean
    const ativo = String(record.ativo).trim().toLowerCase() === 'true';

    const payload = {
      doc: 'false',
      data: {
        nome: String(record.nome).trim(),
        ativo,
      },
    };

    await apiRequest(`${ctx.baseUrl}/client/tms-base/v2/veiculos/fabricantes`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  }
}
