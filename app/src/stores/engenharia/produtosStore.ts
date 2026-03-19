// ========================================
// STORE — PRODUTOS (Engenharia) — API Real
// ========================================

import { create } from 'zustand';
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from '@/lib/api';
import type { Produto, ProdutoFormData } from '@/types/engenharia/produto.types';

// ─── Tipos dos novos endpoints ────────────────────────────────────────────────

interface AbrirPastaResult {
  path: string;
  aberto: boolean;
}

interface ExtensoesDocumentoResult {
  path: string;
  extensoes: string[];
}

interface AbrirDocumentoResult {
  path: string;
  extensao: string;
  aberto: boolean;
}

// ─── Interface da store ───────────────────────────────────────────────────────

interface ProdutosState {
  produtos: Produto[];
  isLoading: boolean;
  error: string | null;

  fetchProdutos: () => Promise<void>;
  createProduto: (data: ProdutoFormData) => Promise<void>;
  updateProduto: (id: number, data: ProdutoFormData) => Promise<void>;
  deleteProduto: (id: number) => Promise<void>;
  varreduraDocumentos: (prefixo?: string) => Promise<void>;

  // Novos — documentos
  abrirPasta: (id: number) => Promise<AbrirPastaResult>;
  extensoesDocumento: (id: number) => Promise<ExtensoesDocumentoResult>;
  abrirDocumento: (id: number, extensao?: string) => Promise<AbrirDocumentoResult>;

  clearError: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useProdutosStore = create<ProdutosState>((set, get) => ({
  produtos: [],
  isLoading: false,
  error: null,

  fetchProdutos: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiGet<Produto[]>('/api/engenharia/Produtos');
      set({ produtos: data, isLoading: false });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar produtos';
      set({ error: message, isLoading: false });
    }
  },

  createProduto: async (data) => {
    set({ error: null });
    try {
      const novo = await apiPost<Produto>('/api/engenharia/Produtos', data);
      set((state) => ({ produtos: [...state.produtos, novo] }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao criar produto';
      set({ error: message });
      throw err;
    }
  },

  updateProduto: async (id, data) => {
    set({ error: null });
    try {
      const atualizado = await apiPut<Produto | null>(`/api/engenharia/Produtos/${id}`, data);
      if (atualizado && atualizado.id) {
        set((state) => ({
          produtos: state.produtos.map((p) => (p.id === id ? atualizado : p)),
        }));
      } else {
        set((state) => ({
          produtos: state.produtos.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        }));
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao atualizar produto';
      set({ error: message });
      throw err;
    }
  },

  deleteProduto: async (id) => {
    set({ error: null });
    try {
      await apiDelete(`/api/engenharia/Produtos/${id}`);
      set((state) => ({
        produtos: state.produtos.filter((p) => p.id !== id),
      }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao excluir produto';
      set({ error: message });
      throw err;
    }
  },

  varreduraDocumentos: async (prefixo) => {
    set({ error: null });
    try {
      const endpoint = prefixo
        ? `/api/engenharia/Produtos/varredura-documentos?prefixo=${prefixo}`
        : '/api/engenharia/Produtos/varredura-documentos';
      await apiPost(endpoint);
      await get().fetchProdutos();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro na varredura de documentos';
      set({ error: message });
    }
  },

  // ── Abrir pasta no Explorer ─────────────────────────────────────────────────

  abrirPasta: async (id) => {
    const result = await apiPost<AbrirPastaResult>(`/api/engenharia/Produtos/${id}/abrir-pasta`);
    return result;
  },

  // ── Listar extensões disponíveis ────────────────────────────────────────────

  extensoesDocumento: async (id) => {
    const result = await apiGet<ExtensoesDocumentoResult>(`/api/engenharia/Produtos/${id}/extensoes-documento`);
    return result;
  },

  // ── Abrir documento com programa padrão ─────────────────────────────────────

  abrirDocumento: async (id, extensao) => {
    const url = extensao
      ? `/api/engenharia/Produtos/${id}/abrir-documento?extensao=${extensao}`
      : `/api/engenharia/Produtos/${id}/abrir-documento`;
    const result = await apiPost<AbrirDocumentoResult>(url);
    return result;
  },

  clearError: () => set({ error: null }),
}));
