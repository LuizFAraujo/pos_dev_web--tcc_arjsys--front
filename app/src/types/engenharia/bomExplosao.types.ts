// ========================================
// TYPES - EXPLOSÃO DE BOM (Engenharia) - v3
// ========================================
// Alinhado com backend ASP.NET Core 10 - feature/vendas
// GET /api/engenharia/Bom/produto/{id}/explosao
//
// Retorna lista consolidada de itens folha - cada produto aparece uma única vez
// com a soma total das ocorrências em todos os níveis da estrutura.

export interface BomExplosaoItem {
  produtoId: number;
  codigo: string;
  descricao: string;
  unidade: string;
  tipo: string;
  quantidadeTotal: number;
}

export interface BomExplosao {
  produtoPaiId: number;
  produtoPaiCodigo: string;
  produtoPaiDescricao: string;
  itens: BomExplosaoItem[];
  totalItens: number;
}
