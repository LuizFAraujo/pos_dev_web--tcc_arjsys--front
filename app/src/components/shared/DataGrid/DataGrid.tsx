/**
 * DataGrid/DataGrid.tsx — Componente principal do grid
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
import { ArrowUpDown, ArrowUp, ArrowDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ColFilterPopover } from './ColFilterPopover';
import { compoundFilterFn, isFilterActive } from './filterEngine';
import { DEFAULT_MIN_WIDTH, DEFAULT_HEADER_HEIGHT, DEFAULT_ROW_HEIGHT } from './types';
import type { GridFilterType, DataGridProps, DataGridHandle, CompoundFilter } from './types';


// ============================================
// DATAGRID (componente interno)
// ============================================

function DataGridInner<T extends Record<string, any>>({
  tabId, storageId, columns: gc, data,
  loading = false, loadingText = 'Carregando...',
  emptyTitle = 'Nenhum registro encontrado', emptyDescription, emptyAction,
  headerHeight = DEFAULT_HEADER_HEIGHT,
  rowHeight = DEFAULT_ROW_HEIGHT,
  className = '',
  onSelect,
  onActivate,
}: DataGridProps<T>, ref: Ref<DataGridHandle>) {

  const [sorting, setSorting] = useTabState<SortingState>(tabId + '-sort', []);
  const [columnFilters, setColumnFilters] = useTabState<ColumnFiltersState>(tabId + '-filters', []);
  const [selectedIdx, setSelectedIdx] = useTabState<number | null>(tabId + '-selected', null);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizerRef = useRef<any>(null);

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
      const s = localStorage.getItem(lsKey);
      if (s) return { ...defaultW, ...JSON.parse(s) };
    } catch { }
    return { ...defaultW };
  });

  useEffect(() => {
    try { localStorage.setItem(lsKey, JSON.stringify(colW)); } catch { }
  }, [colW, lsKey]);

  const resRef = useRef<{ key: string; startX: number; startW: number } | null>(null);

  const onResizeDown = useCallback((k: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const col = gc.find((c) => c.key === k);
    const sw = colW[k] || col?.width || 150;
    resRef.current = { key: k, startX: e.clientX, startW: sw };
    const onMove = (ev: MouseEvent) => {
      const r = resRef.current;
      if (!r) return;
      const c = gc.find((x) => x.key === r.key);
      const min = c?.minWidth || DEFAULT_MIN_WIDTH;
      const max = c?.maxWidth;
      let newW = Math.max(min, r.startW + ev.clientX - r.startX);
      if (max) newW = Math.min(max, newW);
      setColW((p) => ({ ...p, [r.key]: newW }));
    };
    const onUp = () => {
      resRef.current = null;
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
    data, columns: tCols,
    state: { sorting, columnFilters },
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleFiltersChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: { compound: compoundFilterFn },
  });

  const hasFilters = columnFilters.some((f) => isFilterActive(f.value as CompoundFilter));
  const rows = table.getRowModel().rows;
  const lastColKey = gc[gc.length - 1]?.key;

  // ── Virtualização ───────────────────────────────────────────────────────────

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
  });
  virtualizerRef.current = virtualizer;

  const virtualRows = virtualizer.getVirtualItems();
  const totalHeight = virtualizer.getTotalSize();

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

  // --- LOADING ---
  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">{loadingText}</p>
      </div>
    </div>
  );

  // --- EMPTY ---
  if (data.length === 0) return (
    <div className="flex h-full flex-col items-center justify-center">
      <p className="mb-2 text-lg font-medium">{emptyTitle}</p>
      {emptyDescription && <p className="mb-4 text-sm text-muted-foreground">{emptyDescription}</p>}
      {emptyAction}
    </div>
  );

  // --- RENDER ---
  return (
    <div ref={containerRef} tabIndex={0} className={`flex flex-col h-full overflow-hidden outline-none ${className}`}>
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <table className="border-separate border-spacing-0" style={{ tableLayout: 'fixed', width: '100%' }}>
          <colgroup>
            {gc.map((col, idx) => {
              const isLast = idx === gc.length - 1;
              if (isLast) {
                return <col key={col.key} style={{ minWidth: col.minWidth || col.width || 80 }} />;
              }
              const w = colW[col.key] || col.width || 150;
              return <col key={col.key} style={{ width: w, minWidth: col.minWidth || DEFAULT_MIN_WIDTH, maxWidth: col.maxWidth || undefined }} />;
            })}
          </colgroup>

          {/* HEADER */}
          <thead className="sticky top-0 z-10 text-slate-100">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b-2 border-slate-300">
                {hg.headers.map((h) => {
                  const m = h.column.columnDef.meta as any;
                  const ck = m?.colKey as string | undefined;
                  const isLast = ck === lastColKey;
                  const canSort = h.column.getCanSort();
                  const sorted = h.column.getIsSorted();
                  const ft: GridFilterType | false = m?.filterType ?? false;
                  const canResize = m?.resizable !== false && !isLast;
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
              </tr>
            ))}
          </thead>

          {/* BODY — Virtualizado */}
          <tbody>
            {/* Spacer top — empurra as linhas visíveis pra posição correta */}
            {virtualRows.length > 0 && (
              <tr aria-hidden="true">
                <td style={{ height: virtualRows[0].start, padding: 0, border: 0 }} colSpan={gc.length} />
              </tr>
            )}

            {virtualRows.map((vRow) => {
              const row = rows[vRow.index];
              const i = vRow.index;
              const isSelected = selectedIdx === i;
              return (
                <tr key={row.id}
                  style={{ height: rowHeight }}
                  onClick={() => selectRow(i)}
                  onDoubleClick={(e) => { if (e.ctrlKey) onActivateRef.current?.(row.original); }}
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
                </tr>
              );
            })}

            {/* Spacer bottom — completa a altura total pra scrollbar ficar correta */}
            {virtualRows.length > 0 && (
              <tr aria-hidden="true">
                <td style={{ height: totalHeight - virtualRows[virtualRows.length - 1].end, padding: 0, border: 0 }} colSpan={gc.length} />
              </tr>
            )}

            {rows.length === 0 && data.length > 0 && (
              <tr><td colSpan={gc.length} className="px-3 py-6 text-center text-muted-foreground">
                Nenhum resultado com os filtros aplicados
                <button className="ml-2 text-primary hover:underline" onClick={() => setColumnFilters([])}>Limpar filtros</button>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="shrink-0 border-t bg-muted/40 px-4 py-1.5 text-xs text-muted-foreground flex items-center justify-between">
        <span>{rows.length} {rows.length === 1 ? 'registro' : 'registros'}{rows.length !== data.length ? ` de ${data.length}` : ''}</span>
        {hasFilters && (
          <Button variant="ghost" size="sm" className="text-xs h-6" onClick={() => setColumnFilters([])}>
            <X className="mr-1 h-3 w-3" /> Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
}

export const DataGrid = forwardRef(DataGridInner) as <T extends Record<string, any>>(
  props: DataGridProps<T> & { ref?: Ref<DataGridHandle> }
) => ReturnType<typeof DataGridInner>;
