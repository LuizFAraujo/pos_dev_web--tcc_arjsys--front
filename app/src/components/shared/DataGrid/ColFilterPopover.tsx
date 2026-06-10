/**
 * ColFilterPopover.tsx - Popover de filtro por coluna
 *
 * Renderiza o ícone de filtro no header da coluna.
 * Ao clicar, abre popover com opções de filtro conforme o tipo:
 * - text: multi-condição com E/OU (FilterConditionRow)
 * - exact: input único de valor exato
 * - select: dropdown com opções
 * - number: range min/max
 * - checklist: checkboxes multi-select (todos marcados = sem filtro)
 *
 * Ícone fica amarelo preenchido quando filtro ativo.
 *
 * Comportamento de edição: o popover mantém estado LOCAL (`pendente`)
 * enquanto o usuário edita. Mudanças só são comitadas pro estado externo
 * (`onChange`) quando o usuário clica em "Aplicar" (ou pressiona Enter).
 * Botão "Cancelar" descarta as alterações em curso. Isso evita re-render
 * do grid a cada microação (abrir, trocar operador, digitar cada tecla).
 *
 * Lógica de filtro centralizada em filterEngine.ts.
 */

import { useEffect, useState, useMemo } from 'react';
import { Filter, FilterX, Eraser, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/shared/AppTooltip';
import { FilterConditionRow, LogicToggle, TEXT_FILTER_OPTIONS } from './FilterConditionRow';
import { isFilterActive, matchSingleCondition } from './filterEngine';
import type { GridFilterType, CompoundFilter, FilterCondition } from './types';

// Re-export para manter compatibilidade com imports existentes
export { isFilterActive, matchSingleCondition };

// ============================================
// COL FILTER POPOVER
// ============================================

interface ColFilterPopoverProps {
  type: GridFilterType;                              // tipo de filtro da coluna
  options?: { label: string; value: string }[];      // opções pra filterType 'select' ou 'checklist'
  value: CompoundFilter;                             // valor atual do filtro (estado externo)
  onChange: (f: CompoundFilter) => void;              // callback pra COMITAR mudança ao aplicar
  onClear: () => void;                               // callback ao limpar filtro
  header: string;                                    // nome da coluna (exibido no título)
}

function condicaoVazia(): FilterCondition {
  return { operator: 'contem', value: '', logic: 'E' };
}

function inicializarPendente(value: CompoundFilter, type: GridFilterType): CompoundFilter {
  if (type === 'text' && (!value.conditions || value.conditions.length === 0)) {
    return { ...value, type, conditions: [condicaoVazia()] };
  }
  return { ...value, type };
}

export function ColFilterPopover({ type, options, value, onChange, header }: ColFilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const [pendente, setPendente] = useState<CompoundFilter>(() => inicializarPendente(value, type));

  // Sincroniza pendente com value quando popover abre
  // (snapshot do estado externo no momento da abertura)
  useEffect(() => {
    if (open) setPendente(inicializarPendente(value, type));
  }, [open, value, type]);

  const filtroAtivoExterno = isFilterActive(value);
  const haPendencias = useMemo(
    () => JSON.stringify(pendente) !== JSON.stringify(inicializarPendente(value, type)),
    [pendente, value, type],
  );

  const aplicar = () => {
    onChange(pendente);
    setOpen(false);
  };

  const cancelar = () => {
    setPendente(inicializarPendente(value, type));
    setOpen(false);
  };

  // Enter no popover → Aplicar (exceto se for em textarea ou similar)
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      aplicar();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelar();
    }
  };

  // ── Helpers de edição (operam sobre `pendente`) ────────────────────────────

  const conditions: FilterCondition[] = (type === 'text' && pendente.conditions) ? pendente.conditions : [];
  const hasConditions = conditions.some((c) => c.value.trim());
  const activeCount = conditions.filter((c) => c.value.trim()).length;

  const updateConditions = (newConds: FilterCondition[]) => {
    setPendente((prev) => ({ ...prev, conditions: newConds }));
  };

  const addCondition = () => {
    updateConditions([...conditions, condicaoVazia()]);
  };

  const removeCondition = (idx: number) => {
    const next = conditions.filter((_, i) => i !== idx);
    updateConditions(next.length > 0 ? next : [condicaoVazia()]);
  };

  // Eraser: zera valores das condicoes E aplica direto (fecha popover)
  const limparValoresTexto = () => {
    const zerado = { ...pendente, conditions: conditions.map((c) => ({ ...c, value: '' })) };
    setPendente(zerado);
    onChange(zerado);
    setOpen(false);
  };

  // FilterX: reseta filtro (condicao unica vazia) + aplica direto + fecha
  const resetarFiltroPendente = () => {
    const zerado: CompoundFilter = { type, conditions: [condicaoVazia()] };
    setPendente(zerado);
    onChange(zerado);
    setOpen(false);
  };

  // Checklist clear: zera selecao + aplica direto + fecha
  const limparChecklistPendente = () => {
    const zerado = { ...pendente, checkedValues: undefined };
    setPendente(zerado);
    onChange(zerado);
    setOpen(false);
  };

  // Number clear: zera min/max + aplica direto + fecha
  const limparNumberPendente = () => {
    const zerado: CompoundFilter = { type: 'number' };
    setPendente(zerado);
    onChange(zerado);
    setOpen(false);
  };

  const numberTemFiltro = type === 'number' && (
    (pendente.min !== undefined && pendente.min !== '') ||
    (pendente.max !== undefined && pendente.max !== '')
  );

  const popWidth = type === 'checklist' ? 'w-48' : type === 'text' ? 'w-72' : 'w-52';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* Ícone - amarelo preenchido quando filtro ATIVO no estado externo */}
      <PopoverTrigger asChild>
        <button className={`p-0.5 rounded hover:bg-slate-600 ${filtroAtivoExterno ? 'text-yellow-400 bg-slate-600' : 'opacity-40 hover:opacity-80'}`}>
          <Filter className="h-3 w-3" fill={filtroAtivoExterno ? 'currentColor' : 'none'} />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className={`${popWidth} space-y-1.5 max-h-[70vh] overflow-y-auto`}
        align="start"
        onKeyDown={onKeyDown}
      >

        {/* Título + contagem + limpar valores + resetar filtro */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground">Filtrar: {header}</p>
          <div className="flex items-center gap-1">
            {type === 'text' && hasConditions && (
              <span className="text-[9px] text-muted-foreground mr-1">{activeCount} filtro(s)</span>
            )}
            {type === 'text' && hasConditions && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={limparValoresTexto} className="p-0.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Eraser className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent><p>Limpar valores</p></TooltipContent>
              </Tooltip>
            )}
            {type === 'text' && (conditions.length > 1 || hasConditions) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={resetarFiltroPendente} className="p-0.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">
                    <FilterX className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent><p>Resetar filtro</p></TooltipContent>
              </Tooltip>
            )}
            {/* Limpar checklist - aplica direto + fecha */}
            {type === 'checklist' && pendente.checkedValues !== undefined && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={limparChecklistPendente}
                    className="p-0.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">
                    <FilterX className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent><p>Limpar filtro</p></TooltipContent>
              </Tooltip>
            )}
            {/* Limpar number - aplica direto + fecha */}
            {numberTemFiltro && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={limparNumberPendente}
                    className="p-0.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">
                    <FilterX className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent><p>Limpar filtro</p></TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* ===== TEXTO: multi-condição com E/OU ===== */}
        {type === 'text' && (
          <div className="space-y-0.5">
            {conditions.map((cond, idx) => (
              <div key={idx}>
                {idx > 0 && (
                  <LogicToggle
                    logic={conditions[idx - 1].logic}
                    onChange={(l) => {
                      const next = [...conditions];
                      next[idx - 1] = { ...next[idx - 1], logic: l };
                      updateConditions(next);
                    }}
                  />
                )}
                <FilterConditionRow
                  options={TEXT_FILTER_OPTIONS}
                  condition={cond.operator}
                  value={cond.value}
                  onConditionChange={(c) => {
                    const next = [...conditions];
                    next[idx] = { ...next[idx], operator: c };
                    updateConditions(next);
                  }}
                  onValueChange={(v) => {
                    const next = [...conditions];
                    next[idx] = { ...next[idx], value: v };
                    updateConditions(next);
                  }}
                  onRemove={conditions.length > 1 ? () => removeCondition(idx) : undefined}
                />
              </div>
            ))}
            <button onClick={addCondition} className="text-[10px] text-blue-500 hover:underline mt-1">
              + Adicionar condição
            </button>
          </div>
        )}

        {/* ===== EXACT: input único ===== */}
        {type === 'exact' && (
          <div>
            <label className="text-[10px] text-muted-foreground">Valor exato</label>
            <Input
              className="h-7 text-xs"
              value={pendente.valor || ''}
              onChange={(e) => setPendente((prev) => ({ ...prev, valor: e.target.value }))}
            />
          </div>
        )}

        {/* ===== SELECT: dropdown ===== */}
        {type === 'select' && (
          <Select
            value={pendente.valor || '__all__'}
            onValueChange={(v) => setPendente((prev) => ({ ...prev, valor: v === '__all__' ? '' : v }))}
          >
            <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Todos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos</SelectItem>
              {(options || []).map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        )}

        {/* ===== NUMBER: range min/max ===== */}
        {type === 'number' && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground">Mín</label>
              <Input
                className="h-7 text-xs"
                type="number"
                value={pendente.min || ''}
                onChange={(e) => setPendente((prev) => ({ ...prev, min: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Máx</label>
              <Input
                className="h-7 text-xs"
                type="number"
                value={pendente.max || ''}
                onChange={(e) => setPendente((prev) => ({ ...prev, max: e.target.value }))}
              />
            </div>
          </div>
        )}

        {/* ===== CHECKLIST: checkboxes multi-select ===== */}
        {type === 'checklist' && options && (() => {
          const allValues = options.map((o) => o.value);
          const checked = pendente.checkedValues ?? allValues;
          const allChecked = checked.length === allValues.length;

          const setAll = () => setPendente((prev) => ({ ...prev, checkedValues: undefined }));
          const toggleAll = () => {
            if (allChecked) {
              setPendente((prev) => ({ ...prev, checkedValues: [] }));
            } else {
              setAll();
            }
          };
          const toggleOne = (val: string) => {
            const next = checked.includes(val)
              ? checked.filter((v) => v !== val)
              : [...checked, val];
            if (next.length === allValues.length) {
              setAll();
            } else {
              setPendente((prev) => ({ ...prev, checkedValues: next }));
            }
          };

          return (
            <div className="space-y-1">
              <button onClick={toggleAll}
                className="flex items-center gap-2 w-full px-1 py-0.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${allChecked ? 'bg-slate-700 border-slate-700 dark:bg-slate-300 dark:border-slate-300' : 'border-slate-300 dark:border-slate-600'}`}>
                  {allChecked && <span className="text-[8px] text-white dark:text-slate-900">✓</span>}
                </div>
                <span className="font-medium">Todos</span>
              </button>
              <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
              {options.map((o) => {
                const isChecked = checked.includes(o.value);
                return (
                  <button key={o.value} onClick={() => toggleOne(o.value)}
                    className="flex items-center gap-2 w-full px-1 py-0.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${isChecked ? 'bg-slate-700 border-slate-700 dark:bg-slate-300 dark:border-slate-300' : 'border-slate-300 dark:border-slate-600'}`}>
                      {isChecked && <span className="text-[8px] text-white dark:text-slate-900">✓</span>}
                    </div>
                    <span>{o.label}</span>
                  </button>
                );
              })}
            </div>
          );
        })()}

        {/* ── Footer: Aplicar / Cancelar ────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-1 pt-1.5 mt-1 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={cancelar}
            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-3 w-3" /> Cancelar
          </button>
          <button
            type="button"
            onClick={aplicar}
            disabled={!haPendencias}
            className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded font-medium ${haPendencias
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
          >
            <Check className="h-3 w-3" /> Aplicar
          </button>
        </div>

      </PopoverContent>
    </Popover>
  );
}
