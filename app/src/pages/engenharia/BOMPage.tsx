/**
 * BOMPage.tsx — Estrutura de Produtos (BOM)
 *
 * IGUAL ClientesPage:
 *   - mode={page.mode} SEMPRE
 *   - formRef pro PageActions
 *   - codigoPai derivado de page.editingItem (não estado separado)
 *   - list: DataGrid flat
 *   - view/edit: BOMForm inline (tree)
 *   - new: dialog autocomplete → edit
 *   - extraTag: código do produto
 */

import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { Plus, FolderOpen, FileText } from 'lucide-react';
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
import { useDeleteDialog } from '@/hooks/useDeleteDialog';
import { BOMForm } from '@/components/engenharia/BOMForm';
import type { BOMFormHandle } from '@/components/engenharia/BOMForm';
import { NovaEstruturaDialog } from '@/components/engenharia/NovaEstruturaDialog';
import { BomDeleteDialog } from '@/components/engenharia/BomDeleteDialog';
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
  const temDoc = item.produtoFilhoTemDocumento ?? false;
  if (!temDoc) return <span className="text-muted-foreground">-</span>;

  const handleAbrirPasta = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try { await abrirPasta(item.produtoFilhoId); }
    catch (err: any) { toast.error(err?.body?.erro || err?.message || 'Erro ao abrir pasta'); }
  };

  const handleDocClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try { await abrirDocumento(item.produtoFilhoId, extensao || 'pdf'); }
    catch (err: any) { toast.error(err?.body?.erro || err?.message || 'Erro ao abrir documento'); }
  };

  return (
    <div className="flex items-center justify-center gap-0.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" onClick={handleAbrirPasta}
            className="inline-flex items-center justify-center h-6 w-6 rounded transition-colors text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 cursor-pointer">
            <FolderOpen className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent><p>Abrir pasta</p></TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" onClick={handleDocClick}
            className="inline-flex items-center justify-center h-6 w-6 rounded transition-colors text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer">
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

  // ── Store ─────────────────────────────────────────────────────────────────
  const bomFlat = useBOMStore((s) => s.bomFlat);
  const isLoading = useBOMStore((s) => s.isLoading);
  const error = useBOMStore((s) => s.error);
  const fetchBomFlat = useBOMStore((s) => s.fetchBomFlat);
  const produtosComEstrutura = useBOMStore((s) => s.produtosComEstrutura);
  const fetchProdutosPai = useBOMStore((s) => s.fetchProdutosPai);
  const deleteBomItem = useBOMStore((s) => s.deleteBomItem);

  useEffect(() => {
    if (bomFlat.length === 0) fetchBomFlat();
    if (produtosComEstrutura.length === 0) fetchProdutosPai();
  }, [bomFlat.length, fetchBomFlat, produtosComEstrutura.length, fetchProdutosPai]);

  useEffect(() => { if (error) toast.error(error); }, [error]);

  const [dialogOpen, setDialogOpen] = useState(false);

  // ── Lista ─────────────────────────────────────────────────────────────────
  const list = useListState<BomItem>({
    tabId: tab.id, data: bomFlat, searchColumns: SEARCH_COLUMNS,
    defaultSearchCols: ['produtoPaiCodigo', 'produtoFilhoCodigo'],
  });

  // ── Delete ────────────────────────────────────────────────────────────────
  const del = useDeleteDialog<BomItem>({
    onDelete: (item) => deleteBomItem(item.id),
    onAfterDelete: (item) => { if (item.id === list.selectedCardId) list.setSelectedCardId(null); },
    successMessage: 'Relação excluída.',
  });

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    toast.success('Estrutura salva.');
    await fetchBomFlat();
  }, [fetchBomFlat]);

  // ── Novo → dialog ─────────────────────────────────────────────────────────
  const handleNew = useCallback(() => { setDialogOpen(true); }, []);

  const handleEstruturaCreated = useCallback((codigoProduto: string) => {
    setDialogOpen(false);
    // Cria um BomItem fake com o código pai pra openEdit usar
    page.openEdit({ id: -1, produtoPaiCodigo: codigoProduto } as BomItem);
  }, [page]);

  // ── Override openNew ──────────────────────────────────────────────────────
  const pageOverride = useMemo(() => ({ ...page, openNew: handleNew }), [page, handleNew]);

  // ── codigoPai derivado do editingItem (não estado separado) ───────────────
  const codigoPai = page.editingItem?.produtoPaiCodigo || '';

  // ── extraTag: código do produto nos modos view/edit ───────────────────────
  const extraTag = page.mode !== 'list' && codigoPai ? codigoPai : undefined;

  // ── Colunas ───────────────────────────────────────────────────────────────
  const columns: GridColumn<BomItem>[] = useMemo(() => [
    { key: 'produtoPaiDescricao', header: 'DESC. PAI', width: 280, minWidth: 150,
      render: (i) => <span className="font-semibold uppercase text-slate-800 dark:text-slate-200">{i.produtoPaiDescricao || '-'}</span> },
    { key: 'produtoPaiCodigo', header: 'CÓD. PAI', width: 180, minWidth: 130, contentAlign: 'center',
      render: (i) => <span className="font-mono font-semibold text-blue-900 dark:text-blue-300">{i.produtoPaiCodigo || '-'}</span> },
    { key: 'quantidade', header: 'QTDE', width: 100, minWidth: 70, contentAlign: 'right', filterType: 'number',
      render: (i) => <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatQtde(i.quantidade)}</span> },
    { key: 'produtoFilhoCodigo', header: 'CÓD. FILHO', width: 180, minWidth: 130, contentAlign: 'center',
      render: (i) => <span className="font-mono text-blue-900 dark:text-blue-300">{i.produtoFilhoCodigo || '-'}</span> },
    { key: 'produtoFilhoDescricao', header: 'DESC. FILHO', width: 280, minWidth: 150,
      render: (i) => <span className="font-semibold uppercase text-slate-800 dark:text-slate-200">{i.produtoFilhoDescricao || '-'}</span> },
    { key: 'produtoFilhoUnidade', header: 'UN', width: 70, minWidth: 60, contentAlign: 'center',
      filterType: 'checklist', filterOptions: UNIDADE_OPTIONS },
    { key: 'produtoFilhoTemDocumento', header: 'DOC.', width: 90, minWidth: 80, contentAlign: 'center', sortable: false,
      filterType: 'checklist', filterOptions: SIM_NAO_OPTIONS,
      render: (i) => <BomDocButtons item={i} extensao="pdf" /> },
  ], []);

  // ── Render ────────────────────────────────────────────────────────────────
  const inForm = page.mode !== 'list';

  return (
    <PageShell module="Engenharia" title="Estrutura de Produtos" mode={page.mode} extraTag={extraTag}
      headerRight={
        <PageActions
          page={pageOverride} activeItem={list.activeItem}
          onDelete={del.requestDelete}
          lockMessage="Esta estrutura já está sendo editada em outra aba."
          searchColumns={SEARCH_COLUMNS} searchTerm={list.searchTerm}
          onSearchChange={list.setSearchTerm} searchSelectedColumns={list.searchCols}
          onSearchColumnsChange={list.setSearchCols} gridRef={list.gridRef}
          viewMode={list.viewMode} onViewModeChange={list.handleViewMode}
          formRef={formRef} hideButtons={['cards']}
          newTooltip="Nova estrutura" viewTooltip="Abrir estrutura"
          editTooltip="Editar estrutura" deleteTooltip="Excluir relação"
          noSelectionText="Selecione uma relação"
        />
      }
    >
      {!inForm && (
        <DataGrid
          ref={list.gridRef} tabId={tab.id} storageId="bom-flat"
          columns={columns} data={list.filtrados}
          loading={isLoading} loadingText="Carregando estruturas..."
          emptyTitle="Nenhuma estrutura encontrada" emptyDescription="Crie a primeira estrutura"
          onSelect={(item) => list.setSelectedItem(item as BomItem | null)}
          onActivate={(item) => page.openView(item as BomItem)}
          emptyAction={<Button onClick={handleNew}><Plus className="mr-2 h-4 w-4" /> Criar Primeira</Button>}
        />
      )}

      {inForm && (
        <BOMForm key={page.resetKey} ref={formRef}
          mode={page.mode as 'view' | 'new' | 'edit'}
          codigoPai={codigoPai} tabId={tab.id}
          onDirty={() => page.setDirty(true)} onSave={handleSave}
        />
      )}

      <NovaEstruturaDialog open={dialogOpen} onOpenChange={setDialogOpen} onEstruturaCreated={handleEstruturaCreated} />
      <BomDeleteDialog open={del.open} onOpenChange={del.setOpen} item={del.item} onConfirm={del.confirmDelete} />
    </PageShell>
  );
}
