/**
 * PanelFilters.tsx — Conteúdo de filtros para o PagePanel
 *
 * Accordion de filtros que replica exatamente os filtros do ColFilterPopover.
 * Reutiliza FilterConditionRow e LogicToggle do DataGrid.
 *
 * Cada seção é colapsável. Ícone de funil amarelo quando filtro ativo.
 * Botões: expandir/recolher todos, limpar todos, limpar individual.
 *
 * Template genérico — cada page passa suas colunas filtráveis:
 *
 *   <PanelFilters filters={[
 *     { key: 'codigo', header: 'CÓDIGO', filterType: 'text' },
 *     { key: 'tipo', header: 'TIPO', filterType: 'checklist', filterOptions: TIPO_OPTIONS },
 *     { key: 'peso', header: 'PESO (KG)', filterType: 'number' },
 *   ]} />
 */

import { useState, useMemo } from 'react';
import { Filter, FilterX, ChevronDown, ChevronUp, ChevronsDownUp, ChevronsUpDown } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/shared/AppTooltip';
import { FilterConditionRow, LogicToggle, TEXT_FILTER_OPTIONS } from '@/components/shared/DataGrid/FilterConditionRow';
import { Input } from '@/components/ui/input';
import type { FilterCondition, CompoundFilter, GridFilterType } from '@/components/shared/DataGrid/types';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface PanelFilterColumn {
  key: string;
  header: string;
  filterType: GridFilterType;
  filterOptions?: { label: string; value: string }[];
}

interface PanelFiltersProps {
  /** Definição das colunas filtráveis */
  filters: PanelFilterColumn[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isActive(f?: CompoundFilter): boolean {
  if (!f) return false;
  if (f.conditions && f.conditions.some(c => c.value.trim())) return true;
  if (f.checkedValues !== undefined) return true;
  return !!(f.contem || f.comeca || f.termina || f.naoContem || f.valor || f.min || f.max);
}

function countActive(f?: CompoundFilter): number {
  if (!f) return 0;
  if (f.conditions) return f.conditions.filter(c => c.value.trim()).length;
  if (f.checkedValues !== undefined) return f.checkedValues.length;
  let c = 0;
  if (f.min) c++;
  if (f.max) c++;
  if (f.valor) c++;
  return c;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function PanelFilters({ filters }: PanelFiltersProps) {
  // Estado dos filtros (local por agora — depois sincroniza com DataGrid)
  const [values, setValues] = useState<Record<string, CompoundFilter>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const getValue = (key: string, type: GridFilterType): CompoundFilter =>
    values[key] || { type };

  const setValue = (key: string, f: CompoundFilter) =>
    setValues(prev => ({ ...prev, [key]: f }));

  const clearOne = (key: string) =>
    setValues(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const clearAll = () => setValues({});

  const toggle = (key: string) =>
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    filters.forEach(f => { all[f.key] = true; });
    setExpanded(all);
  };

  const collapseAll = () => setExpanded({});

  const anyExpanded = Object.values(expanded).some(v => v);
  const activeCount = useMemo(
    () => filters.filter(f => isActive(values[f.key])).length,
    [filters, values],
  );

  // ── Render: texto (multi-condição) ────────────────────────────────────────

  const renderText = (key: string) => {
    const f = getValue(key, 'text');
    const conditions: FilterCondition[] = f.conditions || [{ operator: 'contem', value: '', logic: 'E' }];

    const updateConditions = (conds: FilterCondition[]) =>
      setValue(key, { ...f, conditions: conds });

    return (
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
              onRemove={conditions.length > 1 ? () => {
                const next = conditions.filter((_, i) => i !== idx);
                updateConditions(next.length > 0 ? next : [{ operator: 'contem', value: '', logic: 'E' }]);
              } : undefined}
            />
          </div>
        ))}
        <button
          onClick={() => updateConditions([...conditions, { operator: 'contem', value: '', logic: 'E' }])}
          className="text-[10px] text-blue-500 hover:underline mt-1 pl-4"
        >
          + Adicionar condição
        </button>
      </div>
    );
  };

  // ── Render: número (min/max) ──────────────────────────────────────────────

  const renderNumber = (key: string) => {
    const f = getValue(key, 'number');
    return (
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-muted-foreground">Mín</label>
          <Input
            className="h-6 text-[11px] bg-white dark:bg-slate-950"
            type="number"
            value={f.min || ''}
            onChange={(e) => setValue(key, { ...f, min: e.target.value })}
          />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground">Máx</label>
          <Input
            className="h-6 text-[11px] bg-white dark:bg-slate-950"
            type="number"
            value={f.max || ''}
            onChange={(e) => setValue(key, { ...f, max: e.target.value })}
          />
        </div>
      </div>
    );
  };

  // ── Render: checklist (checkboxes multi-select) ───────────────────────────

