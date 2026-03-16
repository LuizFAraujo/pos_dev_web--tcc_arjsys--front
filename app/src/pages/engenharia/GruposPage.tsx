/**
 * GruposPage.tsx — Página de grupos de produto com modos list/view/new/edit
 *
 * Template: PageShell + PageActions + usePageMode
 * Hooks: useListState, useDeleteDialog
 */

import { useEffect, useRef, useMemo, useCallback } from 'react';
import { Plus, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import { useGruposStore } from '@/stores/engenharia/gruposStore';
import { PageShell, usePageMode, PageActions } from '@/components/shared/PageShell';
import { DataGrid } from '@/components/shared/DataGrid';
import type { GridColumn } from '@/components/shared/DataGrid';
import { CardGrid } from '@/components/shared/CardGrid';
import type { SearchColumn } from '@/components/shared/SearchBar';
import { Button } from '@/components/ui/button';
import { useListState } from '@/hooks/useListState';
import { useDeleteDialog } from '@/hooks/useDeleteDialog';
import { GrupoDeleteDialog } from '@/components/engenharia/GrupoDeleteDialog';
import { GrupoForm } from '@/components/engenharia/GrupoForm';
import type { GrupoFormHandle } from '@/components/engenharia/GrupoForm';
import type { GrupoProduto, GrupoProdutoFormData } from '@/types/engenharia/grupo.types';
import { NIVEL_LABELS } from '@/types/engenharia/grupo.types';

interface GruposPageProps {
  tab: { id: string; type: string; title: string };
}

const SEARCH_COLUMNS: SearchColumn[] = [
  { key: 'codigo', label: 'Código' },
  { key: 'descricao', label: 'Descrição' },
];

const NIVEL_OPTIONS = [
  { label: 'Coluna 1 (Grupo)', value: 'Coluna1' },
  { label: 'Coluna 2 (Subgrupo)', value: 'Coluna2' },
  { label: 'Coluna 3 (Família)', value: 'Coluna3' },
];

const SIM_NAO_OPTIONS = [
  { label: 'Sim', value: 'true' },
  { label: 'Não', value: 'false' },
];

function GrupoCard({ grupo }: { grupo: GrupoProduto }) {
  return (
    <div className="p-4">
      <p className="font-mono font-semibold text-sm text-slate-800 dark:text-slate-200">
        {grupo.codigo || '-'}
      </p>
      <p className="text-xs text-muted-foreground mt-1 truncate">{grupo.descricao}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {NIVEL_LABELS[grupo.nivel] || grupo.nivel}
      </p>
      {grupo.pathDocumentos && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <FolderOpen className="h-3 w-3" />
          <span className="font-mono truncate">{grupo.pathDocumentos}</span>
        </div>
      )}
    </div>
  );
}

