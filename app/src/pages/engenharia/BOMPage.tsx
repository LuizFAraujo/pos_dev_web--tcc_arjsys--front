/**
 * BOMPage.tsx — Estrutura de Produtos (BOM)
 *
 * Fase 1: Flat view com DataGrid template + PageShell + usePageMode
 *
 * Modos:
 *   list — DataGrid com todas as relações flat (pai → filho)
 *   view — TreeView de um produto pai selecionado (tag com código)
 *
 * SearchBar: busca por código pai, código filho, descrição pai, descrição filho
 * Coluna DOC.: botões pasta/documento como ProdutosPage
 * Duplo clique ou Enter na grid → abre tree em view mode
 * Botão + do template → abre NovaEstruturaDialog
 * Tree view mantida como está (BOMTreeView) — refatoração na Fase 2
 */

import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { FolderOpen, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useBOMStore } from '@/stores/engenharia/bomStore';
import { useProdutosStore } from '@/stores/engenharia/produtosStore';
import { PageShell, usePageMode, PageActions } from '@/components/shared/PageShell';
import { DataGrid } from '@/components/shared/DataGrid';
import type { GridColumn } from '@/components/shared/DataGrid';
import type { SearchColumn } from '@/components/shared/SearchBar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/shared/AppTooltip';
import { useListState } from '@/hooks/useListState';
import { useTabState } from '@/hooks/useTabState';
import { BOMTreeView } from '@/components/engenharia/BOMTreeView';
import { NovaEstruturaDialog } from '@/components/engenharia/NovaEstruturaDialog';
import type { BomItem } from '@/types/engenharia/bom.types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface BOMPageProps {
  tab: { id: string; type: string; title: string };
}

// ─── Search ───────────────────────────────────────────────────────────────────

const SEARCH_COLUMNS: SearchColumn[] = [
  { key: 'produtoPaiCodigo', label: 'Código Pai' },
  { key: 'produtoPaiDescricao', label: 'Descrição Pai' },
  { key: 'produtoFilhoCodigo', label: 'Código Filho' },
  { key: 'produtoFilhoDescricao', label: 'Descrição Filho' },
];

const UNIDADE_OPTIONS = [
  { label: 'Unidade', value: 'UN' },
  { label: 'Peça', value: 'PC' },
  { label: 'Conjunto', value: 'CJ' },
  { label: 'Quilograma', value: 'KG' },
  { label: 'Kit', value: 'KT' },
  { label: 'Metro', value: 'MT' },
];

