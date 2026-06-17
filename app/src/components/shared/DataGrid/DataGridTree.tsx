/**
 * DataGridTree.tsx - Grid hierárquico (tree) com visual padronizado do DataGrid
 *
 * Mesmo header (cores, fontes, resize, sort, filtros), footer, zebra/hover.
 * Linhas hierárquicas com indent e expand/collapse.
 * Virtualização de linhas via @tanstack/react-virtual (suporta grandes volumes).
 *
 * Lógica de filtro centralizada em filterEngine.ts.
 */

import { useMemo, useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { Ref, ReactNode } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useTabState } from '@/hooks/useTabState';
import { userScopedLocalStorage } from '@/lib/userScopedStorage';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronRight, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ColFilterPopover } from './ColFilterPopover';
import { isFilterActive, matchCompoundFilter } from './filterEngine';
import { DEFAULT_MIN_WIDTH, DEFAULT_HEADER_HEIGHT, DEFAULT_ROW_HEIGHT } from './types';
import type { GridColumn, DataGridHandle, GridFilterType, CompoundFilter } from './types';

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
  /** Altura variável por linha (px). Opcional: sem ela, usa rowHeight fixo. */
  getRowHeight?: (item: T, index: number) => number;
  className?: string;
  onSelect?: (item: T | null) => void;
  onActivate?: (item: T) => void;
  /** Classe CSS extra por linha (ex: visual de edição por status) */
  rowClassName?: (item: T) => string;
  /** Conteúdo extra no rodapé, posicionado à direita junto do count (ex: dicas de edição). */
  footerExtra?: ReactNode;
  /** Conteúdo à esquerda do rodapé (ex: dica "Pressione Editar..."). Count vai pra direita. */
  footerLeft?: ReactNode;
}

