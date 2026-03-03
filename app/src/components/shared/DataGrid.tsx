/**
 * DataGrid.tsx - Grid de dados reutilizável com features configuráveis
 *
 * Features (opt-in por coluna):
 * - sortable: ordenação click no header (asc → desc → off)
 * - filterable: popover com contém/começa/termina/não contém
 * - resizable: drag na borda direita do header
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import type { ReactNode } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// ============================================
// TIPOS
// ============================================

export interface DataGridColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  render?: (item: T, index: number) => ReactNode;

  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;

  filterable?: boolean;
  filterField?: string;

  resizable?: boolean;
  initialWidth?: number;
  minWidth?: number;
}

interface DataGridProps<T> {
  columns: DataGridColumn<T>[];
  data: T[];
  total?: number;
  loading?: boolean;
  loadingText?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;
  itemLabel?: string;
  className?: string;
}

type SortOrder = 'asc' | 'desc' | null;

interface ColFilter {
  contem: string;
  comeca: string;
  termina: string;
  naoContem: string;
}

const EMPTY_F: ColFilter = { contem: '', comeca: '', termina: '', naoContem: '' };

// ============================================
// HELPERS
// ============================================

const alignCls = (a?: 'left' | 'center' | 'right') =>
  a === 'center' ? 'text-center' : a === 'right' ? 'text-right' : 'text-left';

function matchF(value: string, f: ColFilter): boolean {
  const v = (value || '').toLowerCase();
  if (f.contem && !v.includes(f.contem.toLowerCase())) return false;
  if (f.comeca && !v.startsWith(f.comeca.toLowerCase())) return false;
  if (f.termina && !v.endsWith(f.termina.toLowerCase())) return false;
  if (f.naoContem && v.includes(f.naoContem.toLowerCase())) return false;
  return true;
}

function isActive(f: ColFilter): boolean {
  return !!(f.contem || f.comeca || f.termina || f.naoContem);
}

// ============================================
// COMPONENTE
// ============================================

export function DataGrid<T extends Record<string, any>>({
  columns, data, total, loading = false, loadingText = 'Carregando...',
  emptyTitle = 'Nenhum registro encontrado', emptyDescription, emptyAction,
  keyExtractor, itemLabel = 'registros', className = '',
}: DataGridProps<T>) {

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrd, setSortOrd] = useState<SortOrder>(null);
  const [filters, setFilters] = useState<Record<string, ColFilter>>({});
  const [widths, setWidths] = useState<Record<string, number>>(() => {
    const w: Record<string, number> = {};
    columns.forEach((c) => { if (c.resizable && c.initialWidth) w[c.key] = c.initialWidth; });
    return w;
  });

  const resRef = useRef<{ key: string; startX: number; startW: number } | null>(null);

  const onResizeDown = useCallback((k: string, e: React.MouseEvent) => {
    e.preventDefault();
    const sw = widths[k] || columns.find((c) => c.key === k)?.initialWidth || 150;
    resRef.current = { key: k, startX: e.clientX, startW: sw };
    const onMove = (ev: MouseEvent) => {
      if (!resRef.current) return;
      const minW = columns.find((c) => c.key === resRef.current!.key)?.minWidth || 60;
      setWidths((p) => ({ ...p, [resRef.current!.key]: Math.max(minW, resRef.current!.startW + ev.clientX - resRef.current!.startX) }));
    };
    const onUp = () => { resRef.current = null; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [widths, columns]);

  const onSort = useCallback((k: string) => {
    if (sortKey === k) { if (sortOrd === 'asc') setSortOrd('desc'); else { setSortKey(null); setSortOrd(null); } }
    else { setSortKey(k); setSortOrd('asc'); }
  }, [sortKey, sortOrd]);

  const setF = useCallback((k: string, field: keyof ColFilter, val: string) => {
    setFilters((p) => ({ ...p, [k]: { ...(p[k] || EMPTY_F), [field]: val } }));
  }, []);

  const clearF = useCallback((k: string) => {
    setFilters((p) => { const n = { ...p }; delete n[k]; return n; });
  }, []);

  const processed = useMemo(() => {
    let res = [...data];
    for (const col of columns) {
      if (!col.filterable) continue;
      const f = filters[col.key];
      if (!f || !isActive(f)) continue;
      const field = col.filterField || col.key;
      res = res.filter((item) => matchF(String(item[field] ?? ''), f));
    }
    if (sortKey && sortOrd) {
      const col = columns.find((c) => c.key === sortKey);
      if (col) {
        res.sort((a, b) => {
          if (col.sortFn) return sortOrd === 'desc' ? -col.sortFn(a, b) : col.sortFn(a, b);
          const field = col.filterField || col.key;
          const va = a[field], vb = b[field];
          if (va == null && vb == null) return 0;
          if (va == null) return 1;
          if (vb == null) return -1;
          if (typeof va === 'number' && typeof vb === 'number') return sortOrd === 'asc' ? va - vb : vb - va;
          const cmp = String(va).localeCompare(String(vb), 'pt-BR', { sensitivity: 'base' });
          return sortOrd === 'asc' ? cmp : -cmp;
        });
      }
    }
    return res;
  }, [data, columns, filters, sortKey, sortOrd]);

  const anyFilter = Object.values(filters).some(isActive);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">{loadingText}</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
        <p className="mb-2 text-lg font-medium">{emptyTitle}</p>
        {emptyDescription && <p className="mb-4 text-sm text-muted-foreground">{emptyDescription}</p>}
        {emptyAction}
      </div>
    );
  }

  const totalCount = total ?? data.length;

  return (
    <div className={`rounded-lg border ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((col) => {
                const w = widths[col.key];
                const sorted = sortKey === col.key;
                const f = filters[col.key] || EMPTY_F;
                const fOn = isActive(f);

                return (
                  <th key={col.key} className={`p-3 text-sm font-medium ${alignCls(col.align)} relative select-none`} style={w ? { width: w, minWidth: w } : undefined}>
                    <div className="flex items-center gap-1">
                      {col.sortable ? (
                        <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => onSort(col.key)}>
                          {col.header}
                          <span className="opacity-50">
                            {!sorted && <ArrowUpDown className="h-3 w-3" />}
                            {sorted && sortOrd === 'asc' && <ArrowUp className="h-3 w-3 opacity-100" />}
                            {sorted && sortOrd === 'desc' && <ArrowDown className="h-3 w-3 opacity-100" />}
                          </span>
                        </button>
                      ) : <span>{col.header}</span>}

                      {col.filterable && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className={`ml-auto p-0.5 rounded hover:bg-muted ${fOn ? 'text-primary' : 'opacity-40 hover:opacity-100'}`}>
                              <Filter className="h-3 w-3" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-56 space-y-2" align="start">
                            <p className="text-xs font-semibold text-muted-foreground">Filtrar: {col.header}</p>
                            <div className="space-y-1.5">
                              <div><label className="text-[10px] text-muted-foreground">Contém</label><Input className="h-7 text-xs" value={f.contem} onChange={(e) => setF(col.key, 'contem', e.target.value)} /></div>
                              <div><label className="text-[10px] text-muted-foreground">Começa com</label><Input className="h-7 text-xs" value={f.comeca} onChange={(e) => setF(col.key, 'comeca', e.target.value)} /></div>
                              <div><label className="text-[10px] text-muted-foreground">Termina com</label><Input className="h-7 text-xs" value={f.termina} onChange={(e) => setF(col.key, 'termina', e.target.value)} /></div>
                              <div><label className="text-[10px] text-muted-foreground">Não contém</label><Input className="h-7 text-xs" value={f.naoContem} onChange={(e) => setF(col.key, 'naoContem', e.target.value)} /></div>
                            </div>
                            {fOn && (
                              <Button variant="ghost" size="sm" className="w-full text-xs h-7" onClick={() => clearF(col.key)}>
                                <X className="mr-1 h-3 w-3" /> Limpar
                              </Button>
                            )}
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                    {col.resizable && (
                      <div className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-primary/30 active:bg-primary/50" onMouseDown={(e) => onResizeDown(col.key, e)} />
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {processed.map((item, index) => {
              const key = keyExtractor ? keyExtractor(item, index) : (item.id ?? index);
              return (
                <tr key={key} className="border-t transition-colors hover:bg-muted/30">
                  {columns.map((col) => {
                    const w = widths[col.key];
                    return (
                      <td key={col.key} className={`p-3 text-sm ${alignCls(col.align)} ${col.className || ''}`} style={w ? { width: w, minWidth: w } : undefined}>
                        {col.render ? col.render(item, index) : (item[col.key] ?? '-')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {processed.length === 0 && data.length > 0 && (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-sm text-muted-foreground">
                  Nenhum resultado com os filtros aplicados
                  <button className="ml-2 text-primary hover:underline" onClick={() => setFilters({})}>Limpar filtros</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="border-t bg-muted/30 p-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {processed.length === totalCount ? `${totalCount} ${itemLabel}` : `${processed.length} de ${totalCount} ${itemLabel}`}
        </p>
        {anyFilter && (
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setFilters({})}>
            <X className="mr-1 h-3 w-3" /> Limpar todos os filtros
          </Button>
        )}
      </div>
    </div>
  );
}
