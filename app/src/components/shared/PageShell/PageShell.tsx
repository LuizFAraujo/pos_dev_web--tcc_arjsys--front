/**
 * PageShell.tsx - Template definitivo de página
 *
 * Layout:
 * ┌──────────────────────────────────────────────┐
 * │ HEADER: Admin / CLIENTES [tag]  [btns]       │
 * ├──────────────────────────────────────────────┤
 * │ CONTEÚDO (scroll isolado)                     │
 * ├──────────────────────────────────────────────┤
 * │ FOOTER (opcional)                             │
 * └──────────────────────────────────────────────┘
 */

import type { PageShellProps } from './types';

export function PageShell({ module, title, tag, headerRight, footer, children }: PageShellProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* HEADER */}
      <div className="shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5">
        <div className="flex items-center justify-between gap-3">
          {/* Módulo / TÍTULO [tag] */}
          <div className="flex items-center gap-2 truncate shrink-0">
            <h1 className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
              {module && <>{module} <span className="mx-1">/</span> </>}
              <span className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase">{title}</span>
            </h1>
            {tag && (
              <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-600 rounded px-1.5 py-0.5 leading-none">
                {tag}
              </span>
            )}
          </div>

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