  const renderChecklist = (key: string, options: { label: string; value: string }[]) => {
    const f = getValue(key, 'checklist');
    const allValues = options.map(o => o.value);
    const checked = f.checkedValues ?? allValues;
    const allChecked = checked.length === allValues.length;

    const setAll = () => setValue(key, { ...f, checkedValues: undefined });
    const toggleAll = () => {
      if (allChecked) {
        setValue(key, { ...f, checkedValues: [] });
      } else {
        setAll();
      }
    };
    const toggleOne = (val: string) => {
      const next = checked.includes(val)
        ? checked.filter(v => v !== val)
        : [...checked, val];
      if (next.length === allValues.length) {
        setAll();
      } else {
        setValue(key, { ...f, checkedValues: next });
      }
    };

    return (
      <div className="space-y-0.5">
        <button
          onClick={toggleAll}
          className="flex items-center gap-2 w-full px-1 py-0.5 text-[11px] hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
        >
          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${allChecked ? 'bg-slate-700 border-slate-700 dark:bg-slate-300 dark:border-slate-300' : 'border-slate-300 dark:border-slate-600'}`}>
            {allChecked && <span className="text-[8px] text-white dark:text-slate-900">✓</span>}
          </div>
          <span className="font-medium">Todos</span>
        </button>
        <div className="border-t border-slate-200 dark:border-slate-700 my-0.5" />
        {options.map((o) => {
          const isChecked = checked.includes(o.value);
          return (
            <button
              key={o.value}
              onClick={() => toggleOne(o.value)}
              className="flex items-center gap-2 w-full px-1 py-0.5 text-[11px] hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
            >
              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${isChecked ? 'bg-slate-700 border-slate-700 dark:bg-slate-300 dark:border-slate-300' : 'border-slate-300 dark:border-slate-600'}`}>
                {isChecked && <span className="text-[8px] text-white dark:text-slate-900">✓</span>}
              </div>
              <span>{o.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  // ── Render: conteúdo por tipo ──────────────────────────────────────────────

  const renderContent = (col: PanelFilterColumn) => {
    switch (col.filterType) {
      case 'text': return renderText(col.key);
      case 'number': return renderNumber(col.key);
      case 'checklist': return col.filterOptions ? renderChecklist(col.key, col.filterOptions) : null;
      default: return null;
    }
  };

  // ── Render principal ──────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">

      {/* Ações: contagem + expandir/recolher + limpar todos */}
      <div className="flex items-center gap-1 pb-1.5 mb-0.5">
        <span className="flex-1 text-xs text-muted-foreground">
          {activeCount > 0 ? `${activeCount} filtro(s) ativo(s)` : 'Nenhum filtro ativo'}
        </span>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={anyExpanded ? collapseAll : expandAll}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {anyExpanded
                ? <ChevronsDownUp className="h-3.5 w-3.5" />
                : <ChevronsUpDown className="h-3.5 w-3.5" />
              }
            </button>
          </TooltipTrigger>
          <TooltipContent><p>{anyExpanded ? 'Recolher todos' : 'Expandir todos'}</p></TooltipContent>
        </Tooltip>

        {activeCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={clearAll}
                className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <FilterX className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent><p>Limpar todos os filtros</p></TooltipContent>
          </Tooltip>
        )}
      </div>


      {/* Lista de filtros accordion */}
      <div className="flex-1 overflow-y-auto -mx-4 px-4">
        {filters.map((col) => {
          const f = values[col.key];
          const active = isActive(f);
          const count = countActive(f);
          const isOpen = expanded[col.key] || false;

          return (
            <div key={col.key} className="border-b border-slate-200 dark:border-slate-700">
              {/* Linha clicável */}
              <button
                onClick={() => toggle(col.key)}
                className={`flex items-center gap-1.5 w-full px-1 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isOpen ? 'bg-slate-50 dark:bg-slate-800/50' : ''}`}
              >
                <Filter
                  className={`h-3 w-3 shrink-0 ${active ? 'text-yellow-500' : 'text-slate-300 dark:text-slate-600'}`}
                  fill={active ? 'currentColor' : 'none'}
                />
                <span className={`flex-1 text-xs ${isOpen ? 'font-semibold' : 'font-medium'} text-slate-700 dark:text-slate-300`}>
                  {col.header}
                </span>

                {active && count > 0 && (
                  <span className="text-[9px] bg-amber-400 text-amber-900 px-1.5 rounded-full font-medium">
                    {count}
                  </span>
                )}

                {/* Limpar individual */}
                {active && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        onClick={(e) => { e.stopPropagation(); clearOne(col.key); }}
                        className="p-0.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                      >
                        <FilterX className="h-3 w-3" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent><p>Limpar filtro</p></TooltipContent>
                  </Tooltip>
                )}

                {isOpen
                  ? <ChevronUp className="h-3 w-3 text-slate-400 shrink-0" />
                  : <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
                }
              </button>

              {/* Conteúdo expandido */}
              {isOpen && (
                <div className="px-1 pb-2 pt-1">
                  {renderContent(col)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
