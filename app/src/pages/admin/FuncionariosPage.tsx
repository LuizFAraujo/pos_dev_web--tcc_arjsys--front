/**
 * FuncionariosPage.tsx - Página de funcionários em modo server-side com scroll infinito
 *
 * Template: PageShell + PageActions + usePageMode
 * Hooks: useGridQuery (server-side), useListState (UI/cards/search), useDeleteDialog
 */

import { useEffect, useRef, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useFuncionariosStore } from '@/stores/admin/funcionariosStore';
import { PageShell, usePageMode, PageActions } from '@/components/shared/PageShell';
import { DataGrid } from '@/components/shared/DataGrid';
import type { GridColumn } from '@/components/shared/DataGrid';
import { CardGrid } from '@/components/shared/CardGrid';
import type { SearchColumn } from '@/components/shared/SearchBar';
import { useListState } from '@/hooks/useListState';
import { useTabState } from '@/hooks/useTabState';
import { useDeleteDialog } from '@/hooks/useDeleteDialog';
import { useGridQuery } from '@/hooks/useGridQuery';
import { FuncionarioDeleteDialog } from '@/components/admin/FuncionarioDeleteDialog';
import { FuncionarioForm } from '@/components/admin/FuncionarioForm';
import type { FuncionarioFormHandle } from '@/components/admin/FuncionarioForm';
import type { Funcionario, FuncionarioFormData } from '@/types/admin/funcionario.types';

interface FuncionariosPageProps {
  tab: { id: string; type: string; title: string };
}

const SEARCH_COLUMNS: SearchColumn[] = [
  { key: 'nome', label: 'Nome' },
  { key: 'usuario', label: 'Usuário' },
  { key: 'cargo', label: 'Cargo' },
  { key: 'setor', label: 'Setor' },
  { key: 'cidade', label: 'Cidade' },
  { key: 'telefone', label: 'Telefone' },
];

const DEFAULT_SEARCH_COLS = ['nome'];

function FuncionarioCard({ funcionario }: { funcionario: Funcionario }) {
  return (
    <div className="p-4">
      <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">
        {funcionario.nome || '-'}
      </p>
      <p className="text-xs text-muted-foreground font-mono mt-1">{funcionario.usuario || '-'}</p>
      {funcionario.cargo && (
        <p className="text-xs text-muted-foreground mt-1 truncate">{funcionario.cargo}</p>
      )}
      {funcionario.setor && (
        <p className="text-xs text-muted-foreground mt-1">{funcionario.setor}</p>
      )}
    </div>
  );
}

export function FuncionariosPage({ tab }: FuncionariosPageProps) {
  const formRef = useRef<FuncionarioFormHandle>(null);

  const page = usePageMode<Funcionario>(tab.id, (f) => String(f.id), tab.type);

  const [busca, setBusca] = useTabState<string>(tab.id + '-busca', '');

  const { itens, total, totalGeral, hasMore, isLoading, error, carregarMais, refetch } = useGridQuery<Funcionario>({
    endpoint: '/api/admin/Funcionarios/buscar',
    tabId: tab.id,
    colunasBuscaInicial: DEFAULT_SEARCH_COLS,
  });

  useEffect(() => { if (error) toast.error(error); }, [error]);

  const createFuncionario = useFuncionariosStore((s) => s.createFuncionario);
  const updateFuncionario = useFuncionariosStore((s) => s.updateFuncionario);
  const deleteFuncionario = useFuncionariosStore((s) => s.deleteFuncionario);

  const list = useListState<Funcionario>({
    tabId: tab.id,
    data: itens,
    searchColumns: SEARCH_COLUMNS,
    defaultSearchCols: DEFAULT_SEARCH_COLS,
  });

  const del = useDeleteDialog<Funcionario>({
    onDelete: async (f) => { await deleteFuncionario(f.id); refetch(); },
    onAfterDelete: (f) => {
      if (f.id === list.selectedCardId) list.setSelectedCardId(null);
    },
  });

  const handleSave = useCallback(async (data: FuncionarioFormData) => {
    if (page.mode === 'edit' && page.editingItem) {
      await updateFuncionario(page.editingItem.id, data);
    } else {
      await createFuncionario(data);
    }
    refetch();
  }, [page.mode, page.editingItem, updateFuncionario, createFuncionario, refetch]);

  const columns: GridColumn<Funcionario>[] = useMemo(() => [
    {
      key: 'nome', header: 'Nome', width: 200, minWidth: 120,
      render: (f) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200">{f.nome || '-'}</span>
      ),
    },
    {
      key: 'usuario', header: 'Usuário', width: 140, minWidth: 100,
      className: 'font-mono', filterType: 'exact',
    },
    { key: 'cargo', header: 'Cargo', width: 160, minWidth: 100 },
    { key: 'setor', header: 'Setor', width: 160, minWidth: 100 },
    { key: 'telefone', header: 'Telefone', width: 140, minWidth: 100, contentAlign: 'center' },
    {
      key: 'cidade', header: 'Cidade/UF', width: 150, minWidth: 80,
      render: (f) => (f.cidade ? `${f.cidade}${f.estado ? '/' + f.estado : ''}` : '-'),
    },
  ], []);

  const inForm = page.mode !== 'list';

  return (
    <PageShell module="Admin" title="Funcionários" mode={page.mode}
      headerRight={
        <PageActions
          page={page}
          activeItem={list.activeItem}
          onDelete={del.requestDelete}
          lockMessage="Este funcionário já está sendo editado em outra aba."
          searchColumns={SEARCH_COLUMNS}
          searchTerm={busca}
          onSearchChange={setBusca}
          searchSelectedColumns={list.searchCols}
          onSearchColumnsChange={list.setSearchCols}
          gridRef={list.gridRef}
          viewMode={list.viewMode}
          onViewModeChange={list.handleViewMode}
          formRef={formRef}
          newTooltip="Novo funcionário"
          noSelectionText="Selecione um funcionário"
        />
      }
    >

      <div style={{ display: !inForm && list.isListMode ? 'contents' : 'none' }}>
        <DataGrid
          ref={list.gridRef} tabId={tab.id} storageId="funcionarios"
          columns={columns} data={itens}
          serverSide total={total} totalGeral={totalGeral}
          hasMore={hasMore} onCarregarMais={carregarMais}
          loading={isLoading} loadingText="Carregando funcionários..."
          onSelect={(item) => list.setSelectedItem(item as Funcionario | null)}
          onActivate={(item) => page.openView(item as Funcionario)}
        />
      </div>
      <div style={{ display: !inForm && !list.isListMode ? 'contents' : 'none' }}>
        <CardGrid
          ref={list.cardGridRef} data={itens} selectedId={list.selectedCardId}
          onSelect={(f) => list.setSelectedCardId(f?.id ?? null)}
          onActivate={(item) => page.openView(item as Funcionario)}
          loading={isLoading} loadingText="Carregando funcionários..."
          emptyTitle="Nenhum funcionário encontrado"
          renderCard={(f) => <FuncionarioCard funcionario={f} />}
        />
      </div>

      {inForm && (
        <FuncionarioForm
          key={page.resetKey}
          ref={formRef}
          mode={page.mode as 'view' | 'new' | 'edit'}
          funcionario={page.editingItem}
          onDirty={() => page.setDirty(true)}
          onSave={handleSave}
        />
      )}

      <FuncionarioDeleteDialog
        open={del.open} onOpenChange={del.setOpen}
        funcionario={del.item} onConfirm={del.confirmDelete}
      />

    </PageShell>
  );
}
