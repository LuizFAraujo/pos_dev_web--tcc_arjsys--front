/**
 * DateField.tsx — Campo de data com popover + calendário visual
 *
 * Substitui o <input type="date"> nativo (visual feio, inconsistente entre navegadores)
 * por Calendar + Popover do shadcn/ui.
 *
 * Dependências (instalar uma vez):
 *   pnpm dlx shadcn@latest add calendar
 *   ↳ traz também react-day-picker e date-fns
 *
 * Uso:
 *   <DateField
 *     label="Data de Entrega"
 *     value={valor}             // string ISO ou yyyy-MM-dd
 *     onChange={setValor}       // recebe yyyy-MM-dd ou '' se limpar
 *     showToday                 // mostra botão "Hoje"
 *     readOnly={mode === 'view'}
 *   />
 */

import { useMemo, useState } from 'react';
import { CalendarIcon, X } from 'lucide-react';
import { format, parse, isValid as isValidDate } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DateFieldProps {
  id?: string;
  label?: string;
  value?: string | null;
  onChange: (value: string) => void;
  /** Mostra botão "Hoje" no rodapé do calendário */
  showToday?: boolean;
  /** Permite limpar via botão X dentro do trigger */
  clearable?: boolean;
  readOnly?: boolean;
  required?: boolean;
  error?: string;
  placeholder?: string;
  className?: string;
}

/** Tenta extrair um Date a partir de várias formas: ISO, yyyy-MM-dd, Date */
function parseValue(v?: string | null): Date | undefined {
  if (!v) return undefined;
  // Tenta yyyy-MM-dd primeiro
  const short = parse(v.slice(0, 10), 'yyyy-MM-dd', new Date());
  if (isValidDate(short)) return short;
  // Tenta ISO
  const d = new Date(v);
  return isValidDate(d) ? d : undefined;
}

function toInputFormat(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

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
  placeholder = 'Selecione uma data',
  className,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);

  const date = useMemo(() => parseValue(value), [value]);
  const displayText = date ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : '';

  const handleSelect = (d?: Date) => {
    if (!d) return;
    onChange(toInputFormat(d));
    setOpen(false);
  };

  const handleToday = () => {
    onChange(toInputFormat(new Date()));
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      {label && (
        <Label
          htmlFor={id}
          className={`text-xs font-medium ${
            error
              ? 'text-red-500 dark:text-red-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {label}
          {required && ' *'}
        </Label>
      )}

      <Popover open={readOnly ? false : open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            disabled={readOnly}
            className={`relative inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm bg-white dark:bg-slate-950 transition-colors
              ${error ? 'border-red-400 dark:border-red-500' : 'border-input'}
              ${readOnly ? 'cursor-default opacity-100' : 'hover:bg-muted/50 cursor-pointer'}
              ${!displayText ? 'text-muted-foreground' : 'text-foreground'}
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0`}
          >
            <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="flex-1 text-left">{displayText || placeholder}</span>
            {clearable && !readOnly && displayText && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                className="h-5 w-5 inline-flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive"
                aria-label="Limpar"
              >
                <X className="h-3 w-3" />
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            locale={ptBR}
            initialFocus
          />
          {showToday && (
            <div className="flex items-center justify-between border-t px-3 py-2">
              <span className="text-xs text-muted-foreground">
                {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </span>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleToday}>
                Hoje
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
          <span className="inline-block h-1 w-1 rounded-full bg-red-400 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
