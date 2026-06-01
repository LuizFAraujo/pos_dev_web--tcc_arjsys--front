/**
 * useGridQuery.ts - Hook de busca server-side em modo SCROLL INFINITO
 *
 * Encapsula:
 *  - Persistência por aba (useTabState) de filtros, sort e busca textual
 *  - Debounce de filtros e busca (200ms) pra não bater no back a cada tecla
 *  - Tradução do estado TanStack pra BuscaRequest do back (lib/busca/converterBusca)
 *  - Carregamento incremental: começa com 1 chunk, conforme `carregarMais` é chamado
 *    acumula próximos chunks no array `itens`. Reseta ao mudar filtros/sort/busca.
 *
 * O DataGrid em modo serverSide observa o virtualizador e dispara `carregarMais`
 * quando o usuário se aproxima do fim. Não há paginação numerada — UX estilo
 * Protheus/IDE, tudo numa "página só" do ponto de vista do usuário.
 *
 * Uso típico numa page:
 *   const { itens, total, hasMore, isLoading, error, carregarMais, refetch } =
 *     useGridQuery<ProdutoResponseDTO>({ endpoint: '/api/engenharia/Produtos/buscar', tabId });
 */

import { useCallback, useEffect, useRef, useState } from 'react';
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
  /** Tamanho do chunk de carregamento (default 100) */
  tamanhoChunk?: number;
  /** Delay do debounce em ms (default 200) */
  debounceMs?: number;
  /**
   * Colunas onde o SearchBar busca quando o usuario ainda nao escolheu nenhuma.
   * Deve bater com o `defaultSearchCols` passado no `useListState` da mesma page,
   * pra que ambas as leituras do useTabState(tabId+'-search-cols') vejam o mesmo
   * valor inicial.
   */
  colunasBuscaInicial?: string[];
}

export interface UseGridQueryResult<T> {
  /** Itens acumulados (todas as páginas carregadas até agora) */
  itens: T[];
  /** Total de registros após filtros/busca */
  total: number;
  /** Total de registros da tabela inteira (sem filtros) */
  totalGeral: number;
  /** true quando ainda há páginas no back que não foram carregadas */
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
  /** Carrega o próximo chunk (chamado pelo DataGrid ao chegar perto do fim) */
  carregarMais: () => void;
  /** Reinicia do zero (página 1, mantém filtros) — útil após mutações */
  refetch: () => void;
}

// ============================================
// HOOK
// ============================================

export function useGridQuery<T>({
  endpoint,
  tabId,
  tamanhoChunk = 100,
  debounceMs = 200,
  colunasBuscaInicial = [],
}: UseGridQueryOptions): UseGridQueryResult<T> {
  // Estado de UI persistido por aba — DataGrid e PanelFilters compartilham
  const [filtros] = useTabState<ColumnFiltersState>(tabId + '-filters', []);
  const [sort] = useTabState<SortingState>(tabId + '-sort', []);
  const [busca] = useTabState<string>(tabId + '-busca', '');
  // Colunas onde o SearchBar busca (popover "X col." do header).
  // O default precisa bater com o `defaultSearchCols` do useListState da page,
  // ja que ambos leem a mesma key e quem inicializa primeiro fixa o valor.
  const [colunasBusca] = useTabState<string[]>(tabId + '-search-cols', colunasBuscaInicial);

  // Debounce em filtros e busca textual — sort é instantâneo (clique direto)
  const filtrosDebounced = useDebouncedValue(filtros, debounceMs);
  const buscaDebounced = useDebouncedValue(busca, debounceMs);

  // Estado da query
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itens, setItens] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [totalGeral, setTotalGeral] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchTick, setRefetchTick] = useState(0);

  // Chave que muda quando filtros/sort/busca mudam — usada pra detectar reset
  const filtrosHash = JSON.stringify({
    f: filtrosDebounced,
    s: sort,
    b: buscaDebounced,
    c: colunasBusca,
  });
  const filtrosHashRef = useRef<string>(filtrosHash);
  const inicializadoRef = useRef(false);

  useEffect(() => {
    let cancelado = false;

    // Detecta mudança de filtros → reseta página pra 1
    // (se já está em 1, segue direto pra fetch)
    const mudouFiltros = inicializadoRef.current && filtrosHashRef.current !== filtrosHash;
    if (mudouFiltros) {
      filtrosHashRef.current = filtrosHash;
      if (paginaAtual !== 1) {
        setPaginaAtual(1);
        return; // setPaginaAtual vai re-disparar este effect
      }
    }
    inicializadoRef.current = true;
    filtrosHashRef.current = filtrosHash;

    const req = montarBuscaRequest({
      filtros: filtrosDebounced,
      sort,
      busca: buscaDebounced,
      colunasBusca,
      pagina: paginaAtual,
      tamanho: tamanhoChunk,
    });

    setIsLoading(true);
    setError(null);

    apiPost<PaginadoResponse<T>>(endpoint, req)
      .then((resp) => {
        if (cancelado) return;
        setItens((prev) => (paginaAtual === 1 ? resp.itens : [...prev, ...resp.itens]));
        setTotal(resp.total);
        setTotalGeral(resp.totalGeral);
        setHasMore(paginaAtual < resp.totalPaginas);
      })
      .catch((err: unknown) => {
        if (cancelado) return;
        const msg = err instanceof ApiError ? err.message : 'Erro ao buscar dados';
        setError(msg);
        if (paginaAtual === 1) {
          setItens([]);
          setTotal(0);
        }
        setHasMore(false);
      })
      .finally(() => {
        if (!cancelado) setIsLoading(false);
      });

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, filtrosHash, paginaAtual, tamanhoChunk, refetchTick]);

  const carregarMais = useCallback(() => {
    if (isLoading || !hasMore) return;
    setPaginaAtual((p) => p + 1);
  }, [isLoading, hasMore]);

  const refetch = useCallback(() => {
    setPaginaAtual(1);
    setRefetchTick((t) => t + 1);
  }, []);

  return { itens, total, totalGeral, hasMore, isLoading, error, carregarMais, refetch };
}
