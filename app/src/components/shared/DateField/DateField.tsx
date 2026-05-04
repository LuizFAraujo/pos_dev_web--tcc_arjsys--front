/**
 * DateField.tsx - Campo de data digitável com calendário popover
 *
 * Componente genérico de uso geral (não acoplado a nenhuma página).
 *
 * Funcionalidades:
 *   1. Input digitável com máscara dd/MM/yyyy
 *      - Auto-insere `/` ao digitar dígitos (ex: "20052026" → "20/05/2026")
 *      - Aceita digitar com `/` também
 *      - Ano com 2 dígitos: pivô <50 → 20xx, >=50 → 19xx
 *      - Auto-completa zero (ex: "5/" → "05/")
 *   2. Ícone de calendário à esquerda - clique abre popover
 *   3. Tab/Enter/Esc fecham o popover sem cancelar
 *   4. Calendar abre no mês/ano da data atual (ou hoje, se vazio/inválido)
 *   5. 1 clique seleciona o dia e fecha
 *   6. Dropdowns próprios (mês e ano) via Portal:
 *      - 5 itens visíveis (configurável)
 *      - Setinhas no topo/rodapé clicáveis (avança 1 sem fechar o drop)
 *      - Item selecionado destacado em azul, scroll com 1 linha de folga
 *      - Range de ano sem teto: clique na seta de baixo expande em 1
 *   7. Visual coerente com shadcn - overrides 100% via <style> escopado
 *      em .arjsys-datefield (sem CALENDAR_THEME, sem !important do Tailwind)
 *
 * Dependência:
 *   pnpm --filter ./app add react-datepicker
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarIcon, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, X } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale/pt-BR';
import { format, parse, isValid as isValidDate } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import 'react-datepicker/dist/react-datepicker.css';

registerLocale('pt-BR', ptBR);

interface DateFieldProps {
  id?: string;
  label?: string;
  value?: string | null;
  onChange: (value: string) => void;
  showToday?: boolean;
  clearable?: boolean;
  readOnly?: boolean;
  required?: boolean;
  error?: string;
  placeholder?: string;
  className?: string;
  /** Itens visíveis nos dropdowns mês/ano. Default: 5 */
  dropdownItemNumber?: number;
  /** Limite mínimo de ano (default 1900) */
  yearMin?: number;
  /** Limite máximo INICIAL de ano. Pode crescer via setinha. Default ano atual + 50 */
  yearMax?: number;
}

/* ---------- helpers ---------- */

function parseValue(v?: string | null): Date | null {
  if (!v) return null;
  const short = parse(v.slice(0, 10), 'yyyy-MM-dd', new Date());
  if (isValidDate(short)) return short;
  const d = new Date(v);
  return isValidDate(d) ? d : null;
}

