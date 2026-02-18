// --- Environment Types & URL Construction ---
// Shared across all layers (infrastructure, presentation, etc.)

export type Environment = 'test' | 'staging' | 'sandbox' | 'prod';

const BASE_URLS: Record<Environment, string> = {
  test: 'https://api.platform.test.silsistemas.com.br',
  staging: 'https://api.platform.staging.silsistemas.com.br',
  sandbox: 'https://api.platform.sandbox.silsistemas.com.br',
  prod: 'https://api.platform.silsistemas.com.br',
};

export function getBaseUrl(env: Environment): string {
  return BASE_URLS[env];
}
