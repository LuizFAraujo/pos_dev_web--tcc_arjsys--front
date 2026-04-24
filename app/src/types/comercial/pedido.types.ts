// ========================================
// TYPES — PEDIDO DE VENDA (Comercial) — v3.1
// ========================================
// Alinhado com backend ASP.NET Core 10 — feature/vendas
// CRUD /api/comercial/PedidoVenda
//
// Mudanças v3.1 em relação a v3:
//   - Itens vão junto no POST/PUT (array obrigatório, >= 1 item)
//   - PUT retorna 200 OK com o PV completo (não mais 204)
//   - Edição permitida em status avançado, com justificativa obrigatória
//   - Novo evento ItensAlterados registra alterações em status avançado
//   - DTOs PedidoVendaCreateData / PedidoVendaUpdateData (com itens) /
//     ItemPedidoCreateData / ItemPedidoUpsertData
//   - PV ganha campo clienteCodigo (ex: "CLI-0042")
//
// Fluxo Normal:    Liberado → Andamento → Concluido → AEntregar → Entregue
// Fluxo PreVenda:  AguardandoNS → RecebidoNS → AguardandoRetorno → Liberado → (fluxo Normal)
// Especiais:       Pausado, Cancelado, Reaberto, Devolvido

// ============================================
// TIPO
// ============================================

export type TipoPedidoVenda = 'Normal' | 'PreVenda';

export const TIPO_PV_LABELS: Record<TipoPedidoVenda, string> = {
  Normal: 'Normal',
  PreVenda: 'Pré-venda',
};

export const TIPO_PV_COLORS: Record<TipoPedidoVenda, string> = {
  Normal: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  PreVenda: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
};

// ============================================
// STATUS (12 valores)
// ============================================

export type StatusPedido =
  // Fluxo PreVenda
  | 'AguardandoNS'
  | 'RecebidoNS'
  | 'AguardandoRetorno'
  // Fluxo comum
  | 'Liberado'
  | 'Andamento'
  | 'Concluido'
  | 'AEntregar'
  | 'Entregue'
  // Especiais
  | 'Pausado'
  | 'Cancelado'
  | 'Reaberto'
  | 'Devolvido';

/** Ordem canônica do fluxo (base para cálculo de retrocesso) */
export const FLUXO_PREVENDA: StatusPedido[] = [
  'AguardandoNS',
  'RecebidoNS',
  'AguardandoRetorno',
  'Liberado',
  'Andamento',
  'Concluido',
  'AEntregar',
  'Entregue',
];

export const FLUXO_NORMAL: StatusPedido[] = [
  'Liberado',
  'Andamento',
  'Concluido',
  'AEntregar',
  'Entregue',
];

/** Status iniciais — edição livre, sem justificativa */
export const STATUS_INICIAL: StatusPedido[] = [
  'AguardandoNS',
  'RecebidoNS',
  'AguardandoRetorno',
  'Liberado',
];

/**
 * Status avançados — edição permitida com justificativa obrigatória.
 * Gera evento ItensAlterados e notifica Eng/Prod/Almox.
 */
export const STATUS_AVANCADO: StatusPedido[] = [
  'Andamento',
  'Concluido',
  'AEntregar',
  'Pausado',
];

/** Status bloqueados — edição 100% proibida. Front esconde botão Editar. */
export const STATUS_BLOQUEADO: StatusPedido[] = [
  'Entregue',
  'Devolvido',
  'Cancelado',
  'Reaberto',
];

/** Status em que o PV pode ser excluído (DELETE) */
export const STATUS_PERMITE_DELETE: StatusPedido[] = ['AguardandoNS', 'Liberado'];

export const STATUS_LABELS: Record<StatusPedido, string> = {
  AguardandoNS: 'Aguardando NS',
  RecebidoNS: 'Recebido NS',
  AguardandoRetorno: 'Aguardando Retorno',
  Liberado: 'Liberado',
  Andamento: 'Em Andamento',
  Concluido: 'Concluído',
  AEntregar: 'A Entregar',
  Entregue: 'Entregue',
  Pausado: 'Pausado',
  Cancelado: 'Cancelado',
  Reaberto: 'Reaberto',
  Devolvido: 'Devolvido',
};

export const STATUS_COLORS: Record<StatusPedido, string> = {
  AguardandoNS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  RecebidoNS: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  AguardandoRetorno: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  Liberado: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Andamento: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  Concluido: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  AEntregar: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  Entregue: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  Pausado: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
  Cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  Reaberto: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  Devolvido: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
};

// ============================================
// HELPERS DE PERMISSÃO
// ============================================

export function bloqueiaEdicao(status: StatusPedido): boolean {
  return STATUS_BLOQUEADO.includes(status);
}

export function exigeJustificativa(status: StatusPedido): boolean {
  return STATUS_AVANCADO.includes(status);
}

export function edicaoLivre(status: StatusPedido): boolean {
  return STATUS_INICIAL.includes(status);
}

// ============================================
// TRANSIÇÕES
// ============================================

