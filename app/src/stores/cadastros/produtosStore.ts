// ========================================
// STORE - PRODUTOS (Zustand)
// ========================================

import { create } from 'zustand';
import type { Produto, ProdutoFormData, ProdutoFilters } from '@/types/cadastros/produto.types';
import { mockProdutos } from '@/data/cadastros/mockProdutos';

interface ProdutosState {
    // Estado
    produtos: Produto[];
    isLoading: boolean;
    error: string | null;
    filters: ProdutoFilters;

    // Actions
    loadProdutos: () => void;
    createProduto: (data: ProdutoFormData) => void;
    updateProduto: (id: string, data: Partial<ProdutoFormData>) => void;
    deleteProduto: (id: string) => void;
    setFilters: (filters: ProdutoFilters) => void;
    clearFilters: () => void;
    getProdutoById: (id: string) => Produto | undefined;
    generateCodigo: (tipo: 'FABRICADO' | 'COMPRADO' | 'MATERIA_PRIMA') => string;
}

export const useProdutosStore = create<ProdutosState>((set, get) => ({
    // Estado inicial
    produtos: [],
    isLoading: false,
    error: null,
    filters: {},

    // Carregar produtos (mock com delay simulado)
    loadProdutos: () => {
        set({ isLoading: true, error: null });

        // Simular delay de API
        setTimeout(() => {
            set({
                produtos: mockProdutos,
                isLoading: false,
            });
        }, 300);
    },

    // Criar produto
    createProduto: (data) => {
        const novoProduto: Produto = {
            id: `produto-${Date.now()}`,
            codigo: data.codigo,
            descricaoCurta: data.descricaoCurta,
            descricaoCompleta: data.descricaoCompleta,
            tipo: data.tipo,
            unidade: data.unidade,
            pesoEstimado: data.pesoEstimado,
            tempoFabricacao: data.tempoFabricacao,
            possuiDesenho: data.possuiDesenho,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        set((state) => ({
            produtos: [...state.produtos, novoProduto],
        }));
    },

    // Atualizar produto
    updateProduto: (id, data) => {
        set((state) => ({
            produtos: state.produtos.map((p) =>
                p.id === id
                    ? {
                        ...p,
                        ...data,
                        updatedAt: new Date(),
                    }
                    : p
            ),
        }));
    },

    // Deletar produto
    deleteProduto: (id) => {
        set((state) => ({
            produtos: state.produtos.filter((p) => p.id !== id),
        }));
    },

    // Definir filtros
    setFilters: (filters) => {
        set({ filters });
    },

    // Limpar filtros
    clearFilters: () => {
        set({ filters: {} });
    },

    // Buscar produto por ID
    getProdutoById: (id) => {
        return get().produtos.find((p) => p.id === id);
    },

    // Gerar código automático
    generateCodigo: (tipo) => {
        const state = get();
        const prefixo = tipo === 'FABRICADO' ? 'PRD' : tipo === 'COMPRADO' ? 'CMP' : 'MP';

        // Filtrar produtos do mesmo tipo
        const produtosMesmoTipo = state.produtos.filter((p) => p.codigo.startsWith(prefixo));

        // Pegar maior número
        let maiorNumero = 0;
        produtosMesmoTipo.forEach((p) => {
            const numero = parseInt(p.codigo.split('-')[1]);
            if (numero > maiorNumero) {
                maiorNumero = numero;
            }
        });

        // Incrementar
        const novoNumero = maiorNumero + 1;

        // Formatar com 3 dígitos
        return `${prefixo}-${String(novoNumero).padStart(3, '0')}`;
    },
}));