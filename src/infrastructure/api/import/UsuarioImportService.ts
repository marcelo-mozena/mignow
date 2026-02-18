import type { ValidationError } from '@/shared/types';
import type { IImportService, ImportContext } from '@/domain/interfaces/IImportService';
import { apiRequest, buildAuthHeaders } from '@/infrastructure/api/apiClient';
import { isValidCpf, isValidEmail, getEndOfCurrentDecade } from '@/shared/utils/validators';

// --- Fields ---

const REQUIRED_FIELDS: Array<{ field: string; label: string }> = [
  { field: 'nome', label: 'Nome' },
  { field: 'email', label: 'E-mail' },
  { field: 'cpf', label: 'CPF' },
];

// --- Service ---

export class UsuarioImportService implements IImportService {
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

    // Email format validation
    const email = record.email;
    if (email !== undefined && email !== null && String(email).trim() !== '') {
      if (!isValidEmail(String(email))) {
        errors.push({
          row,
          field: 'E-mail',
          error: `Valor "${email}" não é um e-mail válido.`,
        });
      }
    }

    // CPF validation
    const cpf = record.cpf;
    if (cpf !== undefined && cpf !== null && String(cpf).trim() !== '') {
      if (!isValidCpf(String(cpf))) {
        errors.push({
          row,
          field: 'CPF',
          error: `Valor "${cpf}" não é um CPF válido.`,
        });
      }
    }

    return errors;
  }

  async importRecord(ctx: ImportContext, record: Record<string, unknown>): Promise<void> {
    const headers = buildAuthHeaders(ctx.authToken, ctx.organizationId, ctx.companyId);

    const nome = String(record.nome ?? '').trim();
    const email = String(record.email ?? '').trim();
    const cpf = String(record.cpf ?? '').replace(/\D/g, '');
    const telefone = record.telefone ? String(record.telefone).trim() : '';
    const acessoExpiraEm = getEndOfCurrentDecade();

    const payload = {
      doc: '',
      data: {
        nome,
        email,
        cpf,
        telefone,
        organizacao_ativa: {
          observacao: '',
          acesso_expira_em: acessoExpiraEm,
          ativo: true,
          integracao: {
            identificacao_api: '',
          },
          pessoa: {
            identificacao_api: '',
          },
        },
      },
    };

    await apiRequest(`${ctx.baseUrl}/client-admin/base/v2/usuarios`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  }
}
