/**
 * DataGrid/DataGrid.tsx - Componente principal do grid
 *
 * Grid baseado em TanStack Table com:
 * - Sort por coluna (click no header)
 * - Filtros por coluna (popover com multi-condição, E/OU, checklist)
 * - Resize de colunas (drag na borda, localStorage)
 * - Linha selecionada (clique + setas cima/baixo)
 * - Enter com linha selecionada → onActivate (abre edição)
 * - Duplo clique na linha → onActivate
 * - Zebra, hover, header fixo (sticky)
 * - Última coluna preenche espaço restante
 * - Virtualização de linhas via @tanstack/react-virtual (suporta 70k+ registros)
 *
 * Lógica de filtro centralizada em filterEngine.ts.
 */

import { useMemo, useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { Ref } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type Updater,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useTabState } from '@/hooks/useTabState';
import { useTabsStore } from '@/stores/tabsStore';
import { userScopedLocalStorage } from '@/lib/userScopedStorage';
import { ArrowUpDown, ArrowUp, ArrowDown, Inbox } from 'lucide-react';
import { ColFilterPopover } from './ColFilterPopover';
import { compoundFilterFn, isFilterActive } from './filterEngine';
import { DEFAULT_MIN_WIDTH, DEFAULT_HEADER_HEIGHT, DEFAULT_ROW_HEIGHT } from './types';
import type { GridFilterType, DataGridProps, DataGridHandle, CompoundFilter } from './types';
import { GridSkeleton } from '@/components/shared/GridSkeleton';

// Posição de scroll por aba — em memória, fora do ciclo de vida do componente.
// Aba fechada → entry removido. Não persiste entre sessões.
const scrollPositionsByTab = new Map<string, number>();


// ============================================
// DATAGRID (componente interno)
// ============================================

