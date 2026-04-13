/**
 * ListFooter.tsx — Footer reutilizável para páginas em modo lista
 *
 * Exibe contagem de registros (filtrados / total) e botão "Limpar filtros".
 * Usado via prop `footer` do PageShell.
 *
 * Uso:
 *   <PageShell
 *     footer={page.mode === 'list' ? (
 *       <ListFooter filtered={filtered} total={total}
 *         hasFilters={hasFilters} onClearFilters={clearFilters} />
 *     ) : undefined}
 *   >
 *
 * Props opcionais — se não passar hasFilters/onClearFilters, não mostra botão.
 */

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ListFooterProps {
  /** Quantidade de registros exibidos (após todos os filtros) */
  filtered: number;
  /** Quantidade total de registros (antes dos filtros de coluna) */
  total: number;
  /** Se há filtros de coluna ativos (opcional — se false/omitido, não mostra botão) */
  hasFilters?: boolean;
  /** Callback para limpar filtros de coluna (opcional) */
  onClearFilters?: () => void;
}

export function ListFooter({ filtered, total, hasFilters, onClearFilters }: ListFooterProps) {
  return (
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <span>
        {filtered} {filtered === 1 ? 'registro' : 'registros'}
        {filtered !== total ? ` de ${total}` : ''}
      </span>
      {hasFilters && onClearFilters && (
        <Button variant="ghost" size="sm" className="text-xs h-6" onClick={onClearFilters}>
          <X className="mr-1 h-3 w-3" /> Limpar filtros
        </Button>
      )}
    </div>
  );
}
