// ========================================
// STORE — CONFIGURAÇÕES ENGENHARIA
// ========================================
// Configurações globais (chave/valor) + PathDocumentos (CRUD) + Varredura

import { create } from 'zustand';
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from '@/lib/api';
import type {
  ConfiguracaoEngenharia,
  PathDocumentos,
  PathDocumentosCreate,
  PathDocumentosUpdate,
  VarreduraResultado,
} from '@/types/engenharia/configuracao.types';

interface ConfiguracoesState {
  // ── Configurações globais ─────────────────────────────────────────────────
  configuracoes: ConfiguracaoEngenharia[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  fetchConfiguracoes: () => Promise<void>;
  updateConfiguracao: (id: number, valor: string) => Promise<void>;

  // ── Path Documentos ───────────────────────────────────────────────────────
  paths: PathDocumentos[];
  isLoadingPaths: boolean;
  isSavingPath: boolean;

  fetchPaths: () => Promise<void>;
  createPath: (data: PathDocumentosCreate) => Promise<void>;
  updatePath: (id: number, data: PathDocumentosUpdate) => Promise<void>;
  deletePath: (id: number) => Promise<void>;

  // ── Varredura ─────────────────────────────────────────────────────────────
  isVarrendo: boolean;
  executarVarredura: (prefixo?: string) => Promise<VarreduraResultado | null>;

  clearError: () => void;
}

export const useConfiguracoesStore = create<ConfiguracoesState>((set, get) => ({
  configuracoes: [],
  isLoading: false,
  isSaving: false,
  error: null,

  paths: [],
  isLoadingPaths: false,
  isSavingPath: false,

  isVarrendo: false,

  // ── Configurações globais ─────────────────────────────────────────────────

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
    set({ isSaving: true, error: null });
    try {
      const config = get().configuracoes.find((c) => c.id === id);
      await apiPut(`/api/engenharia/ConfiguracaoEngenharia/${id}`, {
        chave: config?.chave ?? '',
        valor,
        descricao: config?.descricao ?? '',
      });
      set((state) => ({
        configuracoes: state.configuracoes.map((c) =>
          c.id === id ? { ...c, valor, modificadoEm: new Date().toISOString() } : c
        ),
        isSaving: false,
      }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao salvar configuração';
      set({ error: message, isSaving: false });
      throw err;
    }
  },

  // ── Path Documentos ───────────────────────────────────────────────────────

  fetchPaths: async () => {
    set({ isLoadingPaths: true, error: null });
    try {
      const raw = await apiGet<any>('/api/engenharia/PathDocumentos');
      const list: PathDocumentos[] = Array.isArray(raw) ? raw : [];
      set({ paths: list, isLoadingPaths: false });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar paths';
      set({ error: message, isLoadingPaths: false });
    }
  },

  createPath: async (data) => {
    set({ isSavingPath: true, error: null });
    try {
      const novo = await apiPost<PathDocumentos>('/api/engenharia/PathDocumentos', data);
      if (novo && novo.id) {
        set((state) => ({ paths: [...state.paths, novo], isSavingPath: false }));
      } else {
        await get().fetchPaths();
        set({ isSavingPath: false });
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao criar path';
      set({ error: message, isSavingPath: false });
      throw err;
    }
  },

  updatePath: async (id, data) => {
    set({ isSavingPath: true, error: null });
    try {
      await apiPut(`/api/engenharia/PathDocumentos/${id}`, data);
      set((state) => ({
        paths: state.paths.map((p) =>
          p.id === id ? { ...p, ...data, modificadoEm: new Date().toISOString() } : p
        ),
        isSavingPath: false,
      }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao atualizar path';
      set({ error: message, isSavingPath: false });
      throw err;
    }
  },

  deletePath: async (id) => {
    set({ error: null });
    try {
      await apiDelete(`/api/engenharia/PathDocumentos/${id}`);
      set((state) => ({ paths: state.paths.filter((p) => p.id !== id) }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao excluir path';
      set({ error: message });
      throw err;
    }
  },

  // ── Varredura ─────────────────────────────────────────────────────────────

  executarVarredura: async (prefixo) => {
    set({ isVarrendo: true, error: null });
    try {
      const url = prefixo
        ? `/api/engenharia/Produtos/varredura-documentos?prefixo=${prefixo}`
        : '/api/engenharia/Produtos/varredura-documentos';
      const resultado = await apiPost<VarreduraResultado>(url);
      set({ isVarrendo: false });
      return resultado ?? null;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao executar varredura';
      set({ error: message, isVarrendo: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
