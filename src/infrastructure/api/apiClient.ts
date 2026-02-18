import type { RequestLogEntry } from '@/shared/types';

// --- Request Logger (pluggable — wired at app init, avoids cross-layer dep) ---

type RequestLogger = (entry: RequestLogEntry) => void;
let logRequest: RequestLogger = () => {};

/** Call once at startup to connect the API client to the request log store. */
export function setRequestLogger(logger: RequestLogger) {
  logRequest = logger;
}

// --- Error Types ---

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// --- Error handling ---

interface ApiErrorBody {
  message: string | null;
  errorCode: string | null;
}

function extractBodyInfo(body: unknown): ApiErrorBody {
  const result: ApiErrorBody = { message: null, errorCode: null };
  if (body && typeof body === 'object') {
    const obj = body as Record<string, unknown>;
    if ('display_message' in obj && obj.display_message)
      result.message = String(obj.display_message);
    else if ('message' in obj && obj.message) result.message = String(obj.message);
    else if ('error_description' in obj && obj.error_description)
      result.message = String(obj.error_description);
    else if ('error' in obj && obj.error) result.message = String(obj.error);

    if ('error_code' in obj && obj.error_code) result.errorCode = String(obj.error_code);
  }
  return result;
}

function getFallbackMessage(status: number): string {
  if (status === 400) return 'Erro de validação. Verifique os dados informados.';
  if (status === 401) return 'Não autorizado. Faça login novamente.';
  if (status >= 500) return 'Erro interno do servidor. Tente novamente mais tarde.';
  return `Erro inesperado (${status}).`;
}

function getErrorInfo(status: number, body: unknown): { message: string; errorCode?: string } {
  const info = extractBodyInfo(body);
  const message = info.message ?? getFallbackMessage(status);
  const errorCode = info.errorCode ?? undefined;
  // Include error code in message so callers (e.g. import orchestrator) surface it to users
  const fullMessage = errorCode ? `[${errorCode}] ${message}` : message;
  return { message: fullMessage, errorCode };
}

// --- Helpers ---

function redactHeaders(headers: unknown): Record<string, string> {
  if (!headers || typeof headers !== 'object') return {};
  const h = headers as Record<string, string>;
  const redacted: Record<string, string> = {};
  for (const [key, value] of Object.entries(h)) {
    redacted[key] = key.toLowerCase() === 'authorization' ? '[REDACTED]' : value;
  }
  return redacted;
}

function safeParseJson(body: unknown): unknown {
  if (!body || typeof body !== 'string') return undefined;
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

// --- Generic request ---

export async function apiRequest<T>(url: string, options: RequestInit): Promise<T> {
  const method = options.method ?? 'GET';
  const requestBody = safeParseJson(options.body);

  console.group(`[API Request] ${method} ${url}`);
  console.log('Headers:', redactHeaders(options.headers));
  if (requestBody) console.log('Body:', requestBody);
  console.groupEnd();

  logRequest({
    method,
    url,
    status: 'pending',
    timestamp: Date.now(),
    requestBody,
    requestHeaders: options.headers as Record<string, string>,
  });

  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (err) {
    console.error(`[API Error] ${method} ${url} — Erro de conexão`, err);
    logRequest({
      method,
      url,
      status: 'error',
      statusCode: 0,
      timestamp: Date.now(),
      requestBody,
      requestHeaders: options.headers as Record<string, string>,
    });
    throw new ApiError(0, 'Erro de conexão. Verifique sua rede.');
  }

  if (!response.ok) {
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      // ignore parse error
    }
    const errorInfo = getErrorInfo(response.status, body);
    console.error(
      `[API Response] ${method} ${url} — Status: ${response.status} — Code: ${errorInfo.errorCode ?? 'N/A'}\nBody: ${JSON.stringify(body, null, 2)}`
    );
    logRequest({
      method,
      url,
      status: 'error',
      statusCode: response.status,
      timestamp: Date.now(),
      requestBody,
      responseBody: body,
      requestHeaders: options.headers as Record<string, string>,
    });
    throw new ApiError(response.status, errorInfo.message, errorInfo.errorCode);
  }

  const data = (await response.json()) as T;
  console.group(`[API Response] ${method} ${url} — Status: ${response.status}`);
  console.log('Data:', data);
  console.groupEnd();

  logRequest({
    method,
    url,
    status: 'success',
    statusCode: response.status,
    timestamp: Date.now(),
    requestBody,
    responseBody: data,
    requestHeaders: options.headers as Record<string, string>,
  });

  return data;
}

// --- Helper: Build authenticated headers ---

export function buildAuthHeaders(
  token: string,
  orgId: string,
  companyId: string
): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    'sil-organization': orgId,
    'sil-company': companyId,
  };
}
