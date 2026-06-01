/**
 * useGridQuery.ts - Hook de busca paginada server-side para grids
 *
 * Encapsula:
 *  - Persistência por aba (useTabState) de filtros, sort, página, tamanho e busca textual
 *  - Debounce de filtros e busca (200ms) pra não bater no back a cada tecla
 *  - Tradução do estado TanStack pra BuscaRequest do back (lib/busca/converterBusca)
 *  - Fetch via POST /buscar com tipagem forte
 *
 * Uso típico numa page:
 *   const { itens, total, totalPaginas, isLoading, error, refetch } =
 *     useGridQuery<ProdutoResponseDTO>({ endpoint: '/api/engenharia/Produtos/buscar', tabId });
 *
 * O DataGrid (Fase 5) recebe `data={itens}`, `total={total}`, `serverSide` e
 * usa o mesmo tabId pra alimentar/responder aos estados (filters, sort, pagina,
 * tamanho) via useTabState — sem prop drilling extra.
 */

import { useCallback, useEffect, useState } from 'react';
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table';

import { ApiError, apiPost } from '@/lib/api';
import { montarBuscaRequest } from '@/lib/busca/converterBusca';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTabState } from '@/hooks/useTabState';
import type { PaginadoResponse } from '@/types/shared/busca.types';

// ============================================
// TIPOS
// ============================================

export interface UseGridQueryOptions {
  /** URL do endpoint POST /buscar (ex: '/api/engenharia/Produtos/buscar') */
  endpoint: string;
  /** ID único da aba (pra isolar estado entre instâncias da mesma page) */
  tabId: string;
  /** Tamanho de página inicial (default 50) */
  tamanhoInicial?: number;
  /** Delay do debounce em ms (default 200) */
  debounceMs?: number;
}

export interface UseGridQueryResult<T> {
  itens: T[];
  total: number;
  totalPaginas: number;
  isLoading: boolean;
  error: string | null;
  /** Força refetch sem mudar parâmetros (útil após mutações) */
  refetch: () => void;
}

// ============================================
// HOOK
// ============================================

export function useGridQuery<T>({
  endpoint,
  tabId,
  tamanhoInicial = 50,
  debounceMs = 200,
}: UseGridQueryOptions): UseGridQueryResult<T> {
  // Estado de UI persistido por aba (subscribers do useTabState mantêm
  // DataGrid e PanelFilters sincronizados sem prop drilling)
  const [filtros] = useTabState<ColumnFiltersState>(tabId + '-filters', []);
  const [sort] = useTabState<SortingState>(tabId + '-sort', []);
  const [pagina] = useTabState<number>(tabId + '-pagina', 1);
  const [tamanho] = useTabState<number>(tabId + '-tamanho', tamanhoInicial);
  const [busca] = useTabState<string>(tabId + '-busca', '');

  // Debounce em filtros e busca textual — sort/pagina/tamanho são instantâneos
  const filtrosDebounced = useDebouncedValue(filtros, debounceMs);
  const buscaDebounced = useDebouncedValue(busca, debounceMs);

  // Estado da query
  const [itens, setItens] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchTick, setRefetchTick] = useState(0);

  useEffect(() => {
    let cancelado = false;

    const req = montarBuscaRequest({
      filtros: filtrosDebounced,
      sort,
      busca: buscaDebounced,
      pagina,
      tamanho,
    });

    setIsLoading(true);
    setError(null);

    apiPost<PaginadoResponse<T>>(endpoint, req)
      .then((resp) => {
        if (cancelado) return;
        setItens(resp.itens);
        setTotal(resp.total);
        setTotalPaginas(resp.totalPaginas);
      })
      .catch((err: unknown) => {
        if (cancelado) return;
        const msg = err instanceof ApiError ? err.message : 'Erro ao buscar dados';
        setError(msg);
        setItens([]);
        setTotal(0);
        setTotalPaginas(1);
      })
      .finally(() => {
        if (!cancelado) setIsLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [endpoint, filtrosDebounced, sort, buscaDebounced, pagina, tamanho, refetchTick]);

  const refetch = useCallback(() => {
    setRefetchTick((t) => t + 1);
  }, []);

  return { itens, total, totalPaginas, isLoading, error, refetch };
}
