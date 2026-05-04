// ========================================
// STORE - DEMANDA DE PRODUÇÃO
// ========================================

import { create } from 'zustand';
import { apiGet, ApiError } from '@/lib/api';
import type { DemandaItem } from '@/types/producao/demanda.types';

interface DemandaState {
  itens: DemandaItem[];
  isLoading: boolean;
  error: string | null;

  /** Filtro corrente - armazenado pra última carga. Apenas referência. */
  ultimoFiltroTipos: string | null;

  fetchDemanda: (
    tiposCsv?: string,
    opts?: { silent?: boolean },
  ) => Promise<void>;
  /** Atualiza um item específico no array sem refetch. */
  patchItem: (
    ordemProducaoItemId: number,
    patch: Partial<DemandaItem>,
  ) => void;
  /** Remove um item do array (ex: faltante <= 0 após apontar). */
  removeItem: (ordemProducaoItemId: number) => void;
  clearError: () => void;
}

function extractArray<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    const arrays = Object.values(obj).filter(Array.isArray);
    if (arrays.length > 0) return arrays[0] as T[];
  }
  return [];
}

export const useDemandaStore = create<DemandaState>((set) => ({
  itens: [],
  isLoading: false,
  error: null,
  ultimoFiltroTipos: null,

  fetchDemanda: async (tiposCsv, opts) => {
    const silent = opts?.silent ?? false;
    if (!silent) set({ isLoading: true, error: null });
    try {
      const url = tiposCsv
        ? `/api/producao/Demanda?tipos=${encodeURIComponent(tiposCsv)}`
        : '/api/producao/Demanda';
      const raw = await apiGet<unknown>(url);
      const itens = extractArray<DemandaItem>(raw);
      set({
        itens,
        isLoading: false,
        ultimoFiltroTipos: tiposCsv ?? null,
        error: null,
      });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao carregar demanda';
      set({ error: message, isLoading: false });
    }
  },

  patchItem: (ordemProducaoItemId, patch) => {
    set((state) => ({
      itens: state.itens.map((it) =>
        it.ordemProducaoItemId === ordemProducaoItemId
          ? { ...it, ...patch }
          : it,
      ),
    }));
  },

  removeItem: (ordemProducaoItemId) => {
    set((state) => ({
      itens: state.itens.filter(
        (it) => it.ordemProducaoItemId !== ordemProducaoItemId,
      ),
    }));
  },

  clearError: () => set({ error: null }),
}));
