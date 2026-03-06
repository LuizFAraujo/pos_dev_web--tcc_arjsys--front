/**
 * PageShell.tsx - Template definitivo de página
 *
 * Replica o layout da BOM:
 * - Header compacto: breadcrumb + título (text-lg) + botões à direita
 * - Sem search bar no header (filtros ficam no grid)
 * - Conteúdo com scroll isolado
 * - Footer fixo (opcional)
 * - Sem paddings excessivos
 */

import type { ReactNode } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@ui/breadcrumb';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BreadcrumbEntry {
  label: string;
  href?: string;
}

interface PageShellProps {
  breadcrumbs?: BreadcrumbEntry[];
  title: string;
  tooltip?: string;
  /** Botões à direita do título */
  headerRight?: ReactNode;
  /** Extra abaixo do título (search, filtros rápidos — opcional) */
  headerExtra?: ReactNode;
  /** Footer fixo */
  footer?: ReactNode;
  children: ReactNode;
}

export function PageShell({
  breadcrumbs, title, tooltip, headerRight, headerExtra, footer, children,
}: PageShellProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* HEADER */}
      <div className="shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-1.5">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb className="mb-0.5">
            <BreadcrumbList className="text-xs">
              {breadcrumbs.map((item, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {item.href ? (
                      <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
        <div className="flex items-center justify-between gap-2">
          {tooltip ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate cursor-default">{title}</h1>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start"><p className="text-sm">{tooltip}</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">{title}</h1>
          )}
          {headerRight && <div className="flex items-center gap-2 shrink-0">{headerRight}</div>}
        </div>
        {headerExtra && <div className="mt-1">{headerExtra}</div>}
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
