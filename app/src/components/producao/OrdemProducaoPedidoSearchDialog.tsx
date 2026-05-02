/**
 * OrdemProducaoPedidoSearchDialog.tsx — Pesquisa avançada de PV elegível para OP.
 * Recebe lista já filtrada (Liberado/Andamento/Pausado).
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
import type { PedidoVenda } from '@/types/comercial/pedido.types';
import { STATUS_LABELS, STATUS_COLORS } from '@/types/comercial/pedido.types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pedidos: PedidoVenda[];
  onSelect: (pedido: PedidoVenda) => void;
}

const columns: GridColumn<PedidoVenda>[] = [
  {
    key: 'codigo',
    header: 'Código PV',
    width: 130,
    filterType: 'text',
    className: 'font-mono',
  },
  {
    key: 'clienteCodigo',
    header: 'Cód. Cliente',
    width: 110,
    filterType: 'text',
    className: 'font-mono',
  },
  {
    key: 'clienteNome',
    header: 'Cliente',
    width: 250,
    filterType: 'text',
  },
  {
    key: 'status',
    header: 'Status',
    width: 150,
    filterType: 'checklist',
    filterOptions: Object.entries(STATUS_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
    contentAlign: 'center',
    render: (p) => (
      <span
        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
          STATUS_COLORS[p.status] || ''
        }`}
      >
        {STATUS_LABELS[p.status] || p.status}
      </span>
    ),
  },
];

const SEARCH_COLUMNS: SearchColumn[] = [
  { key: 'codigo', label: 'Código PV' },
  { key: 'clienteCodigo', label: 'Cód. Cliente' },
  { key: 'clienteNome', label: 'Cliente' },
];

const DEFAULT_SEARCH_COLUMNS = ['codigo', 'clienteNome'];

export function OrdemProducaoPedidoSearchDialog({
  open,
  onOpenChange,
  pedidos,
  onSelect,
}: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSearchColumns, setSelectedSearchColumns] =
    useState<string[]>(DEFAULT_SEARCH_COLUMNS);
  const [selectedItem, setSelectedItem] = useState<PedidoVenda | null>(null);

  const filteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return pedidos;
    const cols =
      selectedSearchColumns.length > 0 ? selectedSearchColumns : DEFAULT_SEARCH_COLUMNS;
    return pedidos.filter((p) =>
      cols.some((key) => {
        const val = (p as unknown as Record<string, unknown>)[key];
        if (val == null) return false;
        return String(val).toLowerCase().includes(term);
      }),
    );
  }, [pedidos, searchTerm, selectedSearchColumns]);

  const handleActivate = (p: PedidoVenda) => {
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
            Pesquisar Pedidos
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
          <DataGrid<PedidoVenda>
            tabId="op-pedido-search-dialog"
            storageId="op-pedido-search-dialog"
            columns={columns}
            data={filteredData}
            onSelect={(item) => setSelectedItem(item)}
            onActivate={handleActivate}
            activateOnDoubleClick
            emptyTitle="Nenhum pedido elegível"
            emptyDescription="Apenas PVs em Liberado, Andamento ou Pausado aceitam novas OPs."
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
