/**
 * ProdutosPage.tsx — Página de produtos com modos list/view/new/edit
 *
 * Template: PageShell + PageActions + usePageMode
 * Hooks: useListState, useDeleteDialog
 * Extra: botão Varredura via extraActions do PageActions
 * Coluna DOC.: dois botões — abrir pasta (esq) e abrir documento (dir)
 *   DocButtons recebe prop extensao: se passada, abre direto; se não, lista extensões
 *
 * Filtros sincronizados: PanelFilters ↔ DataGrid via useTabState(tabId + '-filters')
 */

import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { Plus, ScanSearch, FolderOpen, FileText, FileX2, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import type { ColumnFiltersState } from '@tanstack/react-table';
import { useProdutosStore } from '@/stores/engenharia/produtosStore';
import { PageShell, usePageMode, PageActions } from '@/components/shared/PageShell';
import { DataGrid } from '@/components/shared/DataGrid';
import type { GridColumn } from '@/components/shared/DataGrid';
import { CardGrid } from '@/components/shared/CardGrid';
import type { SearchColumn } from '@/components/shared/SearchBar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/shared/AppTooltip';
import { useListState } from '@/hooks/useListState';
import { useTabState } from '@/hooks/useTabState';
import { useDeleteDialog } from '@/hooks/useDeleteDialog';
import { ProdutoDeleteDialog } from '@/components/engenharia/ProdutoDeleteDialog';
import { ProdutoForm } from '@/components/engenharia/ProdutoForm';
import type { ProdutoFormHandle } from '@/components/engenharia/ProdutoForm';
import type { Produto, ProdutoFormData } from '@/types/engenharia/produto.types';
import { PagePanel, PanelFilters } from '@/components/shared/PagePanel';
import type { PanelFilterColumn } from '@/components/shared/PagePanel';
import type { CompoundFilter } from '@/components/shared/DataGrid/types';
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

const UNIDADE_OPTIONS = [
  { label: 'Unidade', value: 'UN' },
  { label: 'Peça', value: 'PC' },
  { label: 'Conjunto', value: 'CJ' },
  { label: 'Quilograma', value: 'KG' },
  { label: 'Kit', value: 'KT' },
  { label: 'Metro', value: 'MT' },
  { label: 'Metro²', value: 'M2' },
  { label: 'Metro³', value: 'M3' },
  { label: 'Litro', value: 'LT' },
];

const SIM_NAO_OPTIONS = [
  { label: 'Sim', value: 'true' },
  { label: 'Não', value: 'false' },
];

// ─── Card ─────────────────────────────────────────────────────────────────────

function ProdutoCard({ produto }: { produto: Produto }) {
  return (
    <div className="p-3">
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

// ─── Botões DOC na coluna da grid ─────────────────────────────────────────────

function DocButtons({ produto, extensao }: { produto: Produto; extensao?: string }) {
  const abrirPasta = useProdutosStore((s) => s.abrirPasta);
  const extensoesDocumento = useProdutosStore((s) => s.extensoesDocumento);
  const abrirDocumento = useProdutosStore((s) => s.abrirDocumento);

  const [extOpen, setExtOpen] = useState(false);
  const [extensoes, setExtensoes] = useState<string[]>([]);

  const temPasta = (produto as any).temPasta ?? false;
  const temDoc = produto.temDocumento ?? false;

  if (!temPasta && !temDoc) {
    return <span className="text-muted-foreground">-</span>;
  }

  const handleAbrirPasta = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await abrirPasta(produto.id);
    } catch (err: any) {
      toast.error(err?.body?.erro || err?.message || 'Erro ao abrir pasta');
    }
  };

  const handleDocClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!temDoc) return;

    // Se passou extensão, abre direto
    if (extensao) {
      try {
        await abrirDocumento(produto.id, extensao);
      } catch (err: any) {
        toast.error(err?.body?.erro || err?.message || 'Erro ao abrir documento');
      }
      return;
    }

    // Sem extensão → busca lista e decide
    try {
      const result = await extensoesDocumento(produto.id);
      const exts = result.extensoes || [];

      if (exts.length === 0) {
        toast.error('Nenhum documento encontrado.');
        return;
      }

      if (exts.length === 1) {
        await abrirDocumento(produto.id, exts[0]);
        return;
      }

      setExtensoes(exts);
      setExtOpen(true);
    } catch (err: any) {
      toast.error(err?.body?.erro || err?.message || 'Erro ao buscar extensões');
    }
  };

  const handleAbrirExt = async (ext: string) => {
    setExtOpen(false);
    try {
      await abrirDocumento(produto.id, ext);
    } catch (err: any) {
      toast.error(err?.body?.erro || err?.message || 'Erro ao abrir documento');
    }
  };

  return (
    <div className="flex items-center justify-center gap-0.5">
      {/* Botão pasta */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleAbrirPasta}
            disabled={!temPasta}
            className={`inline-flex items-center justify-center h-6 w-6 rounded transition-colors ${temPasta
              ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 cursor-pointer'
              : 'text-muted-foreground/40 cursor-default'
              }`}
          >
            <FolderOpen className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{temPasta ? 'Abrir pasta' : 'Sem pasta'}</p>
        </TooltipContent>
      </Tooltip>

      {/* Botão documento */}
      {/* Botão documento */}
      {extensao ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleDocClick}
              disabled={!temDoc}
              className={`inline-flex items-center justify-center h-6 w-6 rounded transition-colors ${temDoc
                ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'
                : temPasta
                  ? 'text-muted-foreground/50 cursor-default'
                  : 'text-muted-foreground/40 cursor-default'
                }`}
            >
              {temDoc
                ? <FileText className="h-3.5 w-3.5" />
                : <FileX2 className="h-3.5 w-3.5" />
              }
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{temDoc ? 'Abrir documento' : temPasta ? 'Pasta sem documento' : 'Sem documento'}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <Popover open={extOpen} onOpenChange={setExtOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  onClick={handleDocClick}
                  disabled={!temDoc}
                  className={`inline-flex items-center justify-center h-6 w-6 rounded transition-colors ${temDoc
                    ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'
                    : temPasta
                      ? 'text-muted-foreground/50 cursor-default'
                      : 'text-muted-foreground/40 cursor-default'
                    }`}
                >
                  {temDoc
                    ? <FileText className="h-3.5 w-3.5" />
                    : <FileX2 className="h-3.5 w-3.5" />
                  }
                </button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>{temDoc ? 'Abrir documento' : temPasta ? 'Pasta sem documento' : 'Sem documento'}</p>
            </TooltipContent>
          </Tooltip>
          <PopoverContent className="w-auto p-1" align="center">
            <div className="flex flex-col">
              <p className="px-2 py-1 text-[10px] text-muted-foreground uppercase tracking-wider">Extensão</p>
              {extensoes.map((ext) => (
                <button
                  key={ext}
                  type="button"
                  onClick={() => handleAbrirExt(ext)}
                  className="px-3 py-1.5 text-xs text-left hover:bg-muted rounded transition-colors font-mono"
                >
                  .{ext}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export function ProdutosPage({ tab }: ProdutosPageProps) {
  const formRef = useRef<ProdutoFormHandle>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  // ─── Filtros sincronizados (mesma key que o DataGrid usa internamente) ─────
  const [columnFilters, setColumnFilters] = useTabState<ColumnFiltersState>(tab.id + '-filters', []);

  const panelFilterValues = useMemo(() => {
    const rec: Record<string, CompoundFilter> = {};
    columnFilters.forEach(f => { rec[f.id] = f.value as CompoundFilter; });
    return rec;
  }, [columnFilters]);

  const handlePanelFilterChange = useCallback((values: Record<string, CompoundFilter>) => {
    const next: ColumnFiltersState = Object.entries(values).map(([id, value]) => ({ id, value }));
    setColumnFilters(next);
  }, [setColumnFilters]);

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
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8"
            onClick={() => varreduraDocumentos()}>
            <ScanSearch className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent><p>Varredura de documentos</p></TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8"
            onClick={() => setPanelOpen(true)}>
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent><p>Filtros</p></TooltipContent>
      </Tooltip>
    </>
  ), [varreduraDocumentos]);

  // ─── Colunas ──────────────────────────────────────────────────────────────────

  const columns: GridColumn<Produto>[] = useMemo(() => [
    {
      key: 'codigo', header: 'CÓDIGO', width: 130, minWidth: 130, contentAlign: 'center',
      render: (p) => <span className="font-mono font-medium">{p.codigo}</span>,
    },
    {
      key: 'descricao', header: 'DESCRIÇÃO', width: 250, minWidth: 200,
      render: (p) => (<span className="font-medium">{p.descricao}</span>),
    },
    {
      key: 'tipo', header: 'TIPO', width: 130, minWidth: 110,
      filterType: 'checklist', filterOptions: TIPO_OPTIONS, contentAlign: 'center',
      render: (p) => TIPO_PRODUTO_LABELS[p.tipo] || p.tipo,
    },
    {
      key: 'unidade', header: 'UN', width: 75, minWidth: 65, contentAlign: 'center',
      filterType: 'checklist', filterOptions: UNIDADE_OPTIONS
    },
    {
      key: 'peso', header: 'PESO (KG)', width: 80, minWidth: 70,
      filterType: 'number', contentAlign: 'right',
      render: (p) => p.peso ? p.peso.toFixed(2) : '-',
    },
    {
      key: 'temDocumento', header: 'DOC.', width: 90, minWidth: 80,
      filterType: 'checklist', filterOptions: SIM_NAO_OPTIONS, contentAlign: 'center',
      sortable: false,
      render: (p) => <DocButtons produto={p} extensao="pdf" />,
    },
    {
      key: 'ativo', header: 'ATIVO', width: 80, minWidth: 80,
      filterType: 'checklist', filterOptions: SIM_NAO_OPTIONS, contentAlign: 'center',
      render: (p) => p.ativo ? 'Sim' : 'Não',
    },
  ], []);

  // ─── Render ───────────────────────────────────────────────────────────────────

  const panelFilterColumns: PanelFilterColumn[] = useMemo(() => [
    { key: 'codigo', header: 'CÓDIGO', filterType: 'text' },
    { key: 'descricao', header: 'DESCRIÇÃO', filterType: 'text' },
    { key: 'tipo', header: 'TIPO', filterType: 'checklist', filterOptions: TIPO_OPTIONS },
    { key: 'unidade', header: 'UN', filterType: 'checklist', filterOptions: UNIDADE_OPTIONS },
    { key: 'peso', header: 'PESO (KG)', filterType: 'number' },
    { key: 'temDocumento', header: 'DOC.', filterType: 'checklist', filterOptions: SIM_NAO_OPTIONS },
    { key: 'ativo', header: 'ATIVO', filterType: 'checklist', filterOptions: SIM_NAO_OPTIONS },
  ], []);

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

      {/* Grid e Cards sempre montados — alterna visibilidade */}
      <div style={{ display: !inForm && list.isListMode ? 'contents' : 'none' }}>
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
      </div>
      <div style={{ display: !inForm && !list.isListMode ? 'contents' : 'none' }}>
        <CardGrid
          ref={list.cardGridRef} data={list.filtrados} selectedId={list.selectedCardId}
          cardHeight={90}
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
      </div>

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

      <PagePanel open={panelOpen} onClose={() => setPanelOpen(false)} title="Filtros">
        <PanelFilters filters={panelFilterColumns} values={panelFilterValues} onChange={handlePanelFilterChange} />
      </PagePanel>

    </PageShell>
  );
}
