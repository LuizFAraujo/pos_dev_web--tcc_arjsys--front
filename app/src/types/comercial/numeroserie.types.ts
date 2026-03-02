// ========================================
// TYPES — NÚMERO DE SÉRIE (Comercial)
// ========================================
// Alinhado com backend ASP.NET Core 10
// /api/comercial/NumeroSerie
// Código formato: II.MM.AA.NNNNN (idade empresa desde 1966 . mês . ano . sequencial)
// Status: Aberto → EmFabricacao → Concluido → Entregue

export type StatusNumeroSerie =
  | 'Aberto'
  | 'EmFabricacao'
  | 'Concluido'
  | 'Entregue';

export const TRANSICOES_NS: Record<StatusNumeroSerie, StatusNumeroSerie[]> = {
  Aberto: ['EmFabricacao'],
  EmFabricacao: ['Concluido'],
  Concluido: ['Entregue'],
  Entregue: [],
};

export const NS_STATUS_LABELS: Record<StatusNumeroSerie, string> = {
  Aberto: 'Aberto',
  EmFabricacao: 'Em Fabricação',
  Concluido: 'Concluído',
  Entregue: 'Entregue',
};

export const NS_STATUS_COLORS: Record<StatusNumeroSerie, string> = {
  Aberto: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  EmFabricacao: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  Concluido: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Entregue: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
};

export interface NumeroSerie {
  id: number;
  codigo: string;
  pedidoVendaId: number;
  pedidoVendaCodigo?: string;
  clienteNome?: string;
  status: StatusNumeroSerie;
  criadoEm?: string;
  modificadoEm?: string;
}

export interface NumeroSerieFormData {
  pedidoVendaId: number;
}
