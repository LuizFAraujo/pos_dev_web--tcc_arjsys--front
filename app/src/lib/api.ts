// ========================================
// API CLIENT — Cliente HTTP centralizado
// ========================================
// Base para todas as chamadas ao backend.
// Usa fetch nativo com tipagem forte.
// Se um dia migrar para Axios, só muda aqui.

const API_BASE_URL = 'http://localhost:7000';

// ============================================
// TIPOS DE ERRO
// ============================================

/** Formato de erro retornado pelo backend */
interface ApiErrorResponse {
  erro: string;
}

/** Erro customizado para erros da API */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// ============================================
// FUNÇÃO BASE
// ============================================

/**
 * Função base para todas as requisições à API.
 *
 * @param endpoint - Caminho do endpoint (ex: '/api/engenharia/Produtos')
 * @param options - Opções do fetch (method, body, headers, etc.)
 * @returns Dados tipados da resposta
 * @throws ApiError com mensagem do backend ou mensagem genérica
 *
 * Uso:
 * ```ts
 * const produtos = await apiFetch<Produto[]>('/api/engenharia/Produtos');
 * ```
 */
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  };

  let response: Response;

  try {
    response = await fetch(url, config);
  } catch {
    throw new ApiError(
      'Erro de conexão com o servidor. Verifique se o backend está rodando.',
      0,
    );
  }

  // DELETE pode retornar 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  // Tenta parsear o JSON
  let data: T | ApiErrorResponse;

  try {
    data = await response.json();
  } catch {
    throw new ApiError('Resposta inválida do servidor.', response.status);
  }

  // Se não foi OK, trata o erro do backend
  if (!response.ok) {
    const errorData = data as ApiErrorResponse;
    const message = errorData?.erro || `Erro ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return data as T;
}

// ============================================
// HELPERS — Atalhos para cada método HTTP
// ============================================

/** GET request */
export async function apiGet<T>(endpoint: string): Promise<T> {
  return apiFetch<T>(endpoint, { method: 'GET' });
}

/** POST request */
export async function apiPost<T>(endpoint: string, body?: unknown): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/** PUT request */
export async function apiPut<T>(endpoint: string, body: unknown): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/** PATCH request */
export async function apiPatch<T>(endpoint: string, body: unknown): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/** DELETE request */
export async function apiDelete<T = void>(endpoint: string): Promise<T> {
  return apiFetch<T>(endpoint, { method: 'DELETE' });
}
