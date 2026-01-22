// ========================================
// TYPES - BOM (Bill of Materials)
// ========================================

/**
 * Tipo de item na estrutura
 */
export type TipoItem = 'FABRICADO' | 'COMPRADO' | 'MATERIA_PRIMA';

/**
 * Item da estrutura (nó da árvore)
 */
export interface BOMItem {
    id: string;
    produtoId: string;
    codigo: string;
    descricao: string;
    tipo: TipoItem;
    quantidade: number;
    unidade: string;
    nivel: number;
    sequencia: number;
    parentId: string | null;
    children?: BOMItem[];
}

/**
 * Estrutura completa de um produto
 */
export interface BOMStructure {
    produtoId: string;
    codigoProduto: string;
    descricaoProduto: string;
    items: BOMItem[];
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Formulário para adicionar/editar item
 */
export interface BOMItemFormData {
    produtoId: string;
    quantidade: number;
    sequencia: number;
}

/**
 * Filtros da árvore BOM
 */
export interface BOMFilters {
    showOnlyFabricados?: boolean;
    showOnlyComprados?: boolean;
    searchTerm?: string;
}