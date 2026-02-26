// ========================================
// TYPES — BOM / Estrutura de Produto (Engenharia)
// ========================================
// Alinhado com o backend ASP.NET Core 10.
// Endpoints em /api/engenharia/Bom

/**
 * Item de estrutura BOM — resposta do backend
 *
 * GET /api/engenharia/Bom/flat retorna lista destes itens.
 * GET /api/engenharia/Bom/produto/{produtoPaiId} retorna filhos de um produto.
 */
export interface BomItem {
  id: number;
  produtoPaiId: number;
  produtoFilhoId: number;
  quantidade: number;
  posicao: number;
  observacao?: string;

  /** Dados expandidos do produto pai (retornados pelo backend nos GETs) */
  produtoPaiCodigo?: string;
  produtoPaiDescricao?: string;

  /** Dados expandidos do produto filho (retornados pelo backend nos GETs) */
  produtoFilhoCodigo?: string;
  produtoFilhoDescricao?: string;
  produtoFilhoUnidade?: string;
  produtoFilhoTipo?: string;
  produtoFilhoTemDocumento?: boolean;
}

/**
 * Produto que possui estrutura — resposta do GET /api/engenharia/Bom
 * Lista paginável de produtos que são "pais" na BOM.
 */
export interface BomProdutoPai {
  produtoId: number;
  produtoCodigo: string;
  produtoDescricao: string;
  quantidadeFilhos: number;
}

/**
 * Dados para criar/editar item BOM
 * POST /api/engenharia/Bom
 * PUT /api/engenharia/Bom/{id}
 */
export interface BomItemFormData {
  produtoPaiId: number;
  produtoFilhoId: number;
  quantidade: number;
  posicao?: number; // Se <= 0 ou omitido, backend gera automaticamente
  observacao?: string;
}

/**
 * Item na visualização Tree (construído no frontend)
 *
 * Montado a partir dos dados flat da API para exibir hierarquia.
 */
export interface BomTreeItem {
  id: number;
  codigo: string;
  descricao: string;
  unidade: string;
  tipo: string;
  quantidade: number;
  posicao: number;
  nivel: number;
  temDocumento: boolean;
  hasChildren: boolean;
  children: BomTreeItem[];
}

/**
 * Filtros da BOM (uso no frontend)
 */
export interface BomFilters {
  searchTerm?: string;
  tipo?: string;
  temDocumento?: boolean;
}
