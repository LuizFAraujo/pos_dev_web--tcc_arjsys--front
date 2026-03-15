/**
 * useListState.ts — Hook para estado da lista em páginas de cadastro
 *
 * Encapsula toda a lógica de estado do modo list:
 *   - SearchBar: termo de busca, colunas selecionadas
 *   - Filtro: filtra dados pelo termo + colunas
 *   - View mode: lista ou cards
 *   - Seleção: item selecionado (grid ou card), activeItem unificado
 *
 * Uso:
 *   const list = useListState<Cliente>({
 *     tabId: tab.id,
 *     data: clientes,
 *     searchColumns: SEARCH_COLUMNS,
 *     defaultSearchCols: ['nome'],
 *   });
 *
 *   // list.filtrados, list.searchTerm, list.activeItem, list.viewMode, etc.
 */

import { useState, useMemo, useCallback, useRef } from 'react';
import { useTabState } from '@/hooks/useTabState';
import type { DataGridHandle } from '@/components/shared/DataGrid';
import type { CardGridHandle } from '@/components/shared/CardGrid';
import type { SearchColumn } from '@/components/shared/SearchBar';

interface UseListStateOptions<T> {
  /** ID da aba — pra persistir estado entre trocas de aba */
  tabId: string;
  /** Dados brutos da store */
  data: T[];
  /** Colunas disponíveis no SearchBar */
  searchColumns: SearchColumn[];
  /** Colunas padrão selecionadas (default: primeira coluna) */
  defaultSearchCols?: string[];
}

interface UseListStateReturn<T> {
  // ── Refs ──────────────────────────────────────────────────────────────────
  /** Ref do DataGrid — passar no componente e no PageActions */
  gridRef: React.RefObject<DataGridHandle | null>;
  /** Ref do CardGrid */
  cardGridRef: React.RefObject<CardGridHandle | null>;

  // ── Search ────────────────────────────────────────────────────────────────
  /** Termo de busca atual */
  searchTerm: string;
  /** Setter do termo de busca */
  setSearchTerm: (value: string) => void;
  /** Colunas selecionadas no SearchBar */
  searchCols: string[];
  /** Setter das colunas selecionadas */
  setSearchCols: (cols: string[]) => void;

  // ── Dados filtrados ───────────────────────────────────────────────────────
  /** Dados filtrados pelo SearchBar */
  filtrados: T[];

  // ── View mode ─────────────────────────────────────────────────────────────
  /** Modo de visualização: 'list' ou 'cards' */
  viewMode: 'list' | 'cards';
  /** Handler para trocar modo — limpa seleção automaticamente */
  handleViewMode: (mode: 'list' | 'cards') => void;
  /** Se está no modo lista (atalho) */
  isListMode: boolean;

  // ── Seleção ───────────────────────────────────────────────────────────────
  /** Item selecionado no grid (modo lista) */
  selectedItem: T | null;
  /** Setter do item selecionado no grid */
  setSelectedItem: (item: T | null) => void;
  /** ID do card selecionado (modo cards) */
  selectedCardId: number | string | null;
  /** Setter do ID do card selecionado */
  setSelectedCardId: (id: number | string | null) => void;
  /** Item ativo unificado — grid ou card, dependendo do viewMode */
  activeItem: T | null;
}

export function useListState<T extends { id: number | string }>({
  tabId,
  data,
  searchColumns,
  defaultSearchCols,
}: UseListStateOptions<T>): UseListStateReturn<T> {

  const gridRef = useRef<DataGridHandle>(null);
  const cardGridRef = useRef<CardGridHandle>(null);

  const [searchTerm, setSearchTerm] = useTabState(tabId + '-search', '');
  const [searchCols, setSearchCols] = useTabState<string[]>(
    tabId + '-search-cols',
    defaultSearchCols || [searchColumns[0]?.key].filter(Boolean),
  );
  const [viewMode, setViewMode] = useTabState<'list' | 'cards'>(tabId + '-view', 'list');
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [selectedCardId, setSelectedCardId] = useTabState<number | string | null>(tabId + '-card-sel', null);

  // ── Filtro ──────────────────────────────────────────────────────────────────

  const filtrados = useMemo(() => {
    if (!searchTerm) return data || [];
    const term = searchTerm.toLowerCase();
    return (data || []).filter((item) =>
      searchCols.some((col) => {
        const val = (item as any)[col];
        return val && String(val).toLowerCase().includes(term);
      }),
    );
  }, [data, searchTerm, searchCols]);

  // ── Seleção ─────────────────────────────────────────────────────────────────

  const selectedCard = useMemo(
    () => filtrados.find((item) => item.id === selectedCardId) ?? null,
    [filtrados, selectedCardId],
  );

  const activeItem = viewMode === 'list' ? selectedItem : selectedCard;

  // ── View mode ───────────────────────────────────────────────────────────────

  const handleViewMode = useCallback((mode: 'list' | 'cards') => {
    setViewMode(mode);
    if (mode === 'list') {
      setSelectedCardId(null);
      cardGridRef.current?.clearSelection();
    } else {
      setSelectedItem(null);
    }
  }, [setViewMode, setSelectedCardId]);

  return {
    gridRef,
    cardGridRef,
    searchTerm, setSearchTerm,
    searchCols, setSearchCols,
    filtrados,
    viewMode, handleViewMode, isListMode: viewMode === 'list',
    selectedItem, setSelectedItem,
    selectedCardId, setSelectedCardId,
    activeItem,
  };
}