function toInputFormat(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

function toDisplay(d: Date | null): string {
  return d ? format(d, 'dd/MM/yyyy') : '';
}

function applyMask(raw: string): string {
  const cleaned = raw.replace(/[^0-9/]/g, '');
  const digits = cleaned.replace(/\//g, '');
  let out = '';
  if (digits.length === 0) return '';

  out += digits.slice(0, 2);
  if (out.length === 1 && cleaned.indexOf('/') === 1) out = '0' + out;

  if (digits.length >= 2) out += '/';
  else if (cleaned.indexOf('/') === 1) out += '/';

  if (digits.length > 2) {
    const mes = digits.slice(2, 4);
    out += mes;
    if (digits.length >= 4) out += '/';
    else if (cleaned.indexOf('/', 3) > -1) out += '/';
  }

  if (digits.length > 4) {
    out += digits.slice(4, 8);
  }

  return out;
}

function parseMasked(text: string): Date | null {
  const cleaned = text.trim();
  if (!cleaned) return null;
  const parts = cleaned.split('/');
  if (parts.length < 2) return null;

  const dia = parseInt(parts[0] ?? '', 10);
  const mes = parseInt(parts[1] ?? '', 10);
  let ano = parseInt(parts[2] ?? '', 10);

  if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return null;

  if (parts[2] && parts[2].length === 2) {
    ano = ano < 50 ? 2000 + ano : 1900 + ano;
  }

  if (mes < 1 || mes > 12) return null;
  if (dia < 1 || dia > 31) return null;

  const d = new Date(ano, mes - 1, dia);
  if (!isValidDate(d)) return null;
  if (d.getFullYear() !== ano || d.getMonth() !== mes - 1 || d.getDate() !== dia) {
    return null;
  }
  return d;
}

const MESES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const ITEM_HEIGHT = 28;
const ARROW_HEIGHT = 24;
/** Cor do dia selecionado da lib react-datepicker (referência única) */
const SELECTED_BLUE = '#216ba5';

/* ---------- CSS escopado (Opção B - única fonte de estilo da lib) ---------- */

const CALENDAR_CSS = `
  /* Wrapper raiz da lib - sem visual próprio, herda do wrapper externo */
  .arjsys-datefield .react-datepicker {
    background-color: transparent;
    border: none;
    border-radius: 0;
    box-shadow: none;
    font-family: inherit;
    font-size: 0.875rem;
    color: inherit;
    line-height: 1.25;
  }

  /* Container do mês */
  .arjsys-datefield .react-datepicker__month-container {
    float: none;
    background-color: transparent;
  }

  /* Header da lib - zera padding/bg/border que causam faixa cinza */
  .arjsys-datefield .react-datepicker__header {
    padding: 0 !important;
    background-color: transparent !important;
    border-bottom: none !important;
    border-top-left-radius: 0 !important;
    border-top-right-radius: 0 !important;
  }

  /* Linha dos nomes dos dias (dom seg ter...) */
  .arjsys-datefield .react-datepicker__day-names {
    display: flex;
    justify-content: space-around;
    margin: 0;
    padding: 0.375rem 0.5rem 0.25rem;
  }
  .arjsys-datefield .react-datepicker__day-name {
    width: 2rem;
    margin: 0;
    line-height: 1.5rem;
    font-size: 0.75rem;
    font-weight: 400;
    color: hsl(215 16% 47%);
  }
  .dark .arjsys-datefield .react-datepicker__day-name {
    color: hsl(215 20% 65%);
  }

  /* Mês (grid de semanas) */
  .arjsys-datefield .react-datepicker__month {
    margin: 0;
    padding: 0.25rem 0.5rem 0.5rem;
    background-color: transparent;
  }

  /* Semana (linha) */
  .arjsys-datefield .react-datepicker__week {
    display: flex;
    justify-content: space-around;
  }

  /* Dia (célula) */
  .arjsys-datefield .react-datepicker__day {
    width: 2rem;
    height: 2rem;
    line-height: 2rem;
    margin: 0;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    color: inherit;
    transition: background-color 0.1s, color 0.1s;
  }
  .arjsys-datefield .react-datepicker__day:hover {
    background-color: hsl(210 40% 96%);
  }
  .dark .arjsys-datefield .react-datepicker__day:hover {
    background-color: hsl(217 33% 17%);
  }

  /* Hoje (sem ser o selecionado) */
  .arjsys-datefield .react-datepicker__day--today {
    background-color: hsl(210 40% 96%);
    font-weight: 600;
  }
  .dark .arjsys-datefield .react-datepicker__day--today {
    background-color: hsl(217 33% 17%);
  }

  /* Selecionado - usa a cor referência ${SELECTED_BLUE} */
  .arjsys-datefield .react-datepicker__day--selected,
  .arjsys-datefield .react-datepicker__day--keyboard-selected {
    background-color: ${SELECTED_BLUE} !important;
    color: #fff !important;
    font-weight: 500;
  }
  .arjsys-datefield .react-datepicker__day--selected:hover,
  .arjsys-datefield .react-datepicker__day--keyboard-selected:hover {
    background-color: ${SELECTED_BLUE} !important;
    opacity: 0.9;
  }

  /* Fora do mês */
  .arjsys-datefield .react-datepicker__day--outside-month {
    color: hsl(215 16% 47%);
    opacity: 0.5;
  }

  /* Desabilitado */
  .arjsys-datefield .react-datepicker__day--disabled {
    color: hsl(215 16% 47%);
    opacity: 0.4;
    cursor: not-allowed;
  }
  .arjsys-datefield .react-datepicker__day--disabled:hover {
    background-color: transparent;
  }

  /* Triângulo decorativo da lib (não usamos) */
  .arjsys-datefield .react-datepicker__triangle {
    display: none;
  }
`;

/* ---------- dropdown customizado (mês e ano) - Portal + fixed ---------- */

interface ItemDropdownProps {
  value: number;
  onChange: (v: number) => void;
  options: { value: number; label: string }[];
  expandOnArrowDown?: boolean;
  expandOnArrowUp?: boolean;
  onExpand?: (direction: 'up' | 'down') => void;
  triggerWidth?: string;
  itemNumber?: number;
  /**
   * Como centralizar o conteúdo:
   *  - 'text-only': centraliza apenas no espaço do texto (setinha fica à direita)
   *  - 'full': centraliza em todo o botão/item (setinha sobreposta visual ao centro)
   */
  centerText?: 'text-only' | 'full';
}

function ItemDropdown({
  value,
  onChange,
  options,
  expandOnArrowDown = false,
  expandOnArrowUp = false,
  onExpand,
  triggerWidth = 'min-w-28',
  itemNumber = 5,
  centerText = 'text-only',
}: ItemDropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  const [pos, setPos] = useState<{ top: number; left: number; width: number }>({
    top: 0, left: 0, width: 0,
  });

  const currentIndex = options.findIndex((o) => o.value === value);
  const currentLabel = options[currentIndex]?.label ?? '';

  const listHeight = ITEM_HEIGHT * itemNumber;

  const updatePosition = () => {
    const t = triggerRef.current;
    if (!t) return;
    const r = t.getBoundingClientRect();
    setPos({
      top: r.bottom + 4,
      left: r.left,
      width: r.width,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open]);

  // Posiciona o item selecionado com 1 linha de folga acima (não fica atrás da seta)
  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => {
      const list = listRef.current;
      const el = itemRefs.current.get(value);
      if (!list || !el) return;
      list.scrollTop = Math.max(0, el.offsetTop - ITEM_HEIGHT);
    });
    return () => cancelAnimationFrame(raf);
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const goUp = () => {
    if (currentIndex > 0) {
      onChange(options[currentIndex - 1].value);
    } else if (expandOnArrowUp && onExpand) {
      onExpand('up');
    }
  };

  const goDown = () => {
    if (currentIndex < options.length - 1) {
      onChange(options[currentIndex + 1].value);
    } else if (expandOnArrowDown && onExpand) {
      onExpand('down');
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`relative flex items-center h-7 px-2 ${triggerWidth} rounded-md border border-input bg-white dark:bg-slate-950 text-sm font-medium text-foreground hover:bg-slate-50 dark:hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
        style={{ boxSizing: 'border-box', transition: 'background-color 75ms' }}
      >
        {centerText === 'full' ? (
          <>
            <span className="block w-full text-center pr-3.5">{currentLabel}</span>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </>
        ) : (
          <>
            <span className="flex-1 text-center">{currentLabel}</span>
            <ChevronDown className="ml-1 h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </>
        )}
      </button>

      {open && createPortal(
        <div
          ref={popoverRef}
          className="rounded-md border border-border bg-white dark:bg-slate-950 shadow-lg flex flex-col **:box-border!"
          style={{
            position: 'fixed',
            top: `${pos.top}px`,
            left: `${pos.left}px`,
            minWidth: `${pos.width}px`,
            zIndex: 9999,
          }}
        >
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goUp();
            }}
            className="flex items-center justify-center w-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-75 border-b border-border rounded-t-md shrink-0"
            style={{ height: `${ARROW_HEIGHT}px`, boxSizing: 'border-box' }}
            aria-label="Anterior"
            tabIndex={-1}
          >
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          <div
            ref={listRef}
            className="overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ height: `${listHeight}px`, boxSizing: 'border-box' }}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  ref={(el) => {
                    if (el) itemRefs.current.set(opt.value, el);
                    else itemRefs.current.delete(opt.value);
                  }}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex items-center w-full text-sm transition-colors duration-75 shrink-0 ${centerText === 'full' ? 'justify-center px-2' : 'px-3'
                    } ${isSelected
                      ? 'font-medium'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground'
                    }`}
                  style={{
                    height: `${ITEM_HEIGHT}px`,
                    boxSizing: 'border-box',
                    ...(isSelected
                      ? { backgroundColor: SELECTED_BLUE, color: '#fff' }
                      : {}),
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goDown();
            }}
            className="flex items-center justify-center w-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-75 border-t border-border rounded-b-md shrink-0"
            style={{ height: `${ARROW_HEIGHT}px`, boxSizing: 'border-box' }}
            aria-label="Próximo"
            tabIndex={-1}
          >
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>,
        document.body
      )}
    </>
  );
}

