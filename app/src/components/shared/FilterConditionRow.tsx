/**
 * FilterConditionRow.tsx - Linha de condição de filtro reutilizável
 *
 * Componente base que renderiza: [✕ remover] [dropdown condição] [input valor] [✕ limpar]
 * Recebe as opções do dropdown por parâmetro — reutilizável pra texto, número, etc.
 *
 * Uso:
 *   <FilterConditionRow
 *     options={TEXT_OPTIONS}
 *     condition="contem"
 *     value="motor"
 *     onConditionChange={(c) => ...}
 *     onValueChange={(v) => ...}
 *     onRemove={() => ...}
 *     showRemove={true}
 *   />
 */

import { X } from 'lucide-react';

export interface FilterOption {
  label: string;   // texto exibido no dropdown
  value: string;    // valor interno
}

// Opções padrão pra filtro de texto
export const TEXT_FILTER_OPTIONS: FilterOption[] = [
  { label: 'Contém', value: 'contem' },
  { label: 'Não contém', value: 'nao_contem' },
  { label: 'Começa com', value: 'comeca' },
  { label: 'Termina com', value: 'termina' },
  { label: 'É igual a', value: 'igual' },
  { label: 'É diferente de', value: 'diferente' },
];

interface FilterConditionRowProps {
  options: FilterOption[];        // opções do dropdown de condição
  condition: string;              // condição selecionada
  value: string;                  // valor do input
  onConditionChange: (c: string) => void;
  onValueChange: (v: string) => void;
  onRemove?: () => void;          // se não passar, não mostra botão remover
  showRemove?: boolean;           // default: true se onRemove existir
  placeholder?: string;           // placeholder do input (default: 'valor...')
  inputType?: 'text' | 'number';  // tipo do input (default: 'text')
}

export function FilterConditionRow({
  options, condition, value,
  onConditionChange, onValueChange, onRemove,
  showRemove = !!onRemove,
  placeholder = 'valor...',
  inputType = 'text',
}: FilterConditionRowProps) {
  return (
    <div className="flex items-center gap-1 group">
      {/* Botão remover — aparece no hover */}
      {showRemove && onRemove ? (
        <button
          onClick={onRemove}
          className="w-4 h-4 flex items-center justify-center shrink-0 rounded text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-500"
          title="Remover condição"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      ) : (
        <span className="w-4 shrink-0" />
      )}

      {/* Dropdown condição */}
      <select
        value={condition}
        onChange={(e) => onConditionChange(e.target.value)}
        className="h-6 text-[11px] border border-slate-200 dark:border-slate-700 rounded px-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shrink-0 w-25 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Input valor com X pra limpar */}
      <div className="relative flex-1">
        <input
          type={inputType}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-6 text-[11px] border border-slate-200 dark:border-slate-700 rounded px-1.5 pr-5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {value && (
          <button
            onClick={() => onValueChange('')}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-3.5 h-3.5 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600 text-[8px]"
            title="Limpar"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

// Toggle E/OU entre condições
interface LogicToggleProps {
  logic: 'E' | 'OU';
  onChange: (logic: 'E' | 'OU') => void;
}

export function LogicToggle({ logic, onChange }: LogicToggleProps) {
  return (
    <div className="flex items-center gap-1 pl-5 py-0.5">
      <button
        onClick={() => onChange('E')}
        className={`text-[9px] font-semibold px-1.5 py-0 rounded border transition-colors ${logic === 'E' ? 'bg-slate-700 text-white border-slate-700 dark:bg-slate-300 dark:text-slate-900 dark:border-slate-300' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700'}`}
      >
        E
      </button>
      <button
        onClick={() => onChange('OU')}
        className={`text-[9px] font-semibold px-1.5 py-0 rounded border transition-colors ${logic === 'OU' ? 'bg-slate-700 text-white border-slate-700 dark:bg-slate-300 dark:text-slate-900 dark:border-slate-300' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700'}`}
      >
        OU
      </button>
    </div>
  );
}