function DataGridInner<T extends Record<string, any>>({
  tabId, storageId, columns: gc, data,
  loading = false, loadingText = 'Carregando...',
  headerHeight = DEFAULT_HEADER_HEIGHT,
  rowHeight = DEFAULT_ROW_HEIGHT,
  getRowHeight,
  className = '',
  onSelect,
  onActivate,
  activateOnDoubleClick = false,
  serverSide = false,
  total,
  totalGeral,
  hasMore = false,
  onCarregarMais,
}: DataGridProps<T>, ref: Ref<DataGridHandle>) {

  const [sorting, setSorting] = useTabState<SortingState>(tabId + '-sort', []);
  const [columnFilters, setColumnFilters] = useTabState<ColumnFiltersState>(tabId + '-filters', []);
  const [busca] = useTabState<string>(tabId + '-busca', '');
  const [selectedIdx, setSelectedIdx] = useTabState<number | null>(tabId + '-selected', null);

  const totalRegistros = total ?? data.length;

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizerRef = useRef<any>(null);

  // Persistência de scroll por aba — Map em memória (não persiste entre sessões).
  // Salva continuamente via onScroll; restaura quando esta aba vira a ativa
  // (subscribe direto ao tabsStore) OU quando o viewMode da page volta pra 'list'
  // (sinal robusto pra troca lista↔cards, que ResizeObserver/IntersectionObserver
  // não pegam confiavelmente quando o wrapper usa display:contents).
  const activeTabId = useTabsStore((s) => s.activeTabId);
  const [viewMode] = useTabState<'list' | 'cards'>(tabId + '-view', 'list');

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      // Só registra scroll quando a aba está ativa (evita falsos zeros durante display:none)
      if (useTabsStore.getState().activeTabId === tabId) {
        scrollPositionsByTab.set(tabId, el.scrollTop);
      }
    };
    el.addEventListener('scroll', onScroll, { passive: true });

    return () => el.removeEventListener('scroll', onScroll);
  }, [tabId]);

  // Restaura scroll quando esta aba volta a ser a ativa OU quando o container
  // volta a ficar visível (ex: alternar modo lista/cards na mesma aba).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const restoreWithRetry = () => {
      const target = scrollPositionsByTab.get(tabId) ?? 0;
      if (target <= 0) return;

      let attempts = 0;
      let cancelled = false;
      const tick = () => {
        if (cancelled) return;
        if (!el.isConnected || el.clientHeight === 0) {
          if (++attempts < 90) requestAnimationFrame(tick);
          return;
        }
        if (el.scrollHeight >= target + el.clientHeight) {
          if (Math.abs(el.scrollTop - target) > 1) el.scrollTop = target;
          return;
        }
        if (++attempts < 90) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      return () => { cancelled = true; };
    };

    // Trigger 1: aba ativa
    // Trigger 2: viewMode voltou pra 'list' (deps cobre as duas)
    let cleanup: (() => void) | undefined;
    if (activeTabId === tabId && viewMode === 'list') cleanup = restoreWithRetry();

    // Trigger 3: container fica visível por outro motivo (fallback).
    let prevVisible = el.offsetParent !== null && el.clientHeight > 0;
    const io = new IntersectionObserver((entries) => {
      const visible = entries[0]?.isIntersecting ?? false;
      if (visible && !prevVisible) {
        cleanup?.();
        cleanup = restoreWithRetry();
      }
      prevVisible = visible;
    });
    io.observe(el);

    return () => {
      cleanup?.();
      io.disconnect();
    };
  }, [activeTabId, tabId, viewMode]);

  // Ao desmontar de fato (aba fechada), descarta a posição salva.
  useEffect(() => () => { scrollPositionsByTab.delete(tabId); }, [tabId]);

  useImperativeHandle(ref, () => ({
    clearFilters: () => setColumnFilters([]),
    clearSort: () => setSorting([]),
    clearAll: () => { setColumnFilters([]); setSorting([]); setSelectedIdx(null); },
    focus: () => containerRef.current?.focus(),
    scrollToIndex: (index: number) => virtualizerRef.current?.scrollToIndex(index, { align: 'auto' }),
  }), [setColumnFilters, setSorting, setSelectedIdx]);

  const handleSortingChange = useCallback((updater: Updater<SortingState>) => {
    setSorting(typeof updater === 'function' ? updater(sorting) : updater);
  }, [sorting, setSorting]);

  const handleFiltersChange = useCallback((updater: Updater<ColumnFiltersState>) => {
    setColumnFilters(typeof updater === 'function' ? updater(columnFilters) : updater);
  }, [columnFilters, setColumnFilters]);

  const lsKey = `grid-widths-${storageId || tabId}`;

  const defaultW = useMemo(() => {
    const w: Record<string, number> = {};
    gc.forEach((c) => { if (c.width) w[c.key] = c.width; });
    return w;
  }, [gc]);

  const [colW, setColW] = useState<Record<string, number>>(() => {
    try {
      const s = userScopedLocalStorage.get(lsKey);
      if (s) return { ...defaultW, ...JSON.parse(s) };
    } catch { }
    return { ...defaultW };
  });

  useEffect(() => {
    try { userScopedLocalStorage.set(lsKey, JSON.stringify(colW)); } catch { }
  }, [colW, lsKey]);

  const onResizeDown = useCallback((k: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const col = gc.find((c) => c.key === k);
    const min = col?.minWidth || DEFAULT_MIN_WIDTH;
    const max = col?.maxWidth;
    // Largura inicial = largura real renderizada do cabeçalho.
    const th = (e.currentTarget as HTMLElement).closest('th');
    const startW = th ? th.getBoundingClientRect().width : (colW[k] || col?.width || 150);
    const startX = e.clientX;
    const scroller = scrollRef.current;
    const isLastCol = k === gc[gc.length - 1]?.key;
    let clientX = startX;
    let extra = 0; // crescimento somado pela auto-rolagem (acompanha o scroll)
    let raf = 0;

    // Redimensionamento 1:1 com o mouse. Quem cobre o vazio final é a faixa de
    // preenchimento, então mexer numa coluna não afeta as outras.
    const apply = () => {
      let newW = startW + (clientX - startX) + extra;
      newW = Math.max(min, newW);
      if (max) newW = Math.min(max, newW);
      setColW((p) => ({ ...p, [k]: newW }));
    };

    // Auto-rolagem suave, só pra direita e só na última coluna: enquanto o cursor
    // fica na borda direita, a coluna cresce e a rolagem acompanha (sem pulo).
    // Velocidade proporcional a quão fundo o cursor entra na zona da borda
    // (devagar perto do limite), pra dar pra acertar. Diminuir é arrastar pra esquerda.
    const EDGE = 44;
    const MAX_STEP = 5;
    const tick = () => {
      if (!scroller) { raf = 0; return; }
      const rect = scroller.getBoundingClientRect();
      const depth = clientX - (rect.right - EDGE);
      if (depth > 0) {
        const step = Math.min(depth / EDGE, 1) * MAX_STEP;
        extra += step;
        apply();
        scroller.scrollLeft += step;
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };

    const onMove = (ev: MouseEvent) => {
      clientX = ev.clientX;
      apply();
      if (isLastCol && scroller && raf === 0) {
        const rect = scroller.getBoundingClientRect();
        if (clientX > rect.right - EDGE) raf = requestAnimationFrame(tick);
      }
    };
    const onUp = () => {
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [colW, gc]);

  const tCols = useMemo<ColumnDef<T, any>[]>(() => gc.map((col) => ({
    id: col.key,
    accessorKey: col.filterField || col.key,
    header: col.header,
    enableSorting: col.sortable !== false,
    sortDescFirst: false,
    enableSortingRemoval: true,
    enableColumnFilter: col.filterType !== false,
    filterFn: col.filterType !== false ? compoundFilterFn : undefined,
    cell: col.render ? ({ row }: any) => col.render!(row.original) : ({ getValue }: any) => getValue() ?? '-',
    meta: {
      contentAlign: col.contentAlign,
      headerAlign: col.headerAlign,
      className: col.className,
      filterType: col.filterType !== false ? (col.filterType || 'text') : false,
      filterOptions: col.filterOptions,
      resizable: col.resizable !== false,
      colKey: col.key,
    },
  })), [gc]);

  const table = useReactTable({
    data,
    columns: tCols,
    state: { sorting, columnFilters },
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleFiltersChange,
    rowCount: serverSide ? totalRegistros : undefined,
    manualFiltering: serverSide,
    manualSorting: serverSide,
    manualPagination: serverSide,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: serverSide ? undefined : getSortedRowModel(),
    getFilteredRowModel: serverSide ? undefined : getFilteredRowModel(),
    filterFns: { compound: compoundFilterFn },
  });

  const rows = table.getRowModel().rows;

  // Largura de cada coluna: a definida pelo usuário (ou padrão). Nenhuma coluna
  // estica — o vazio final é coberto pela faixa de preenchimento no fim da tabela.
  const baseW = (c: (typeof gc)[number]) => c.widthOverride ?? (colW[c.key] || c.width || 150);

  // ── Virtualização ───────────────────────────────────────────────────────────

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index) => getRowHeight?.(rows[index]?.original as T, index) ?? rowHeight,
    overscan: 10,
  });
  virtualizerRef.current = virtualizer;

  // Re-mede quando a função de altura variável muda (ex: liga/desliga miniaturas).
  useEffect(() => {
    virtualizer.measure();
  }, [getRowHeight, rowHeight, virtualizer]);

  const virtualRows = virtualizer.getVirtualItems();
  const totalHeight = virtualizer.getTotalSize();

  // ── Trigger de carregarMais quando virtualizador chega perto do fim ────────
  // Threshold: dispara quando o último item visível está nas últimas 10 linhas
  const onCarregarMaisRef = useRef(onCarregarMais);
  onCarregarMaisRef.current = onCarregarMais;
  const loadingRef = useRef(loading);
  loadingRef.current = loading;

  useEffect(() => {
    if (!serverSide || !hasMore || loadingRef.current) return;
    if (virtualRows.length === 0) return;
    const ultimoVisivel = virtualRows[virtualRows.length - 1];
    if (ultimoVisivel.index >= rows.length - 10) {
      onCarregarMaisRef.current?.();
    }
  }, [serverSide, hasMore, virtualRows, rows.length]);

  // ── Refs pra callbacks estáveis ─────────────────────────────────────────────

  const rowCountRef = useRef(0);
  rowCountRef.current = rows.length;
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const onActivateRef = useRef(onActivate);
  onActivateRef.current = onActivate;

  const selectRow = useCallback((idx: number | null) => {
    setSelectedIdx(idx);
    const row = idx !== null ? rowsRef.current[idx] : null;
    onSelectRef.current?.(row ? row.original : null);
  }, [setSelectedIdx]);

  useEffect(() => {
    const row = selectedIdx !== null ? rowsRef.current[selectedIdx] : null;
    onSelectRef.current?.(row ? row.original : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIdx, rows.length]);

  // Auto-scroll pra linha selecionada (teclado)
  const scrollToIdx = useCallback((idx: number) => {
    virtualizer.scrollToIndex(idx, { align: 'auto' });
  }, [virtualizer]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((prev: number | null) => {
          const next = prev == null ? 0 : Math.min(prev + 1, rowCountRef.current - 1);
          const row = rowsRef.current[next];
          onSelectRef.current?.(row ? row.original : null);
          scrollToIdx(next);
          return next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((prev: number | null) => {
          const next = prev == null ? 0 : Math.max(prev - 1, 0);
          const row = rowsRef.current[next];
          onSelectRef.current?.(row ? row.original : null);
          scrollToIdx(next);
          return next;
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const idx = selectedIdx;
        if (idx == null) return;
        const row = rowsRef.current[idx];
        if (!row) return;
        const item = row.original;
        setTimeout(() => onActivateRef.current?.(item), 0);
      }
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [setSelectedIdx, selectedIdx, scrollToIdx]);

  // --- LOADING (apenas quando primeira carga e sem dados — chunks subsequentes
  //     não bloqueiam o grid; o spinner discreto fica no rodapé) ---
  if (loading && data.length === 0) return <GridSkeleton label={loadingText} />;

  // Sem early return de "empty" — a mensagem vai dentro do body, com header
  // do grid sempre visível pra preservar referência visual das colunas.
  const temFiltrosAtivos = columnFilters.some((f) => isFilterActive(f.value as CompoundFilter));
  const temBusca = busca.trim().length > 0;
  const mensagemVazio = temFiltrosAtivos || temBusca
    ? 'Nenhum registro encontrado para os filtros aplicados'
    : 'Nenhum registro';
  const limparFiltrosEBusca = () => {
    setColumnFilters([]);
    // busca é controlada pela page (SearchBar) — não temos setter aqui;
    // o link "Limpar filtros" se restringe a filtros de coluna.
  };

  // --- RENDER ---
  return (
    <div ref={containerRef} tabIndex={0} className={`flex flex-col h-full overflow-hidden outline-none ${className}`}>
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <table className="border-separate border-spacing-0" style={{ tableLayout: 'fixed', width: '100%' }}>
          <colgroup>
            {gc.map((col) => (
              <col key={col.key} style={{ width: baseW(col), minWidth: col.minWidth || DEFAULT_MIN_WIDTH, maxWidth: col.maxWidth || undefined }} />
            ))}
            {/* Faixa de preenchimento: ocupa o vazio final sem sacrificar nenhuma
                coluna real. Some (largura 0) quando as colunas passam da tela. */}
            <col aria-hidden="true" />
          </colgroup>

          {/* HEADER */}
          <thead className="sticky top-0 z-10 text-slate-100">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b-2 border-slate-300">
                {hg.headers.map((h) => {
                  const m = h.column.columnDef.meta as any;
                  const ck = m?.colKey as string | undefined;
                  const canSort = h.column.getCanSort();
                  const sorted = h.column.getIsSorted();
                  const ft: GridFilterType | false = m?.filterType ?? false;
                  const canResize = m?.resizable !== false;
                  const cf = h.column.getFilterValue() as CompoundFilter | undefined;

                  return (
                    <th key={h.id}
                      style={{ height: headerHeight }}
                      className="px-2 py-0 text-xs font-medium relative select-none whitespace-nowrap overflow-hidden border-r border-slate-600 last:border-r-0 bg-slate-700 dark:bg-slate-800"
                    >
                      <div className="flex items-center gap-1 w-full">
                        {canSort ? (
                          <button className={`shrink-0 transition-colors hover:text-white ${sorted ? 'text-yellow-400 bg-slate-600 rounded p-0.5' : 'opacity-60 hover:opacity-100 p-0.5'}`}
                            onClick={h.column.getToggleSortingHandler()}>
                            {!sorted && <ArrowUpDown className="h-3 w-3" />}
                            {sorted === 'asc' && <ArrowUp className="h-3 w-3" fill="currentColor" />}
                            {sorted === 'desc' && <ArrowDown className="h-3 w-3" fill="currentColor" />}
                          </button>
                        ) : <span className="w-3 shrink-0" />}

                        <span
                          className={`flex-1 truncate ${m?.headerAlign === 'left' ? 'text-left' : m?.headerAlign === 'right' ? 'text-right' : 'text-center'}`}
                          onClick={canSort ? h.column.getToggleSortingHandler() : undefined}
                          style={canSort ? { cursor: 'pointer' } : undefined}
                        >
                          {flexRender(h.column.columnDef.header, h.getContext())}
                        </span>

                        {ft ? (
                          <ColFilterPopover type={ft} options={m?.filterOptions}
                            header={String(h.column.columnDef.header)}
                            value={cf || { type: ft }}
                            onChange={(f) => h.column.setFilterValue({ ...f, type: ft })}
                            onClear={() => h.column.setFilterValue(undefined)}
                          />
                        ) : <span className="w-3 shrink-0" />}
                      </div>

                      {canResize && ck && (
                        <div className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-slate-400"
                          onMouseDown={(e) => onResizeDown(ck, e)}
                        />
                      )}
                    </th>
                  );
                })}
                {/* Cabeçalho da faixa de preenchimento */}
                <th aria-hidden="true" style={{ height: headerHeight }} className="bg-slate-700 dark:bg-slate-800" />
              </tr>
            ))}
          </thead>

          {/* BODY - Virtualizado */}
          <tbody>
            {/* Empty state padronizado — header acima permanece visível */}
            {data.length === 0 && (
              <tr>
                <td colSpan={gc.length + 1} className="px-3 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox className="h-10 w-10 text-slate-300 dark:text-slate-700" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">{mensagemVazio}</p>
                    {temFiltrosAtivos && (
                      <button
                        type="button"
                        onClick={limparFiltrosEBusca}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Limpar filtros
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}

            {/* Spacer top - empurra as linhas visíveis pra posição correta */}
            {virtualRows.length > 0 && (
              <tr aria-hidden="true">
                <td style={{ height: virtualRows[0].start, padding: 0, border: 0 }} colSpan={gc.length + 1} />
              </tr>
            )}

            {virtualRows.map((vRow) => {
              const row = rows[vRow.index];
              const i = vRow.index;
              const isSelected = selectedIdx === i;
              return (
                <tr key={row.id}
                  style={{ height: getRowHeight?.(row.original, i) ?? rowHeight }}
                  onClick={() => selectRow(i)}
                  onDoubleClick={(e) => {
                    // Por padrão exige Ctrl pra evitar ativação acidental em listas.
                    // Modais de seleção podem ativar com `activateOnDoubleClick`.
                    if (e.ctrlKey || activateOnDoubleClick) {
                      onActivateRef.current?.(row.original);
                    }
                  }}
                  className={`border-b border-slate-200 dark:border-slate-800 transition-colors cursor-default
                    ${isSelected
                      ? 'bg-sky-200 dark:bg-sky-900'
                      : i % 2 === 0
                        ? 'bg-white dark:bg-slate-950'
                        : 'bg-slate-50 dark:bg-slate-900'}
                    ${!isSelected ? 'hover:bg-slate-200 dark:hover:bg-slate-700' : ''}`}
                >
                  {row.getVisibleCells().map((cell) => {
                    const m = cell.column.columnDef.meta as any;
                    return (
                      <td key={cell.id} className={`px-2 py-0 text-sm truncate ${m?.className || ''}`}>
                        <div className={`flex items-center ${m?.contentAlign === 'center' ? 'justify-center' : m?.contentAlign === 'right' ? 'justify-end' : 'justify-start'}`}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      </td>
                    );
                  })}
                  {/* Célula da faixa de preenchimento (vazia, herda a cor da linha) */}
                  <td aria-hidden="true" />
                </tr>
              );
            })}

            {/* Spacer bottom - completa a altura total pra scrollbar ficar correta */}
            {virtualRows.length > 0 && (
              <tr aria-hidden="true">
                <td style={{ height: totalHeight - virtualRows[virtualRows.length - 1].end, padding: 0, border: 0 }} colSpan={gc.length + 1} />
              </tr>
            )}

            {rows.length === 0 && data.length > 0 && (
              <tr><td colSpan={gc.length + 1} className="px-3 py-6 text-center text-muted-foreground">
                Nenhum resultado com os filtros aplicados
                <button className="ml-2 text-primary hover:underline" onClick={() => setColumnFilters([])}>Limpar filtros</button>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Rodape fino: contagem ao estilo Protheus, com separador de milhar pt-BR
         - sem filtro/busca: "71.089 registros"
         - com filtro/busca: "2.033 de 71.089 registros"
         Fallback quando totalGeral=0 (back antigo ou ainda nao respondeu):
         usa total > 0 > data.length na ordem
       */}
      {serverSide && (() => {
        const totalRef = (totalGeral && totalGeral > 0)
          ? totalGeral
          : (total && total > 0) ? total : data.length;
        const filtrando = temFiltrosAtivos || temBusca;
        const fmt = (n: number) => n.toLocaleString('pt-BR');
        return (
          <div className="flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-1 text-[11px] text-slate-500 dark:text-slate-400">
            {loading && data.length > 0 && (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600 dark:border-slate-700 dark:border-t-slate-300" />
            )}
            <span>
              {filtrando ? (
                <>
                  <span className="font-semibold">{fmt(total ?? 0)}</span>
                  {' de '}
                  <span className="font-semibold">{fmt(totalRef)}</span>
                </>
              ) : (
                <span className="font-semibold">{fmt(totalRef)}</span>
              )}
              {' '}registros
            </span>
          </div>
        );
      })()}

    </div>
  );
}

export const DataGrid = forwardRef(DataGridInner) as <T extends Record<string, any>>(
  props: DataGridProps<T> & { ref?: Ref<DataGridHandle> }
) => ReturnType<typeof DataGridInner>;


