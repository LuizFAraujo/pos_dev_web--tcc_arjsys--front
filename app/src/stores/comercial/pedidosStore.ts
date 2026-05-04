// ========================================
// STORE - PEDIDOS DE VENDA (Comercial) - v3.1
// ========================================
// Endpoints consolidados (feature/vendas v3.1):
//   POST   /api/comercial/PedidoVenda                → cria cabeçalho + itens atomicamente
//   PUT    /api/comercial/PedidoVenda/{id}           → replace full (diff no back) → 200 + body
//   PATCH  /api/comercial/PedidoVenda/{id}/status    → muda status (justificativa condicional)
//   DELETE /api/comercial/PedidoVenda/{id}           → AguardandoNS ou Liberado
//   GET    /api/comercial/PedidoVenda                → lista
//   GET    /api/comercial/PedidoVenda/{id}           → detalhe
//   GET    /api/comercial/PedidoVenda/{id}/historico → log
//
// Endpoints individuais (ainda existem, fallback):
//   POST   /api/comercial/PedidoVenda/{id}/itens
//   PUT    /api/comercial/PedidoVenda/{id}/itens/{itemId}
//   DELETE /api/comercial/PedidoVenda/{id}/itens/{itemId}?justificativa=...

import { create } from 'zustand';
import { apiGet, apiPost, apiPut, apiPatch, apiDelete, ApiError } from '@/lib/api';
import type {
  PedidoVenda,
  PedidoVendaCreateData,
  PedidoVendaUpdateData,
  ItemPedidoCreateData,
  StatusPedido,
  StatusPedidoUpdate,
  PedidoHistorico,
} from '@/types/comercial/pedido.types';

interface PedidosState {
  pedidos: PedidoVenda[];
  pedidoDetalhe: PedidoVenda | null;
  historico: PedidoHistorico[];
  isLoading: boolean;
  error: string | null;

  fetchPedidos: () => Promise<void>;
  fetchPedido: (id: number) => Promise<void>;

  /** POST consolidado - cria PV + itens em 1 chamada (itens.length >= 1). */
  createPedido: (data: PedidoVendaCreateData) => Promise<PedidoVenda | null>;

  /** PUT consolidado - replace full, back faz diff. Retorna PV completo. */
  updatePedido: (id: number, data: PedidoVendaUpdateData) => Promise<PedidoVenda | null>;

  deletePedido: (id: number) => Promise<void>;

  /** PATCH /status - justificativa obrigatória em pausar/cancelar/reabrir/devolver/retroceder */
  alterarStatus: (id: number, novoStatus: StatusPedido, justificativa?: string) => Promise<void>;

  /** PATCH /projeto - define ou limpa o Produto BOM liberado pela Engenharia */
  definirProjeto: (id: number, produtoBomId: number | null) => Promise<void>;

  fetchHistorico: (id: number) => Promise<void>;

  // Endpoints individuais (fallback raro, fora do fluxo do form)
  addItem: (pedidoId: number, data: ItemPedidoCreateData) => Promise<void>;
  updateItem: (pedidoId: number, itemId: number, data: ItemPedidoCreateData) => Promise<void>;
  removeItem: (pedidoId: number, itemId: number, justificativa?: string) => Promise<void>;

  clearError: () => void;
}

function extractArray<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.itens)) return obj.itens as T[];
    const arrays = Object.values(obj).filter(Array.isArray);
    if (arrays.length > 0) return arrays[0] as T[];
  }
  return [];
}

