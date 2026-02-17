import { registerImportService } from '@/infrastructure/api/import/importOrchestrator';
import { VeiculoImportService } from '@/infrastructure/api/import/VeiculoImportService';

let initialized = false;

/**
 * Register all import services.
 * Call this once at app startup.
 * To add a new entity type, create a new XxxImportService and register it here.
 */
export function initImportServices() {
  if (initialized) return;

  registerImportService('veiculos', new VeiculoImportService());
  // registerImportService('clientes', new ClienteImportService());
  // registerImportService('fornecedores', new FornecedorImportService());

  initialized = true;
}
