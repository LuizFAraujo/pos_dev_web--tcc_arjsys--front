/**
 * DataGrid.tsx - Grid baseado em TanStack Table
 */

import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type FilterFn,
  type Updater,
} from '@tanstack/react-table';
import { useTabState } from '@/hooks/useTabState';
import { ArrowUpDown, ArrowUp, ArrowDown, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// ============================================
// TIPOS
// ============================================

export type GridFilterType = 'text' | 'exact' | 'select' | 'number';

export interface GridColumn<T> {
  key: string;                                        // identificador da coluna, deve bater com campo do objeto T
  header: string;                                     // texto exibido no cabeçalho
  contentAlign?: 'left' | 'center' | 'right';         // alinhamento do conteúdo (default: 'left')
  headerAlign?: 'left' | 'center' | 'right';          // alinhamento do cabeçalho (default: 'center')
  className?: string;                                 // classes CSS extras nas células de conteúdo
  render?: (item: T) => ReactNode;                    // render customizado. se não passar, exibe item[key]
  sortable?: boolean;                                 // habilita ordenação (default: true)
  filterType?: GridFilterType | false;                // tipo de filtro: 'text'|'exact'|'select'|'number'|false (default: 'text')
  filterOptions?: { label: string; value: string }[]; // opções do dropdown, obrigatório se filterType 'select'
  filterField?: string;                               // campo do objeto pra filtrar/ordenar, se diferente de key
  resizable?: boolean;                                // habilita redimensionar arrastando borda (default: true, exceto última)
  width?: number;                                     // largura inicial em px (default: 150). última coluna ignora
  minWidth?: number;                                  // largura mínima em px (default: 50)
  maxWidth?: number;                                  // largura máxima em px (default: sem limite)
}

interface DataGridProps<T> {
  tabId: string;                // ID da aba — pra persistir sort/filters entre trocas de aba
  storageId?: string;           // ID fixo pra localStorage (ex: 'clientes'). Se não passar, usa tabId
  columns: GridColumn<T>[];     // definição das colunas
  data: T[];                    // dados a exibir
  loading?: boolean;            // exibe spinner (default: false)
  loadingText?: string;         // texto do spinner (default: 'Carregando...')
  emptyTitle?: string;          // título quando sem dados (default: 'Nenhum registro encontrado')
  emptyDescription?: string;    // descrição quando sem dados
  emptyAction?: ReactNode;      // botão/ação quando sem dados
  headerHeight?: number;        // altura do header em px (default: 32)
  rowHeight?: number;           // altura das linhas em px (default: 28)
  className?: string;           // classes extras no container
}

// ============================================
// FILTER
// ============================================

interface CompoundFilter {
  type: GridFilterType;
  contem?: string; comeca?: string; termina?: string; naoContem?: string;
  valor?: string; min?: string; max?: string;
}

const compoundFilterFn: FilterFn<any> = (row, columnId, fv: CompoundFilter) => {
  if (!fv || !fv.type) return true;
  const cv = String(row.getValue(columnId) ?? '').toLowerCase();
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
      const n = parseFloat(String(row.getValue(columnId)));
      if (isNaN(n)) return !fv.min && !fv.max;
      if (fv.min && n < parseFloat(fv.min)) return false;
      if (fv.max && n > parseFloat(fv.max)) return false;
      return true;
    }
    default: return true;
  }
};

function isActive(f?: CompoundFilter): boolean {
  if (!f) return false;
  return !!(f.contem || f.comeca || f.termina || f.naoContem || f.valor || f.min || f.max);
}

const DEFAULT_MIN_WIDTH = 50;
const DEFAULT_HEADER_HEIGHT = 32;
const DEFAULT_ROW_HEIGHT = 28;

// ============================================
// FILTER POPOVER
// ============================================

