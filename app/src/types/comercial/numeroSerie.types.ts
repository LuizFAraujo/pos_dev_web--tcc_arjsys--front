// ========================================
// TYPES - NÚMERO DE SÉRIE (Comercial) - v3.1
// ========================================
// Alinhado com backend ASP.NET Core 10 - /api/comercial/NumeroSerie
//
// v3.1 (22/04): ganha clienteCodigo (ex: "CLI-0042")

import type { StatusPedido, TipoPedidoVenda } from './pedido.types';

export interface NumeroSerie {
  id: number;
  codigo: string;

  // PV vinculado (readonly)
  pedidoVendaId: number;
  pedidoVendaCodigo?: string;
  clienteCodigo?: string; // v3.1
  clienteNome?: string;
  pvTipo: TipoPedidoVenda;
  pvStatus: StatusPedido;
  pvDataEntrega?: string | null;

  // Produto BOM vinculado (preenchido pela Engenharia, opcional)
  produtoId?: number | null;
  produtoCodigo?: string | null;
  produtoDescricao?: string | null;

  criadoEm?: string;
  modificadoEm?: string | null;
}

/** POST - só PV PreVenda em AguardandoNS; produtoId opcional; codigo opcional (back gera se omitido) */
export interface NumeroSerieCreateData {
  pedidoVendaId: number;
  produtoId?: number | null;
  codigo?: string | null;
}

/** PUT - Engenharia edita o Produto vinculado */
export interface NumeroSerieUpdateData {
  produtoId?: number | null;
}
