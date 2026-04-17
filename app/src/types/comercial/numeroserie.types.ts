// ========================================
// TYPES — NÚMERO DE SÉRIE (Comercial)
// ========================================
// Alinhado com backend ASP.NET Core 10
// /api/comercial/NumeroSerie
// Código formato: II.MM.AA.NNNNN (idade empresa desde 1966 . mês . ano . sequencial)
// Status: Aguardando → EmAndamento → AguardandoEntrega → Entregue
// Tipo: Normal | VendaFutura

// ============================================
// TIPO
// ============================================

export type TipoNumeroSerie = 'Normal' | 'VendaFutura';

export const TIPO_NS_LABELS: Record<TipoNumeroSerie, string> = {
  Normal: 'Normal',
  VendaFutura: 'Venda Futura',
};

export const TIPO_NS_COLORS: Record<TipoNumeroSerie, string> = {
  Normal: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  VendaFutura: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
};

// ============================================
// STATUS
// ============================================

export type StatusNumeroSerie =
  | 'Aguardando'
  | 'EmAndamento'
  | 'AguardandoEntrega'
  | 'Entregue'
  | 'Cancelado';

export const TRANSICOES_NS: Record<StatusNumeroSerie, StatusNumeroSerie[]> = {
  Aguardando: ['EmAndamento', 'Cancelado'],
  EmAndamento: ['AguardandoEntrega', 'Cancelado'],
  AguardandoEntrega: ['Entregue', 'EmAndamento'],
  Entregue: [],
  Cancelado: [],
};

export const NS_STATUS_LABELS: Record<StatusNumeroSerie, string> = {
  Aguardando: 'Aguardando',
  EmAndamento: 'Em Andamento',
  AguardandoEntrega: 'Aguardando Entrega',
  Entregue: 'Entregue',
  Cancelado: 'Cancelado',
};

export const NS_STATUS_COLORS: Record<StatusNumeroSerie, string> = {
  Aguardando: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  EmAndamento: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  AguardandoEntrega: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  Entregue: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  Cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

// ============================================
// NÚMERO DE SÉRIE
// ============================================

export interface NumeroSerie {
  id: number;
  codigo: string;
  pedidoVendaId: number;
  pedidoVendaCodigo?: string;
  clienteNome?: string;
  tipo: TipoNumeroSerie;
  status: StatusNumeroSerie;
  codigoProjeto?: string;
  criadoEm?: string;
  modificadoEm?: string;
}

/** Dados para criar NS — tipo e status conforme regras de negócio */
export interface NumeroSerieFormData {
  pedidoVendaId: number;
  tipo?: TipoNumeroSerie;
  status?: StatusNumeroSerie;
  codigoProjeto?: string;
}

/** Dados para alterar status do NS */
export interface StatusNumeroSerieUpdate {
  novoStatus: StatusNumeroSerie;
}
