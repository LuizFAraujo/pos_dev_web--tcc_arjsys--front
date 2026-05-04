// ========================================
// STORE - GRUPOS DE PRODUTO (Engenharia)
// ========================================

import { create } from 'zustand';
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from '@/lib/api';
import type { GrupoProduto, GrupoProdutoFormData, GrupoVinculo, GrupoVinculoFormData, NivelGrupo } from '@/types/engenharia/grupo.types';

interface GruposState {
  grupos: GrupoProduto[];
  vinculos: GrupoVinculo[];
  isLoading: boolean;
  error: string | null;

  fetchGrupos: () => Promise<void>;
  fetchGruposPorNivel: (nivel: NivelGrupo) => Promise<GrupoProduto[]>;
  createGrupo: (data: GrupoProdutoFormData) => Promise<void>;
  updateGrupo: (id: number, data: GrupoProdutoFormData) => Promise<void>;
  deleteGrupo: (id: number) => Promise<void>;

  fetchVinculos: () => Promise<void>;
  fetchVinculosPorPai: (paiId: number) => Promise<GrupoVinculo[]>;
  createVinculo: (data: GrupoVinculoFormData) => Promise<void>;
  deleteVinculo: (id: number) => Promise<void>;

  clearError: () => void;
}

export const useGruposStore = create<GruposState>((set, get) => ({
  grupos: [],
  vinculos: [],
  isLoading: false,
  error: null,

  fetchGrupos: async () => {
    set({ isLoading: true, error: null });
    try {
      const raw = await apiGet<any>('/api/engenharia/GrupoProduto');
      let grupos: GrupoProduto[] = [];
      if (Array.isArray(raw)) {
        grupos = raw;
      } else if (raw && Array.isArray(raw.itens)) {
        grupos = raw.itens;
      } else if (raw && typeof raw === 'object') {
        const arrays = Object.values(raw).filter(Array.isArray);
        if (arrays.length > 0) grupos = arrays[0] as GrupoProduto[];
      }
      set({ grupos, isLoading: false });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar grupos';
      set({ error: message, isLoading: false });
    }
  },

  fetchGruposPorNivel: async (nivel) => {
    try {
      const raw = await apiGet<any>(`/api/engenharia/GrupoProduto/nivel/${nivel}`);
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  },

  createGrupo: async (data) => {
    set({ error: null });
    try {
      const novo = await apiPost<GrupoProduto>('/api/engenharia/GrupoProduto', data);
      if (novo && novo.id) {
        set((state) => ({ grupos: [...state.grupos, novo] }));
      } else {
        await get().fetchGrupos();
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao criar grupo';
      set({ error: message });
      throw err;
    }
  },

  updateGrupo: async (id, data) => {
    set({ error: null });
    try {
      const resposta = await apiPut<GrupoProduto | null>(`/api/engenharia/GrupoProduto/${id}`, data);
      if (resposta && resposta.id) {
        set((state) => ({
          grupos: state.grupos.map((g) => (g.id === id ? resposta : g)),
        }));
      } else {
        set((state) => ({
          grupos: state.grupos.map((g) =>
            g.id === id ? { ...g, ...data, modificadoEm: new Date().toISOString() } : g
          ),
        }));
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao atualizar grupo';
      set({ error: message });
      throw err;
    }
  },

  deleteGrupo: async (id) => {
    set({ error: null });
    try {
      await apiDelete(`/api/engenharia/GrupoProduto/${id}`);
      set((state) => ({
        grupos: state.grupos.filter((g) => g.id !== id),
      }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao excluir grupo';
      set({ error: message });
      throw err;
    }
  },

  fetchVinculos: async () => {
    try {
      const raw = await apiGet<any>('/api/engenharia/GrupoVinculo');
      let vinculos: GrupoVinculo[] = [];
      if (Array.isArray(raw)) {
        vinculos = raw;
      } else if (raw && typeof raw === 'object') {
        const arrays = Object.values(raw).filter(Array.isArray);
        if (arrays.length > 0) vinculos = arrays[0] as GrupoVinculo[];
      }
      set({ vinculos });
    } catch {
      // silencioso
    }
  },

  fetchVinculosPorPai: async (paiId) => {
    try {
      const raw = await apiGet<any>(`/api/engenharia/GrupoVinculo/pai/${paiId}`);
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  },

  createVinculo: async (data) => {
    set({ error: null });
    try {
      await apiPost('/api/engenharia/GrupoVinculo', data);
      await get().fetchVinculos();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao criar vínculo';
      set({ error: message });
      throw err;
    }
  },

  deleteVinculo: async (id) => {
    set({ error: null });
    try {
      await apiDelete(`/api/engenharia/GrupoVinculo/${id}`);
      set((state) => ({
        vinculos: state.vinculos.filter((v) => v.id !== id),
      }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao remover vínculo';
      set({ error: message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
