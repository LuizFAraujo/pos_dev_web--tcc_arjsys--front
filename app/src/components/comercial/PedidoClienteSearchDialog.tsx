/**
 * PedidoClienteSearchDialog.tsx - Modal de pesquisa avançada de cliente
 *
 * Layout:
 *   - Header: título compacto
 *   - Toolbar: SearchBar global (busca em N colunas com seletor)
 *   - Tabela: DataGrid com filtros por coluna, sort, resize, scroll horizontal
 *     interno. Colunas: Código, Nome, CPF/CNPJ, Cidade, Estado, Telefone.
 *   - Rodapé: dicas de navegação discretas + botões Cancelar / Confirmar
 *
 * Fluxos de seleção:
 *   - Enter ou duplo-clique numa linha → confirma e fecha (onActivate)
 *     - DataGrid recebe `activateOnDoubleClick` pra ativar sem Ctrl
 *   - Clique simples seleciona; botão Confirmar usa o selecionado
 *   - Esc fecha sem selecionar
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
import type { Cliente } from '@/types/admin/cliente.types';

interface PedidoClienteSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientes: Cliente[];
  onSelect: (cliente: Cliente) => void;
}

const columns: GridColumn<Cliente>[] = [
  {
    key: 'codigo',
    header: 'Código',
    width: 100,
    filterType: 'text',
    className: 'font-mono',
  },
  {
    key: 'nome',
    header: 'Nome',
    width: 220,
    filterType: 'text',
  },
  {
    key: 'cpfCnpj',
    header: 'CPF/CNPJ',
    width: 150,
    filterType: 'text',
    className: 'font-mono',
  },
  {
    key: 'cidade',
    header: 'Cidade',
    width: 150,
    filterType: 'text',
  },
  {
    key: 'estado',
    header: 'Estado',
    width: 80,
    filterType: 'text',
    contentAlign: 'center',
  },
  {
    key: 'telefone',
    header: 'Telefone',
    width: 130,
    filterType: 'text',
    className: 'font-mono',
  },
];

const SEARCH_COLUMNS: SearchColumn[] = [
  { key: 'codigo', label: 'Código' },
  { key: 'nome', label: 'Nome' },
  { key: 'cpfCnpj', label: 'CPF/CNPJ' },
  { key: 'cidade', label: 'Cidade' },
  { key: 'estado', label: 'Estado' },
  { key: 'telefone', label: 'Telefone' },
];

const DEFAULT_SEARCH_COLUMNS = ['nome'];

export function PedidoClienteSearchDialog({
  open,
  onOpenChange,
  clientes,
  onSelect,
}: PedidoClienteSearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSearchColumns, setSelectedSearchColumns] =
    useState<string[]>(DEFAULT_SEARCH_COLUMNS);
  const [selectedItem, setSelectedItem] = useState<Cliente | null>(null);

  // Aplica busca global nas colunas selecionadas
  const filteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return clientes;

    const cols = selectedSearchColumns.length > 0 ? selectedSearchColumns : DEFAULT_SEARCH_COLUMNS;

    return clientes.filter((c) =>
      cols.some((key) => {
        const val = (c as unknown as Record<string, unknown>)[key];
        if (val == null) return false;
        return String(val).toLowerCase().includes(term);
      }),
    );
  }, [clientes, searchTerm, selectedSearchColumns]);

  const handleActivate = (c: Cliente) => {
    onSelect(c);
    onOpenChange(false);
  };

  const handleConfirm = () => {
    if (selectedItem) {
      onSelect(selectedItem);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Pesquisar cliente
          </DialogTitle>
        </DialogHeader>

        {/* Toolbar com busca global */}
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

        {/* Tabela - altura limitada a ~10 linhas, scroll horizontal interno */}
        <div className="h-84 overflow-x-auto overflow-y-hidden">
          <DataGrid<Cliente>
            tabId="cliente-search-dialog"
            storageId="cliente-search-dialog"
            columns={columns}
            data={filteredData}
            onSelect={(item) => setSelectedItem(item)}
            onActivate={handleActivate}
            activateOnDoubleClick
            emptyTitle="Nenhum cliente encontrado"
          />
        </div>

        {/* Rodapé: dica + ações */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t">
          <p className="text-[11px] text-muted-foreground italic">
            Use ↑↓ para navegar, Enter ou duplo-clique para selecionar.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={!selectedItem}
            >
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
