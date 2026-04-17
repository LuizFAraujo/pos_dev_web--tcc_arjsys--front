// ========================================
// STORE — NÚMERO DE SÉRIE (Comercial)
// ========================================
// Endpoints:
//   GET   /api/comercial/NumeroSerie             → lista (aceita ?tipo=Normal|VendaFutura)
//   GET   /api/comercial/NumeroSerie/{id}        → detalhe
//   GET   /api/comercial/NumeroSerie/pedido/{id} → NS por pedido
//   POST  /api/comercial/NumeroSerie             → criar (tipo, status, codigoProjeto)
//   PATCH /api/comercial/NumeroSerie/{id}/status  → alterar status

import { create } from 'zustand';
import { apiGet, apiPost, apiPatch, ApiError } from '@/lib/api';
import type {
  NumeroSerie,
  NumeroSerieFormData,
  StatusNumeroSerie,
  StatusNumeroSerieUpdate,
  TipoNumeroSerie,
} from '@/types/comercial/numeroserie.types';

interface NumeroSerieState {
  series: NumeroSerie[];
  isLoading: boolean;
  error: string | null;

  fetchSeries: (tipo?: TipoNumeroSerie) => Promise<void>;
  fetchSeriesByPedido: (pedidoId: number) => Promise<NumeroSerie[]>;
  gerarSerie: (data: NumeroSerieFormData) => Promise<NumeroSerie | null>;
  alterarStatus: (id: number, novoStatus: StatusNumeroSerie) => Promise<void>;
  clearError: () => void;
}

export const useNumeroSerieStore = create<NumeroSerieState>((set, get) => ({
  series: [],
  isLoading: false,
  error: null,

  fetchSeries: async (tipo) => {
    set({ isLoading: true, error: null });
    try {
      const query = tipo ? `?tipo=${tipo}` : '';
      const raw = await apiGet<any>(`/api/comercial/NumeroSerie${query}`);
      let series: NumeroSerie[] = [];
      if (Array.isArray(raw)) {
        series = raw;
      } else if (raw && Array.isArray(raw.itens)) {
        series = raw.itens;
      } else if (raw && typeof raw === 'object') {
        const arrays = Object.values(raw).filter(Array.isArray);
        if (arrays.length > 0) series = arrays[0] as NumeroSerie[];
      }
      set({ series, isLoading: false });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar números de série';
      set({ error: message, isLoading: false });
    }
  },

  fetchSeriesByPedido: async (pedidoId) => {
    try {
      const raw = await apiGet<any>(`/api/comercial/NumeroSerie/pedido/${pedidoId}`);
      const list: NumeroSerie[] = Array.isArray(raw) ? raw : (raw?.itens ?? []);
      return list;
    } catch {
      return [];
    }
  },

  gerarSerie: async (data) => {
    set({ error: null });
    try {
      const nova = await apiPost<NumeroSerie>('/api/comercial/NumeroSerie', data);
      if (nova && nova.id) {
        set((state) => ({ series: [...state.series, nova] }));
        return nova;
      } else {
        await get().fetchSeries();
        return null;
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao gerar número de série';
      set({ error: message });
      throw err;
    }
  },

  alterarStatus: async (id, novoStatus) => {
    set({ error: null });
    try {
      const payload: StatusNumeroSerieUpdate = { novoStatus };
      await apiPatch(`/api/comercial/NumeroSerie/${id}/status`, payload);
      set((state) => ({
        series: state.series.map((s) =>
          s.id === id ? { ...s, status: novoStatus, modificadoEm: new Date().toISOString() } : s
        ),
      }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao alterar status';
      set({ error: message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
