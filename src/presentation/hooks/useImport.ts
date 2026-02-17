import { useCallback } from 'react';
import type { ValidationError, ImportSummary } from '@/shared/types';
import type { ImportContext } from '@/domain/interfaces/IImportService';
import { validateImport, executeImport } from '@/infrastructure/api/import/importOrchestrator';
import { useAuthStore, getBaseUrl, type Environment } from '@/presentation/stores/useAuthStore';
import { useOrgStore } from '@/presentation/stores/useOrgStore';

/**
 * Hook that provides onValidate and onImport callbacks
 * wired to the import orchestrator with the current auth/org context.
 */
export function useImport() {
  const { authToken, environment } = useAuthStore();
  const { selectedOrgId, selectedCompanyId } = useOrgStore();

  const getContext = useCallback((): ImportContext => {
    if (!environment) throw new Error('Ambiente não selecionado.');
    if (!authToken) throw new Error('Não autenticado.');
    if (!selectedOrgId) throw new Error('Organização não selecionada.');
    if (!selectedCompanyId) throw new Error('Empresa não selecionada.');

    return {
      baseUrl: getBaseUrl(environment as Environment),
      authToken,
      organizationId: selectedOrgId,
      companyId: selectedCompanyId,
    };
  }, [authToken, environment, selectedOrgId, selectedCompanyId]);

  const onValidate = useCallback(
    async (dataType: string, file: File): Promise<ValidationError[]> => {
      return validateImport(dataType, file);
    },
    []
  );

  const onImport = useCallback(
    async (dataType: string, file: File): Promise<ImportSummary> => {
      const ctx = getContext();
      return executeImport(dataType, file, ctx);
    },
    [getContext]
  );

  return { onValidate, onImport };
}
