// ========================================
// STORE — CONFIGURAÇÕES ENGENHARIA
// ========================================

import { create } from 'zustand';
import { apiGet, apiPut, apiPost, ApiError } from '@/lib/api';
import type { ConfiguracaoEngenharia } from '@/types/engenharia/configuracao.types';

interface ConfiguracoesState {
  configuracoes: ConfiguracaoEngenharia[];
  isLoading: boolean;
  isSaving: boolean;
  isVarrendo: boolean;
  error: string | null;
  successMsg: string | null;

  fetchConfiguracoes: () => Promise<void>;
  updateConfiguracao: (id: number, valor: string) => Promise<void>;
  executarVarredura: (prefixo?: string) => Promise<void>;
  clearError: () => void;
  clearSuccess: () => void;
}

export const useConfiguracoesStore = create<ConfiguracoesState>((set, get) => ({
  configuracoes: [],
  isLoading: false,
  isSaving: false,
  isVarrendo: false,
  error: null,
  successMsg: null,

  fetchConfiguracoes: async () => {
    set({ isLoading: true, error: null });
    try {
      const raw = await apiGet<any>('/api/engenharia/ConfiguracaoEngenharia');
      let list: ConfiguracaoEngenharia[] = [];
      if (Array.isArray(raw)) {
        list = raw;
      } else if (raw && Array.isArray(raw.itens)) {
        list = raw.itens;
      } else if (raw && typeof raw === 'object') {
        const arrays = Object.values(raw).filter(Array.isArray);
        if (arrays.length > 0) list = arrays[0] as ConfiguracaoEngenharia[];
      }
      set({ configuracoes: list, isLoading: false });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar configurações';
      set({ error: message, isLoading: false });
    }
  },

  updateConfiguracao: async (id, valor) => {
    set({ isSaving: true, error: null, successMsg: null });
    try {
      const resposta = await apiPut<ConfiguracaoEngenharia | null>(
        `/api/engenharia/ConfiguracaoEngenharia/${id}`,
        { valor }
      );
      if (resposta && resposta.id) {
        set((state) => ({
          configuracoes: state.configuracoes.map((c) => (c.id === id ? resposta : c)),
        }));
      } else {
        // 204 — merge local
        set((state) => ({
          configuracoes: state.configuracoes.map((c) =>
            c.id === id ? { ...c, valor, modificadoEm: new Date().toISOString() } : c
          ),
        }));
      }
      set({ isSaving: false, successMsg: 'Configuração salva com sucesso' });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao salvar configuração';
      set({ error: message, isSaving: false });
    }
  },

  executarVarredura: async (prefixo) => {
    set({ isVarrendo: true, error: null, successMsg: null });
    try {
      const url = prefixo
        ? `/api/engenharia/Produtos/varredura-documentos?prefixo=${prefixo}`
        : '/api/engenharia/Produtos/varredura-documentos';
      await apiPost(url);
      set({ isVarrendo: false, successMsg: 'Varredura de documentos concluída' });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao executar varredura';
      set({ error: message, isVarrendo: false });
    }
  },

  clearError: () => set({ error: null }),
  clearSuccess: () => set({ successMsg: null }),
}));
