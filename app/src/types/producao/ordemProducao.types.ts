// ========================================
// TYPES — ORDEM DE PRODUÇÃO (Produção) — v3.1
// ========================================
// Alinhado com backend ASP.NET Core 10 — /api/producao/OrdemProducao
//
// v3.1 (22/04): ganha clienteCodigo (nullable — OP de estoque não tem cliente)
//
// Códigos:
//   Master: OP.AAAA.MM.NNNN
//   Filha:  OP.AAAA.MM.NNNN/NNNN

// ============================================
// STATUS
// ============================================

export type StatusOrdemProducao =
  | 'Pendente'
  | 'Andamento'
  | 'Pausada'
  | 'Concluida'
  | 'Cancelada';

export const STATUS_OP_LABELS: Record<StatusOrdemProducao, string> = {
  Pendente: 'Pendente',
  Andamento: 'Em Andamento',
  Pausada: 'Pausada',
  Concluida: 'Concluída',
  Cancelada: 'Cancelada',
};

export const STATUS_OP_COLORS: Record<StatusOrdemProducao, string> = {
  Pendente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  Andamento: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  Pausada: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
  Concluida: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  Cancelada: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export const STATUS_OP_TERMINAIS: StatusOrdemProducao[] = ['Concluida', 'Cancelada'];

// ============================================
// EVENTOS
// ============================================

export type EventoOrdemProducao =
  | 'Criada'
  | 'Iniciada'
  | 'Pausada'
  | 'Retomada'
  | 'Concluida'
  | 'Cancelada'
  | 'Apontamento';

export const EVENTO_OP_LABELS: Record<EventoOrdemProducao, string> = {
  Criada: 'Criada',
  Iniciada: 'Iniciada',
  Pausada: 'Pausada',
  Retomada: 'Retomada',
  Concluida: 'Concluída',
  Cancelada: 'Cancelada',
  Apontamento: 'Apontamento',
};

// ============================================
// ITEM DA OP (snapshot da BOM)
// ============================================

export interface OrdemProducaoItem {
  id: number;
  ordemProducaoId: number;
  produtoId: number;
  produtoCodigo: string;
  produtoDescricao: string;
  produtoUnidade: string;
  quantidadePlanejada: number;
  quantidadeProduzida: number;
  quantidadeFaltante: number;
  percentualConcluido: number;
  observacao?: string | null;
  criadoEm?: string;
  modificadoEm?: string | null;
}

export interface OrdemProducaoFilhaResumo {
  id: number;
  codigo: string;
  produtoId: number;
  produtoCodigo: string;
  produtoDescricao: string;
  status: StatusOrdemProducao;
  percentualConcluido: number;
}

// ============================================
// ORDEM DE PRODUÇÃO
// ============================================

export interface OrdemProducao {
  id: number;
  codigo: string;

  // PV (opcional — null = estoque)
  pedidoVendaId?: number | null;
  pedidoVendaCodigo?: string | null;
  /** v3.1 — nullable: OP de estoque (sem PV) não tem cliente */
  clienteCodigo?: string | null;
  clienteNome?: string | null;

  // Produto (Master: raiz da BOM; Filha: produto da estrutura)
  produtoId: number;
  produtoCodigo: string;
  produtoDescricao: string;

  // Hierarquia
  ordemPaiId?: number | null;
  ordemPaiCodigo?: string | null;
  ehMaster: boolean;
  ehEstoque: boolean;

  // Estado
  status: StatusOrdemProducao;
  dataInicio?: string | null;
  dataFim?: string | null;
  observacoes?: string | null;

  // Relacionados
  itens: OrdemProducaoItem[];
  filhas: OrdemProducaoFilhaResumo[];

  criadoEm?: string;
  modificadoEm?: string | null;
}

export interface OrdemProducaoHistorico {
  id: number;
  ordemProducaoId: number;
  evento: EventoOrdemProducao;
  statusAnterior?: StatusOrdemProducao | null;
  statusNovo?: StatusOrdemProducao | null;
  justificativa?: string | null;
  detalhe?: string | null;
  dataHora: string;
}

export interface OrdemProducaoStatusProducao {
  ordemProducaoId: number;
  codigo: string;
  status: StatusOrdemProducao;
  itens: OrdemProducaoItem[];
  percentualTotal: number;
  tudoProduzido: boolean;
}

export interface OrdemProducaoDivergenciaItem {
  produtoId: number;
  produtoCodigo: string;
  produtoDescricao: string;
  quantidadeNaOp: number;
  quantidadeNaBomAtual: number;
  diferenca: number;
  observacao: string;
}

export interface OrdemProducaoDivergencia {
  ordemProducaoId: number;
  codigo: string;
  temDivergencia: boolean;
  divergencias: OrdemProducaoDivergenciaItem[];
}

export interface OrdemProducaoMasterCreateData {
  pedidoVendaId?: number | null;
  produtoId: number;
  observacoes?: string;
}

export interface OrdemProducaoFilhaCreateData {
  ordemPaiId: number;
  produtoId: number;
  observacoes?: string;
}

export interface OrdemProducaoUpdateData {
  observacoes?: string;
}

export interface OrdemProducaoStatusUpdate {
  novoStatus: StatusOrdemProducao;
  justificativa?: string;
}

export interface OrdemProducaoApontamentoData {
  quantidade: number;
  observacao?: string;
}
