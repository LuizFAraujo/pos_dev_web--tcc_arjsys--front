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
 *
 * Se `mode` for passado sem `tag`, gera a tag automaticamente:
 *   view → 'visualização', edit → 'edição', new → 'novo', list → sem tag
 */

import { useMemo } from 'react';
import type { PageShellProps, PageMode } from './types';

/** Mapa mode → texto da tag */
const MODE_TAG: Record<PageMode, string | undefined> = {
  list: undefined,
  view: 'visualização',
  edit: 'edição',
  new: 'novo',
};

export function PageShell({ module, title, tag, mode, headerRight, footer, children }: PageShellProps) {
  const resolvedTag = useMemo(() => tag ?? (mode ? MODE_TAG[mode] : undefined), [tag, mode]);

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
            {resolvedTag && (
              <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-600 rounded px-1.5 py-0.5 leading-none">
                {resolvedTag}
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
