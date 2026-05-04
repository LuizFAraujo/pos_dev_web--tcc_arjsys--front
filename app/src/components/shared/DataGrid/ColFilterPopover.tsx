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
 * Botão limpar tudo + contagem ficam ao lado do título.
 *
 * Lógica de filtro centralizada em filterEngine.ts.
 */

import { Filter, FilterX, Eraser } from 'lucide-react';
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
  value: CompoundFilter;                             // valor atual do filtro
  onChange: (f: CompoundFilter) => void;              // callback ao mudar filtro
  onClear: () => void;                               // callback ao limpar filtro
  header: string;                                    // nome da coluna (exibido no título)
}

export function ColFilterPopover({ type, options, value, onChange, header }: ColFilterPopoverProps) {
  const on = isFilterActive(value);

  // Pra tipo 'text': usa multi-condição
  const conditions: FilterCondition[] = (type === 'text' && value.conditions) ? value.conditions : [];
  const hasConditions = conditions.some(c => c.value.trim());
  const activeCount = conditions.filter(c => c.value.trim()).length;

  const updateConditions = (newConds: FilterCondition[]) => {
    onChange({ ...value, conditions: newConds });
  };

  const addCondition = () => {
    updateConditions([...conditions, { operator: 'contem', value: '', logic: 'E' }]);
  };

  const removeCondition = (idx: number) => {
    const next = conditions.filter((_, i) => i !== idx);
    updateConditions(next.length > 0 ? next : [{ operator: 'contem', value: '', logic: 'E' }]);
  };

  // Garante pelo menos 1 condição ao abrir o popover
  const ensureConditions = () => {
    if (type === 'text' && conditions.length === 0) {
      onChange({ ...value, conditions: [{ operator: 'contem', value: '', logic: 'E' }] });
    }
  };

  const popWidth = type === 'checklist' ? 'w-38' : type === 'text' ? 'w-72' : 'w-52';

  return (
    <Popover onOpenChange={(open) => { if (open) ensureConditions(); }}>
      {/* Ícone - amarelo preenchido quando ativo */}
      <PopoverTrigger asChild>
        <button className={`p-0.5 rounded hover:bg-slate-600 ${on ? 'text-yellow-400 bg-slate-600' : 'opacity-40 hover:opacity-80'}`}>
          <Filter className="h-3 w-3" fill={on ? 'currentColor' : 'none'} />
        </button>
      </PopoverTrigger>

      <PopoverContent className={`${popWidth} space-y-1.5 max-h-[70vh] overflow-y-auto`} align="start">

        {/* Título + contagem + limpar valores + resetar filtro */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground">Filtrar: {header}</p>
          <div className="flex items-center gap-1">
            {hasConditions && (
              <span className="text-[9px] text-muted-foreground mr-1">{activeCount} filtro(s)</span>
            )}
            {hasConditions && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => {
                    const cleared = conditions.map(c => ({ ...c, value: '' }));
                    updateConditions(cleared);
                  }} className="p-0.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Eraser className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent><p>Limpar valores</p></TooltipContent>
              </Tooltip>
            )}
            {(conditions.length > 1 || hasConditions) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => {
                    onChange({ type: value.type, conditions: [{ operator: 'contem', value: '', logic: 'E' }] });
                  }} className="p-0.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">
                    <FilterX className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent><p>Resetar filtro</p></TooltipContent>
              </Tooltip>
            )}
            {/* Limpar checklist - aparece quando filtro checklist está ativo */}
            {type === 'checklist' && value.checkedValues !== undefined && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => onChange({ ...value, checkedValues: undefined })}
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
                {/* Toggle E/OU entre condições - independente por par */}
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
            <Input className="h-7 text-xs" value={value.valor || ''} onChange={(e) => onChange({ ...value, valor: e.target.value })} />
          </div>
        )}

        {/* ===== SELECT: dropdown ===== */}
        {type === 'select' && (
          <Select value={value.valor || '__all__'} onValueChange={(v) => onChange({ ...value, valor: v === '__all__' ? '' : v })}>
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
            <div><label className="text-[10px] text-muted-foreground">Mín</label><Input className="h-7 text-xs" type="number" value={value.min || ''} onChange={(e) => onChange({ ...value, min: e.target.value })} /></div>
            <div><label className="text-[10px] text-muted-foreground">Máx</label><Input className="h-7 text-xs" type="number" value={value.max || ''} onChange={(e) => onChange({ ...value, max: e.target.value })} /></div>
          </div>
        )}

        {/* ===== CHECKLIST: checkboxes multi-select ===== */}
        {type === 'checklist' && options && (() => {
          const allValues = options.map(o => o.value);
          const checked = value.checkedValues ?? allValues;
          const allChecked = checked.length === allValues.length;

          // Marcar todos = sem filtro (remove checkedValues)
          const setAll = () => {
            onChange({ ...value, checkedValues: undefined });
          };
          const toggleAll = () => {
            if (allChecked) {
              onChange({ ...value, checkedValues: [] });
            } else {
              setAll();
            }
          };
          const toggleOne = (val: string) => {
            const next = checked.includes(val)
              ? checked.filter(v => v !== val)
              : [...checked, val];
            // Se marcou todos, limpa o filtro
            if (next.length === allValues.length) {
              setAll();
            } else {
              onChange({ ...value, checkedValues: next });
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

      </PopoverContent>
    </Popover>
  );
}
