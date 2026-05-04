/**
 * PageShell.tsx - Template de página
 *
 * Layout:
 *   HEADER
 *   CONTEÚDO
 *   FOOTER (v2): [footerLeft slot]             [atalhos de teclado]
 *
 * Compat: se `footer` vier explícito, substitui todo o footer (comportamento antigo).
 * Caso contrário:
 *   - mode view → dica "Pressione Editar" à direita (+ footerLeft se passado)
 *   - mode new/edit → atalhos Ctrl+S à direita (+ footerLeft se passado)
 *   - mode list → sem footer (a menos que `footer` venha explícito)
 */

import { useMemo } from 'react';
import { Keyboard } from 'lucide-react';
import type { PageShellProps, PageMode } from './types';

const MODE_TAG: Record<PageMode, string | undefined> = {
  list: undefined,
  view: 'visualização',
  edit: 'edição',
  new: 'novo',
};

function AtalhosTeclado({ mode }: { mode: PageMode }) {
  if (mode !== 'edit' && mode !== 'new') return null;
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <Keyboard className="h-3.5 w-3.5 shrink-0" />
      <span>
        <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono">
          Ctrl+S
        </kbd>{' '}
        Salvar
      </span>
      <span>
        <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono">
          Ctrl+Shift+S
        </kbd>{' '}
        Salvar e sair
      </span>
    </div>
  );
}

export function PageShell({
  module,
  title,
  tag,
  extraTag,
  mode,
  headerRight,
  footer,
  footerLeft,
  children,
}: PageShellProps) {
  const resolvedTag = useMemo(
    () => tag ?? (mode ? MODE_TAG[mode] : undefined),
    [tag, mode],
  );

  const resolvedFooter = useMemo(() => {
    // Compat total: footer explícito substitui tudo
    if (footer) return footer;

    if (!mode || mode === 'list') return null;

    // View → dica à direita; footerLeft opcional à esquerda
    if (mode === 'view') {
      const dica = (
        <div className="text-xs text-muted-foreground italic">
          Pressione Editar para modificar o registro
        </div>
      );
      if (footerLeft) {
        return (
          <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex-1 min-w-0 text-xs text-muted-foreground truncate">
              {footerLeft}
            </div>
            <div className="shrink-0">{dica}</div>
          </div>
        );
      }
      return dica;
    }

    // new/edit
    const atalhos = <AtalhosTeclado mode={mode} />;
    if (footerLeft) {
      return (
        <div className="flex items-center justify-between gap-4 w-full">
          <div className="flex-1 min-w-0 text-xs text-muted-foreground truncate">
            {footerLeft}
          </div>
          <div className="shrink-0">{atalhos}</div>
        </div>
      );
    }
    return atalhos;
  }, [footer, footerLeft, mode]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* HEADER */}
      <div className="shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 truncate shrink-0">
            <h1 className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
              {module && (
                <>
                  {module} <span className="mx-1">/</span>{' '}
                </>
              )}
              <span className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase">
                {title}
              </span>
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
          {headerRight && (
            <div className="flex items-center gap-1.5 shrink-0">{headerRight}</div>
          )}
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="flex-1 overflow-hidden relative">{children}</div>

      {/* FOOTER */}
      {resolvedFooter && (
        <div className="shrink-0 border-t bg-muted/40 px-4 py-1.5">{resolvedFooter}</div>
      )}
    </div>
  );
}