function ColFilterPopover({ type, options, value, onChange, onClear, header }: {
  type: GridFilterType; options?: { label: string; value: string }[];
  value: CompoundFilter; onChange: (f: CompoundFilter) => void; onClear: () => void; header: string;
}) {
  const on = isActive(value);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={`p-0.5 rounded hover:bg-slate-600 ${on ? 'text-blue-300' : 'opacity-40 hover:opacity-80'}`}>
          <Filter className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 space-y-2" align="start">
        <p className="text-xs font-semibold text-muted-foreground">Filtrar: {header}</p>
        {type === 'text' && (
          <div className="space-y-1.5">
            <div><label className="text-[10px] text-muted-foreground">Contém</label><Input className="h-7 text-xs" value={value.contem || ''} onChange={(e) => onChange({ ...value, contem: e.target.value })} /></div>
            <div><label className="text-[10px] text-muted-foreground">Começa com</label><Input className="h-7 text-xs" value={value.comeca || ''} onChange={(e) => onChange({ ...value, comeca: e.target.value })} /></div>
            <div><label className="text-[10px] text-muted-foreground">Termina com</label><Input className="h-7 text-xs" value={value.termina || ''} onChange={(e) => onChange({ ...value, termina: e.target.value })} /></div>
            <div><label className="text-[10px] text-muted-foreground">Não contém</label><Input className="h-7 text-xs" value={value.naoContem || ''} onChange={(e) => onChange({ ...value, naoContem: e.target.value })} /></div>
          </div>
        )}
        {type === 'exact' && (<div><label className="text-[10px] text-muted-foreground">Valor exato</label><Input className="h-7 text-xs" value={value.valor || ''} onChange={(e) => onChange({ ...value, valor: e.target.value })} /></div>)}
        {type === 'select' && (
          <Select value={value.valor || '__all__'} onValueChange={(v) => onChange({ ...value, valor: v === '__all__' ? '' : v })}>
            <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Todos" /></SelectTrigger>
            <SelectContent><SelectItem value="__all__">Todos</SelectItem>{(options || []).map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
        )}
        {type === 'number' && (
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[10px] text-muted-foreground">Mín</label><Input className="h-7 text-xs" type="number" value={value.min || ''} onChange={(e) => onChange({ ...value, min: e.target.value })} /></div>
            <div><label className="text-[10px] text-muted-foreground">Máx</label><Input className="h-7 text-xs" type="number" value={value.max || ''} onChange={(e) => onChange({ ...value, max: e.target.value })} /></div>
          </div>
        )}
        {on && (<Button variant="ghost" size="sm" className="w-full text-xs h-7" onClick={onClear}><X className="mr-1 h-3 w-3" /> Limpar</Button>)}
      </PopoverContent>
    </Popover>
  );
}

// ============================================
// DATAGRID
// ============================================

