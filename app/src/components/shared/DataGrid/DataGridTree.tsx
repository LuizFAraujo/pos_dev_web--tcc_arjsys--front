/**
 * DataGridTree.tsx — Grid hierárquico (tree) com visual padronizado do DataGrid
 *
 * Mesmo header (cores, fontes, resize, sort, filtros), footer, zebra/hover.
 * Linhas hierárquicas com indent e expand/collapse.
 */

import { useMemo, useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { Ref, ReactNode } from 'react';
import { useTabState } from '@/hooks/useTabState';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronRight, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ColFilterPopover, isFilterActive, matchSingleCondition } from './ColFilterPopover';
import { DEFAULT_MIN_WIDTH, DEFAULT_HEADER_HEIGHT, DEFAULT_ROW_HEIGHT } from './types';
import type { GridColumn, DataGridHandle, GridFilterType, CompoundFilter, FilterCondition } from './types';

export interface DataGridTreeProps<T> {
  tabId: string;
  storageId?: string;
  columns: GridColumn<T>[];
  data: T[];
  rootNodes: T[];
  getChildren: (node: T) => T[];
  getKey: (node: T) => string;
  getLevel: (node: T) => number;
  hasChildren: (node: T) => boolean;
  isExpanded: (node: T) => boolean;
  onToggle: (node: T) => void;
  codeColumnKey: string;
  indentPx?: number;
  loading?: boolean;
  loadingText?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  headerHeight?: number;
  rowHeight?: number;
  className?: string;
  onSelect?: (item: T | null) => void;
  onActivate?: (item: T) => void;
  /** Classe CSS extra por linha (ex: visual de edição por status) */
  rowClassName?: (item: T) => string;
  /** Conteúdo extra no rodapé (ex: dicas de edição) */
  footerExtra?: ReactNode;
}

const filterFn = (cv: string, fv: CompoundFilter): boolean => {
  if (!fv || !fv.type) return true;
  const lc = cv.toLowerCase();
  if (fv.type === 'text' && fv.conditions && fv.conditions.length > 0) {
    const active = fv.conditions.filter((c: FilterCondition) => c.value.trim());
    if (active.length === 0) return true;
    let result = matchSingleCondition(lc, active[0]);
    for (let i = 1; i < active.length; i++) {
      const match = matchSingleCondition(lc, active[i]);
      result = active[i - 1].logic === 'OU' ? result || match : result && match;
    }
    return result;
  }
  switch (fv.type) {
    case 'text':
      if (fv.contem && !lc.includes(fv.contem.toLowerCase())) return false;
      if (fv.comeca && !lc.startsWith(fv.comeca.toLowerCase())) return false;
      if (fv.termina && !lc.endsWith(fv.termina.toLowerCase())) return false;
      if (fv.naoContem && lc.includes(fv.naoContem.toLowerCase())) return false;
      return true;
    case 'exact': return !fv.valor || lc === fv.valor.toLowerCase();
    case 'select': return !fv.valor || lc === fv.valor.toLowerCase();
    case 'number': {
      const n = parseFloat(cv);
      if (isNaN(n)) return !fv.min && !fv.max;
      if (fv.min && n < parseFloat(fv.min)) return false;
      if (fv.max && n > parseFloat(fv.max)) return false;
      return true;
    }
    case 'checklist': {
      if (!fv.checkedValues) return true;
      if (fv.checkedValues.length === 0) return false;
      return fv.checkedValues.some((v: string) => v.toLowerCase() === lc);
    }
    default: return true;
  }
};

