/**
 * PageHeader.tsx - Cabeçalho padrão para páginas do sistema
 * 
 * Header reutilizável para todas as páginas com título, descrição e breadcrumbs.
 * 
 * Funcionalidades:
 * - Título e descrição da página
 * - Breadcrumbs de navegação
 * - Slot para botões de ação (direita)
 * - Layout responsivo
 * - Altura otimizada (py-3 ao invés de py-4)
 */

import type { ReactNode } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@ui/breadcrumb';

interface BreadcrumbItem {
    /** Label do breadcrumb */
    label: string;

    /** URL do breadcrumb (opcional, se não tiver é a página atual) */
    href?: string;
}

interface PageHeaderProps {
    /** Título da página */
    title: string;

    /** Descrição da página (opcional) */
    description?: string;

    /** Items do breadcrumb (opcional) */
    breadcrumbs?: BreadcrumbItem[];

    /** Botões de ação (opcional) */
    actions?: ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
    return (
        <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="px-6 py-2">
                {/* Breadcrumbs */}
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <Breadcrumb className="mb-1">
                        <BreadcrumbList>
                            {breadcrumbs.map((item, index) => (
                                <div key={index} className="flex items-center">
                                    {index > 0 && <BreadcrumbSeparator />}
                                    <BreadcrumbItem>
                                        {item.href ? (
                                            <BreadcrumbLink href={item.href}>
                                                {item.label}
                                            </BreadcrumbLink>
                                        ) : (
                                            <BreadcrumbPage>{item.label}</BreadcrumbPage>
                                        )}
                                    </BreadcrumbItem>
                                </div>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                )}

                {/* Título + Ações */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">
                            {title}
                        </h1>
                        {description && (
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                {description}
                            </p>
                        )}
                    </div>

                    {/* Botões de ação */}
                    {actions && (
                        <div className="flex items-center gap-2 shrink-0">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}