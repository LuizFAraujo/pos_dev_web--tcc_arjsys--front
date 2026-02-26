// ========================================
// STORE — PRODUTOS (Engenharia) — API Real
// ========================================

import { create } from 'zustand';
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from '@/lib/api';
import type { Produto, ProdutoFormData } from '@/types/engenharia/produto.types';

interface ProdutosState {
  // Estado
  produtos: Produto[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProdutos: () => Promise<void>;
  createProduto: (data: ProdutoFormData) => Promise<void>;
  updateProduto: (id: number, data: ProdutoFormData) => Promise<void>;
  deleteProduto: (id: number) => Promise<void>;
  varreduraDocumentos: (prefixo?: string) => Promise<void>;
  clearError: () => void;
}

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
      const atualizado = await apiPut<Produto>(`/api/engenharia/Produtos/${id}`, data);
      set((state) => ({
        produtos: state.produtos.map((p) => (p.id === id ? atualizado : p)),
      }));
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
      // Recarrega produtos para pegar temDocumento atualizado
      await get().fetchProdutos();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro na varredura de documentos';
      set({ error: message });
    }
  },

  clearError: () => set({ error: null }),
}));
