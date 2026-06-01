/**
 * ClientesPage.tsx - Página de clientes em modo server-side com scroll infinito
 *
 * Template: PageShell + PageActions + usePageMode
 * Hooks: useGridQuery (server-side), useListState (UI/cards/search), useDeleteDialog
 */

import { useEffect, useRef, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useClientesStore } from '@/stores/admin/clientesStore';
import { PageShell, usePageMode, PageActions } from '@/components/shared/PageShell';
import { DataGrid } from '@/components/shared/DataGrid';
import type { GridColumn } from '@/components/shared/DataGrid';
import { CardGrid } from '@/components/shared/CardGrid';
import type { SearchColumn } from '@/components/shared/SearchBar';
import { useListState } from '@/hooks/useListState';
import { useTabState } from '@/hooks/useTabState';
import { useDeleteDialog } from '@/hooks/useDeleteDialog';
import { useGridQuery } from '@/hooks/useGridQuery';
import { ClienteDeleteDialog } from '@/components/admin/ClienteDeleteDialog';
import { ClienteForm } from '@/components/admin/ClienteForm';
import type { ClienteFormHandle } from '@/components/admin/ClienteForm';
import type { Cliente, ClienteFormData } from '@/types/admin/cliente.types';

interface ClientesPageProps {
  tab: { id: string; type: string; title: string };
}

const SEARCH_COLUMNS: SearchColumn[] = [
  { key: 'codigo', label: 'Código' },
  { key: 'nome', label: 'Cliente' },
  { key: 'razaoSocial', label: 'Razão Social' },
  { key: 'cpfCnpj', label: 'CPF/CNPJ' },
  { key: 'estado', label: 'Estado' },
  { key: 'cidade', label: 'Cidade' },
  { key: 'telefone', label: 'Telefone' },
];

const DEFAULT_SEARCH_COLS = ['codigo', 'nome'];

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

  // ─── Busca textual server-side (alimenta useGridQuery) ──────────────────────
  const [busca, setBusca] = useTabState<string>(tab.id + '-busca', '');

  // ─── Query server-side em modo scroll infinito ──────────────────────────────
  const { itens, total, totalGeral, hasMore, isLoading, error, carregarMais, refetch } = useGridQuery<Cliente>({
    endpoint: '/api/admin/Clientes/buscar',
    tabId: tab.id,
    colunasBuscaInicial: DEFAULT_SEARCH_COLS,
  });

  useEffect(() => { if (error) toast.error(error); }, [error]);

  // ─── Mutações via store ─────────────────────────────────────────────────────
  const createCliente = useClientesStore((s) => s.createCliente);
  const updateCliente = useClientesStore((s) => s.updateCliente);
  const deleteCliente = useClientesStore((s) => s.deleteCliente);

  // ─── Lista (cards/UI) ───────────────────────────────────────────────────────
  const list = useListState<Cliente>({
    tabId: tab.id,
    data: itens,
    searchColumns: SEARCH_COLUMNS,
    defaultSearchCols: DEFAULT_SEARCH_COLS,
  });

  // ─── Delete ─────────────────────────────────────────────────────────────────
  const del = useDeleteDialog<Cliente>({
    onDelete: async (c) => { await deleteCliente(c.id); refetch(); },
    onAfterDelete: (c) => {
      if (c.id === list.selectedCardId) list.setSelectedCardId(null);
    },
  });

  // ─── Save ───────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async (data: ClienteFormData) => {
    if (page.mode === 'edit' && page.editingItem) {
      await updateCliente(page.editingItem.id, data);
    } else {
      await createCliente(data);
    }
    refetch();
  }, [page.mode, page.editingItem, updateCliente, createCliente, refetch]);

  // ─── Colunas ────────────────────────────────────────────────────────────────
  const columns: GridColumn<Cliente>[] = useMemo(() => [
    {
      key: 'codigo', header: 'Código', width: 110, minWidth: 90,
      contentAlign: 'center', filterType: 'text',
      render: (c) => (
        <span className="font-mono text-xs">{c.codigo || '-'}</span>
      ),
    },
    {
      key: 'nome', header: 'Cliente', width: 220, minWidth: 140,
      filterType: 'text',
      render: (c) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
          {c.nome || '-'}
        </span>
      ),
    },
    {
      key: 'razaoSocial', header: 'Razão Social', width: 240, minWidth: 140,
      filterType: 'text',
      render: (c) => (
        <span className="truncate">
          {c.razaoSocial || <span className="text-muted-foreground">-</span>}
        </span>
      ),
    },
    {
      key: 'cpfCnpj', header: 'CPF/CNPJ', width: 170, minWidth: 130,
      contentAlign: 'center', className: 'font-mono', filterType: 'exact',
    },
    {
      key: 'estado', header: 'Estado', width: 80, minWidth: 70,
      contentAlign: 'center', filterType: 'text',
      render: (c) => c.estado || <span className="text-muted-foreground">-</span>,
    },
    {
      key: 'cidade', header: 'Cidade', width: 160, minWidth: 110,
      filterType: 'text',
      render: (c) => (
        <span className="truncate">
          {c.cidade || <span className="text-muted-foreground">-</span>}
        </span>
      ),
    },
    {
      key: 'telefone', header: 'Telefone', width: 140, minWidth: 100,
      contentAlign: 'center', className: 'font-mono', filterType: 'text',
    },
  ], []);

  // ─── Render ─────────────────────────────────────────────────────────────────
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
          searchTerm={busca}
          onSearchChange={setBusca}
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

      <div style={{ display: !inForm && list.isListMode ? 'contents' : 'none' }}>
        <DataGrid
          ref={list.gridRef} tabId={tab.id} storageId="clientes"
          columns={columns} data={itens}
          serverSide total={total} totalGeral={totalGeral}
          hasMore={hasMore} onCarregarMais={carregarMais}
          loading={isLoading} loadingText="Carregando clientes..."
          onSelect={(item) => list.setSelectedItem(item as Cliente | null)}
          onActivate={(item) => page.openView(item as Cliente)}
        />
      </div>
      <div style={{ display: !inForm && !list.isListMode ? 'contents' : 'none' }}>
        <CardGrid
          ref={list.cardGridRef} data={itens} selectedId={list.selectedCardId}
          onSelect={(c) => list.setSelectedCardId(c?.id ?? null)}
          onActivate={(item) => page.openView(item as Cliente)}
          loading={isLoading} loadingText="Carregando clientes..."
          emptyTitle="Nenhum cliente encontrado"
          renderCard={(c) => <ClienteCard cliente={c} />}
        />
      </div>

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

      <ClienteDeleteDialog
        open={del.open} onOpenChange={del.setOpen}
        cliente={del.item} onConfirm={del.confirmDelete}
      />

    </PageShell>
  );
}
