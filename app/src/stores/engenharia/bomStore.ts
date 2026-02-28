// ========================================
// STORE — BOM / Estrutura de Produto — API Real
// ========================================
// Endpoints:
//   GET  /api/engenharia/Bom           → lista produtos que têm estrutura
//   GET  /api/engenharia/Bom/flat      → todas as relações (flat)
//   GET  /api/engenharia/Bom/produto/{id} → filhos de um produto
//   POST /api/engenharia/Bom           → criar item BOM
//   PUT  /api/engenharia/Bom/{id}      → atualizar item BOM
//   DELETE /api/engenharia/Bom/{id}    → deletar item BOM

import { create } from 'zustand';
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from '@/lib/api';
import type {
  BomItem,
  BomProdutoPai,
  BomItemFormData,
  BomTreeItem,
} from '@/types/engenharia/bom.types';

// ============================================
// FUNÇÕES DE TRANSFORMAÇÃO
// ============================================

/**
 * Transforma lista flat de BomItems em árvore hierárquica.
 * Usado na TreeView para um produto pai específico.
 */
export function buildTreeFromFlat(items: BomItem[]): BomTreeItem[] {
  // Monta set de IDs que são pais (têm filhos)
  const idsPai = new Set(items.map((i) => i.produtoPaiId));

  return items.map((item) => ({
    id: item.id,
    codigo: item.produtoFilhoCodigo || '',
    descricao: item.produtoFilhoDescricao || '',
    unidade: item.produtoFilhoUnidade || 'UN',
    tipo: item.produtoFilhoTipo || '',
    quantidade: item.quantidade,
    posicao: item.posicao,
    nivel: 2,
    temDocumento: item.produtoFilhoTemDocumento || false,
    hasChildren: idsPai.has(item.produtoFilhoId),
    children: [], // Filhos são carregados sob demanda ou recursivamente
  }));
}

// ============================================
// STORE
// ============================================

interface BOMState {
  // Dados
  bomFlat: BomItem[];
  produtosPai: BomProdutoPai[];
  filhosPorProduto: Record<number, BomItem[]>;
  produtosComEstrutura: string[];

  // Estado
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchBomFlat: () => Promise<void>;
  fetchProdutosPai: () => Promise<void>;
  fetchFilhosProduto: (produtoId: number) => Promise<BomItem[]>;
  createBomItem: (data: BomItemFormData) => Promise<void>;
  updateBomItem: (id: number, data: BomItemFormData) => Promise<void>;
  deleteBomItem: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useBOMStore = create<BOMState>((set, get) => ({
  bomFlat: [],
  produtosPai: [],
  filhosPorProduto: {},
  produtosComEstrutura: [],
  isLoading: false,
  error: null,

  fetchBomFlat: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiGet<{ itens: BomItem[] }>('/api/engenharia/Bom/flat');
      set({ bomFlat: data.itens, isLoading: false });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar BOM flat';
      set({ error: message, isLoading: false });
    }
  },

  fetchProdutosPai: async () => {
    set({ error: null });
    try {
      const data = await apiGet<{ itens: any[] }>('/api/engenharia/Bom');
      set({
        produtosPai: data.itens,
        produtosComEstrutura: data.itens.map((p) => p.codigo),
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar produtos pai';
      set({ error: message });
    }
  },

  fetchFilhosProduto: async (produtoId: number) => {
    set({ error: null });
    try {
      const data = await apiGet<BomItem[]>(`/api/engenharia/Bom/produto/${produtoId}`);
      set((state) => ({
        filhosPorProduto: { ...state.filhosPorProduto, [produtoId]: data },
      }));
      return data;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar filhos';
      set({ error: message });
      return [];
    }
  },

  createBomItem: async (data) => {
    set({ error: null });
    try {
      await apiPost('/api/engenharia/Bom', data);
      // Recarrega dados
      await get().fetchBomFlat();
      await get().fetchProdutosPai();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao criar item BOM';
      set({ error: message });
      throw err;
    }
  },

  updateBomItem: async (id, data) => {
    set({ error: null });
    try {
      await apiPut(`/api/engenharia/Bom/${id}`, data);
      await get().fetchBomFlat();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao atualizar item BOM';
      set({ error: message });
      throw err;
    }
  },

  deleteBomItem: async (id) => {
    set({ error: null });
    try {
      await apiDelete(`/api/engenharia/Bom/${id}`);
      await get().fetchBomFlat();
      await get().fetchProdutosPai();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao excluir item BOM';
      set({ error: message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
