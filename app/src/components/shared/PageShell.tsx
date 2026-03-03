/**
 * PageShell.tsx - Shell padrão para páginas do sistema
 *
 * Unifica PageWrapper + PageHeader + bloco de erro + barra de busca.
 * Cada página passa props declarativas e o shell cuida do layout.
 *
 * Uso:
 * <PageShell
 *   breadcrumbs={[{ label: 'Engenharia' }, { label: 'Produtos' }]}
 *   title="Produtos"
 *   description="Gerencie o cadastro de produtos"
 *   error={error}
 *   actions={<Button>Novo</Button>}
 *   searchTerm={searchTerm}
 *   onSearchChange={setSearchTerm}
 *   searchPlaceholder="Buscar por código ou descrição..."
 *   extraFilters={<Select>...</Select>}
 * >
 *   <DataGrid ... />
 * </PageShell>
 */

import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { PageWrapper } from '@/components/shared/PageWrapper';
import { PageHeader } from '@/components/shared/PageHeader';
import { Input } from '@/components/ui/input';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageShellProps {
  /** Breadcrumbs */
  breadcrumbs?: BreadcrumbItem[];

  /** Título da página */
  title: string;

  /** Descrição (opcional) */
  description?: string;

  /** Botões de ação no header (direita) */
  actions?: ReactNode;

  /** Mensagem de erro da API */
  error?: string | null;

  /** Mensagem de sucesso */
  success?: string | null;

  // --- Busca (opcional) ---

  /** Termo de busca — se passado, renderiza o input de busca */
  searchTerm?: string;

  /** Callback de mudança de busca */
  onSearchChange?: (value: string) => void;

  /** Placeholder do campo de busca */
  searchPlaceholder?: string;

  /** Filtros extras ao lado do campo de busca */
  extraFilters?: ReactNode;

  // --- Conteúdo ---

  /** Conteúdo da página (DataGrid, forms, etc) */
  children: ReactNode;

  /** Classe CSS extra */
  className?: string;
}

export function PageShell({
  breadcrumbs,
  title,
  description,
  actions,
  error,
  success,
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  extraFilters,
  children,
  className = '',
}: PageShellProps) {
  const hasSearch = searchTerm !== undefined && onSearchChange !== undefined;

  return (
    <PageWrapper className={className}>
      <PageHeader
        breadcrumbs={breadcrumbs}
        title={title}
        description={description}
        actions={actions}
      />

      {/* Erro */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Sucesso */}
      {success && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          ✓ {success}
        </div>
      )}

      {/* Barra de busca + filtros extras */}
      {hasSearch && (
        <div className="mt-4 mb-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          {extraFilters}
        </div>
      )}

      {/* Conteúdo */}
      {children}
    </PageWrapper>
  );
}
