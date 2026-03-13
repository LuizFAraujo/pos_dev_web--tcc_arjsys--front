/**
 * ClientesPage.tsx — Página de clientes com modos list/view/new/edit
 *
 * Botões do header são gerenciados pelo PageActions (template).
 * Esta página cuida apenas do conteúdo específico:
 * - Colunas do grid e SearchBar
 * - Form inline (ClienteForm)
 * - Callbacks de CRUD
 * - Card customizado
 */

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useClientesStore } from '@/stores/admin/clientesStore';
import { useTabState } from '@/hooks/useTabState';
import { PageShell, usePageMode, PageActions } from '@/components/shared/PageShell';
import { DataGrid } from '@/components/shared/DataGrid';
import type { GridColumn, DataGridHandle } from '@/components/shared/DataGrid';
import { CardGrid } from '@/components/shared/CardGrid';
import type { CardGridHandle } from '@/components/shared/CardGrid';
import type { SearchColumn } from '@/components/shared/SearchBar';
import { Button } from '@/components/ui/button';
import { DeleteClienteDialog } from '@/components/admin/DeleteClienteDialog';
import { ClienteForm } from '@/components/admin/ClienteForm';
import type { ClienteFormHandle } from '@/components/admin/ClienteForm';
import type { Cliente, ClienteFormData } from '@/types/admin/cliente.types';

interface ClientesPageProps {
  tab: { id: string; type: string; title: string };
}

const SEARCH_COLUMNS: SearchColumn[] = [
  { key: 'nome', label: 'Nome' },
  { key: 'cpfCnpj', label: 'CPF/CNPJ' },
  { key: 'razaoSocial', label: 'Razão Social' },
  { key: 'cidade', label: 'Cidade' },
  { key: 'telefone', label: 'Telefone' },
  { key: 'contatoComercial', label: 'Contato' },
];

const DEFAULT_SEARCH_COLS = ['nome'];

function ClienteCard({ cliente }: { cliente: Cliente }) {
  return (
    <div className="p-4">
      <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">
        {cliente.nome || '-'}
      </p>
      <p className="text-xs text-muted-foreground font-mono mt-1">{cliente.cpfCnpj || '-'}</p>
      {cliente.razaoSocial && (
        <p className="text-xs text-muted-foreground mt-1 truncate">{cliente.razaoSocial}</p>
      )}
      {cliente.cidade && (
        <p className="text-xs text-muted-foreground mt-1">
          {cliente.cidade}{cliente.estado ? '/' + cliente.estado : ''}
        </p>
      )}
    </div>
  );
}

