/**
 * PageShell.tsx - Template definitivo de página
 *
 * Layout:
 * ┌──────────────────────────────────────────────┐
 * │ HEADER: Admin / CLIENTES    [search] [btns]  │
 * ├──────────────────────────────────────────────┤
 * │ CONTEÚDO (scroll isolado)                     │
 * ├──────────────────────────────────────────────┤
 * │ FOOTER (opcional)                             │
 * └──────────────────────────────────────────────┘
 *
 * - Header compacto: uma linha com módulo / PÁGINA + ações à direita
 * - Sem headerExtra — tudo fica no headerRight
 * - Footer fixo opcional
 */

import type { ReactNode } from 'react';

interface PageShellProps {
  /** Módulo: ex 'Admin' */
  module?: string;
  /** Título da página: ex 'Clientes' */
  title: string;
  /** Conteúdo à direita do header (botões, search, filtros) */
  headerRight?: ReactNode;
  /** Footer fixo */
  footer?: ReactNode;
  /** Conteúdo principal */
  children: ReactNode;
}

export function PageShell({ module, title, headerRight, footer, children }: PageShellProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* HEADER */}
      <div className="shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5">
        <div className="flex items-center justify-between gap-3">
          {/* Módulo / TÍTULO */}
          <h1 className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate shrink-0">
            {module && <>{module} <span className="mx-1">/</span> </>}
            <span className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase">{title}</span>
          </h1>

          {/* Ações à direita */}
          {headerRight && (
            <div className="flex items-center gap-1.5 shrink-0">
              {headerRight}
            </div>
          )}
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>

      {/* FOOTER */}
      {footer && (
        <div className="shrink-0 border-t bg-muted/40 px-4 py-1.5">
          {footer}
        </div>
      )}
    </div>
  );
}
