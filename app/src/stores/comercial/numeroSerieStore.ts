// ========================================
// STORE - NÚMERO DE SÉRIE (Comercial) - v3
// ========================================
// Endpoints (feature/vendas):
//   GET  /api/comercial/NumeroSerie                → lista (?pagina=N&tamanho=N)
//   GET  /api/comercial/NumeroSerie/{id}           → detalhe
//   GET  /api/comercial/NumeroSerie/pedido/{pvId}  → 1:1, 404 se não tiver
//   POST /api/comercial/NumeroSerie                → criar (só PV PreVenda em AguardandoNS)
//   PUT  /api/comercial/NumeroSerie/{id}           → atualizar produtoId
//
// No v3:
// - NS não tem mais status próprio; herda do PV vinculado
// - produtoId (FK BOM) substitui codigoProjeto
// - Sem DELETE no fluxo v3

import { create } from 'zustand';
import { apiGet, apiPost, apiPut, ApiError } from '@/lib/api';
import type {
  NumeroSerie,
  NumeroSerieCreateData,
  NumeroSerieUpdateData,
} from '@/types/comercial/numeroSerie.types';

interface NumeroSerieState {
  series: NumeroSerie[];
  isLoading: boolean;
  error: string | null;

  fetchSeries: () => Promise<void>;
  fetchSerieByPedido: (pedidoId: number) => Promise<NumeroSerie | null>;
  gerarSerie: (data: NumeroSerieCreateData) => Promise<NumeroSerie | null>;
  updateSerie: (id: number, data: NumeroSerieUpdateData) => Promise<void>;
  clearError: () => void;
}

/** Extrai array de respostas paginadas ou não-paginadas */
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

export const useNumeroSerieStore = create<NumeroSerieState>((set, get) => ({
  series: [],
  isLoading: false,
  error: null,

  fetchSeries: async () => {
    set({ isLoading: true, error: null });
    try {
      const raw = await apiGet<unknown>('/api/comercial/NumeroSerie');
      const series = extractArray<NumeroSerie>(raw);
      set({ series, isLoading: false });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar números de série';
      set({ error: message, isLoading: false });
    }
  },

  fetchSerieByPedido: async (pedidoId) => {
    try {
      const ns = await apiGet<NumeroSerie>(`/api/comercial/NumeroSerie/pedido/${pedidoId}`);
      return ns;
    } catch (err) {
      // 404 é esperado quando o PV não tem NS
      if (err instanceof ApiError && err.status === 404) return null;
      return null;
    }
  },

  gerarSerie: async (data) => {
    set({ error: null });
    try {
      const nova = await apiPost<NumeroSerie>('/api/comercial/NumeroSerie', data);
      if (nova && nova.id) {
        set((state) => ({ series: [...state.series, nova] }));
        return nova;
      }
      await get().fetchSeries();
      return null;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao gerar número de série';
      set({ error: message });
      throw err;
    }
  },

  updateSerie: async (id, data) => {
    set({ error: null });
    try {
      await apiPut(`/api/comercial/NumeroSerie/${id}`, data);
      // 204 - refaz fetch pra pegar produtoCodigo/produtoDescricao atualizados
      await get().fetchSeries();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao atualizar número de série';
      set({ error: message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
