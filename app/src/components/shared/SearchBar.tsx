/**
 * SearchBar.tsx - Barra de pesquisa com seletor de colunas
 *
 * Componente reutilizável que permite:
 * - Digitar termo de busca
 * - Selecionar em quais colunas pesquisar (combobox com checkboxes)
 * - Limpar pesquisa com ícone X discreto
 * - Coluna padrão configurável via prop
 *
 * Uso:
 *   <SearchBar
 *     value={searchTerm}
 *     onChange={setSearchTerm}
 *     columns={[
 *       { key: 'nome', label: 'Nome' },
 *       { key: 'cpfCnpj', label: 'CPF/CNPJ' },
 *     ]}
 *     selectedColumns={selectedCols}
 *     onColumnsChange={setSelectedCols}
 *     defaultColumns={['nome']}    // se nada selecionado, usa estas
 *     placeholder="Buscar..."
 *   />
 */

import { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown, Check } from 'lucide-react';

export interface SearchColumn {
  key: string;    // chave do campo
  label: string;  // nome exibido no dropdown
}

interface SearchBarProps {
  value: string;                              // termo de busca
  onChange: (value: string) => void;           // callback ao digitar
  columns: SearchColumn[];                     // colunas disponíveis
  selectedColumns: string[];                   // colunas selecionadas (keys)
  onColumnsChange: (cols: string[]) => void;   // callback ao mudar colunas
  placeholder?: string;                        // placeholder do input (default: 'Buscar...')
  className?: string;                          // classes extras no container
}

export function SearchBar({
  value, onChange, columns, selectedColumns, onColumnsChange,
  placeholder = 'Buscar...', className = '',
}: SearchBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha dropdown ao clicar fora (pointerdown em capture pra disparar antes
  // que Radix/Popover/Dialog consumam o evento) e ao pressionar Escape.
  useEffect(() => {
    if (!dropdownOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [dropdownOpen]);

  const toggleColumn = (key: string) => {
    if (selectedColumns.includes(key)) {
      // Não permite desmarcar todas - pelo menos 1
      if (selectedColumns.length > 1) {
        onColumnsChange(selectedColumns.filter(k => k !== key));
      }
    } else {
      onColumnsChange([...selectedColumns, key]);
    }
  };

  const selectedCount = selectedColumns.length;
  const allSelected = selectedCount === columns.length;

  return (
    <div className={`relative flex items-center h-8 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 ${className}`}
      ref={dropdownRef}
    >
      {/* Ícone search */}
      <div className="flex items-center pl-2">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
      </div>

      {/* Input — focar/clicar fecha o dropdown de colunas */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setDropdownOpen(false)}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        data-1p-ignore
        data-lpignore="true"
        data-form-type="other"
        name="search-term"
        className="flex-1 h-full px-2 text-xs bg-transparent outline-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400 min-w-0"
      />

      {/* Botão limpar - só aparece com texto */}
      {value && (
        <button
          onClick={() => onChange('')}
          className="flex items-center justify-center h-5 w-5 mr-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* Separador vertical */}
      <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

      {/* Botão seletor de colunas */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-0.5 px-1.5 h-full text-[10px] text-muted-foreground hover:text-foreground transition-colors rounded-r-md hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0"
      >
        <span>{allSelected ? 'Tudo' : `${selectedCount} col.`}</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {/* Dropdown de colunas */}
      {dropdownOpen && (
        <div className="absolute top-full right-0 mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-50 py-1">
          <p className="px-2 py-1 text-[10px] font-semibold text-muted-foreground">Pesquisar em:</p>
          {columns.map((col) => {
            const isChecked = selectedColumns.includes(col.key);
            return (
              <button
                key={col.key}
                onClick={() => toggleColumn(col.key)}
                className="flex items-center gap-2 w-full px-2 py-1 text-xs text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${isChecked ? 'bg-slate-700 border-slate-700 dark:bg-slate-300 dark:border-slate-300' : 'border-slate-300 dark:border-slate-600'}`}>
                  {isChecked && <Check className="h-2.5 w-2.5 text-white dark:text-slate-900" />}
                </div>
                <span className={isChecked ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}>{col.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
