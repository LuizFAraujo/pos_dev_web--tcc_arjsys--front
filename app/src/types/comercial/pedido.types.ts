// ========================================
// TYPES — PEDIDO DE VENDA (Comercial)
// ========================================
// Alinhado com backend ASP.NET Core 10
// CRUD /api/comercial/PedidoVenda
// Status: Orcamento → Aprovado → EmProducao → Concluido → Entregue (ou Cancelado)
// IDs int sequenciais

export type StatusPedido =
  | 'Orcamento'
  | 'Aprovado'
  | 'EmProducao'
  | 'Concluido'
  | 'Entregue'
  | 'Cancelado';

/** Transições válidas de status */
export const TRANSICOES_STATUS: Record<StatusPedido, StatusPedido[]> = {
  Orcamento: ['Aprovado', 'Cancelado'],
  Aprovado: ['EmProducao', 'Cancelado'],
  EmProducao: ['Concluido'],
  Concluido: ['Entregue'],
  Entregue: [],
  Cancelado: [],
};

/** Labels amigáveis para cada status */
export const STATUS_LABELS: Record<StatusPedido, string> = {
  Orcamento: 'Orçamento',
  Aprovado: 'Aprovado',
  EmProducao: 'Em Produção',
  Concluido: 'Concluído',
  Entregue: 'Entregue',
  Cancelado: 'Cancelado',
};

/** Cores para badges de status */
export const STATUS_COLORS: Record<StatusPedido, string> = {
  Orcamento: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  Aprovado: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  EmProducao: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  Concluido: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Entregue: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  Cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export interface ItemPedido {
  id: number;
  pedidoVendaId: number;
  produtoId: number;
  produtoCodigo?: string;
  produtoDescricao?: string;
  quantidade: number;
  precoUnitario: number;
  total?: number;
}

export interface ItemPedidoFormData {
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
}

export interface PedidoVenda {
  id: number;
  codigo: string;
  clienteId: number;
  clienteNome?: string;
  status: StatusPedido;
  observacao?: string;
  itens?: ItemPedido[];
  totalItens?: number;
  valorTotal?: number;
  criadoEm?: string;
  modificadoEm?: string;
}

export interface PedidoVendaFormData {
  clienteId: number;
  observacao?: string;
}
