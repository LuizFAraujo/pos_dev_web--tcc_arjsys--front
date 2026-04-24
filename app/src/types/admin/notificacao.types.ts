// ========================================
// TYPES — NOTIFICAÇÕES (Admin) — v3
// ========================================
// Alinhado com backend ASP.NET Core 10 — feature/vendas
// /api/admin/Notificacoes
//
// Notificações são por módulo destino (não por usuário).
// Front consome (back gera automaticamente em vários pontos).

// ============================================
// MÓDULO DO SISTEMA
// ============================================

export type ModuloSistema =
  | 'Engenharia'
  | 'Comercial'
  | 'Producao'
  | 'Compras'
  | 'Almoxarifado'
  | 'Admin';

export const MODULO_LABELS: Record<ModuloSistema, string> = {
  Engenharia: 'Engenharia',
  Comercial: 'Comercial',
  Producao: 'Produção',
  Compras: 'Compras',
  Almoxarifado: 'Almoxarifado',
  Admin: 'Administração',
};

// ============================================
// TIPO DA NOTIFICAÇÃO
// ============================================

export type TipoNotificacao = 'Info' | 'Sucesso' | 'Aviso' | 'Erro';

export const TIPO_NOTIFICACAO_LABELS: Record<TipoNotificacao, string> = {
  Info: 'Informação',
  Sucesso: 'Sucesso',
  Aviso: 'Aviso',
  Erro: 'Erro',
};

export const TIPO_NOTIFICACAO_COLORS: Record<TipoNotificacao, string> = {
  Info: 'text-blue-600 dark:text-blue-400',
  Sucesso: 'text-green-600 dark:text-green-400',
  Aviso: 'text-amber-600 dark:text-amber-400',
  Erro: 'text-red-600 dark:text-red-400',
};

export const TIPO_NOTIFICACAO_BG: Record<TipoNotificacao, string> = {
  Info: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',
  Sucesso: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20',
  Aviso: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20',
  Erro: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
};

// ============================================
// NOTIFICAÇÃO
// ============================================

export interface Notificacao {
  id: number;
  moduloDestino: ModuloSistema;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  lida: boolean;
  dataLeitura?: string | null;

  // Rastro de origem (tabela + id) para navegação "ir pra origem"
  origemTabela?: string | null;
  origemId?: number | null;

  criadoEm: string;
  modificadoEm?: string | null;
}

// ============================================
// FORM DATA (criação manual — uso raro, back gera sozinho na maioria dos casos)
// ============================================

export interface NotificacaoCreateData {
  moduloDestino: ModuloSistema;
  tipo?: TipoNotificacao;
  titulo: string;
  mensagem: string;
  origemTabela?: string;
  origemId?: number;
}

// ============================================
// FILTROS DE LISTAGEM
// ============================================

export interface NotificacaoFiltros {
  modulo: ModuloSistema;
  lidas?: boolean;
  pagina?: number;
  tamanho?: number;
}
