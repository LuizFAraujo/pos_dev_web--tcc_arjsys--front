// ========================================
// TYPES - COMPARTILHADOS
// ========================================

/**
 * Status genérico do sistema
 */
export type Status = 'ATIVO' | 'INATIVO' | 'PENDENTE' | 'CANCELADO';

/**
 * Ordem de classificação
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Interface de paginação
 */
export interface Pagination {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

/**
 * Resposta paginada genérica
 */
export interface PaginatedResponse<T> {
    data: T[];
    pagination: Pagination;
}

/**
 * Opção de select genérica
 */
export interface SelectOption {
    value: string;
    label: string;
}