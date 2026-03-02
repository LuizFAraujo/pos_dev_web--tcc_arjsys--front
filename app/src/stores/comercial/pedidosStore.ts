// ========================================
// STORE — PEDIDOS DE VENDA (Comercial)
// ========================================

import { create } from 'zustand';
import { apiGet, apiPost, apiPut, apiPatch, apiDelete, ApiError } from '@/lib/api';
import type { PedidoVenda, PedidoVendaFormData, ItemPedido, ItemPedidoFormData, StatusPedido } from '@/types/comercial/pedido.types';

interface PedidosState {
  pedidos: PedidoVenda[];
  pedidoDetalhe: PedidoVenda | null;
  isLoading: boolean;
  error: string | null;

  fetchPedidos: () => Promise<void>;
  fetchPedido: (id: number) => Promise<void>;
  createPedido: (data: PedidoVendaFormData) => Promise<PedidoVenda | null>;
  updatePedido: (id: number, data: PedidoVendaFormData) => Promise<void>;
  deletePedido: (id: number) => Promise<void>;
  alterarStatus: (id: number, novoStatus: StatusPedido) => Promise<void>;

  // Itens
  addItem: (pedidoId: number, data: ItemPedidoFormData) => Promise<void>;
  updateItem: (pedidoId: number, itemId: number, data: ItemPedidoFormData) => Promise<void>;
  removeItem: (pedidoId: number, itemId: number) => Promise<void>;

  clearError: () => void;
}

export const usePedidosStore = create<PedidosState>((set, get) => ({
  pedidos: [],
  pedidoDetalhe: null,
  isLoading: false,
  error: null,

  fetchPedidos: async () => {
    set({ isLoading: true, error: null });
    try {
      const raw = await apiGet<any>('/api/comercial/PedidoVenda');
      let pedidos: PedidoVenda[] = [];
      if (Array.isArray(raw)) {
        pedidos = raw;
      } else if (raw && Array.isArray(raw.itens)) {
        pedidos = raw.itens;
      } else if (raw && typeof raw === 'object') {
        const arrays = Object.values(raw).filter(Array.isArray);
        if (arrays.length > 0) pedidos = arrays[0] as PedidoVenda[];
      }
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
        set((state) => ({ pedidos: [...state.pedidos, novo] }));
        return novo;
      } else {
        await get().fetchPedidos();
        return null;
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao criar pedido';
      set({ error: message });
      throw err;
    }
  },

  updatePedido: async (id, data) => {
    set({ error: null });
    try {
      const resposta = await apiPut<PedidoVenda | null>(`/api/comercial/PedidoVenda/${id}`, data);
      if (resposta && resposta.id) {
        set((state) => ({
          pedidos: state.pedidos.map((p) => (p.id === id ? resposta : p)),
        }));
      } else {
        // 204 — merge local
        set((state) => ({
          pedidos: state.pedidos.map((p) =>
            p.id === id ? { ...p, ...data, modificadoEm: new Date().toISOString() } : p
          ),
        }));
      }
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
      }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao excluir pedido';
      set({ error: message });
      throw err;
    }
  },

  alterarStatus: async (id, novoStatus) => {
    set({ error: null });
    try {
      await apiPatch(`/api/comercial/PedidoVenda/${id}/status`, { novoStatus });
      // Atualiza local
      set((state) => ({
        pedidos: state.pedidos.map((p) =>
          p.id === id ? { ...p, status: novoStatus, modificadoEm: new Date().toISOString() } : p
        ),
      }));
      // Se tem detalhe aberto, atualiza
      const detalhe = get().pedidoDetalhe;
      if (detalhe && detalhe.id === id) {
        set({ pedidoDetalhe: { ...detalhe, status: novoStatus } });
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao alterar status';
      set({ error: message });
      throw err;
    }
  },

  // === ITENS ===

  addItem: async (pedidoId, data) => {
    set({ error: null });
    try {
      await apiPost(`/api/comercial/PedidoVenda/${pedidoId}/itens`, data);
      // Recarrega detalhe pra pegar totais atualizados
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

  removeItem: async (pedidoId, itemId) => {
    set({ error: null });
    try {
      await apiDelete(`/api/comercial/PedidoVenda/${pedidoId}/itens/${itemId}`);
      await get().fetchPedido(pedidoId);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao remover item';
      set({ error: message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