export function ClientesPage({ tab }: ClientesPageProps) {
  const gridRef = useRef<DataGridHandle>(null);
  const cardGridRef = useRef<CardGridHandle>(null);
  const formRef = useRef<ClienteFormHandle>(null);

  const [searchTerm, setSearchTerm] = useTabState(tab.id + '-search', '');
  const [searchCols, setSearchCols] = useTabState<string[]>(tab.id + '-search-cols', DEFAULT_SEARCH_COLS);
  const [viewMode, setViewMode] = useTabState<'list' | 'cards'>(tab.id + '-view', 'list');
  const [selectedItem, setSelectedItem] = useState<Cliente | null>(null);
  const [selectedCardId, setSelectedCardId] = useTabState<number | null>(tab.id + '-card-sel', null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clienteDelete, setClienteDelete] = useState<Cliente | null>(null);

  const page = usePageMode<Cliente>(tab.id, (c) => String(c.id));

  const clientes = useClientesStore((s) => s.clientes);
  const isLoading = useClientesStore((s) => s.isLoading);
  const error = useClientesStore((s) => s.error);
  const fetchClientes = useClientesStore((s) => s.fetchClientes);
  const createCliente = useClientesStore((s) => s.createCliente);
  const updateCliente = useClientesStore((s) => s.updateCliente);
  const deleteCliente = useClientesStore((s) => s.deleteCliente);

  useEffect(() => { fetchClientes(); }, [fetchClientes]);
  useEffect(() => { if (error) toast.error(error); }, [error]);

  const filtrados = useMemo(() => {
    if (!searchTerm) return clientes || [];
    const term = searchTerm.toLowerCase();
    return (clientes || []).filter((c) =>
      searchCols.some((col) => {
        const val = (c as any)[col];
        return val && String(val).toLowerCase().includes(term);
      }),
    );
  }, [clientes, searchTerm, searchCols]);

  const selectedCard = useMemo(
    () => filtrados.find((c) => c.id === selectedCardId) ?? null,
    [filtrados, selectedCardId],
  );

  const activeItem = viewMode === 'list' ? selectedItem : selectedCard;
  const inForm = page.mode !== 'list';

  // ─── Save (callback específico da página — o que salvar) ──────────────────

  const handleSave = useCallback(async (data: ClienteFormData) => {
    if (page.mode === 'edit' && page.editingItem) {
      await updateCliente(page.editingItem.id, data);
    } else {
      await createCliente(data);
    }
  }, [page.mode, page.editingItem, updateCliente, createCliente]);

  // ─── Navegação ───────────────────────────────────────────────────────────────

  const handleDelete = useCallback((c: Cliente) => {
    setClienteDelete(c);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!clienteDelete) return;
    await deleteCliente(clienteDelete.id);
    if (clienteDelete.id === selectedCardId) setSelectedCardId(null);
    setDeleteDialogOpen(false);
    setClienteDelete(null);
    toast.success('Registro excluído.');
  }, [clienteDelete, deleteCliente, selectedCardId, setSelectedCardId]);

  const handleViewMode = useCallback((mode: 'list' | 'cards') => {
    setViewMode(mode);
    if (mode === 'list') { setSelectedCardId(null); cardGridRef.current?.clearSelection(); }
    else setSelectedItem(null);
  }, [setViewMode, setSelectedCardId]);

  // ─── Colunas ─────────────────────────────────────────────────────────────────

  const columns: GridColumn<Cliente>[] = useMemo(() => [
    {
      key: 'nome', header: 'Nome', width: 200, minWidth: 120,
      render: (c) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200">{c.nome || '-'}</span>
      ),
    },
    {
      key: 'cpfCnpj', header: 'CPF/CNPJ', width: 170, minWidth: 130,
      contentAlign: 'center', className: 'font-mono', filterType: 'exact',
    },
    { key: 'razaoSocial', header: 'Razão Social', width: 220, minWidth: 120 },
    {
      key: 'cidade', header: 'Cidade/UF', width: 150, minWidth: 80,
      render: (c) => (c.cidade ? `${c.cidade}${c.estado ? '/' + c.estado : ''}` : '-'),
    },
    { key: 'telefone', header: 'Telefone', width: 140, minWidth: 100, contentAlign: 'center' },
    {
      key: 'contatoComercial', header: 'Contato', width: 200, minWidth: 100,
      contentAlign: 'center', headerAlign: 'center',
      render: (c) => c.contatoComercial || '-',
    },
  ], []);

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <PageShell module="Admin" title="Clientes" mode={page.mode}
      headerRight={
        <PageActions
          page={page}
          activeItem={activeItem}
          onDelete={handleDelete}
          lockMessage="Este cliente já está sendo editado em outra aba."
          searchColumns={SEARCH_COLUMNS}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchSelectedColumns={searchCols}
          onSearchColumnsChange={setSearchCols}
          gridRef={gridRef}
          viewMode={viewMode}
          onViewModeChange={handleViewMode}
          formRef={formRef}
          newTooltip="Novo cliente"
          noSelectionText="Selecione um cliente"
        />
      }
    >

      {!inForm && (
        viewMode === 'list' ? (
          <DataGrid
            ref={gridRef} tabId={tab.id} storageId="clientes"
            columns={columns} data={filtrados}
            loading={isLoading} loadingText="Carregando clientes..."
            emptyTitle="Nenhum cliente encontrado" emptyDescription="Crie o primeiro cliente"
            onSelect={(item) => setSelectedItem(item as Cliente | null)}
            onActivate={(item) => page.openView(item as Cliente)}
            emptyAction={
              <Button onClick={() => page.openNew()}>
                <Plus className="mr-2 h-4 w-4" /> Criar Primeiro
              </Button>
            }
          />
        ) : (
          <CardGrid
            ref={cardGridRef} data={filtrados} selectedId={selectedCardId}
            onSelect={(c) => setSelectedCardId(c?.id ?? null)}
            loading={isLoading} loadingText="Carregando clientes..."
            emptyTitle="Nenhum cliente encontrado" emptyDescription="Crie o primeiro cliente"
            renderCard={(c) => <ClienteCard cliente={c} />}
            emptyAction={
              <Button onClick={() => page.openNew()}>
                <Plus className="mr-2 h-4 w-4" /> Criar Primeiro
              </Button>
            }
          />
        )
      )}

      {inForm && (
        <ClienteForm
          key={page.resetKey}
          ref={formRef}
          mode={page.mode as 'view' | 'new' | 'edit'}
          cliente={page.editingItem}
          onDirty={() => page.setDirty(true)}
          onSave={handleSave}
        />
      )}

      <DeleteClienteDialog
        open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}
        cliente={clienteDelete} onConfirm={handleDeleteConfirm}
      />

    </PageShell>
  );
}
