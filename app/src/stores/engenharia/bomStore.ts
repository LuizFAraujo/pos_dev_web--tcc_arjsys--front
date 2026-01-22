// ========================================
// STORE - BOM (Zustand)
// ========================================

import { create } from 'zustand';
import type { BOMItem, BOMStructure } from '@/types/engenharia/bom.types';
import { mockBOMStructureTrator } from '@/data/engenharia/mockBOM';

interface BOMState {
    // Estado
    selectedProdutoId: string | null;
    bomStructure: BOMStructure | null;
    expandedNodes: Set<string>;
    isLoading: boolean;
    error: string | null;

    // Actions
    loadBOM: (produtoId: string) => void;
    clearBOM: () => void;
    toggleNode: (nodeId: string) => void;
    expandAll: () => void;
    collapseAll: () => void;
    addItem: (parentId: string | null, item: Omit<BOMItem, 'id' | 'nivel' | 'parentId'>) => void;
    updateItem: (itemId: string, data: Partial<BOMItem>) => void;
    deleteItem: (itemId: string) => void;
    getAllNodeIds: (items: BOMItem[]) => string[];
}

export const useBOMStore = create<BOMState>((set, get) => ({
    // Estado inicial
    selectedProdutoId: null,
    bomStructure: null,
    expandedNodes: new Set<string>(),
    isLoading: false,
    error: null,

    // Carregar BOM de um produto
    loadBOM: (produtoId) => {
        set({ isLoading: true, error: null });

        // Simular delay de API
        setTimeout(() => {
            // Mock: só temos estrutura do trator
            if (produtoId === '1') {
                set({
                    selectedProdutoId: produtoId,
                    bomStructure: mockBOMStructureTrator,
                    isLoading: false,
                    expandedNodes: new Set<string>(), // Inicia colapsado
                });
            } else {
                set({
                    selectedProdutoId: produtoId,
                    bomStructure: null,
                    isLoading: false,
                    error: 'Estrutura não encontrada para este produto',
                });
            }
        }, 300);
    },

    // Limpar BOM
    clearBOM: () => {
        set({
            selectedProdutoId: null,
            bomStructure: null,
            expandedNodes: new Set<string>(),
            error: null,
        });
    },

    // Toggle expandir/colapsar nó
    toggleNode: (nodeId) => {
        const { expandedNodes } = get();
        const newExpanded = new Set(expandedNodes);

        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
        } else {
            newExpanded.add(nodeId);
        }

        set({ expandedNodes: newExpanded });
    },

    // Expandir todos os nós
    expandAll: () => {
        const { bomStructure } = get();
        if (!bomStructure) return;

        const allIds = get().getAllNodeIds(bomStructure.items);
        set({ expandedNodes: new Set(allIds) });
    },

    // Colapsar todos os nós
    collapseAll: () => {
        set({ expandedNodes: new Set<string>() });
    },

    // Pegar todos os IDs de nós (recursivo)
    getAllNodeIds: (items) => {
        const ids: string[] = [];

        const traverse = (items: BOMItem[]) => {
            items.forEach((item) => {
                ids.push(item.id);
                if (item.children && item.children.length > 0) {
                    traverse(item.children);
                }
            });
        };

        traverse(items);
        return ids;
    },

    // Adicionar item na estrutura
    addItem: (parentId, itemData) => {
        const { bomStructure } = get();
        if (!bomStructure) return;

        const newItem: BOMItem = {
            id: `bom-${Date.now()}`,
            ...itemData,
            nivel: parentId ? findItemLevel(bomStructure.items, parentId) + 1 : 2,
            parentId,
            children: [],
        };

        const updatedItems = parentId
            ? addItemToParent(bomStructure.items, parentId, newItem)
            : [...bomStructure.items, newItem];

        set({
            bomStructure: {
                ...bomStructure,
                items: updatedItems,
                updatedAt: new Date(),
            },
        });
    },

    // Atualizar item
    updateItem: (itemId, data) => {
        const { bomStructure } = get();
        if (!bomStructure) return;

        const updatedItems = updateItemRecursive(bomStructure.items, itemId, data);

        set({
            bomStructure: {
                ...bomStructure,
                items: updatedItems,
                updatedAt: new Date(),
            },
        });
    },

    // Deletar item
    deleteItem: (itemId) => {
        const { bomStructure } = get();
        if (!bomStructure) return;

        const updatedItems = deleteItemRecursive(bomStructure.items, itemId);

        set({
            bomStructure: {
                ...bomStructure,
                items: updatedItems,
                updatedAt: new Date(),
            },
        });
    },
}));

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function findItemLevel(items: BOMItem[], itemId: string): number {
    for (const item of items) {
        if (item.id === itemId) return item.nivel;
        if (item.children) {
            const level = findItemLevel(item.children, itemId);
            if (level > 0) return level;
        }
    }
    return 0;
}

function addItemToParent(items: BOMItem[], parentId: string, newItem: BOMItem): BOMItem[] {
    return items.map((item) => {
        if (item.id === parentId) {
            return {
                ...item,
                children: [...(item.children || []), newItem],
            };
        }
        if (item.children) {
            return {
                ...item,
                children: addItemToParent(item.children, parentId, newItem),
            };
        }
        return item;
    });
}

function updateItemRecursive(items: BOMItem[], itemId: string, data: Partial<BOMItem>): BOMItem[] {
    return items.map((item) => {
        if (item.id === itemId) {
            return { ...item, ...data };
        }
        if (item.children) {
            return {
                ...item,
                children: updateItemRecursive(item.children, itemId, data),
            };
        }
        return item;
    });
}

function deleteItemRecursive(items: BOMItem[], itemId: string): BOMItem[] {
    return items
        .filter((item) => item.id !== itemId)
        .map((item) => {
            if (item.children) {
                return {
                    ...item,
                    children: deleteItemRecursive(item.children, itemId),
                };
            }
            return item;
        });
}