export const usePedidosStore = create<PedidosState>((set, get) => ({
  pedidos: [],
  pedidoDetalhe: null,
  historico: [],
  isLoading: false,
  error: null,

  fetchPedidos: async () => {
    set({ isLoading: true, error: null });
    try {
      const raw = await apiGet<unknown>('/api/comercial/PedidoVenda');
      const pedidos = extractArray<PedidoVenda>(raw);
      set({ pedidos, isLoading: false });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar pedidos';
      set({ error: message, isLoading: false });
    }
  },

  fetchPedido: async (id) => {
    set({ error: null });
    try {
      const pedido = await apiGet<PedidoVenda>(`/api/comercial/PedidoVenda/${id}`);
      set({ pedidoDetalhe: pedido });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar pedido';
      set({ error: message });
    }
  },

  createPedido: async (data) => {
    set({ error: null });
    try {
      const novo = await apiPost<PedidoVenda>('/api/comercial/PedidoVenda', data);
      if (novo && novo.id) {
        set((state) => ({
          pedidos: [...state.pedidos, novo],
          pedidoDetalhe: novo,
        }));
        return novo;
      }
      await get().fetchPedidos();
      return null;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao criar pedido';
      set({ error: message });
      throw err;
    }
  },

  updatePedido: async (id, data) => {
    set({ error: null });
    try {
      // v3.1: PUT retorna 200 + body (PedidoVendaResponseDTO)
      const atualizado = await apiPut<PedidoVenda | null>(
        `/api/comercial/PedidoVenda/${id}`,
        data,
      );
      if (atualizado && atualizado.id) {
        set((state) => ({
          pedidos: state.pedidos.map((p) => (p.id === id ? atualizado : p)),
          pedidoDetalhe: state.pedidoDetalhe?.id === id ? atualizado : state.pedidoDetalhe,
        }));
        return atualizado;
      }
      // Fallback defensivo (204)
      await get().fetchPedidos();
      if (get().pedidoDetalhe?.id === id) await get().fetchPedido(id);
      return null;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao atualizar pedido';
      set({ error: message });
      throw err;
    }
  },

  deletePedido: async (id) => {
    set({ error: null });
    try {
      await apiDelete(`/api/comercial/PedidoVenda/${id}`);
      set((state) => ({
        pedidos: state.pedidos.filter((p) => p.id !== id),
        pedidoDetalhe: state.pedidoDetalhe?.id === id ? null : state.pedidoDetalhe,
      }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao excluir pedido';
      set({ error: message });
      throw err;
    }
  },

  alterarStatus: async (id, novoStatus, justificativa) => {
    set({ error: null });
    try {
      const payload: StatusPedidoUpdate = { novoStatus };
      if (justificativa && justificativa.trim()) {
        payload.justificativa = justificativa.trim();
      }
      await apiPatch(`/api/comercial/PedidoVenda/${id}/status`, payload);

      await get().fetchPedidos();
      if (get().pedidoDetalhe?.id === id) await get().fetchPedido(id);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao alterar status';
      set({ error: message });
      throw err;
    }
  },

  definirProjeto: async (id, produtoBomId) => {
    set({ error: null });
    try {
      await apiPatch(`/api/comercial/PedidoVenda/${id}/projeto`, { produtoBomId });
      await get().fetchPedidos();
      if (get().pedidoDetalhe?.id === id) await get().fetchPedido(id);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao liberar projeto';
      set({ error: message });
      throw err;
    }
  },

  fetchHistorico: async (id) => {
    set({ error: null });
    try {
      const raw = await apiGet<unknown>(`/api/comercial/PedidoVenda/${id}/historico`);
      const historico = extractArray<PedidoHistorico>(raw);
      set({ historico });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar histórico';
      set({ error: message });
    }
  },

  // ─── Individuais (fallback) ─────────────────────────────────────

  addItem: async (pedidoId, data) => {
    set({ error: null });
    try {
      await apiPost(`/api/comercial/PedidoVenda/${pedidoId}/itens`, data);
      await get().fetchPedido(pedidoId);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao adicionar item';
      set({ error: message });
      throw err;
    }
  },

  updateItem: async (pedidoId, itemId, data) => {
    set({ error: null });
    try {
      await apiPut(`/api/comercial/PedidoVenda/${pedidoId}/itens/${itemId}`, data);
      await get().fetchPedido(pedidoId);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao atualizar item';
      set({ error: message });
      throw err;
    }
  },

  removeItem: async (pedidoId, itemId, justificativa) => {
    set({ error: null });
    try {
      const query = justificativa
        ? `?justificativa=${encodeURIComponent(justificativa)}`
        : '';
      await apiDelete(`/api/comercial/PedidoVenda/${pedidoId}/itens/${itemId}${query}`);
      await get().fetchPedido(pedidoId);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao remover item';
      set({ error: message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
