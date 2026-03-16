/**
 * ProdutosPage.tsx — Página de produtos com modos list/view/new/edit
 *
 * Template: PageShell + PageActions + usePageMode
 * Hooks: useListState, useDeleteDialog
 * Extra: botão Varredura via extraActions do PageActions
 */

import { useEffect, useRef, useMemo, useCallback } from 'react';
import { Plus, ScanSearch, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useProdutosStore } from '@/stores/engenharia/produtosStore';
import { PageShell, usePageMode, PageActions } from '@/components/shared/PageShell';
import { DataGrid } from '@/components/shared/DataGrid';
import type { GridColumn } from '@/components/shared/DataGrid';
import { CardGrid } from '@/components/shared/CardGrid';
import type { SearchColumn } from '@/components/shared/SearchBar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/shared/AppTooltip';
import { useListState } from '@/hooks/useListState';
import { useDeleteDialog } from '@/hooks/useDeleteDialog';
import { ProdutoDeleteDialog } from '@/components/engenharia/ProdutoDeleteDialog';
import { ProdutoForm } from '@/components/engenharia/ProdutoForm';
import type { ProdutoFormHandle } from '@/components/engenharia/ProdutoForm';
import type { Produto, ProdutoFormData } from '@/types/engenharia/produto.types';
import { TIPO_PRODUTO_LABELS } from '@/types/engenharia/produto.types';

interface ProdutosPageProps {
  tab: { id: string; type: string; title: string };
}

const SEARCH_COLUMNS: SearchColumn[] = [
  { key: 'codigo', label: 'Código' },
  { key: 'descricao', label: 'Descrição' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'unidade', label: 'Unidade' },
];

const TIPO_OPTIONS = [
  { label: 'Fabricado', value: 'Fabricado' },
  { label: 'Comprado', value: 'Comprado' },
  { label: 'Matéria Prima', value: 'MateriaPrima' },
  { label: 'Revenda', value: 'Revenda' },
  { label: 'Serviço', value: 'Servico' },
];

const SIM_NAO_OPTIONS = [
  { label: 'Sim', value: 'true' },
  { label: 'Não', value: 'false' },
];

function ProdutoCard({ produto }: { produto: Produto }) {
  return (
    <div className="p-4">
      <p className="font-mono font-semibold text-sm text-slate-800 dark:text-slate-200">
        {produto.codigo}
      </p>
      <p className="text-xs text-muted-foreground mt-1 truncate">{produto.descricao}</p>
      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
        <span>{TIPO_PRODUTO_LABELS[produto.tipo]}</span>
        {produto.temDocumento && (
          <FileText className="h-3.5 w-3.5 text-blue-500" />
        )}
      </div>
    </div>
  );
}

