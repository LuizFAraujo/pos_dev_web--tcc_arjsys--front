// ========================================
// TYPES — AUTENTICAÇÃO
// ========================================
// Alinhado com o backend ASP.NET Core 10.
// POST /api/admin/Auth/login

/**
 * Credenciais para login — campo é "usuario" (não email)
 */
export interface LoginCredentials {
  usuario: string;
  senha: string;
}

/**
 * Permissão de acesso a um módulo
 */
export interface Permissao {
  id: number;
  funcionarioId: number;
  modulo: ModuloSistema;
  nivel: NivelPermissao;
}

/**
 * Módulos disponíveis no sistema
 */
export type ModuloSistema =
  | 'Engenharia'
  | 'Comercial'
  | 'PCP'
  | 'Compras'
  | 'Almoxarifado'
  | 'Admin';

/**
 * Níveis de acesso
 */
export type NivelPermissao =
  | 'SemAcesso'
  | 'Leitura'
  | 'LeituraEscrita'
  | 'Admin';

/**
 * Dados do funcionário logado — resposta do /api/admin/Auth/login
 */
export interface FuncionarioLogado {
  funcionarioId: number;
  nome: string;
  usuario: string;
  cargo?: string;
  setor?: string;
  permissoes: Permissao[];
}

/**
 * Estado de autenticação no Zustand
 */
export interface AuthState {
  /** Funcionário logado (null se não autenticado) */
  funcionario: FuncionarioLogado | null;

  /** Se está autenticado */
  isAuthenticated: boolean;
}