/* ---------- componente principal ---------- */

export function DateField({
  id,
  label,
  value,
  onChange,
  showToday = false,
  clearable = true,
  readOnly = false,
  required = false,
  error,
  placeholder = 'dd/mm/aaaa',
  className,
  dropdownItemNumber = 5,
  yearMin,
  yearMax,
}: DateFieldProps) {
  const date = parseValue(value);
  const [text, setText] = useState<string>(toDisplay(date));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setText(toDisplay(parseValue(value)));
  }, [value]);

  const currentYear = new Date().getFullYear();

  const [yearLow, setYearLow] = useState(yearMin ?? 1900);
  const [yearHigh, setYearHigh] = useState(yearMax ?? currentYear + 50);

  const yearOptions = useMemo(() => {
    const arr: { value: number; label: string }[] = [];
    for (let y = yearLow; y <= yearHigh; y++) {
      arr.push({ value: y, label: String(y) });
    }
    return arr;
  }, [yearLow, yearHigh]);

  const monthOptions = useMemo(
    () => MESES_PT.map((nome, i) => ({ value: i, label: nome })),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyMask(e.target.value);
    setText(masked);
  };

  const handleBlur = () => {
    const parsed = parseMasked(text);
    if (parsed) {
      onChange(toInputFormat(parsed));
      setText(toDisplay(parsed));
    } else if (text.trim() === '') {
      onChange('');
    } else {
      setText(toDisplay(date));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.currentTarget as HTMLInputElement).blur();
      setOpen(false);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleCalendarSelect = (d: Date | null) => {
    if (d && isValidDate(d)) {
      onChange(toInputFormat(d));
      setText(toDisplay(d));
      setOpen(false);
    }
  };

  const handleToday = () => {
    const now = new Date();
    onChange(toInputFormat(now));
    setText(toDisplay(now));
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange('');
    setText('');
  };

  const handleIconClick = (e: React.MouseEvent) => {
    if (readOnly) return;
    e.preventDefault();
    setOpen((o) => !o);
  };

  const canShowClear = clearable && !readOnly && !!text;

  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      {/* CSS escopado da lib (Opção B - única fonte) */}
      <style>{CALENDAR_CSS}</style>

      {label && (
        <Label
          htmlFor={id}
          className={`text-xs font-medium ${error
            ? 'text-red-500 dark:text-red-400'
            : 'text-slate-500 dark:text-slate-400'
            }`}
        >
          {label}
          {required && ' *'}
        </Label>
      )}

      <div className="relative">
        <input
          id={id}
          type="text"
          value={text}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          placeholder={placeholder}
          inputMode="numeric"
          autoComplete="off"
          className={`inline-flex w-full items-center h-9 pl-9 ${canShowClear ? 'pr-9' : 'pr-3'
            } rounded-md border text-sm bg-white dark:bg-slate-950 transition-colors
            ${error ? 'border-red-400 dark:border-red-500' : 'border-input'}
            ${readOnly ? 'cursor-default opacity-100' : 'cursor-text'}
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0`}
        />

        <button
          type="button"
          onClick={handleIconClick}
          disabled={readOnly}
          className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Abrir calendário"
          tabIndex={-1}
        >
          <CalendarIcon className="h-3.5 w-3.5" />
        </button>

        {canShowClear && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
            aria-label="Limpar data"
            title="Limpar"
            tabIndex={-1}
          >
            <X className="h-3 w-3" />
          </button>
        )}

        {open && !readOnly && (
          <>
            {/* Overlay invisível pra fechar ao clicar fora */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            {/*
              Wrapper externo do calendar:
              - bg/border/rounded-lg/shadow definidos aqui (única fonte visual)
              - overflow-hidden garante que o radius corte os filhos no topo
                (sem isso, o header da lib não respeita o border-radius do pai)
              - classe `arjsys-datefield` ativa as regras do <style> escopado
            */}
            <div
              className="arjsys-datefield absolute left-0 top-full mt-1 z-50 bg-white dark:bg-slate-950 border border-border rounded-lg shadow-md overflow-hidden"
            >
              <DatePicker
                selected={date ?? undefined}
                onChange={handleCalendarSelect}
                locale="pt-BR"
                inline
                openToDate={date ?? new Date()}
                shouldCloseOnSelect
                renderCustomHeader={({
                  date: headerDate,
                  changeMonth,
                  changeYear,
                  decreaseMonth,
                  increaseMonth,
                  prevMonthButtonDisabled,
                  nextMonthButtonDisabled,
                }) => {
                  const currentMonthVal = headerDate.getMonth();
                  const currentYearVal = headerDate.getFullYear();

                  return (
                    <div className="flex items-center justify-between gap-1 px-2 py-1.5 border-b border-border bg-white dark:bg-slate-950">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={decreaseMonth}
                        disabled={prevMonthButtonDisabled}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <div className="flex items-center gap-1.5">
                        <ItemDropdown
                          value={currentMonthVal}
                          onChange={(v) => changeMonth(v)}
                          options={monthOptions}
                          itemNumber={dropdownItemNumber}
                          triggerWidth="w-24"
                          centerText="text-only"
                        />
                        <ItemDropdown
                          value={currentYearVal}
                          onChange={(v) => changeYear(v)}
                          options={yearOptions}
                          itemNumber={dropdownItemNumber}
                          triggerWidth="w-20"
                          centerText="full"
                          expandOnArrowDown
                          expandOnArrowUp
                          onExpand={(direction) => {
                            if (direction === 'down') {
                              const nextYear = yearHigh + 1;
                              setYearHigh(nextYear);
                              changeYear(nextYear);
                            } else {
                              const prevYear = yearLow - 1;
                              setYearLow(prevYear);
                              changeYear(prevYear);
                            }
                          }}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={increaseMonth}
                        disabled={nextMonthButtonDisabled}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                }}
              />

              {showToday && (
                <div className="flex items-center justify-end px-3 py-1.5 border-t border-border bg-white dark:bg-slate-950">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={handleToday}
                  >
                    Hoje
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
          <span className="inline-block h-1 w-1 rounded-full bg-red-400 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