const SIM_NAO_OPTIONS = [
  { label: 'Sim', value: 'true' },
  { label: 'Não', value: 'false' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatQtde(q: number) {
  return q.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

// ─── Botões DOC (mesmo padrão da ProdutosPage) ───────────────────────────────

function BomDocButtons({ item, extensao }: { item: BomItem; extensao?: string }) {
  const abrirPasta = useProdutosStore((s) => s.abrirPasta);
  const extensoesDocumento = useProdutosStore((s) => s.extensoesDocumento);
  const abrirDocumento = useProdutosStore((s) => s.abrirDocumento);

  const [extOpen, setExtOpen] = useState(false);
  const [extensoes, setExtensoes] = useState<string[]>([]);

  const temDoc = item.produtoFilhoTemDocumento ?? false;

  if (!temDoc) {
    return <span className="text-muted-foreground">-</span>;
  }

  const handleAbrirPasta = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await abrirPasta(item.produtoFilhoId);
    } catch (err: any) {
      toast.error(err?.body?.erro || err?.message || 'Erro ao abrir pasta');
    }
  };

  const handleDocClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (extensao) {
      try {
        await abrirDocumento(item.produtoFilhoId, extensao);
      } catch (err: any) {
        toast.error(err?.body?.erro || err?.message || 'Erro ao abrir documento');
      }
      return;
    }

    try {
      const result = await extensoesDocumento(item.produtoFilhoId);
      const exts = result.extensoes || [];

      if (exts.length === 0) {
        toast.error('Nenhum documento encontrado.');
        return;
      }

      if (exts.length === 1) {
        await abrirDocumento(item.produtoFilhoId, exts[0]);
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
      await abrirDocumento(item.produtoFilhoId, ext);
    } catch (err: any) {
      toast.error(err?.body?.erro || err?.message || 'Erro ao abrir documento');
    }
  };

  return (
    <div className="flex items-center justify-center gap-0.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleAbrirPasta}
            className="inline-flex items-center justify-center h-6 w-6 rounded transition-colors text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 cursor-pointer"
          >
            <FolderOpen className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent><p>Abrir pasta</p></TooltipContent>
      </Tooltip>

      {extensao ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleDocClick}
              className="inline-flex items-center justify-center h-6 w-6 rounded transition-colors text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent><p>Abrir documento</p></TooltipContent>
        </Tooltip>
      ) : (
        <Popover open={extOpen} onOpenChange={setExtOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  onClick={handleDocClick}
                  className="inline-flex items-center justify-center h-6 w-6 rounded transition-colors text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5" />
                </button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent><p>Abrir documento</p></TooltipContent>
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

// ─── Constante do ESC duplo ───────────────────────────────────────────────────

const ESC_INTERVAL_MS = 450;

// ─── Página ───────────────────────────────────────────────────────────────────

export function BOMPage({ tab }: BOMPageProps) {

  // ── Store BOM ─────────────────────────────────────────────────────────────
  const bomFlat = useBOMStore((s) => s.bomFlat);
  const isLoading = useBOMStore((s) => s.isLoading);
  const error = useBOMStore((s) => s.error);
  const fetchBomFlat = useBOMStore((s) => s.fetchBomFlat);
  const produtosComEstrutura = useBOMStore((s) => s.produtosComEstrutura);
  const fetchProdutosPai = useBOMStore((s) => s.fetchProdutosPai);

  useEffect(() => {
    if (bomFlat.length === 0) fetchBomFlat();
    if (produtosComEstrutura.length === 0) fetchProdutosPai();
  }, [bomFlat.length, fetchBomFlat, produtosComEstrutura.length, fetchProdutosPai]);

  useEffect(() => { if (error) toast.error(error); }, [error]);

  // ── usePageMode (list = flat, view = tree) ────────────────────────────────

  const page = usePageMode<BomItem>(tab.id, (item) => String(item.id), tab.type);

  // ── NovaEstruturaDialog (controlado pela página, aberto pelo botão + do template) ──
  const [dialogOpen, setDialogOpen] = useState(false);

  // ── Estado da tree (preservado do original) ───────────────────────────────
  const [codigoPaiFocus, setCodigoPaiFocus] = useTabState<string>(tab.id + '-bom-focus', '');
  const [expandedProducts, setExpandedProducts] = useTabState<string[]>(tab.id + '-products', []);
  const [expandedItems, setExpandedItems] = useTabState<Record<string, string[]>>(tab.id + '-items', {});
  const [isDirty, setIsDirty] = useTabState<boolean>(tab.id + '-dirty', false);
  const [clearFiltersFlag] = useTabState<number>(tab.id + '-clear', 0);

  const lastEscTimeRef = useRef<number>(0);

  // ── Lista (flat view) ─────────────────────────────────────────────────────
  const list = useListState<BomItem>({
    tabId: tab.id,
    data: bomFlat,
    searchColumns: SEARCH_COLUMNS,
    defaultSearchCols: ['produtoPaiCodigo', 'produtoFilhoCodigo'],
  });

  // ── Navegação flat → tree ─────────────────────────────────────────────────

  const openTreeForPai = useCallback((codigoPai: string) => {
    setCodigoPaiFocus(codigoPai);
    if (!expandedProducts.includes(codigoPai)) {
      setExpandedProducts([codigoPai]);
    }
    lastEscTimeRef.current = 0;
    page.openView({ id: -1 } as BomItem);
  }, [setCodigoPaiFocus, expandedProducts, setExpandedProducts, page]);

  const closeTree = useCallback(() => {
    page.requestBack();
    lastEscTimeRef.current = 0;
  }, [page]);

  const requestCloseTree = useCallback(() => {
    if (!isDirty) {
      closeTree();
      return;
    }
    const ok = window.confirm('Existem alterações pendentes. Sair sem salvar?');
    if (!ok) return;
    setIsDirty(false);
    closeTree();
  }, [isDirty, closeTree, setIsDirty]);

  const handleEstruturaCreated = useCallback((codigoProduto: string) => {
    setDialogOpen(false);
    openTreeForPai(codigoProduto);
  }, [openTreeForPai]);

  // ── Abrir tree ao ativar item no grid (Enter / duplo clique) ──────────────

  const handleActivate = useCallback((item: BomItem) => {
    const codigo = item.produtoPaiCodigo;
    if (codigo) openTreeForPai(codigo);
  }, [openTreeForPai]);

  // ── Interceptar botão + do template → abrir dialog ────────────────────────

  const handleNew = useMemo(() => {
    // Override do openNew: em vez de ir pro mode 'new', abre o dialog
    const original = page.openNew;
    return () => {
      setDialogOpen(true);
    };
  }, []);

  // ── Tree: toggle expand ───────────────────────────────────────────────────

  const toggleProduct = useCallback((codigo: string) => {
    setExpandedProducts((prev) =>
      prev.includes(codigo) ? prev.filter((c) => c !== codigo) : [...prev, codigo]
    );
  }, [setExpandedProducts]);

  const toggleItem = useCallback((produtoPai: string, codigoItem: string) => {
    setExpandedItems((prev) => {
      const currentItems = prev[produtoPai] || [];
      const isExpanded = currentItems.includes(codigoItem);
      return {
        ...prev,
        [produtoPai]: isExpanded
          ? currentItems.filter((c) => c !== codigoItem)
          : [...currentItems, codigoItem],
      };
    });
  }, [setExpandedItems]);

  // ── Double ESC pra fechar tree ────────────────────────────────────────────

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (page.mode !== 'view') return;
      if (e.key !== 'Escape') {
        lastEscTimeRef.current = 0;
        return;
      }
      const now = Date.now();
      const delta = now - lastEscTimeRef.current;
      if (delta > ESC_INTERVAL_MS) {
        lastEscTimeRef.current = now;
        const el = document.activeElement as HTMLElement | null;
        if (el?.blur) el.blur();
        return;
      }
      lastEscTimeRef.current = 0;
      requestCloseTree();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [page.mode, requestCloseTree]);

  // ── Fallback: se abriu tree sem código ────────────────────────────────────

  useEffect(() => {
    if (page.mode !== 'view') return;
    if (codigoPaiFocus) return;
    const fallback = produtosComEstrutura?.[0];
    if (fallback) openTreeForPai(fallback);
    else closeTree();
  }, [page.mode, codigoPaiFocus, produtosComEstrutura, openTreeForPai, closeTree]);

  // ── PageMode com openNew interceptado ─────────────────────────────────────

  const pageOverride = useMemo(() => ({
    ...page,
    openNew: handleNew,
  }), [page, handleNew]);

  // ── Colunas do DataGrid (flat) ────────────────────────────────────────────

  const columns: GridColumn<BomItem>[] = useMemo(() => [
    {
      key: 'produtoPaiDescricao', header: 'DESC. PAI', width: 280, minWidth: 150,
      render: (item) => (
        <span className="font-semibold uppercase text-slate-800 dark:text-slate-200">
          {item.produtoPaiDescricao || '-'}
        </span>
      ),
    },
    {
      key: 'produtoPaiCodigo', header: 'CÓD. PAI', width: 180, minWidth: 130,
      contentAlign: 'center',
      render: (item) => (
        <span className="font-mono font-semibold text-blue-900 dark:text-blue-300">
          {item.produtoPaiCodigo || '-'}
        </span>
      ),
    },
    {
      key: 'quantidade', header: 'QTDE', width: 100, minWidth: 70,
      contentAlign: 'right', filterType: 'number',
      render: (item) => (
        <span className="font-bold text-emerald-700 dark:text-emerald-400">
          {formatQtde(item.quantidade)}
        </span>
      ),
    },
    {
      key: 'produtoFilhoCodigo', header: 'CÓD. FILHO', width: 180, minWidth: 130,
      contentAlign: 'center',
      render: (item) => (
        <span className="font-mono text-blue-900 dark:text-blue-300">
          {item.produtoFilhoCodigo || '-'}
        </span>
      ),
    },
    {
      key: 'produtoFilhoDescricao', header: 'DESC. FILHO', width: 280, minWidth: 150,
      render: (item) => (
        <span className="font-semibold uppercase text-slate-800 dark:text-slate-200">
          {item.produtoFilhoDescricao || '-'}
        </span>
      ),
    },
    {
      key: 'produtoFilhoUnidade', header: 'UN', width: 70, minWidth: 60,
      contentAlign: 'center',
      filterType: 'checklist', filterOptions: UNIDADE_OPTIONS,
    },
    {
      key: 'produtoFilhoTemDocumento', header: 'DOC.', width: 90, minWidth: 80,
      contentAlign: 'center', sortable: false,
      filterType: 'checklist', filterOptions: SIM_NAO_OPTIONS,
      render: (item) => <BomDocButtons item={item} extensao="pdf" />,
    },
  ], []);

  // ── Tag dinâmica ──────────────────────────────────────────────────────────

  const tag = page.mode === 'view' && codigoPaiFocus ? codigoPaiFocus : undefined;

  // ── Render ────────────────────────────────────────────────────────────────

  const inTree = page.mode === 'view';

  return (
    <PageShell
      module="Engenharia"
      title="Estrutura de Produtos"
      mode={page.mode === 'view' ? 'view' : undefined}
      tag={tag}
      headerRight={
        <PageActions
          page={pageOverride}
          activeItem={list.activeItem}
          lockMessage="Esta estrutura já está sendo visualizada em outra aba."
          searchColumns={SEARCH_COLUMNS}
          searchTerm={list.searchTerm}
          onSearchChange={list.setSearchTerm}
          searchSelectedColumns={list.searchCols}
          onSearchColumnsChange={list.setSearchCols}
          gridRef={list.gridRef}
          viewMode={list.viewMode}
          onViewModeChange={list.handleViewMode}
          hideButtons={['edit', 'delete', 'cards']}
          newTooltip="Nova estrutura"
          viewTooltip="Abrir estrutura"
          noSelectionText="Selecione uma relação"
        />
      }
    >

      {/* ── Flat view (list mode) ────────────────────────────────────────── */}
      {!inTree && (
        <DataGrid
          ref={list.gridRef} tabId={tab.id} storageId="bom-flat"
          columns={columns} data={list.filtrados}
          loading={isLoading} loadingText="Carregando estruturas..."
          emptyTitle="Nenhuma estrutura encontrada" emptyDescription="Crie a primeira estrutura"
          onSelect={(item) => list.setSelectedItem(item as BomItem | null)}
          onActivate={(item) => handleActivate(item as BomItem)}
        />
      )}

      {/* ── Tree view (view mode) ────────────────────────────────────────── */}
      {inTree && (
        <BOMTreeView
          expandedProducts={expandedProducts}
          expandedItems={expandedItems}
          onToggleProduct={toggleProduct}
          onToggleItem={toggleItem}
          clearFiltersFlag={clearFiltersFlag}
          codigoPaiFocus={codigoPaiFocus || undefined}
        />
      )}

      {/* ── Dialog Nova Estrutura (controlado pela página) ───────────────── */}
      <NovaEstruturaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onEstruturaCreated={handleEstruturaCreated}
      />

    </PageShell>
  );
}
