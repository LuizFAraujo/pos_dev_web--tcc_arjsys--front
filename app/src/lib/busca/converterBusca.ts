/**
 * converterBusca.ts - Conversão entre estado do TanStack Table e BuscaRequest do back
 *
 * O DataGrid persiste filtros/sort no formato TanStack (ColumnFiltersState, SortingState)
 * com o CompoundFilter customizado dentro do `value` de cada filtro.
 *
 * Estas funções traduzem esse estado pro contrato BuscaRequest esperado pelos
 * endpoints POST /buscar do back (espelho 1:1 do DTO em Api_ArjSys_Tcc.DTOs.Shared).
 */

import type { ColumnFiltersState, SortingState } from '@tanstack/react-table';
import type {
  CompoundFilter,
  FilterCondition,
} from '@/components/shared/DataGrid/types';
import type {
  BuscaRequest,
  Condicao,
  FiltroColuna,
  Logica,
  Operador,
  Ordenacao,
} from '@/types/shared/busca.types';

// ============================================
// MAPA DE OPERADORES (front legado → back camelCase)
// ============================================

const MAPA_OPERADOR_TEXTO: Record<string, Operador> = {
  contem: 'contem',
  nao_contem: 'naoContem',
  comeca: 'comecaCom',
  termina: 'terminaCom',
  igual: 'igual',
  diferente: 'diferente',
};

const MAPA_LOGICA: Record<string, Logica> = {
  E: 'e',
  OU: 'ou',
};

// ============================================
// CONVERSÃO DE UMA CONDIÇÃO DE TEXTO
// ============================================

function condicaoDeTexto(c: FilterCondition, proximaLogica?: string): Condicao | null {
  const operador = MAPA_OPERADOR_TEXTO[c.operator];
  if (!operador) return null;
  if (!c.value) return null;
  return {
    operador,
    valor: c.value,
    logica: proximaLogica ? MAPA_LOGICA[proximaLogica] : undefined,
  };
}

// ============================================
// CONVERSÃO DE UM COMPOUND FILTER → CONDIÇÕES
// ============================================

function condicoesDoCompound(filtro: CompoundFilter): Condicao[] {
  switch (filtro.type) {
    case 'text': {
      const conds = filtro.conditions ?? [];
      const resultado: Condicao[] = [];
      conds.forEach((c, idx) => {
        const proximaLogica = idx < conds.length - 1 ? conds[idx].logic : undefined;
        const cond = condicaoDeTexto(c, proximaLogica);
        if (cond) resultado.push(cond);
      });
      return resultado;
    }

    case 'exact':
    case 'select': {
      if (!filtro.valor) return [];
      return [{ operador: 'igual', valor: filtro.valor }];
    }

    case 'number': {
      const temMin = filtro.min !== undefined && filtro.min !== '';
      const temMax = filtro.max !== undefined && filtro.max !== '';

      if (temMin && temMax) {
        return [{ operador: 'entre', valor: [filtro.min!, filtro.max!] }];
      }
      if (temMin) {
        return [{ operador: 'maiorOuIgual', valor: filtro.min! }];
      }
      if (temMax) {
        return [{ operador: 'menorOuIgual', valor: filtro.max! }];
      }
      if (filtro.valor) {
        return [{ operador: 'igual', valor: filtro.valor }];
      }
      return [];
    }

    case 'checklist': {
      const valores = filtro.checkedValues ?? [];
      if (valores.length === 0) return [];
      return [{ operador: 'em', valor: valores }];
    }

    default:
      return [];
  }
}

// ============================================
// COLUMN FILTERS → FILTROS POR COLUNA
// ============================================

export function converterColumnFiltersParaFiltros(state: ColumnFiltersState): FiltroColuna[] {
  const resultado: FiltroColuna[] = [];

  for (const f of state) {
    const compound = f.value as CompoundFilter | undefined;
    if (!compound) continue;

    const condicoes = condicoesDoCompound(compound);
    if (condicoes.length === 0) continue;

    resultado.push({
      coluna: f.id,
      condicoes,
    });
  }

  return resultado;
}

// ============================================
// SORTING → ORDENAÇÕES
// ============================================

export function converterSortingParaOrdenacoes(state: SortingState): Ordenacao[] {
  return state.map((s) => ({
    coluna: s.id,
    direcao: s.desc ? 'desc' : 'asc',
  }));
}

// ============================================
// MONTAGEM DO BUSCA REQUEST COMPLETO
// ============================================

export interface MontarBuscaRequestArgs {
  filtros: ColumnFiltersState;
  sort: SortingState;
  busca?: string;
  colunasBusca?: string[];
  pagina: number;
  tamanho: number;
}

export function montarBuscaRequest(args: MontarBuscaRequestArgs): BuscaRequest {
  const filtrosColunas = converterColumnFiltersParaFiltros(args.filtros);
  const ordenacoes = converterSortingParaOrdenacoes(args.sort);

  const req: BuscaRequest = {
    pagina: args.pagina,
    tamanho: args.tamanho,
  };

  if (filtrosColunas.length > 0) req.filtros = filtrosColunas;
  if (ordenacoes.length > 0) req.ordenacoes = ordenacoes;
  if (args.busca && args.busca.trim().length > 0) req.busca = args.busca.trim();
  if (args.colunasBusca && args.colunasBusca.length > 0) req.colunasBusca = args.colunasBusca;

  return req;
}