function DataGridTreeInner<T extends Record<string, any>>({
  tabId, storageId, columns: gc, data,
  rootNodes, getChildren, getKey, getLevel, hasChildren: hasKids, isExpanded, onToggle,
  codeColumnKey, indentPx = 16,
  loading = false, loadingText = 'Carregando...',
  emptyTitle = 'Nenhum registro encontrado', emptyDescription, emptyAction,
  headerHeight = DEFAULT_HEADER_HEIGHT, rowHeight = DEFAULT_ROW_HEIGHT, getRowHeight,
  className = '', onSelect, onActivate, rowClassName, footerExtra, footerLeft,
}: DataGridTreeProps<T>, ref: Ref<DataGridHandle>) {
  const [sorting, setSorting] = useTabState<{ id: string; desc: boolean }[]>(tabId + '-tsort', []);
  const [colFilters, setColFilters] = useTabState<Record<string, CompoundFilter>>(tabId + '-tfilters', {});
  const [selectedIdx, setSelectedIdx] = useTabState<number | null>(tabId + '-tsel', null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizerRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    clearFilters: () => setColFilters({}),
    clearSort: () => setSorting([]),
    clearAll: () => { setColFilters({}); setSorting([]); setSelectedIdx(null); },
    focus: () => containerRef.current?.focus(),
    scrollToIndex: (index: number) => virtualizerRef.current?.scrollToIndex(index, { align: 'auto' }),
  }), [setColFilters, setSorting, setSelectedIdx]);

  const lsKey = `grid-widths-${storageId || tabId}-tree`;
  const defaultW = useMemo(() => { const w: Record<string, number> = {}; gc.forEach((c) => { if (c.width) w[c.key] = c.width; }); return w; }, [gc]);
  const [colW, setColW] = useState<Record<string, number>>(() => { try { const s = userScopedLocalStorage.get(lsKey); if (s) return { ...defaultW, ...JSON.parse(s) }; } catch { } return { ...defaultW }; });
  useEffect(() => { try { userScopedLocalStorage.set(lsKey, JSON.stringify(colW)); } catch { } }, [colW, lsKey]);

  const onResizeDown = useCallback((k: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const col = gc.find((c) => c.key === k);
    const min = col?.minWidth || DEFAULT_MIN_WIDTH;
    const th = (e.currentTarget as HTMLElement).closest('th');
    const startW = th ? th.getBoundingClientRect().width : (colW[k] || col?.width || 150);
    const startX = e.clientX;
    const scroller = scrollRef.current;
    const isLastCol = k === gc[gc.length - 1]?.key;
    let clientX = startX;
    let extra = 0;
    let raf = 0;

    // 1:1 com o mouse; o vazio é coberto pela faixa de preenchimento.
    const apply = () => {
      setColW((p) => ({ ...p, [k]: Math.max(min, startW + (clientX - startX) + extra) }));
    };

    // Auto-rolagem suave, só pra direita e só na última coluna (sem pulo),
    // proporcional à entrada na zona da borda. Diminuir é arrastar pra esquerda.
    const EDGE = 44;
    const MAX_STEP = 5;
    const tick = () => {
      if (!scroller) { raf = 0; return; }
      const rect = scroller.getBoundingClientRect();
      const depth = clientX - (rect.right - EDGE);
      if (depth > 0) { const step = Math.min(depth / EDGE, 1) * MAX_STEP; extra += step; apply(); scroller.scrollLeft += step; raf = requestAnimationFrame(tick); }
      else { raf = 0; }
    };

    const onMove = (ev: MouseEvent) => {
      clientX = ev.clientX; apply();
      if (isLastCol && scroller && raf === 0) { const rect = scroller.getBoundingClientRect(); if (clientX > rect.right - EDGE) raf = requestAnimationFrame(tick); }
    };
    const onUp = () => { if (raf) cancelAnimationFrame(raf); document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
  }, [colW, gc]);

  // Quando há filtro ativo, mostra tudo expandido (filtro de árvore só faz
  // sentido com todos os nós visíveis). Toggle do consumer fica ignorado
  // enquanto o filtro estiver ativo - basta limpar o filtro pra voltar.
  const filtroAtivo = Object.values(colFilters).some(isFilterActive);
  const isExpandedEffective = useCallback(
    (node: T) => (filtroAtivo ? true : isExpanded(node)),
    [filtroAtivo, isExpanded],
  );
  const onToggleEffective = useCallback(
    (node: T) => { if (!filtroAtivo) onToggle(node); },
    [filtroAtivo, onToggle],
  );

  const flatRows = (() => {
    const rows: T[] = [];
    function walk(nodes: T[]) {
      for (const n of nodes) {
        rows.push(n);
        if (hasKids(n) && isExpandedEffective(n)) walk(getChildren(n));
      }
    }
    walk(rootNodes);
    return rows;
  })();

  const filtered = useMemo(() => {
    const entries = Object.entries(colFilters).filter(([, f]) => isFilterActive(f));
    if (entries.length === 0) return flatRows;
    return flatRows.filter((row) => entries.every(([key, filter]) => { const field = gc.find((c) => c.key === key)?.filterField || key; return matchCompoundFilter(String((row as any)[field] ?? ''), filter); }));
  }, [flatRows, colFilters, gc]);

  const sorted = useMemo(() => {
    if (sorting.length === 0) return filtered;
    const s = sorting[0]; const field = gc.find((c) => c.key === s.id)?.filterField || s.id;
    return [...filtered].sort((a, b) => { const cmp = String((a as any)[field] ?? '').localeCompare(String((b as any)[field] ?? ''), 'pt-BR', { numeric: true }); return s.desc ? -cmp : cmp; });
  }, [filtered, sorting, gc]);

  const hasFilters = Object.values(colFilters).some(isFilterActive);

  // Largura de cada coluna: a definida pelo usuário (ou padrão). Nenhuma coluna
  // estica — o vazio final é coberto pela faixa de preenchimento no fim da tabela.
  const baseW = (c: (typeof gc)[number]) => c.widthOverride ?? (colW[c.key] || c.width || 150);

  const rowsRef = useRef(sorted); rowsRef.current = sorted;
  const onSelRef = useRef(onSelect); onSelRef.current = onSelect;
  const onActRef = useRef(onActivate); onActRef.current = onActivate;

  // ── Virtualização ───────────────────────────────────────────────────────────

  const virtualizer = useVirtualizer({
    count: sorted.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index) => getRowHeight?.(sorted[index], index) ?? rowHeight,
    overscan: 10,
  });

  // Força o virtualizer a re-medir quando muda quantidade de linhas ou
  // estado de filtro. Sem isso, depois de mudar o filtro de árvore,
  // o grid só repinta após um clique/scroll que dispare nova medição.
  useEffect(() => {
    virtualizer.measure();
  }, [sorted.length, filtroAtivo, virtualizer, getRowHeight, rowHeight]);

  const virtualRows = virtualizer.getVirtualItems();
  const totalHeight = virtualizer.getTotalSize();

  // ── Seleção e scroll ────────────────────────────────────────────────────────

  const selectRow = useCallback((idx: number | null) => { setSelectedIdx(idx); onSelRef.current?.(idx !== null ? rowsRef.current[idx] ?? null : null); }, [setSelectedIdx]);
  useEffect(() => { onSelRef.current?.(selectedIdx !== null ? rowsRef.current[selectedIdx] ?? null : null); }, [selectedIdx, sorted.length]);

  const scrollToIdx = useCallback((idx: number) => {
    virtualizer.scrollToIndex(idx, { align: 'auto' });
  }, [virtualizer]);

  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((p: number | null) => {
          const n = p == null ? 0 : Math.min(p + 1, rowsRef.current.length - 1);
          onSelRef.current?.(rowsRef.current[n] ?? null);
          scrollToIdx(n);
          return n;
        });
      }
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((p: number | null) => {
          const n = p == null ? 0 : Math.max(p - 1, 0);
          onSelRef.current?.(rowsRef.current[n] ?? null);
          scrollToIdx(n);
          return n;
        });
      }
      else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIdx != null) {
          const item = rowsRef.current[selectedIdx];
          if (item) setTimeout(() => onActRef.current?.(item), 0);
        }
      }
    };
    el.addEventListener('keydown', onKey); return () => el.removeEventListener('keydown', onKey);
  }, [setSelectedIdx, selectedIdx, scrollToIdx]);

  const toggleSort = useCallback((k: string) => { setSorting((prev) => { const ex = prev.find((s) => s.id === k); if (!ex) return [{ id: k, desc: false }]; if (!ex.desc) return [{ id: k, desc: true }]; return []; }); }, [setSorting]);

  if (loading) return (<div className="flex h-full items-center justify-center"><div className="text-center"><div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /><p className="text-sm text-muted-foreground">{loadingText}</p></div></div>);
  if (data.length === 0) return (<div className="flex h-full flex-col items-center justify-center"><p className="mb-2 text-lg font-medium">{emptyTitle}</p>{emptyDescription && <p className="mb-4 text-sm text-muted-foreground">{emptyDescription}</p>}{emptyAction}</div>);

  return (
    <div ref={containerRef} tabIndex={0} className={`flex flex-col h-full overflow-hidden outline-none ${className}`}>
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <table className="border-separate border-spacing-0" style={{ tableLayout: 'fixed', width: '100%' }}>
          <colgroup>{gc.map((col) => <col key={col.key} style={{ width: baseW(col), minWidth: col.minWidth || DEFAULT_MIN_WIDTH }} />)}<col aria-hidden="true" /></colgroup>
          <thead className="sticky top-0 z-10 text-slate-100">
            <tr className="border-b-2 border-slate-300">
              {gc.map((col) => {
                const canSort = col.sortable !== false; const ss = sorting.find((s) => s.id === col.key); const ft: GridFilterType | false = col.filterType !== false ? (col.filterType || 'text') : false; const canResize = col.resizable !== false; const cf = colFilters[col.key]; return (
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
              <th aria-hidden="true" style={{ height: headerHeight }} className="bg-slate-700 dark:bg-slate-800" />
            </tr>
          </thead>
          <tbody>
            {/* Spacer top */}
            {virtualRows.length > 0 && (
              <tr aria-hidden="true">
                <td style={{ height: virtualRows[0].start, padding: 0, border: 0 }} colSpan={gc.length + 1} />
              </tr>
            )}

            {virtualRows.map((vRow) => {
              const row = sorted[vRow.index];
              const i = vRow.index;
              const key = getKey(row); const level = getLevel(row); const kids = hasKids(row); const exp = isExpandedEffective(row); const isSel = selectedIdx === i; return (
                <tr key={key} style={{ height: getRowHeight?.(row, i) ?? rowHeight }} onClick={() => selectRow(i)} onDoubleClick={(e) => { if (e.ctrlKey) onActRef.current?.(row); }}
                  className={(() => {
                    const rc = rowClassName?.(row) || '';
                    const bgClasses = rc.split(' ').filter(c => c.startsWith('bg-')).join(' ');
                    const nonBgClasses = rc.split(' ').filter(c => !c.startsWith('bg-')).join(' ');
                    const bg = isSel ? 'bg-sky-200 dark:bg-sky-900' : (bgClasses || (i % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50 dark:bg-slate-900'));
                    return `group border-b border-slate-200 dark:border-slate-800 transition-colors cursor-default ${bg} ${nonBgClasses} ${!isSel ? 'hover:bg-slate-200 dark:hover:bg-slate-700' : ''}`;
                  })()}>
                  {gc.map((col) => {
                    if (col.key === codeColumnKey) {
                      const indent = (level - 1) * indentPx;
                      return (<td key={col.key} className={`px-2 py-0 text-sm truncate ${col.className || ''}`}><div className="flex items-center" style={{ paddingLeft: `${indent}px` }}>{kids ? (<button type="button" className="shrink-0 mr-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200" onClick={(e) => { e.stopPropagation(); onToggleEffective(row); }}>{exp ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}</button>) : (<span className="inline-block w-4.5 shrink-0" />)}<span className="truncate">{col.render ? col.render(row) : String((row as any)[col.key] ?? '-')}</span></div></td>);
                    }
                    return (<td key={col.key} className={`px-2 py-0 text-sm truncate ${col.className || ''}`}><div className={`flex items-center ${col.contentAlign === 'center' ? 'justify-center' : col.contentAlign === 'right' ? 'justify-end' : 'justify-start'}`}>{col.render ? col.render(row) : String((row as any)[col.key] ?? '-')}</div></td>);
                  })}
                  <td aria-hidden="true" />
                </tr>);
            })}

            {/* Spacer bottom */}
            {virtualRows.length > 0 && (
              <tr aria-hidden="true">
                <td style={{ height: totalHeight - virtualRows[virtualRows.length - 1].end, padding: 0, border: 0 }} colSpan={gc.length + 1} />
              </tr>
            )}

            {sorted.length === 0 && data.length > 0 && (<tr><td colSpan={gc.length + 1} className="px-3 py-6 text-center text-muted-foreground">Nenhum resultado com os filtros aplicados<button className="ml-2 text-primary hover:underline" onClick={() => setColFilters({})}>Limpar filtros</button></td></tr>)}
          </tbody>
        </table>
      </div>
      <div className="shrink-0 border-t bg-muted/40 px-4 py-1.5 text-xs text-muted-foreground flex items-center gap-3">
        {footerLeft && <div className="min-w-0 truncate">{footerLeft}</div>}
        <div className="ml-auto flex items-center gap-3">
          {hasFilters && (<Button variant="ghost" size="sm" className="text-xs h-6" onClick={() => setColFilters({})}><X className="mr-1 h-3 w-3" /> Limpar filtros</Button>)}
          {footerExtra}
          <span>{sorted.length} {sorted.length === 1 ? 'registro' : 'registros'}{sorted.length !== flatRows.length ? ` de ${flatRows.length}` : ''}</span>
        </div>
      </div>
    </div>
  );
}

export const DataGridTree = forwardRef(DataGridTreeInner) as <T extends Record<string, any>>(
  props: DataGridTreeProps<T> & { ref?: Ref<DataGridHandle> }
) => ReturnType<typeof DataGridTreeInner>;
