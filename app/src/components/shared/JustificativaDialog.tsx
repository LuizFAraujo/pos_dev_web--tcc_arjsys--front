/**
 * JustificativaDialog.tsx — Modal genérico com campo de justificativa obrigatória
 *
 * Reutilizável em:
 *   - PV: Pausar, Cancelar, Reabrir, Devolver, Retroceder, Edição em status avançado
 *   - OP: Pausar, Cancelar
 */

import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export type JustificativaVariant = 'neutral' | 'info' | 'warning' | 'danger';

interface JustificativaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  placeholder?: string;
  minLength?: number;
  confirmLabel?: string;
  variant?: JustificativaVariant;
  initialValue?: string;
  onConfirm: (justificativa: string) => Promise<void> | void;
}

export function JustificativaDialog({
  open,
  onOpenChange,
  title,
  description,
  placeholder = 'Descreva o motivo...',
  minLength = 3,
  confirmLabel = 'Confirmar',
  variant = 'neutral',
  initialValue = '',
  onConfirm,
}: JustificativaDialogProps) {
  const [texto, setTexto] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setTexto(initialValue);
      setTouched(false);
      setIsSubmitting(false);
    }
  }, [open, initialValue]);

  const trimmed = texto.trim();
  const isValid = trimmed.length >= minLength;
  const showError = touched && !isValid;

  const handleConfirm = async () => {
    setTouched(true);
    if (!isValid) {
      toast.error(`Justificativa deve ter ao menos ${minLength} caracteres.`);
      return;
    }
    setIsSubmitting(true);
    try {
      await onConfirm(trimmed);
      onOpenChange(false);
    } catch {
      // Caller mostra toast de erro
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmClass =
    variant === 'danger'
      ? 'bg-red-600 text-white hover:bg-red-700'
      : variant === 'warning'
        ? 'bg-amber-600 text-white hover:bg-amber-700'
        : variant === 'info'
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : '';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>

        <div className="flex flex-col gap-1.5 py-2">
          <Label
            htmlFor="justificativa-dialog-text"
            className="text-xs font-medium text-slate-500 dark:text-slate-400"
          >
            Justificativa <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="justificativa-dialog-text"
            rows={4}
            placeholder={placeholder}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onBlur={() => setTouched(true)}
            autoFocus
            className={`text-sm bg-white dark:bg-slate-950 resize-none ${
              showError
                ? 'border-red-400 dark:border-red-500 focus-visible:ring-red-400/30'
                : ''
            }`}
          />
          {showError ? (
            <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
              <span className="inline-block h-1 w-1 rounded-full bg-red-400 shrink-0" />
              Mínimo {minLength} caracteres ({trimmed.length}/{minLength}).
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Este texto ficará registrado no histórico.
            </p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={isSubmitting}
            onClick={(e) => {
              e.preventDefault();
              void handleConfirm();
            }}
            className={confirmClass}
          >
            {isSubmitting ? 'Salvando...' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
