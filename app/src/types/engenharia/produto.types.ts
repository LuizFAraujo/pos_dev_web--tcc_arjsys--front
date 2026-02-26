// ========================================
// TYPES — PRODUTO (Engenharia)
// ========================================
// Alinhado com o backend ASP.NET Core 10.
// CRUD em /api/engenharia/Produtos

/**
 * Tipo de produto — enums do backend (PascalCase)
 */
export type TipoProduto =
  | 'Fabricado'
  | 'Comprado'
  | 'MateriaPrima'
  | 'Revenda'
  | 'Servico';

/**
 * Unidades de medida — enums do backend
 */
export type UnidadeMedida =
  | 'UN'
  | 'PC'
  | 'CJ'
  | 'KG'
  | 'KT'
  | 'MT'
  | 'M2'
  | 'M3'
  | 'LT';

/**
 * Produto — resposta do GET /api/engenharia/Produtos
 *
 * Campos alinhados com o backend:
 * - id é number (int sequencial)
 * - descricao (não descricaoCurta)
 * - temDocumento (não possuiDesenho)
 * - sem tempoFabricacao (não existe no backend)
 */
export interface Produto {
  id: number;
  codigo: string;
  descricao: string;
  descricaoCompleta?: string;
  unidade: UnidadeMedida;
  tipo: TipoProduto;
  peso?: number;
  ativo: boolean;
  temDocumento: boolean;
}

/**
 * Dados para criar/editar produto
 * POST /api/engenharia/Produtos
 * PUT /api/engenharia/Produtos/{id}
 *
 * Não inclui id (gerado pelo backend) nem temDocumento (atualizado por varredura).
 */
export interface ProdutoFormData {
  codigo: string;
  descricao: string;
  descricaoCompleta?: string;
  unidade: UnidadeMedida;
  tipo: TipoProduto;
  peso?: number;
  ativo: boolean;
}

/**
 * Filtros para listagem de produtos (uso no frontend)
 */
export interface ProdutoFilters {
  search?: string;
  tipo?: TipoProduto;
  temDocumento?: boolean;
  ativo?: boolean;
}

// ============================================
// LABELS — Para exibição na UI
// ============================================

export const TIPO_PRODUTO_LABELS: Record<TipoProduto, string> = {
  Fabricado: 'Fabricado',
  Comprado: 'Comprado',
  MateriaPrima: 'Matéria Prima',
  Revenda: 'Revenda',
  Servico: 'Serviço',
};

export const UNIDADE_LABELS: Record<UnidadeMedida, string> = {
  UN: 'Unidade',
  PC: 'Peça',
  CJ: 'Conjunto',
  KG: 'Quilograma',
  KT: 'Kit',
  MT: 'Metro',
  M2: 'Metro²',
  M3: 'Metro³',
  LT: 'Litro',
};
