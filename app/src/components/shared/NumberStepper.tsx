/**
 * NumberStepper.tsx - Input numérico com setas de incremento/decremento.
 *
 * Digitação livre + ChevronUp/ChevronDown nos lados. Auto-seleciona o
 * conteúdo ao receber foco. Aceita min/max/step.
 */

import { useId } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Props {
  value: string;
  onChange: (raw: string) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  className?: string;
  id?: string;
}

export function NumberStepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled = false,
  readOnly = false,
  autoFocus = false,
  className = '',
  id,
}: Props) {
  const auto = useId();
  const inputId = id ?? auto;

  const parsed = (() => {
    const n = parseFloat(value.replace(',', '.'));
    return Number.isNaN(n) ? 0 : n;
  })();

  const ajustar = (delta: number) => {
    if (disabled || readOnly) return;
    let n = parsed + delta;
    if (min !== undefined) n = Math.max(min, n);
    if (max !== undefined) n = Math.min(max, n);
    onChange(String(n));
  };

  const podeMenos =
    !disabled && !readOnly && (min === undefined || parsed > min);
  const podeMais =
    !disabled && !readOnly && (max === undefined || parsed < max);

  return (
    <div className={`flex items-stretch gap-1 ${className}`}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9 shrink-0"
        disabled={!podeMenos}
        onClick={() => ajustar(-step)}
        tabIndex={-1}
      >
        <ChevronDown className="h-4 w-4" />
      </Button>

      <Input
        id={inputId}
        type="text"
        inputMode="decimal"
        autoFocus={autoFocus}
        readOnly={readOnly || disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            ajustar(step);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            ajustar(-step);
          }
        }}
        tabIndex={readOnly || disabled ? -1 : 0}
        className={`h-9 font-mono bg-white dark:bg-slate-950 text-center ${
          readOnly || disabled
            ? 'cursor-default focus-visible:ring-0 focus-visible:ring-offset-0'
            : ''
        }`}
      />

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9 shrink-0"
        disabled={!podeMais}
        onClick={() => ajustar(step)}
        tabIndex={-1}
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
    </div>
  );
}
