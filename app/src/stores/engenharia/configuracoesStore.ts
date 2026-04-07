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

// ─── Progresso da varredura ───────────────────────────────────────────────────

export interface VarreduraProgresso {
  totalGeral: number;
  processados: number;
  comPasta: number;
  comDocumento: number;
  pastaVazia: number;
  semPasta: number;
  atualizados: number;
}

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
  varreduraProgresso: VarreduraProgresso | null;

  /** Varredura legada — sem lotes (usada pelo botão da ProdutosPage) */
  executarVarredura: (prefixo?: string) => Promise<VarreduraResultado | null>;

  /** Varredura em lotes com progresso — usada pela ConfiguracoesPage */
  executarVarreduraEmLotes: (
    prefixo: string | undefined,
    batchSize: number,
    onProgresso: (progresso: VarreduraProgresso) => void,
    cancelRef: { current: boolean },
  ) => Promise<VarreduraProgresso | null>;

  pararVarredura: () => void;
  _cancelRef: { current: boolean };

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
  varreduraProgresso: null,
  _cancelRef: { current: false },

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

  // ── Varredura legada (sem lotes) ──────────────────────────────────────────

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

  // ── Varredura em lotes ────────────────────────────────────────────────────

  executarVarreduraEmLotes: async (prefixo, batchSize, onProgresso, cancelRef) => {
    set({ isVarrendo: true, error: null, varreduraProgresso: null });
    cancelRef.current = false;

    const acumulado: VarreduraProgresso = {
      totalGeral: 0,
      processados: 0,
      comPasta: 0,
      comDocumento: 0,
      pastaVazia: 0,
      semPasta: 0,
      atualizados: 0,
    };

    let offset = 0;

    try {
      while (true) {
        // Verifica cancelamento ANTES de chamar
        if (cancelRef.current) break;

        const params = new URLSearchParams();
        if (prefixo) params.set('prefixo', prefixo);
        params.set('offset', String(offset));
        params.set('limit', String(batchSize));

        const result = await apiPost<VarreduraResultado>(
          `/api/engenharia/Produtos/varredura-documentos?${params.toString()}`
        );

        // Verifica cancelamento DEPOIS de receber (antes de acumular)
        if (cancelRef.current) break;

        // Primeiro lote: captura totalGeral
        if (offset === 0) {
          acumulado.totalGeral = result.totalGeral;
        }

        // Acumula
        acumulado.processados += result.totalVerificados;
        acumulado.comPasta += result.comPasta;
        acumulado.comDocumento += result.comDocumento;
        acumulado.pastaVazia += result.pastaVazia;
        acumulado.semPasta += result.semPasta;
        acumulado.atualizados += result.atualizados;

        // Notifica progresso
        const snapshot = { ...acumulado };
        set({ varreduraProgresso: snapshot });
        onProgresso(snapshot);

        // Último lote: verificados < batchSize
        if (result.totalVerificados < batchSize) break;

        offset += batchSize;
      }

      set({ isVarrendo: false });
      return cancelRef.current ? null : acumulado;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao executar varredura';
      set({ error: message, isVarrendo: false });
      throw err;
    }
  },

  pararVarredura: () => {
    get()._cancelRef.current = true;
  },

  clearError: () => set({ error: null }),
}));