/** Avanços manuais permitidos a partir de cada status */
export const AVANCOS_POR_STATUS: Record<StatusPedido, StatusPedido[]> = {
  AguardandoNS: ['RecebidoNS'],
  RecebidoNS: ['AguardandoRetorno'],
  AguardandoRetorno: ['Liberado'],
  Liberado: [],
  Andamento: [],
  Concluido: ['AEntregar'],
  AEntregar: ['Entregue'],
  Entregue: [],
  Pausado: [],
  Cancelado: [],
  Reaberto: ['Liberado'],
  Devolvido: [],
};

export function podePausar(status: StatusPedido): boolean {
  return (
    status === 'Liberado' ||
    status === 'Andamento' ||
    status === 'Concluido' ||
    status === 'AEntregar'
  );
}

export function podeCancelar(status: StatusPedido): boolean {
  return (
    status !== 'Entregue' && status !== 'Cancelado' && status !== 'Devolvido'
  );
}

export function podeDevolver(status: StatusPedido): boolean {
  return status === 'Entregue';
}

export function podeReabrir(status: StatusPedido): boolean {
  return status === 'Cancelado';
}

export function podeRetomar(status: StatusPedido): boolean {
  return status === 'Pausado';
}

export function statusAnterioresPermitidos(
  statusAtual: StatusPedido,
  tipoPedido: TipoPedidoVenda,
): StatusPedido[] {
  const fluxo = tipoPedido === 'PreVenda' ? FLUXO_PREVENDA : FLUXO_NORMAL;
  const idxAtual = fluxo.indexOf(statusAtual);
  if (idxAtual <= 0) return [];
  return fluxo.slice(0, idxAtual);
}

// ============================================
// HISTÓRICO
// ============================================

export type EventoPedido =
  | 'Criado'
  | 'NsRecebido'
  | 'RetornoSolicitado'
  | 'Aprovado'
  | 'ProducaoIniciada'
  | 'ProducaoConcluida'
  | 'LiberadoEntrega'
  | 'Entregue'
  | 'Pausado'
  | 'Retomado'
  | 'Cancelado'
  | 'Reaberto'
  | 'Devolvido'
  | 'ItensAlterados';

export const EVENTO_LABELS: Record<EventoPedido, string> = {
  Criado: 'Criado',
  NsRecebido: 'NS recebido',
  RetornoSolicitado: 'Retorno solicitado',
  Aprovado: 'Aprovado',
  ProducaoIniciada: 'Produção iniciada',
  ProducaoConcluida: 'Produção concluída',
  LiberadoEntrega: 'Liberado para entrega',
  Entregue: 'Entregue',
  Pausado: 'Pausado',
  Retomado: 'Retomado',
  Cancelado: 'Cancelado',
  Reaberto: 'Reaberto',
  Devolvido: 'Devolvido',
  ItensAlterados: 'Itens alterados',
};

export interface PedidoHistorico {
  id: number;
  pedidoVendaId: number;
  evento: EventoPedido;
  statusAnterior?: StatusPedido | null;
  statusNovo?: StatusPedido | null;
  justificativa?: string | null;
  dataHora: string;
}

// ============================================
// ITENS — v3: descrição livre
// ============================================

export interface ItemPedido {
  id: number;
  pedidoVendaId: number;
  quantidade: number;
  descricao: string;
  observacao?: string | null;
  criadoEm?: string;
  modificadoEm?: string | null;

  /** @deprecated v2 */
  produtoId?: number;
  /** @deprecated v2 */
  produtoCodigo?: string;
  /** @deprecated v2 */
  produtoDescricao?: string;
  /** @deprecated v2 */
  precoUnitario?: number;
  /** @deprecated v2 */
  subtotal?: number;
}

/** Criação individual (fallback) */
export interface ItemPedidoCreateData {
  quantidade: number;
  descricao: string;
  observacao?: string;
  /** Obrigatório em status avançado */
  justificativa?: string;
}

/** Usado no PUT consolidado — id? preenchido = update, vazio = insert */
export interface ItemPedidoUpsertData {
  id?: number;
  quantidade: number;
  descricao: string;
  observacao?: string;
}

// ============================================
// PEDIDO DE VENDA
// ============================================

export interface PedidoVenda {
  id: number;
  codigo: string;
  clienteId: number;
  clienteCodigo?: string; // v3.1 — "CLI-0042"
  clienteNome?: string;
  tipo: TipoPedidoVenda;
  status: StatusPedido;
  data: string;
  dataEntrega?: string | null;
  observacoes?: string | null;
  itens?: ItemPedido[];
  totalItens?: number;
  criadoEm?: string;
  modificadoEm?: string | null;

  /** @deprecated v2 */
  total?: number;
}

/** POST /PedidoVenda — cria cabeçalho + itens atomicamente */
export interface PedidoVendaCreateData {
  clienteId: number;
  tipo: TipoPedidoVenda;
  data?: string;
  dataEntrega?: string;
  observacoes?: string;
  itens: ItemPedidoCreateData[];
}

/** PUT /PedidoVenda/{id} — replace full com diff no back */
export interface PedidoVendaUpdateData {
  clienteId: number;
  tipo: TipoPedidoVenda;
  data?: string;
  dataEntrega?: string;
  observacoes?: string;
  itens: ItemPedidoUpsertData[];
  /** Obrigatório em STATUS_AVANCADO */
  justificativa?: string;
}

/** PATCH /PedidoVenda/{id}/status */
export interface StatusPedidoUpdate {
  novoStatus: StatusPedido;
  justificativa?: string;
}
