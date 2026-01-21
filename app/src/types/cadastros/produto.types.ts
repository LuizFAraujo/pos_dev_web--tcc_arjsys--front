// ========================================
// TYPES - PRODUTO
// ========================================

/**
 * Tipo de produto no sistema
 */
export type TipoProduto = 'FABRICADO' | 'COMPRADO' | 'MATERIA_PRIMA';

/**
 * Unidades de medida disponíveis
 */
export type UnidadeMedida = 'UN' | 'KG' | 'M' | 'M2' | 'M3' | 'L';

/**
 * Interface completa do Produto
 */
export interface Produto {
    id: string;
    codigo: string;
    descricaoCurta: string;
    descricaoCompleta?: string;
    tipo: TipoProduto;
    unidade: UnidadeMedida;
    pesoEstimado?: number;
    tempoFabricacao?: number; // em horas
    possuiDesenho: boolean;
    caminhoDesenho?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Dados do formulário de produto
 */
export interface ProdutoFormData {
    codigo: string;
    descricaoCurta: string;
    descricaoCompleta?: string;
    tipo: TipoProduto;
    unidade: UnidadeMedida;
    pesoEstimado?: number;
    tempoFabricacao?: number;
    possuiDesenho: boolean;
}

/**
 * Filtros para listagem de produtos
 */
export interface ProdutoFilters {
    search?: string;
    tipo?: TipoProduto;
    possuiDesenho?: boolean;
}