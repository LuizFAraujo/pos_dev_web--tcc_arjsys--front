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
import { Keyboard } from 'lucide-react';
import type { PageShellProps, PageMode } from './types';

/** Mapa mode → texto da tag */
const MODE_TAG: Record<PageMode, string | undefined> = {
  list: undefined,
  view: 'visualização',
  edit: 'edição',
  new: 'novo',
};


export function PageShell({ module, title, tag, extraTag, mode, headerRight, footer, children }: PageShellProps) {
  const resolvedTag = useMemo(() => tag ?? (mode ? MODE_TAG[mode] : undefined), [tag, mode]);

  // Footer automático baseado no mode (se footer explícito não foi passado)
  const resolvedFooter = useMemo(() => {
    if (footer) return footer;
    if (!mode || mode === 'list') return null;

    if (mode === 'edit' || mode === 'new') {
      return (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <Keyboard className="h-3.5 w-3.5 shrink-0" />
          <span><kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono">Ctrl+S</kbd> Salvar</span>
          <span><kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono">Ctrl+Shift+S</kbd> Salvar e sair</span>
        </div>
      );
    }

    if (mode === 'view') {
      return (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Pressione Editar para modificar o registro</span>
        </div>
      );
    }

    return null;
  }, [footer, mode]);

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
            {extraTag && (
              <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400 font-mono border border-slate-300 dark:border-slate-600 rounded px-1.5 py-0.5 leading-none">
                {extraTag}
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
      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>

      {/* FOOTER */}
      {resolvedFooter && (
        <div className="shrink-0 border-t bg-muted/40 px-4 py-1.5">
          {resolvedFooter}
        </div>
      )}
    </div>
  );
}