export function ProdutosPage({ tab }: ProdutosPageProps) {
  const formRef = useRef<ProdutoFormHandle>(null);

  const page = usePageMode<Produto>(tab.id, (p) => String(p.id), tab.type);

  // ─── Store ────────────────────────────────────────────────────────────────────

  const produtos = useProdutosStore((s) => s.produtos);
  const isLoading = useProdutosStore((s) => s.isLoading);
  const error = useProdutosStore((s) => s.error);
  const fetchProdutos = useProdutosStore((s) => s.fetchProdutos);
  const createProduto = useProdutosStore((s) => s.createProduto);
  const updateProduto = useProdutosStore((s) => s.updateProduto);
  const deleteProduto = useProdutosStore((s) => s.deleteProduto);
  const varreduraDocumentos = useProdutosStore((s) => s.varreduraDocumentos);

  useEffect(() => { fetchProdutos(); }, [fetchProdutos]);
  useEffect(() => { if (error) toast.error(error); }, [error]);

  // ─── Lista ────────────────────────────────────────────────────────────────────

  const list = useListState<Produto>({
    tabId: tab.id,
    data: produtos,
    searchColumns: SEARCH_COLUMNS,
    defaultSearchCols: ['codigo', 'descricao'],
  });

  // ─── Delete ───────────────────────────────────────────────────────────────────

  const del = useDeleteDialog<Produto>({
    onDelete: (p) => deleteProduto(p.id),
    onAfterDelete: (p) => {
      if (p.id === list.selectedCardId) list.setSelectedCardId(null);
    },
  });

  // ─── Save ─────────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async (data: ProdutoFormData) => {
    if (page.mode === 'edit' && page.editingItem) {
      await updateProduto(page.editingItem.id, data);
    } else {
      await createProduto(data);
    }
  }, [page.mode, page.editingItem, updateProduto, createProduto]);

  // ─── Extra actions (Varredura) ────────────────────────────────────────────────

  const extraActions = useMemo(() => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8"
          onClick={() => varreduraDocumentos()}>
          <ScanSearch className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent><p>Varredura de documentos</p></TooltipContent>
    </Tooltip>
  ), [varreduraDocumentos]);

  // ─── Colunas ──────────────────────────────────────────────────────────────────

  const columns: GridColumn<Produto>[] = useMemo(() => [
    {
      key: 'codigo', header: 'CÓDIGO', width: 130, minWidth: 130, contentAlign: 'center',
      render: (p) => <span className="font-mono font-medium">{p.codigo}</span>,
    },
    {
      key: 'descricao', header: 'DESCRIÇÃO', width: 250, minWidth: 200,
      render: (p) => (
        <div>
          <p className="font-medium">{p.descricao}</p>
          {p.descricaoCompleta && (
            <p className="line-clamp-1 text-xs text-muted-foreground">{p.descricaoCompleta}</p>
          )}
        </div>
      ),
    },
    {
      key: 'tipo', header: 'TIPO', width: 130, minWidth: 110,
      filterType: 'select', filterOptions: TIPO_OPTIONS, contentAlign: 'center',
      render: (p) => TIPO_PRODUTO_LABELS[p.tipo] || p.tipo,
    },
    { key: 'unidade', header: 'UN', width: 75, minWidth: 65, contentAlign: 'center' },
    {
      key: 'peso', header: 'PESO (KG)', width: 80, minWidth: 70,
      filterType: 'number', contentAlign: 'right',
      render: (p) => p.peso ? p.peso.toFixed(2) : '-',
    },
    {
      key: 'temDocumento', header: 'DOC.', width: 80, minWidth: 75,
      filterType: 'select', filterOptions: SIM_NAO_OPTIONS, contentAlign: 'center',
      render: (p) => p.temDocumento
        ? <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        : <span className="text-muted-foreground">-</span>,
    },
    {
      key: 'ativo', header: 'ATIVO', width: 80, minWidth: 80,
      filterType: 'select', filterOptions: SIM_NAO_OPTIONS, contentAlign: 'center',
      render: (p) => p.ativo ? 'Sim' : 'Não',
    },
  ], []);

  // ─── Render ───────────────────────────────────────────────────────────────────

  const inForm = page.mode !== 'list';

  return (
    <PageShell module="Engenharia" title="Produtos" mode={page.mode}
      headerRight={
        <PageActions
          page={page}
          activeItem={list.activeItem}
          onDelete={del.requestDelete}
          lockMessage="Este produto já está sendo editado em outra aba."
          searchColumns={SEARCH_COLUMNS}
          searchTerm={list.searchTerm}
          onSearchChange={list.setSearchTerm}
          searchSelectedColumns={list.searchCols}
          onSearchColumnsChange={list.setSearchCols}
          gridRef={list.gridRef}
          viewMode={list.viewMode}
          onViewModeChange={list.handleViewMode}
          formRef={formRef}
          extraActions={page.mode === 'list' ? extraActions : undefined}
          newTooltip="Novo produto"
          noSelectionText="Selecione um produto"
        />
      }
    >

      {!inForm && (
        list.isListMode ? (
          <DataGrid
            ref={list.gridRef} tabId={tab.id} storageId="produtos"
            columns={columns} data={list.filtrados}
            loading={isLoading} loadingText="Carregando produtos..."
            emptyTitle="Nenhum produto encontrado" emptyDescription="Crie o primeiro produto"
            onSelect={(item) => list.setSelectedItem(item as Produto | null)}
            onActivate={(item) => page.openView(item as Produto)}
            emptyAction={
              <Button onClick={() => page.openNew()}>
                <Plus className="mr-2 h-4 w-4" /> Criar Primeiro
              </Button>
            }
          />
        ) : (
          <CardGrid
            ref={list.cardGridRef} data={list.filtrados} selectedId={list.selectedCardId}
            onSelect={(p) => list.setSelectedCardId(p?.id ?? null)}
			onActivate={(item) => page.openView(item as Produto)}
            loading={isLoading} loadingText="Carregando produtos..."
            emptyTitle="Nenhum produto encontrado" emptyDescription="Crie o primeiro produto"
            renderCard={(p) => <ProdutoCard produto={p} />}
            emptyAction={
              <Button onClick={() => page.openNew()}>
                <Plus className="mr-2 h-4 w-4" /> Criar Primeiro
              </Button>
            }
          />
        )
      )}

      {inForm && (
        <ProdutoForm
          key={page.resetKey}
          ref={formRef}
          mode={page.mode as 'view' | 'new' | 'edit'}
          produto={page.editingItem}
          onDirty={() => page.setDirty(true)}
          onSave={handleSave}
        />
      )}

      <ProdutoDeleteDialog
        open={del.open} onOpenChange={del.setOpen}
        produto={del.item} onConfirm={del.confirmDelete}
      />

    </PageShell>
  );
}
