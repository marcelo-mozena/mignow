// --- JWT Types ---

export interface JwtOrg {
  id: string;
  companies: string[];
  nome?: string;
}

export interface JwtPayload {
  iss: string;
  sub: string;
  aud: string;
  iat: number;
  exp: number;
  name: string;
  orgs: JwtOrg[];
  [key: string]: unknown;
}

/**
 * Decode a JWT token payload without verifying the signature.
 * Only use this client-side for reading claims — never trust for auth decisions.
 */
export function decodeJwt(token: string): JwtPayload {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Token JWT inválido: formato incorreto.');
  }

  const payload = parts[1];
  // Handle base64url → base64 conversion
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const json = atob(base64);
  const decoded = JSON.parse(json) as JwtPayload;

  if (!decoded.orgs || !Array.isArray(decoded.orgs)) {
    throw new Error('Token JWT não contém organizações.');
  }

  return decoded;
}
