// ========================================
// TYPES — PEDIDO DE VENDA (Comercial)
// ========================================
// Alinhado com backend ASP.NET Core 10
// CRUD /api/comercial/PedidoVenda
// Status: Aguardando → EmAndamento → Concluido → AguardandoEntrega → Entregue (ou Cancelado/Pausado)
// IDs int sequenciais

// ============================================
// STATUS
// ============================================

export type StatusPedido =
  | 'Aguardando'
  | 'EmAndamento'
  | 'Pausado'
  | 'Concluido'
  | 'AguardandoEntrega'
  | 'Entregue'
  | 'Cancelado';

/** Transições válidas de status (inclui retorno pra correção de erro) */
export const TRANSICOES_STATUS: Record<StatusPedido, StatusPedido[]> = {
  Aguardando: ['EmAndamento', 'Cancelado'],
  EmAndamento: ['Pausado', 'Concluido', 'Cancelado'],
  Pausado: ['EmAndamento', 'Cancelado'],
  Concluido: ['AguardandoEntrega', 'EmAndamento'],
  AguardandoEntrega: ['Entregue', 'Concluido', 'EmAndamento'],
  Entregue: [],
  Cancelado: [],
};

/** Labels amigáveis para cada status */
export const STATUS_LABELS: Record<StatusPedido, string> = {
  Aguardando: 'Aguardando',
  EmAndamento: 'Em Andamento',
  Pausado: 'Pausado',
  Concluido: 'Concluído',
  AguardandoEntrega: 'Aguardando Entrega',
  Entregue: 'Entregue',
  Cancelado: 'Cancelado',
};

/** Cores para badges de status */
export const STATUS_COLORS: Record<StatusPedido, string> = {
  Aguardando: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  EmAndamento: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Pausado: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  Concluido: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  AguardandoEntrega: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  Entregue: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  Cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

// ============================================
// HISTÓRICO
// ============================================

export type EventoPedido =
  | 'Criado'
  | 'Aprovado'
  | 'Pausado'
  | 'Retomado'
  | 'Cancelado'
  | 'Concluido'
  | 'AguardandoEntrega'
  | 'Entregue';

export interface PedidoHistorico {
  id: number;
  pedidoVendaId: number;
  evento: EventoPedido;
  dataHora: string;
  observacao?: string;
}

// ============================================
// ITENS
// ============================================

export interface ItemPedido {
  id: number;
  pedidoVendaId: number;
  produtoId: number;
  produtoCodigo?: string;
  produtoDescricao?: string;
  quantidade: number;
  precoUnitario: number;
  subtotal?: number;
  criadoEm?: string;
}

export interface ItemPedidoFormData {
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
}

// ============================================
// PEDIDO DE VENDA
// ============================================

export interface PedidoVenda {
  id: number;
  codigo: string;
  clienteId: number;
  clienteNome?: string;
  status: StatusPedido;
  observacoes?: string;
  itens?: ItemPedido[];
  totalItens?: number;
  total?: number;
  criadoEm?: string;
  modificadoEm?: string;
}

/** Dados para criar pedido — status opcional (Aguardando ou EmAndamento, default EmAndamento) */
export interface PedidoVendaFormData {
  clienteId: number;
  observacoes?: string;
  status?: 'Aguardando' | 'EmAndamento';
}

/** Dados para alterar status — observação registrada no histórico */
export interface StatusPedidoUpdate {
  novoStatus: StatusPedido;
  observacao?: string;
}
