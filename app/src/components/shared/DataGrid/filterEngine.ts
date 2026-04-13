/**
 * filterEngine.ts — Motor de filtros compartilhado
 *
 * Centraliza toda a lógica de filtragem usada por:
 * - DataGrid (compoundFilterFn para TanStack Table)
 * - DataGridTree (filterFn para filtragem manual)
 * - ColFilterPopover (isFilterActive, matchSingleCondition)
 * - Pages (applyColumnFilters para filtrar dados antes de passar pro CardGrid)
 *
 * Importar daqui garante que a mesma lógica é usada em todos os contextos.
 */

import type { CompoundFilter, FilterCondition } from './types';
import type { ColumnFiltersState } from '@tanstack/react-table';

// ============================================
// HELPERS
// ============================================

/** Verifica se o filtro tem algum valor ativo */
export function isFilterActive(f?: CompoundFilter): boolean {
  if (!f) return false;
  if (f.conditions && f.conditions.some(c => c.value.trim())) return true;
  // checkedValues existe (mesmo vazio) = filtro ativo. undefined = sem filtro (todos)
  if (f.checkedValues !== undefined) return true;
  return !!(f.contem || f.comeca || f.termina || f.naoContem || f.valor || f.min || f.max);
}

/** Avalia uma condição individual contra um valor de célula (já em lowercase) */
export function matchSingleCondition(cellValue: string, cond: FilterCondition): boolean {
  const v = cond.value.toLowerCase();
  switch (cond.operator) {
    case 'contem': return cellValue.includes(v);
    case 'nao_contem': return !cellValue.includes(v);
    case 'comeca': return cellValue.startsWith(v);
    case 'termina': return cellValue.endsWith(v);
    case 'igual': return cellValue === v;
    case 'diferente': return cellValue !== v;
    default: return true;
  }
}

// ============================================
// MATCH COMPOUND FILTER (valor string vs CompoundFilter)
// ============================================

/**
 * Avalia se um valor de célula (string) passa num CompoundFilter.
 * Usado pelo DataGridTree (filtragem manual) e por applyColumnFilters.
 */
export function matchCompoundFilter(cellValue: string, fv: CompoundFilter): boolean {
  if (!fv || !fv.type) return true;
  const cv = cellValue.toLowerCase();

  if (fv.type === 'text' && fv.conditions && fv.conditions.length > 0) {
    const active = fv.conditions.filter(c => c.value.trim());
    if (active.length === 0) return true;
    let result = matchSingleCondition(cv, active[0]);
    for (let i = 1; i < active.length; i++) {
      const prevLogic = active[i - 1].logic;
      const match = matchSingleCondition(cv, active[i]);
      result = prevLogic === 'OU' ? result || match : result && match;
    }
    return result;
  }

  switch (fv.type) {
    case 'text':
      if (fv.contem && !cv.includes(fv.contem.toLowerCase())) return false;
      if (fv.comeca && !cv.startsWith(fv.comeca.toLowerCase())) return false;
      if (fv.termina && !cv.endsWith(fv.termina.toLowerCase())) return false;
      if (fv.naoContem && cv.includes(fv.naoContem.toLowerCase())) return false;
      return true;
    case 'exact': return !fv.valor || cv === fv.valor.toLowerCase();
    case 'select': return !fv.valor || cv === fv.valor.toLowerCase();
    case 'number': {
      const n = parseFloat(cellValue);
      if (isNaN(n)) return !fv.min && !fv.max;
      if (fv.min && n < parseFloat(fv.min)) return false;
      if (fv.max && n > parseFloat(fv.max)) return false;
      return true;
    }
    case 'checklist': {
      if (!fv.checkedValues) return true;
      if (fv.checkedValues.length === 0) return false;
      return fv.checkedValues.some(v => v.toLowerCase() === cv);
    }
    default: return true;
  }
}

// ============================================
// COMPOUND FILTER FN (para TanStack Table)
// ============================================

/**
 * FilterFn compatível com TanStack Table.
 * Usado pelo DataGrid como filterFn nas colunas.
 *
 * Assinatura: (row, columnId, filterValue) => boolean
 */
export function compoundFilterFn(row: any, columnId: string, fv: CompoundFilter): boolean {
  const cellValue = String(row.getValue(columnId) ?? '');
  return matchCompoundFilter(cellValue, fv);
}

// ============================================
// APPLY COLUMN FILTERS (para uso em pages)
// ============================================

/**
 * Aplica ColumnFiltersState sobre um array de dados.
 * Usado pelas pages para filtrar dados que vão pro CardGrid
 * (e futuramente qualquer componente que não filtre internamente).
 *
 * @param data - Array de objetos (ex: Produto[])
 * @param columnFilters - ColumnFiltersState do TanStack Table (array de { id, value })
 * @param fieldMap - Mapa opcional de columnId → campo real do objeto (pra filterField)
 * @returns Array filtrado
 */
export function applyColumnFilters<T extends Record<string, any>>(
  data: T[],
  columnFilters: ColumnFiltersState,
  fieldMap?: Record<string, string>,
): T[] {
  // Filtra apenas filtros ativos
  const active = columnFilters.filter(f => isFilterActive(f.value as CompoundFilter));
  if (active.length === 0) return data;

  return data.filter(item =>
    active.every(f => {
      const field = fieldMap?.[f.id] || f.id;
      const cellValue = String(item[field] ?? '');
      return matchCompoundFilter(cellValue, f.value as CompoundFilter);
    })
  );
}
