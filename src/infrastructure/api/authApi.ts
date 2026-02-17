import { Environment, getBaseUrl } from '@/presentation/stores/useAuthStore';
import { apiRequest, ApiError } from '@/infrastructure/api/apiClient';

export { ApiError };

// --- Types ---

export interface OtpRequestPayload {
  grant_type: 'otp';
  username: string;
  identifier_type: 'email';
  delivery_method: 'whatsapp';
}

export interface TokenRequestPayload {
  username: string;
  password: string;
  grant_type: 'otp';
  interface: 'WEB';
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  [key: string]: unknown;
}

// --- API Calls ---

export async function sendOtp(environment: Environment, email: string): Promise<void> {
  const baseUrl = getBaseUrl(environment);
  const payload: OtpRequestPayload = {
    grant_type: 'otp',
    username: email,
    identifier_type: 'email',
    delivery_method: 'whatsapp',
  };

  await apiRequest(`${baseUrl}/oauth/v4/otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function validateToken(
  environment: Environment,
  email: string,
  otpCode: string,
  isEnvironmentSetup: boolean
): Promise<TokenResponse> {
  const baseUrl = getBaseUrl(environment);
  const payload: TokenRequestPayload = {
    username: email,
    password: otpCode,
    grant_type: 'otp',
    interface: 'WEB',
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (isEnvironmentSetup) {
    headers['Sil-Backoffice'] = 'true';
  }

  return apiRequest<TokenResponse>(`${baseUrl}/oauth/v4/token`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
}
