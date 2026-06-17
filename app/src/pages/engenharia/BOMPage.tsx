/**
 * BOMPage.tsx - Estrutura de Produtos (BOM) em modo server-side
 *
 * Flat: DataGrid com todas as relações pai-filho via /api/engenharia/Bom/flat/buscar.
 *   - Botão deletar → exclui estrutura COMPLETA (todos filhos diretos do pai selecionado)
 *   - Dialog de confirmação sério com quantidade de filhos
 *   - DocButtons consultam useProdutosStore (cache local) pra `temDocumento` atualizado
 *
 * Tree: BOMForm inline com edição em lote (não server-side - usado dentro do form).
 */

import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { FolderOpen, FileText, ChevronsDown, ChevronsRight, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { useBOMStore } from '@/stores/engenharia/bomStore';
import { useProdutosStore } from '@/stores/engenharia/produtosStore';
import { PageShell, usePageMode, PageActions } from '@/components/shared/PageShell';
import { DataGrid } from '@/components/shared/DataGrid';
import type { GridColumn } from '@/components/shared/DataGrid';
import type { SearchColumn } from '@/components/shared/SearchBar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/shared/AppTooltip';
import { useListState } from '@/hooks/useListState';
import { useTabState } from '@/hooks/useTabState';
import { useGridQuery } from '@/hooks/useGridQuery';
import { BOMForm } from '@/components/engenharia/BOMForm';
import type { BOMFormHandle } from '@/components/engenharia/BOMForm';
import { NovaEstruturaDialog } from '@/components/engenharia/NovaEstruturaDialog';
import { BomDeleteDialog } from '@/components/engenharia/BomDeleteDialog';
import { ExportarBOMDialog } from '@/components/engenharia/ExportarBOMDialog';
import { BomThumbControls } from '@/components/engenharia/BomThumbControls';
import { BomDocCell } from '@/components/engenharia/BomDocCell';
import { DocPreviewDialog } from '@/components/shared/DocPreviewDialog';
import { useBomThumbsStore } from '@/stores/engenharia/bomThumbsStore';
import type { BomItem } from '@/types/engenharia/bom.types';

interface BOMPageProps {
  tab: { id: string; type: string; title: string };
}

const SEARCH_COLUMNS: SearchColumn[] = [
  { key: 'produtoPaiCodigo', label: 'Código Pai' },
  { key: 'produtoPaiDescricao', label: 'Descrição Pai' },
  { key: 'produtoFilhoCodigo', label: 'Código Filho' },
  { key: 'produtoFilhoDescricao', label: 'Descrição Filho' },
];

const DEFAULT_SEARCH_COLS = ['produtoPaiCodigo', 'produtoFilhoCodigo'];

const UNIDADE_OPTIONS = [
  { label: 'Unidade', value: 'UN' }, { label: 'Peça', value: 'PC' },
  { label: 'Conjunto', value: 'CJ' }, { label: 'Quilograma', value: 'KG' },
  { label: 'Kit', value: 'KT' }, { label: 'Metro', value: 'MT' },
];

const SIM_NAO_OPTIONS = [
  { label: 'Sim', value: 'true' }, { label: 'Não', value: 'false' },
];

function formatQtde(q: number) {
  return q.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

// ─── Botões DOC ───────────────────────────────────────────────────────────────

function BomDocButtons({ item, extensao }: { item: BomItem; extensao?: string }) {
  const abrirPasta = useProdutosStore((s) => s.abrirPasta);
  const abrirDocumento = useProdutosStore((s) => s.abrirDocumento);
  const produtos = useProdutosStore((s) => s.produtos);
  // Consulta produto.temDocumento (store atualizado) em vez de item.produtoFilhoTemDocumento
  // (snapshot do bomFlat que pode estar defasado).
  const produto = produtos.find((p) => p.id === item.produtoFilhoId);
  const temDoc = produto?.temDocumento ?? item.produtoFilhoTemDocumento ?? false;
  if (!temDoc) return <span className="text-muted-foreground">-</span>;

  return (
    <div className="flex items-center justify-center gap-0.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" onClick={async (e) => {
            e.stopPropagation();
            try { await abrirPasta(item.produtoFilhoId); }
            catch (err: any) { toast.error(err?.body?.erro || err?.message || 'Erro ao abrir pasta'); }
          }} className="inline-flex items-center justify-center h-6 w-6 rounded transition-colors text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 cursor-pointer">
            <FolderOpen className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent><p>Abrir pasta</p></TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" onClick={async (e) => {
            e.stopPropagation();
            try { await abrirDocumento(item.produtoFilhoId, extensao || 'pdf'); }
            catch (err: any) { toast.error(err?.body?.erro || err?.message || 'Erro ao abrir documento'); }
          }} className="inline-flex items-center justify-center h-6 w-6 rounded transition-colors text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer">
            <FileText className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent><p>Abrir documento</p></TooltipContent>
      </Tooltip>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export function BOMPage({ tab }: BOMPageProps) {
  const formRef = useRef<BOMFormHandle>(null);
  const page = usePageMode<BomItem>(tab.id, (item) => String(item.id), tab.type);

  const [busca, setBusca] = useTabState<string>(tab.id + '-busca', '');

  // Lista flat via endpoint server-side
  const { itens, total, totalGeral, hasMore, isLoading, error, carregarMais, refetch } = useGridQuery<BomItem>({
    endpoint: '/api/engenharia/Bom/flat/buscar',
    tabId: tab.id,
    colunasBuscaInicial: DEFAULT_SEARCH_COLS,
  });

  useEffect(() => { if (error) toast.error(error); }, [error]);

  // Stores complementares (mutações + cache de produtos pra DocButtons + lista de pais)
  const produtosComEstrutura = useBOMStore((s) => s.produtosComEstrutura);
  const fetchProdutosPai = useBOMStore((s) => s.fetchProdutosPai);
  const deleteEstrutura = useBOMStore((s) => s.deleteEstrutura);
  const produtos = useProdutosStore((s) => s.produtos);
  const fetchProdutos = useProdutosStore((s) => s.fetchProdutos);

  // Miniaturas (compartilhado flat/tree)
  const thumbsEnabled = useBomThumbsStore((s) => s.enabled);
  const thumbHeight = useBomThumbsStore((s) => s.thumbHeight);
  const produtosById = useMemo(() => new Map(produtos.map((p) => [p.id, p])), [produtos]);
  const [preview, setPreview] = useTabState<
    { produtoId: number; codigo: string; descricao: string; temPasta: boolean; temDocumento: boolean } | null
  >(tab.id + '-bom-preview', null);

  useEffect(() => {
    if (produtosComEstrutura.length === 0) fetchProdutosPai();
    if (produtos.length === 0) fetchProdutos();
  }, [produtosComEstrutura.length, fetchProdutosPai, produtos.length, fetchProdutos]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // ── Delete estrutura completa ───────────────────────────────────────────────
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<BomItem | null>(null);

  /** Conta filhos diretos do pai selecionado dentro do que está carregado. */
  const deleteFilhosCount = useMemo(() => {
    if (!deleteItem) return 0;
    return itens.filter((b) => b.produtoPaiId === deleteItem.produtoPaiId).length;
  }, [deleteItem, itens]);

  const handleRequestDelete = useCallback((item: BomItem) => {
    setDeleteItem(item);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteItem) return;
    try {
      await deleteEstrutura(deleteItem.produtoPaiId);
      toast.success(`Estrutura de ${deleteItem.produtoPaiCodigo || 'produto'} excluída.`);
      setDeleteDialogOpen(false);
      setDeleteItem(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.body?.erro || err?.message || 'Erro ao excluir estrutura');
    }
  }, [deleteItem, deleteEstrutura, refetch]);

  // ── List state (cards/UI) ───────────────────────────────────────────────────
  const list = useListState<BomItem>({
    tabId: tab.id, data: itens, searchColumns: SEARCH_COLUMNS,
    defaultSearchCols: DEFAULT_SEARCH_COLS,
  });

  const handleSave = useCallback(async () => {
    toast.success('Estrutura salva.');
    refetch();
    await fetchProdutosPai();
  }, [fetchProdutosPai, refetch]);

  const handleNew = useCallback(() => { setDialogOpen(true); }, []);

  const handleEstruturaCreated = useCallback((codigoProduto: string) => {
    setDialogOpen(false);
    page.openEdit({ id: -1, produtoPaiCodigo: codigoProduto } as BomItem);
  }, [page]);

  const pageOverride = useMemo(() => ({ ...page, openNew: handleNew }), [page, handleNew]);

  const codigoPai = page.editingItem?.produtoPaiCodigo || '';
  const extraTag = page.mode !== 'list' && codigoPai ? codigoPai : undefined;

  const columns: GridColumn<BomItem>[] = useMemo(() => [
    {
      key: 'produtoPaiDescricao', header: 'DESC. PAI', width: 670, minWidth: 150,
      render: (i) => <span className="font-semibold uppercase text-slate-800 dark:text-slate-200">{i.produtoPaiDescricao || '-'}</span>
    },
    {
      key: 'produtoPaiCodigo', header: 'CÓD. PAI', width: 220, minWidth: 130, contentAlign: 'center',
      render: (i) => <span className="font-mono font-semibold text-blue-900 dark:text-blue-300">{i.produtoPaiCodigo || '-'}</span>
    },
    {
      key: 'quantidade', header: 'QTDE', width: 100, minWidth: 70, contentAlign: 'right', filterType: 'number',
      render: (i) => <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatQtde(i.quantidade)}</span>
    },
    {
      key: 'produtoFilhoCodigo', header: 'CÓD. FILHO', width: 220, minWidth: 130, contentAlign: 'center',
      render: (i) => <span className="font-mono text-blue-900 dark:text-blue-300">{i.produtoFilhoCodigo || '-'}</span>
    },
    {
      key: 'produtoFilhoDescricao', header: 'DESC. FILHO', width: 670, minWidth: 150,
      render: (i) => <span className="font-semibold uppercase text-slate-800 dark:text-slate-200">{i.produtoFilhoDescricao || '-'}</span>
    },
    {
      key: 'produtoFilhoUnidade', header: 'UN', width: 80, minWidth: 60, contentAlign: 'center',
      filterType: 'checklist', filterOptions: UNIDADE_OPTIONS
    },
    {
      key: 'produtoFilhoTemDocumento', header: 'DOC.', width: 90, minWidth: 80, contentAlign: 'center', sortable: false,
      filterType: 'checklist', filterOptions: SIM_NAO_OPTIONS,
      render: (i) => {
        const produto = produtosById.get(i.produtoFilhoId);
        const temDoc = produto?.temDocumento ?? i.produtoFilhoTemDocumento ?? false;
        return (
          <BomDocCell
            produtoId={i.produtoFilhoId}
            temDocumento={temDoc}
            enabled={thumbsEnabled}
            thumbHeight={thumbHeight}
            codigo={i.produtoFilhoCodigo || ''}
            onPreview={() => setPreview({
              produtoId: i.produtoFilhoId,
              codigo: i.produtoFilhoCodigo || '',
              descricao: i.produtoFilhoDescricao || '',
              temPasta: produto?.temPasta ?? false,
              temDocumento: temDoc,
            })}
            buttons={<BomDocButtons item={i} extensao="pdf" />}
          />
        );
      },
    },
  ], [thumbsEnabled, thumbHeight, produtosById, setPreview]);

  // Altura variável: linha com PDF cresce; sem PDF fica padrão. Só quando ligado.
  const getRowHeight = useMemo(() => {
    if (!thumbsEnabled) return undefined;
    return (i: BomItem) => {
      const produto = produtosById.get(i.produtoFilhoId);
      const temDoc = produto?.temDocumento ?? i.produtoFilhoTemDocumento ?? false;
      return temDoc ? thumbHeight + 40 : 28;
    };
  }, [thumbsEnabled, thumbHeight, produtosById]);

  const inForm = page.mode !== 'list';

  // Botões extras: colapsar/expandir/exportar só no form; miniaturas sempre
  // (logo à esquerda da engrenagem, valendo pra flat e pra tree).
  const extraActions = (
    <div className="flex items-center gap-1">
      {inForm && (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8"
                onClick={() => formRef.current?.collapseAll()}>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Recolher todos</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8"
                onClick={() => formRef.current?.expandAll()}>
                <ChevronsDown className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Expandir todos</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8"
                onClick={() => setExportDialogOpen(true)}>
                <FileSpreadsheet className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Exportar para Excel</p></TooltipContent>
          </Tooltip>
        </>
      )}
      <BomThumbControls />
    </div>
  );

  return (
    <PageShell module="Engenharia" title="Estrutura de Produtos" mode={page.mode} extraTag={extraTag}
      hideFooter={page.mode === 'view'}
      headerRight={
        <PageActions
          page={pageOverride} activeItem={list.activeItem}
          onDelete={handleRequestDelete}
          lockMessage="Esta estrutura já está sendo editada em outra aba."
          searchColumns={SEARCH_COLUMNS}
          searchTerm={busca}
          onSearchChange={setBusca}
          searchSelectedColumns={list.searchCols}
          onSearchColumnsChange={list.setSearchCols}
          gridRef={list.gridRef}
          viewMode={list.viewMode} onViewModeChange={list.handleViewMode}
          formRef={formRef} hideButtons={['cards']}
          extraActions={extraActions}
          newTooltip="Nova estrutura" viewTooltip="Abrir estrutura"
          editTooltip="Editar estrutura" deleteTooltip="Excluir estrutura"
          noSelectionText="Selecione uma estrutura"
        />
      }
    >
      {!inForm && (
        <DataGrid
          ref={list.gridRef} tabId={tab.id} storageId="bom-flat"
          columns={columns} data={itens}
          serverSide total={total} totalGeral={totalGeral}
          hasMore={hasMore} onCarregarMais={carregarMais}
          getRowHeight={getRowHeight}
          loading={isLoading} loadingText="Carregando estruturas..."
          onSelect={(item) => list.setSelectedItem(item as BomItem | null)}
          onActivate={(item) => page.openView(item as BomItem)}
        />
      )}

      {inForm && (
        <BOMForm key={page.resetKey} ref={formRef}
          mode={page.mode as 'view' | 'new' | 'edit'}
          codigoPai={codigoPai} tabId={tab.id}
          onDirty={(dirty) => page.setDirty(dirty)} onSave={handleSave}
        />
      )}

      <NovaEstruturaDialog open={dialogOpen} onOpenChange={setDialogOpen} onEstruturaCreated={handleEstruturaCreated} />
      <BomDeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} item={deleteItem} quantidadeFilhos={deleteFilhosCount} onConfirm={handleConfirmDelete} />
      <ExportarBOMDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        codigoPai={codigoPai}
        getTreeNodes={() => (formRef.current?.getTreeNodes() ?? []) as never}
        hasDirtyChanges={formRef.current?.hasDirtyChanges() ?? false}
      />

      {preview && (
        <DocPreviewDialog
          open
          onOpenChange={(o) => { if (!o) setPreview(null); }}
          produtoId={preview.produtoId}
          codigo={preview.codigo}
          descricao={preview.descricao}
          temPasta={preview.temPasta}
          temDocumento={preview.temDocumento}
          extensao="pdf"
        />
      )}
    </PageShell>
  );
}