export function GruposPage({ tab }: GruposPageProps) {
  const formRef = useRef<GrupoFormHandle>(null);

  const page = usePageMode<GrupoProduto>(tab.id, (g) => String(g.id), tab.type);

  // ─── Store ────────────────────────────────────────────────────────────────────

  const grupos = useGruposStore((s) => s.grupos);
  const isLoading = useGruposStore((s) => s.isLoading);
  const error = useGruposStore((s) => s.error);
  const fetchGrupos = useGruposStore((s) => s.fetchGrupos);
  const createGrupo = useGruposStore((s) => s.createGrupo);
  const updateGrupo = useGruposStore((s) => s.updateGrupo);
  const deleteGrupo = useGruposStore((s) => s.deleteGrupo);

  useEffect(() => { fetchGrupos(); }, [fetchGrupos]);
  useEffect(() => { if (error) toast.error(error); }, [error]);

  // ─── Lista ────────────────────────────────────────────────────────────────────

  const list = useListState<GrupoProduto>({
    tabId: tab.id,
    data: grupos,
    searchColumns: SEARCH_COLUMNS,
    defaultSearchCols: ['codigo', 'descricao'],
  });

  // ─── Delete ───────────────────────────────────────────────────────────────────

  const del = useDeleteDialog<GrupoProduto>({
    onDelete: (g) => deleteGrupo(g.id),
    onAfterDelete: (g) => {
      if (g.id === list.selectedCardId) list.setSelectedCardId(null);
    },
  });

  // ─── Save ─────────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async (data: GrupoProdutoFormData) => {
    if (page.mode === 'edit' && page.editingItem) {
      await updateGrupo(page.editingItem.id, data);
    } else {
      await createGrupo(data);
    }
  }, [page.mode, page.editingItem, updateGrupo, createGrupo]);

  // ─── Colunas ──────────────────────────────────────────────────────────────────

  const columns: GridColumn<GrupoProduto>[] = useMemo(() => [
    {
      key: 'codigo', header: 'CÓDIGO', width: 120, minWidth: 80, contentAlign: 'center',
      render: (g) => <span className="font-mono font-medium">{g.codigo || '-'}</span>,
    },
    { key: 'descricao', header: 'DESCRIÇÃO', width: 250, minWidth: 150 },
    {
      key: 'nivel', header: 'NÍVEL', width: 180, minWidth: 130, contentAlign: 'center',
      filterType: 'checklist', filterOptions: NIVEL_OPTIONS,
      render: (g) => NIVEL_LABELS[g.nivel] || g.nivel,
    },
    {
      key: 'qtdCaracteres', header: 'CHARS', width: 80, minWidth: 60,
      contentAlign: 'center', className: 'font-mono', filterType: 'number',
    },
    {
      key: 'pathDocumentos', header: 'PATH DOCUMENTOS', width: 250, minWidth: 120,
      render: (g) => g.pathDocumentos
        ? <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground"><FolderOpen className="h-3 w-3" />{g.pathDocumentos}</div>
        : <span className="text-muted-foreground">-</span>,
    },
    {
      key: 'ativo', header: 'ATIVO', width: 80, minWidth: 60, contentAlign: 'center',
      filterType: 'checklist', filterOptions: SIM_NAO_OPTIONS,
      render: (g) => g.ativo ? 'Sim' : 'Não',
    },
  ], []);

  // ─── Render ───────────────────────────────────────────────────────────────────

  const inForm = page.mode !== 'list';

  return (
    <PageShell module="Engenharia" title="Grupos de Produto" mode={page.mode}
      headerRight={
        <PageActions
          page={page}
          activeItem={list.activeItem}
          onDelete={del.requestDelete}
          lockMessage="Este grupo já está sendo editado em outra aba."
          searchColumns={SEARCH_COLUMNS}
          searchTerm={list.searchTerm}
          onSearchChange={list.setSearchTerm}
          searchSelectedColumns={list.searchCols}
          onSearchColumnsChange={list.setSearchCols}
          gridRef={list.gridRef}
          viewMode={list.viewMode}
          onViewModeChange={list.handleViewMode}
          formRef={formRef}
          newTooltip="Novo grupo"
          noSelectionText="Selecione um grupo"
        />
      }
    >

      {!inForm && (
        list.isListMode ? (
          <DataGrid
            ref={list.gridRef} tabId={tab.id} storageId="grupos"
            columns={columns} data={list.filtrados}
            loading={isLoading} loadingText="Carregando grupos..."
            emptyTitle="Nenhum grupo encontrado" emptyDescription="Crie o primeiro grupo"
            onSelect={(item) => list.setSelectedItem(item as GrupoProduto | null)}
            onActivate={(item) => page.openView(item as GrupoProduto)}
            emptyAction={
              <Button onClick={() => page.openNew()}>
                <Plus className="mr-2 h-4 w-4" /> Criar Primeiro
              </Button>
            }
          />
        ) : (
          <CardGrid
            ref={list.cardGridRef} data={list.filtrados} selectedId={list.selectedCardId}
            onSelect={(g) => list.setSelectedCardId(g?.id ?? null)}
            onActivate={(item) => page.openView(item as GrupoProduto)}
            loading={isLoading} loadingText="Carregando grupos..."
            emptyTitle="Nenhum grupo encontrado" emptyDescription="Crie o primeiro grupo"
            renderCard={(g) => <GrupoCard grupo={g} />}
            emptyAction={
              <Button onClick={() => page.openNew()}>
                <Plus className="mr-2 h-4 w-4" /> Criar Primeiro
              </Button>
            }
          />
        )
      )}

      {inForm && (
        <GrupoForm
          key={page.resetKey}
          ref={formRef}
          mode={page.mode as 'view' | 'new' | 'edit'}
          grupo={page.editingItem}
          onDirty={() => page.setDirty(true)}
          onSave={handleSave}
        />
      )}

      <GrupoDeleteDialog
        open={del.open} onOpenChange={del.setOpen}
        grupo={del.item} onConfirm={del.confirmDelete}
      />

    </PageShell>
  );
}
