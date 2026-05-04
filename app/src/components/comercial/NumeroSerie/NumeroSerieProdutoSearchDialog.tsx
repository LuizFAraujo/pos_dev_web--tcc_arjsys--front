/**
 * NumeroSerieProdutoSearchDialog.tsx - Pesquisa avançada de Produto BOM
 *
 * Espelha PedidoClienteSearchDialog: SearchBar global + DataGrid com filtros.
 * Enter ou duplo-clique seleciona, Esc fecha.
 */

import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DataGrid } from '@/components/shared/DataGrid';
import type { GridColumn } from '@/components/shared/DataGrid';
import { SearchBar } from '@/components/shared/SearchBar';
import type { SearchColumn } from '@/components/shared/SearchBar';
import type { Produto } from '@/types/engenharia/produto.types';
import { TIPO_PRODUTO_LABELS } from '@/types/engenharia/produto.types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produtos: Produto[];
  onSelect: (produto: Produto) => void;
}

const columns: GridColumn<Produto>[] = [
  {
    key: 'codigo',
    header: 'Código',
    width: 120,
    filterType: 'text',
    className: 'font-mono',
  },
  {
    key: 'descricao',
    header: 'Descrição',
    width: 280,
    filterType: 'text',
  },
  {
    key: 'tipo',
    header: 'Tipo',
    width: 130,
    filterType: 'text',
    render: (p) => TIPO_PRODUTO_LABELS[p.tipo] || p.tipo,
  },
  {
    key: 'unidade',
    header: 'Unidade',
    width: 90,
    filterType: 'text',
    contentAlign: 'center',
  },
];

const SEARCH_COLUMNS: SearchColumn[] = [
  { key: 'codigo', label: 'Código' },
  { key: 'descricao', label: 'Descrição' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'unidade', label: 'Unidade' },
];

const DEFAULT_SEARCH_COLUMNS = ['codigo', 'descricao'];

export function NumeroSerieProdutoSearchDialog({
  open,
  onOpenChange,
  produtos,
  onSelect,
}: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSearchColumns, setSelectedSearchColumns] =
    useState<string[]>(DEFAULT_SEARCH_COLUMNS);
  const [selectedItem, setSelectedItem] = useState<Produto | null>(null);

  const filteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return produtos;

    const cols = selectedSearchColumns.length > 0 ? selectedSearchColumns : DEFAULT_SEARCH_COLUMNS;

    return produtos.filter((p) =>
      cols.some((key) => {
        const val = (p as unknown as Record<string, unknown>)[key];
        if (val == null) return false;
        return String(val).toLowerCase().includes(term);
      }),
    );
  }, [produtos, searchTerm, selectedSearchColumns]);

  const handleActivate = (p: Produto) => {
    onSelect(p);
    onOpenChange(false);
  };

  const handleConfirm = () => {
    if (selectedItem) {
      onSelect(selectedItem);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Pesquisar Produto BOM
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            columns={SEARCH_COLUMNS}
            selectedColumns={selectedSearchColumns}
            onColumnsChange={setSelectedSearchColumns}
            placeholder="Buscar..."
            className="w-full max-w-md"
          />
        </div>

        <div className="h-84 overflow-x-auto overflow-y-hidden">
          <DataGrid<Produto>
            tabId="ns-produto-search-dialog"
            storageId="ns-produto-search-dialog"
            columns={columns}
            data={filteredData}
            onSelect={(item) => setSelectedItem(item)}
            onActivate={handleActivate}
            activateOnDoubleClick
            emptyTitle="Nenhum produto encontrado"
          />
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 border-t">
          <p className="text-[11px] text-muted-foreground italic">
            Use ↑↓ para navegar, Enter ou duplo-clique para selecionar.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleConfirm} disabled={!selectedItem}>
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
