import type { ValidationError } from '@/presentation/components/features/import/ImportTab';
import type { IImportService, ImportContext } from '@/domain/interfaces/IImportService';
import { apiRequest, buildAuthHeaders } from '@/infrastructure/api/apiClient';

// --- All fields for Veículo (all required) ---

const ALL_FIELDS: Array<{ field: string; label: string }> = [
  { field: 'placa', label: 'Placa' },
  { field: 'placa_estado_id', label: 'Estado da Placa' },
  { field: 'renavam', label: 'Renavam' },
  { field: 'chassi', label: 'Chassi' },
  { field: 'ano', label: 'Ano' },
  { field: 'ano_modelo', label: 'Ano Modelo' },
  { field: 'cor', label: 'Cor' },
  { field: 'tara', label: 'Tara' },
  { field: 'lotacao_kg', label: 'Lotação (kg)' },
  { field: 'lotacao_palete', label: 'Lotação (palete)' },
  { field: 'capacidade_volume_m3', label: 'Capacidade Volume (m³)' },
  { field: 'capacidade_litros', label: 'Capacidade (litros)' },
  { field: 'situacao', label: 'Situação' },
  { field: 'data_compra', label: 'Data de Compra' },
  { field: 'tipo', label: 'Tipo' },
  { field: 'tipo_rodado', label: 'Tipo Rodado' },
  { field: 'tipo_carroceria', label: 'Tipo Carroceria' },
  { field: 'tipo_roda', label: 'Tipo Roda' },
  { field: 'quantidade_eixos', label: 'Quantidade Eixos' },
  { field: 'cidade', label: 'Cidade' },
  { field: 'fabricante', label: 'Fabricante' },
  { field: 'fabricante_modelo', label: 'Fabricante Modelo' },
  { field: 'tipo_carga', label: 'Tipo Carga' },
  { field: 'utilizacao', label: 'Utilização' },
  { field: 'veiculo_tipo', label: 'Veículo Tipo' },
  { field: 'motorista_id', label: 'Motorista ID' },
  { field: 'motorista_nome', label: 'Motorista Nome' },
  { field: 'frota', label: 'Frota' },
  { field: 'modelo', label: 'Modelo' },
  { field: 'marca', label: 'Marca' },
  { field: 'propriedade', label: 'Propriedade' },
  { field: 'fornecedor', label: 'Fornecedor' },
  { field: 'proprietario', label: 'Proprietário' },
  { field: 'grupo', label: 'Grupo' },
];

// --- Valid enum values ---

const VALID_TIPO = ['TRA', 'REB', 'BIT', 'SRB'];
const VALID_TIPO_RODADO = ['TOC', 'TAN', 'TRI'];
const VALID_TIPO_CARROCERIA = ['NAP', 'ABE', 'FEC', 'GRA', 'TAN'];
const VALID_TIPO_RODA = ['SIM', 'DUP'];
const VALID_PROPRIEDADE = ['P', 'T'];

// --- Service ---

export class VeiculoImportService implements IImportService {
  validateRecord(record: Record<string, unknown>, index: number): ValidationError[] {
    const errors: ValidationError[] = [];
    const row = index + 1;

    // All fields are required
    for (const { field, label } of ALL_FIELDS) {
      const val = record[field];
      if (val === undefined || val === null || String(val).trim() === '') {
        errors.push({
          row,
          field: label,
          error: `Campo obrigatório "${label}" não informado.`,
        });
      }
    }

    // Enum validations
    if (record.tipo && !VALID_TIPO.includes(String(record.tipo))) {
      errors.push({
        row,
        field: 'Tipo',
        error: `Valor "${record.tipo}" inválido. Permitidos: ${VALID_TIPO.join(', ')}`,
      });
    }

    if (record.tipo_rodado && !VALID_TIPO_RODADO.includes(String(record.tipo_rodado))) {
      errors.push({
        row,
        field: 'Tipo Rodado',
        error: `Valor "${record.tipo_rodado}" inválido. Permitidos: ${VALID_TIPO_RODADO.join(', ')}`,
      });
    }

    if (record.tipo_carroceria && !VALID_TIPO_CARROCERIA.includes(String(record.tipo_carroceria))) {
      errors.push({
        row,
        field: 'Tipo Carroceria',
        error: `Valor "${record.tipo_carroceria}" inválido. Permitidos: ${VALID_TIPO_CARROCERIA.join(', ')}`,
      });
    }

    if (record.tipo_roda && !VALID_TIPO_RODA.includes(String(record.tipo_roda))) {
      errors.push({
        row,
        field: 'Tipo Roda',
        error: `Valor "${record.tipo_roda}" inválido. Permitidos: ${VALID_TIPO_RODA.join(', ')}`,
      });
    }

    if (record.propriedade && !VALID_PROPRIEDADE.includes(String(record.propriedade))) {
      errors.push({
        row,
        field: 'Propriedade',
        error: `Valor "${record.propriedade}" inválido. Permitidos: ${VALID_PROPRIEDADE.join(', ')}`,
      });
    }

    // Numeric validations
    const numericFields = [
      'quantidade_eixos',
      'ano',
      'ano_modelo',
      'tara',
      'lotacao_kg',
      'lotacao_palete',
      'capacidade_volume_m3',
      'capacidade_litros',
      'grupo',
    ];
    for (const f of numericFields) {
      if (record[f] !== undefined && record[f] !== '' && isNaN(Number(record[f]))) {
        errors.push({
          row,
          field: f,
          error: `Valor "${record[f]}" deve ser numérico.`,
        });
      }
    }

    return errors;
  }

  async importRecord(ctx: ImportContext, record: Record<string, unknown>): Promise<void> {
    const headers = buildAuthHeaders(ctx.authToken, ctx.organizationId, ctx.companyId);
    const payload = {
      doc: 'false',
      data: record,
    };

    await apiRequest(`${ctx.baseUrl}/client/tms-base/v2/veiculos`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  }
}