function DataGridTreeInner<T extends Record<string, any>>({
  tabId, storageId, columns: gc, data,
  rootNodes, getChildren, getKey, getLevel, hasChildren: hasKids, isExpanded, onToggle,
  codeColumnKey, indentPx = 16,
  loading = false, loadingText = 'Carregando...',
  emptyTitle = 'Nenhum registro encontrado', emptyDescription, emptyAction,
  headerHeight = DEFAULT_HEADER_HEIGHT, rowHeight = DEFAULT_ROW_HEIGHT,
  className = '', onSelect, onActivate, rowClassName, footerExtra,
}: DataGridTreeProps<T>, ref: Ref<DataGridHandle>) {
  const [sorting, setSorting] = useTabState<{ id: string; desc: boolean }[]>(tabId + '-tsort', []);
  const [colFilters, setColFilters] = useTabState<Record<string, CompoundFilter>>(tabId + '-tfilters', {});
  const [selectedIdx, setSelectedIdx] = useTabState<number | null>(tabId + '-tsel', null);
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    clearFilters: () => setColFilters({}),
    clearSort: () => setSorting([]),
    clearAll: () => { setColFilters({}); setSorting([]); setSelectedIdx(null); },
    focus: () => containerRef.current?.focus(),
  }), [setColFilters, setSorting, setSelectedIdx]);

  const lsKey = `grid-widths-${storageId || tabId}-tree`;
  const defaultW = useMemo(() => { const w: Record<string, number> = {}; gc.forEach((c) => { if (c.width) w[c.key] = c.width; }); return w; }, [gc]);
  const [colW, setColW] = useState<Record<string, number>>(() => { try { const s = localStorage.getItem(lsKey); if (s) return { ...defaultW, ...JSON.parse(s) }; } catch { } return { ...defaultW }; });
  useEffect(() => { try { localStorage.setItem(lsKey, JSON.stringify(colW)); } catch { } }, [colW, lsKey]);

  const resRef = useRef<{ key: string; startX: number; startW: number } | null>(null);
  const onResizeDown = useCallback((k: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const sw = colW[k] || gc.find((c) => c.key === k)?.width || 150;
    resRef.current = { key: k, startX: e.clientX, startW: sw };
    const onMove = (ev: MouseEvent) => { const r = resRef.current; if (!r) return; const min = gc.find((x) => x.key === r.key)?.minWidth || DEFAULT_MIN_WIDTH; setColW((p) => ({ ...p, [r.key]: Math.max(min, r.startW + ev.clientX - r.startX) })); };
    const onUp = () => { resRef.current = null; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
  }, [colW, gc]);

  const flatRows = (() => {
    const rows: T[] = [];
    function walk(nodes: T[]) {
      for (const n of nodes) {
        rows.push(n);
        if (hasKids(n) && isExpanded(n)) walk(getChildren(n));
      }
    }
    walk(rootNodes);
    return rows;
  })();

  const filtered = useMemo(() => {
    const entries = Object.entries(colFilters).filter(([, f]) => isFilterActive(f));
    if (entries.length === 0) return flatRows;
    return flatRows.filter((row) => entries.every(([key, filter]) => { const field = gc.find((c) => c.key === key)?.filterField || key; return filterFn(String((row as any)[field] ?? ''), filter); }));
  }, [flatRows, colFilters, gc]);

  const sorted = useMemo(() => {
    if (sorting.length === 0) return filtered;
    const s = sorting[0]; const field = gc.find((c) => c.key === s.id)?.filterField || s.id;
    return [...filtered].sort((a, b) => { const cmp = String((a as any)[field] ?? '').localeCompare(String((b as any)[field] ?? ''), 'pt-BR', { numeric: true }); return s.desc ? -cmp : cmp; });
  }, [filtered, sorting, gc]);

  const hasFilters = Object.values(colFilters).some(isFilterActive);
  const lastColKey = gc[gc.length - 1]?.key;
  const rowsRef = useRef(sorted); rowsRef.current = sorted;
  const onSelRef = useRef(onSelect); onSelRef.current = onSelect;
  const onActRef = useRef(onActivate); onActRef.current = onActivate;

  const selectRow = useCallback((idx: number | null) => { setSelectedIdx(idx); onSelRef.current?.(idx !== null ? rowsRef.current[idx] ?? null : null); }, [setSelectedIdx]);
  useEffect(() => { onSelRef.current?.(selectedIdx !== null ? rowsRef.current[selectedIdx] ?? null : null); }, [selectedIdx, sorted.length]);

  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx((p: number | null) => { const n = p == null ? 0 : Math.min(p + 1, rowsRef.current.length - 1); onSelRef.current?.(rowsRef.current[n] ?? null); return n; }); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx((p: number | null) => { const n = p == null ? 0 : Math.max(p - 1, 0); onSelRef.current?.(rowsRef.current[n] ?? null); return n; }); }
      else if (e.key === 'Enter') { e.preventDefault(); if (selectedIdx != null) { const item = rowsRef.current[selectedIdx]; if (item) setTimeout(() => onActRef.current?.(item), 0); } }
    };
    el.addEventListener('keydown', onKey); return () => el.removeEventListener('keydown', onKey);
  }, [setSelectedIdx, selectedIdx]);

  const toggleSort = useCallback((k: string) => { setSorting((prev) => { const ex = prev.find((s) => s.id === k); if (!ex) return [{ id: k, desc: false }]; if (!ex.desc) return [{ id: k, desc: true }]; return []; }); }, [setSorting]);

  if (loading) return (<div className="flex h-full items-center justify-center"><div className="text-center"><div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /><p className="text-sm text-muted-foreground">{loadingText}</p></div></div>);
  if (data.length === 0) return (<div className="flex h-full flex-col items-center justify-center"><p className="mb-2 text-lg font-medium">{emptyTitle}</p>{emptyDescription && <p className="mb-4 text-sm text-muted-foreground">{emptyDescription}</p>}{emptyAction}</div>);

  return (
    <div ref={containerRef} tabIndex={0} className={`flex flex-col h-full overflow-hidden outline-none ${className}`}>
      <div className="flex-1 overflow-auto">
        <table className="border-separate border-spacing-0" style={{ tableLayout: 'fixed', width: '100%' }}>
          <colgroup>{gc.map((col, idx) => { const isLast = idx === gc.length - 1; if (isLast) return <col key={col.key} style={{ minWidth: col.minWidth || col.width || 80 }} />; const w = colW[col.key] || col.width || 150; return <col key={col.key} style={{ width: w, minWidth: col.minWidth || DEFAULT_MIN_WIDTH }} />; })}</colgroup>
          <thead className="sticky top-0 z-10 text-slate-100">
            <tr className="border-b-2 border-slate-300">
              {gc.map((col) => {
                const isLast = col.key === lastColKey; const canSort = col.sortable !== false; const ss = sorting.find((s) => s.id === col.key); const ft: GridFilterType | false = col.filterType !== false ? (col.filterType || 'text') : false; const canResize = col.resizable !== false && !isLast; const cf = colFilters[col.key]; return (
                  <th key={col.key} style={{ height: headerHeight }}
                    className="px-0.5 py-0 text-xs font-medium relative select-none whitespace-nowrap overflow-hidden border-r border-slate-600 last:border-r-0 bg-slate-700 dark:bg-slate-800"
                  >
                    <div className="flex items-center gap-0.5 w-full">
                      {canSort ? (<button className={`shrink-0 transition-colors hover:text-white ${ss ? 'text-yellow-400 bg-slate-600 rounded p-0.5' : 'opacity-60 hover:opacity-100 p-0.5'}`} onClick={() => toggleSort(col.key)}>{!ss && <ArrowUpDown className="h-3 w-3" />}{ss && !ss.desc && <ArrowUp className="h-3 w-3" fill="currentColor" />}{ss?.desc && <ArrowDown className="h-3 w-3" fill="currentColor" />}</button>) : <span className="w-3 shrink-0" />}
                      <span className={`flex-1 truncate ${col.headerAlign === 'left' ? 'text-left' : col.headerAlign === 'right' ? 'text-right' : 'text-center'}`} onClick={canSort ? () => toggleSort(col.key) : undefined} style={canSort ? { cursor: 'pointer' } : undefined}>{col.header}</span>
                      {ft ? (<ColFilterPopover type={ft} options={col.filterOptions} header={col.header} value={cf || { type: ft }} onChange={(f) => setColFilters((prev) => ({ ...prev, [col.key]: { ...f, type: ft } }))} onClear={() => setColFilters((prev) => { const next = { ...prev }; delete next[col.key]; return next; })} />) : <span className="w-3 shrink-0" />}
                    </div>
                    {canResize && <div className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-slate-400" onMouseDown={(e) => onResizeDown(col.key, e)} />}
                  </th>);
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const key = getKey(row); const level = getLevel(row); const kids = hasKids(row); const exp = isExpanded(row); const isSel = selectedIdx === i; return (
                <tr key={key} style={{ height: rowHeight }} onClick={() => selectRow(i)} onDoubleClick={() => onActRef.current?.(row)}
                  className={`group border-b border-slate-200 dark:border-slate-800 transition-colors cursor-default ${isSel ? 'bg-sky-200 dark:bg-sky-900' : (rowClassName?.(row) || (i % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50 dark:bg-slate-900'))} ${!isSel ? 'hover:bg-slate-200 dark:hover:bg-slate-700' : ''}`}>
                  {gc.map((col) => {
                    if (col.key === codeColumnKey) {
                      const indent = (level - 1) * indentPx;
                      return (<td key={col.key} className={`px-2 py-0 text-sm truncate ${col.className || ''}`}><div className="flex items-center" style={{ paddingLeft: `${indent}px` }}>{kids ? (<button type="button" className="shrink-0 mr-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200" onClick={(e) => { e.stopPropagation(); onToggle(row); }}>{exp ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}</button>) : (<span className="inline-block w-4.5 shrink-0" />)}<span className="truncate">{col.render ? col.render(row) : String((row as any)[col.key] ?? '-')}</span></div></td>);
                    }
                    return (<td key={col.key} className={`px-2 py-0 text-sm truncate ${col.className || ''}`}><div className={`flex items-center ${col.contentAlign === 'center' ? 'justify-center' : col.contentAlign === 'right' ? 'justify-end' : 'justify-start'}`}>{col.render ? col.render(row) : String((row as any)[col.key] ?? '-')}</div></td>);
                  })}
                </tr>);
            })}
            {sorted.length === 0 && data.length > 0 && (<tr><td colSpan={gc.length} className="px-3 py-6 text-center text-muted-foreground">Nenhum resultado com os filtros aplicados<button className="ml-2 text-primary hover:underline" onClick={() => setColFilters({})}>Limpar filtros</button></td></tr>)}
          </tbody>
        </table>
      </div>
      <div className="shrink-0 border-t bg-muted/40 px-4 py-1.5 text-xs text-muted-foreground flex items-center justify-between">
        <span>{sorted.length} {sorted.length === 1 ? 'registro' : 'registros'}{sorted.length !== flatRows.length ? ` de ${flatRows.length}` : ''}</span>
        {hasFilters && (<Button variant="ghost" size="sm" className="text-xs h-6" onClick={() => setColFilters({})}><X className="mr-1 h-3 w-3" /> Limpar filtros</Button>)}
        {footerExtra}
      </div>
    </div>
  );
}

export const DataGridTree = forwardRef(DataGridTreeInner) as <T extends Record<string, any>>(
  props: DataGridTreeProps<T> & { ref?: Ref<DataGridHandle> }
) => ReturnType<typeof DataGridTreeInner>;
