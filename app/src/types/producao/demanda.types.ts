// ========================================
// TYPES - DEMANDA DE PRODUÇÃO
// ========================================
// Endpoint: GET /api/producao/Demanda?tipos=Fabricado,Comprado
//
// Lista flat: 1 linha por par (OP × produto). Linhas com faltante <= 0 não vêm.

import type { TipoProduto } from '@/types/engenharia/produto.types';
import type { StatusOrdemProducao } from '@/types/producao/ordemProducao.types';

export interface DemandaItem {
  ordemProducaoId: number;
  ordemProducaoCodigo: string;
  statusOp: StatusOrdemProducao;
  ordemProducaoItemId: number;

  produtoId: number;
  produtoCodigo: string;
  produtoDescricao: string;
  produtoUnidade: string;
  tipoProduto: TipoProduto;

  quantidadePlanejada: number;
  quantidadeProduzida: number;
  quantidadeFaltante: number;
  percentualConcluido: number;
}

/** Filtro do front que mapeia pra ?tipos= no endpoint. */
export type DemandaFiltro = 'todos' | 'fabricar' | 'comprar';

export const DEMANDA_FILTRO_LABELS: Record<DemandaFiltro, string> = {
  todos: 'Tudo',
  fabricar: 'A Fabricar',
  comprar: 'A Comprar',
};

/** Converte filtro do front em CSV de tipos pro endpoint. */
export function tiposFromFiltro(filtro: DemandaFiltro): string | undefined {
  switch (filtro) {
    case 'fabricar':
      return 'Fabricado';
    case 'comprar':
      return 'Comprado,MateriaPrima';
    case 'todos':
      return undefined;
  }
}
