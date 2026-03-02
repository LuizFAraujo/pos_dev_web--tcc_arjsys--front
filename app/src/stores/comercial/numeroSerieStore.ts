// ========================================
// STORE — NÚMERO DE SÉRIE (Comercial)
// ========================================

import { create } from 'zustand';
import { apiGet, apiPost, apiPatch, ApiError } from '@/lib/api';
import type { NumeroSerie, NumeroSerieFormData, StatusNumeroSerie } from '@/types/comercial/numeroserie.types';

interface NumeroSerieState {
  series: NumeroSerie[];
  isLoading: boolean;
  error: string | null;

  fetchSeries: () => Promise<void>;
  fetchSeriesByPedido: (pedidoId: number) => Promise<NumeroSerie[]>;
  gerarSerie: (data: NumeroSerieFormData) => Promise<void>;
  alterarStatus: (id: number, novoStatus: StatusNumeroSerie) => Promise<void>;
  clearError: () => void;
}

export const useNumeroSerieStore = create<NumeroSerieState>((set, get) => ({
  series: [],
  isLoading: false,
  error: null,

  fetchSeries: async () => {
    set({ isLoading: true, error: null });
    try {
      const raw = await apiGet<any>('/api/comercial/NumeroSerie');
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
      const list: NumeroSerie[] = Array.isArray(raw) ? raw : [];
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
      } else {
        await get().fetchSeries();
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
      await apiPatch(`/api/comercial/NumeroSerie/${id}/status`, { novoStatus });
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
