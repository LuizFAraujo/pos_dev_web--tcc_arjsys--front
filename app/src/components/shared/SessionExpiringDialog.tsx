/**
 * SessionExpiringDialog.tsx - Aviso modal de expiração da sessão.
 *
 * Modal centralizado com countdown e barra de progresso. Bloqueia
 * interação com o resto da tela (overlay bg-black/50, igual à sidebar
 * direita). Não fecha por ESC nem clique fora.
 *
 * Comportamento:
 *  - "Continuar conectado": chama onExtend() (renova sessão)
 *  - "Sair agora": chama onLogout()
 *  - Se o tempo zerar sem ação: chama onTimeout() automaticamente
 */

import { useEffect, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  /** Tempo total da janela de aviso em ms (ex: SESSION_WARNING_MS). */
  warningMs: number;
  onExtend: () => void;
  onLogout: () => void;
  onTimeout: () => void;
}

export function SessionExpiringDialog({
  open,
  warningMs,
  onExtend,
  onLogout,
  onTimeout,
}: Props) {
  const [restanteMs, setRestanteMs] = useState(warningMs);

  // Reinicia contador ao abrir
  useEffect(() => {
    if (!open) return;
    setRestanteMs(warningMs);
  }, [open, warningMs]);

  // Tick de 1s descrescendo
  useEffect(() => {
    if (!open) return;
    const start = Date.now();
    const interval = setInterval(() => {
      const novo = Math.max(0, warningMs - (Date.now() - start));
      setRestanteMs(novo);
      if (novo <= 0) {
        clearInterval(interval);
        onTimeout();
      }
    }, 250);
    return () => clearInterval(interval);
  }, [open, warningMs, onTimeout]);

  const segundos = Math.ceil(restanteMs / 1000);
  const pct = Math.max(0, Math.min(100, (restanteMs / warningMs) * 100));

  return (
    <DialogPrimitive.Root open={open}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/50',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
          )}
        />
        <DialogPrimitive.Content
          // Bloqueia ESC e clique fora
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          className={cn(
            'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'w-full max-w-md rounded-lg border bg-background p-6 shadow-lg',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
            'data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
          )}
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0 rounded-full bg-amber-100 dark:bg-amber-900/30 p-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogPrimitive.Title className="text-base font-semibold">
                Sua sessão está prestes a expirar
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-sm text-muted-foreground mt-1">
                Por inatividade, você será desconectado em{' '}
                <span className="font-mono font-semibold text-foreground">
                  {segundos}s
                </span>
                .
              </DialogPrimitive.Description>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full bg-amber-500 transition-[width] duration-250 ease-linear"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onLogout}>
              Sair agora
            </Button>
            <Button size="sm" onClick={onExtend}>
              Continuar conectado
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