export function DataGrid<T extends Record<string, any>>({
  tabId, storageId, columns: gc, data,
  loading = false, loadingText = 'Carregando...',
  emptyTitle = 'Nenhum registro encontrado', emptyDescription, emptyAction,
  headerHeight = DEFAULT_HEADER_HEIGHT,
  rowHeight = DEFAULT_ROW_HEIGHT,
  className = '',
}: DataGridProps<T>) {

  // --- Estado persistido por aba ---
  const [sorting, setSorting] = useTabState<SortingState>(tabId + '-sort', []);
  const [columnFilters, setColumnFilters] = useTabState<ColumnFiltersState>(tabId + '-filters', []);
  const [selectedIdx, setSelectedIdx] = useTabState<number | null>(tabId + '-selected', null);

  // Handlers que resolvem Updater do TanStack
  const handleSortingChange = useCallback((updater: Updater<SortingState>) => {
    setSorting(typeof updater === 'function' ? updater(sorting) : updater);
  }, [sorting, setSorting]);

  const handleFiltersChange = useCallback((updater: Updater<ColumnFiltersState>) => {
    setColumnFilters(typeof updater === 'function' ? updater(columnFilters) : updater);
  }, [columnFilters, setColumnFilters]);

  // --- Column widths: localStorage com chave fixa por tipo de página ---
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
    } catch {}
    return { ...defaultW };
  });

  useEffect(() => {
    try { localStorage.setItem(lsKey, JSON.stringify(colW)); } catch {}
  }, [colW, lsKey]);

  // --- Resize ---
  const resRef = useRef<{ key: string; startX: number; startW: number } | null>(null);

  const onResizeDown = useCallback((k: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const col = gc.find((c) => c.key === k);
    const sw = colW[k] || col?.width || 150;
    resRef.current = { key: k, startX: e.clientX, startW: sw };

    const onMove = (ev: MouseEvent) => {
      const ref = resRef.current;
      if (!ref) return;
      const c = gc.find((x) => x.key === ref.key);
      const min = c?.minWidth || DEFAULT_MIN_WIDTH;
      const max = c?.maxWidth;
      let newW = Math.max(min, ref.startW + ev.clientX - ref.startX);
      if (max) newW = Math.min(max, newW);
      setColW((p) => ({ ...p, [ref.key]: newW }));
    };
    const onUp = () => {
      resRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [colW, gc]);

  // --- Navegação por teclado (setas cima/baixo) ---
  const containerRef = useRef<HTMLDivElement>(null);
  const rowCountRef = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((prev: number | null) => {
          const max = rowCountRef.current - 1;
          if (prev == null) return 0;
          return prev < max ? prev + 1 : prev;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((prev: number | null) => {
          if (prev == null) return 0;
          return prev > 0 ? prev - 1 : prev;
        });
      }
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [setSelectedIdx]);

  // --- TanStack columns ---
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

  const hasFilters = columnFilters.some((f) => isActive(f.value as CompoundFilter));
  const rows = table.getRowModel().rows;
  const lastColKey = gc[gc.length - 1]?.key;

  // Atualiza ref do count pra navegação por teclado
  rowCountRef.current = rows.length;

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
      <div className="flex-1 overflow-auto">
        <table className="border-collapse" style={{ tableLayout: 'fixed', width: '100%' }}>
          <colgroup>
            {gc.map((col, idx) => {
              const isLast = idx === gc.length - 1;
              // Última coluna: width ignorado, preenche espaço restante. Use minWidth.
              if (isLast) {
                return <col key={col.key} style={{ minWidth: col.minWidth || col.width || 80 }} />;
              }
              const w = colW[col.key] || col.width || 150;
              return <col key={col.key} style={{ width: w, minWidth: col.minWidth || DEFAULT_MIN_WIDTH, maxWidth: col.maxWidth || undefined }} />;
            })}
          </colgroup>

          {/* HEADER */}
          <thead className="sticky top-0 z-10 bg-slate-700 dark:bg-slate-800 text-slate-100">
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
                      className="px-2 py-0 text-xs font-medium relative select-none whitespace-nowrap overflow-hidden border-r border-slate-600 last:border-r-0"
                    >
                      {/* Layout: [sort] [título] [filtro] */}
                      <div className="flex items-center gap-1 w-full">
                        {/* Sort: sempre à esquerda */}
                        {canSort ? (
                          <button className="shrink-0 opacity-60 hover:opacity-100 hover:text-white transition-colors"
                            onClick={h.column.getToggleSortingHandler()}>
                            {!sorted && <ArrowUpDown className="h-3 w-3" />}
                            {sorted === 'asc' && <ArrowUp className="h-3 w-3" />}
                            {sorted === 'desc' && <ArrowDown className="h-3 w-3" />}
                          </button>
                        ) : <span className="w-3 shrink-0" />}

                        {/* Título: preenche o centro, alinhamento conforme headerAlign */}
                        <span
                          className={`flex-1 truncate ${m?.headerAlign === 'left' ? 'text-left' : m?.headerAlign === 'right' ? 'text-right' : 'text-center'}`}
                          onClick={canSort ? h.column.getToggleSortingHandler() : undefined}
                          style={canSort ? { cursor: 'pointer' } : undefined}
                        >
                          {flexRender(h.column.columnDef.header, h.getContext())}
                        </span>

                        {/* Filtro: sempre à direita */}
                        {ft ? (
                          <ColFilterPopover type={ft} options={m?.filterOptions}
                            header={String(h.column.columnDef.header)}
                            value={cf || { type: ft }}
                            onChange={(f) => h.column.setFilterValue({ ...f, type: ft })}
                            onClear={() => h.column.setFilterValue(undefined)}
                          />
                        ) : <span className="w-3 shrink-0" />}
                      </div>

                      {/* Resize handle */}
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

          {/* BODY */}
          <tbody>
            {rows.map((row, i) => {
              const isSelected = selectedIdx === i;
              return (
                <tr key={row.id}
                  style={{ height: rowHeight }}
                  onClick={() => setSelectedIdx(i)}
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

            {/* Sem resultados após filtro */}
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
