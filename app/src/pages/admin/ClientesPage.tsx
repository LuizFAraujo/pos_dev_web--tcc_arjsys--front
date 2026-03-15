/**
 * ClientesPage.tsx — Página de clientes com modos list/view/new/edit
 *
 * Template: PageShell + PageActions + usePageMode (header, botões, modos)
 * Hooks: useListState (search, filtro, seleção), useDeleteDialog (exclusão)
 * Página: colunas, form, card, callbacks de CRUD
 */

import { useEffect, useRef, useMemo, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useClientesStore } from '@/stores/admin/clientesStore';
import { PageShell, usePageMode, PageActions } from '@/components/shared/PageShell';
import { DataGrid } from '@/components/shared/DataGrid';
import type { GridColumn } from '@/components/shared/DataGrid';
import { CardGrid } from '@/components/shared/CardGrid';
import type { SearchColumn } from '@/components/shared/SearchBar';
import { Button } from '@/components/ui/button';
import { useListState } from '@/hooks/useListState';
import { useDeleteDialog } from '@/hooks/useDeleteDialog';
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
  const formRef = useRef<ClienteFormHandle>(null);

  const page = usePageMode<Cliente>(tab.id, (c) => String(c.id), tab.type);

  // ─── Store ────────────────────────────────────────────────────────────────────

  const clientes = useClientesStore((s) => s.clientes);
  const isLoading = useClientesStore((s) => s.isLoading);
  const error = useClientesStore((s) => s.error);
  const fetchClientes = useClientesStore((s) => s.fetchClientes);
  const createCliente = useClientesStore((s) => s.createCliente);
  const updateCliente = useClientesStore((s) => s.updateCliente);
  const deleteCliente = useClientesStore((s) => s.deleteCliente);

  useEffect(() => { fetchClientes(); }, [fetchClientes]);
  useEffect(() => { if (error) toast.error(error); }, [error]);

  // ─── Lista (search, filtro, seleção, viewMode) ───────────────────────────────

  const list = useListState<Cliente>({
    tabId: tab.id,
    data: clientes,
    searchColumns: SEARCH_COLUMNS,
    defaultSearchCols: ['nome'],
  });

  // ─── Delete ───────────────────────────────────────────────────────────────────

  const del = useDeleteDialog<Cliente>({
    onDelete: (c) => deleteCliente(c.id),
    onAfterDelete: (c) => {
      if (c.id === list.selectedCardId) list.setSelectedCardId(null);
    },
  });

  // ─── Save ─────────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async (data: ClienteFormData) => {
    if (page.mode === 'edit' && page.editingItem) {
      await updateCliente(page.editingItem.id, data);
    } else {
      await createCliente(data);
    }
  }, [page.mode, page.editingItem, updateCliente, createCliente]);

  // ─── Colunas ──────────────────────────────────────────────────────────────────

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

  const inForm = page.mode !== 'list';

  return (
    <PageShell module="Admin" title="Clientes" mode={page.mode}
      headerRight={
        <PageActions
          page={page}
          activeItem={list.activeItem}
          onDelete={del.requestDelete}
          lockMessage="Este cliente já está sendo editado em outra aba."
          searchColumns={SEARCH_COLUMNS}
          searchTerm={list.searchTerm}
          onSearchChange={list.setSearchTerm}
          searchSelectedColumns={list.searchCols}
          onSearchColumnsChange={list.setSearchCols}
          gridRef={list.gridRef}
          viewMode={list.viewMode}
          onViewModeChange={list.handleViewMode}
          formRef={formRef}
          newTooltip="Novo cliente"
          noSelectionText="Selecione um cliente"
        />
      }
    >

      {!inForm && (
        list.isListMode ? (
          <DataGrid
            ref={list.gridRef} tabId={tab.id} storageId="clientes"
            columns={columns} data={list.filtrados}
            loading={isLoading} loadingText="Carregando clientes..."
            emptyTitle="Nenhum cliente encontrado" emptyDescription="Crie o primeiro cliente"
            onSelect={(item) => list.setSelectedItem(item as Cliente | null)}
            onActivate={(item) => page.openView(item as Cliente)}
            emptyAction={
              <Button onClick={() => page.openNew()}>
                <Plus className="mr-2 h-4 w-4" /> Criar Primeiro
              </Button>
            }
          />
        ) : (
          <CardGrid
            ref={list.cardGridRef} data={list.filtrados} selectedId={list.selectedCardId}
            onSelect={(c) => list.setSelectedCardId(c?.id ?? null)}
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
        open={del.open} onOpenChange={del.setOpen}
        cliente={del.item} onConfirm={del.confirmDelete}
      />

    </PageShell>
  );
}
