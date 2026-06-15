/**
 * ProdutosPage.tsx - Página de produtos com modos list/view/new/edit
 *
 * Template: PageShell + PageActions + usePageMode
 * Hooks: useListState, useDeleteDialog
 * Extra: botão Varredura via extraActions do PageActions
 * Coluna DOC.: DocButtons compartilhado (abrir pasta / abrir documento no servidor).
 *
 * Visão Cards: barra de controles (CardViewBar) + cards com miniatura do PDF.
 *   - Miniatura clicada abre o modal de prévia (DocPreviewDialog, documento original).
 *   - Preferências (com/sem imagem, largura, altura, cadeado) no cardViewStore.
 *
 * Filtros sincronizados: PanelFilters ↔ DataGrid ↔ CardGrid via useTabState(tabId + '-filters')
 * CardGrid recebe dados já filtrados por applyColumnFilters (filterEngine.ts)
 * ListFooter unificado via prop footer do PageShell (modo list)
 */

import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { FileX2, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import type { ColumnFiltersState } from '@tanstack/react-table';
import { useProdutosStore } from '@/stores/engenharia/produtosStore';
import { useCardViewStore, fatorProporcao } from '@/stores/engenharia/cardViewStore';
import { PageShell, usePageMode, PageActions } from '@/components/shared/PageShell';
import { DataGrid } from '@/components/shared/DataGrid';
import type { GridColumn } from '@/components/shared/DataGrid';
import { CardGrid } from '@/components/shared/CardGrid';
import { DocButtons } from '@/components/shared/DocButtons';
import { DocPreviewDialog } from '@/components/shared/DocPreviewDialog';
import type { SearchColumn } from '@/components/shared/SearchBar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/shared/AppTooltip';
import { useListState } from '@/hooks/useListState';
import { useTabState } from '@/hooks/useTabState';
import { useDeleteDialog } from '@/hooks/useDeleteDialog';
import { useGridQuery } from '@/hooks/useGridQuery';
import { thumbnailUrl } from '@/lib/api';
import { ProdutoDeleteDialog } from '@/components/engenharia/ProdutoDeleteDialog';
import { ProdutoForm } from '@/components/engenharia/ProdutoForm';
import type { ProdutoFormHandle } from '@/components/engenharia/ProdutoForm';
import { ProdutoConfigPanel } from '@/components/engenharia/ProdutoConfigPanel';
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

interface ProdutoCardProps {
  produto: Produto;
  /** Modo com imagem (miniatura) ligado. */
  comImagem: boolean;
  /** Altura da área da miniatura, em px (usada quando sem proporção fixa). */
  altura: number;
  /** Fator largura/altura da proporção fixa (A4/travada), ou null quando livre. */
  fator: number | null;
  /** Abre o modal de prévia ampliada. */
  onPreview: () => void;
}

function ProdutoCard({ produto, comImagem, altura, fator, onPreview }: ProdutoCardProps) {
  const temPasta = (produto as any).temPasta ?? false;
  const temDoc = produto.temDocumento ?? false;

  // Sem imagem: só o rodapé, respeitando a altura do card. Com imagem: miniatura + rodapé.
  if (!comImagem) {
    return (
      <div style={{ minHeight: altura }}>
        <CardFooter produto={produto} temPasta={temPasta} temDoc={temDoc} />
      </div>
    );
  }

  return (
    <div>
      <CardThumb produto={produto} altura={altura} fator={fator} temDoc={temDoc} onPreview={onPreview} />
      <CardFooter produto={produto} temPasta={temPasta} temDoc={temDoc} />
    </div>
  );
}

// ─── Rodapé do card (igual nos dois modos) ─────────────────────────────────────

function CardFooter({ produto, temPasta, temDoc }: { produto: Produto; temPasta: boolean; temDoc: boolean }) {
  return (
    <div className="p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
          {produto.codigo}
        </p>
        <DocButtons produtoId={produto.id} temPasta={temPasta} temDocumento={temDoc} extensao="pdf" />
      </div>
      <p className="text-[11px] leading-snug text-muted-foreground mt-1 line-clamp-2">{produto.descricao}</p>
    </div>
  );
}

// ─── Área da miniatura do card ─────────────────────────────────────────────────

function CardThumb({
  produto, altura, fator, temDoc, onPreview,
}: { produto: Produto; altura: number; fator: number | null; temDoc: boolean; onPreview: () => void }) {
  const [erroImg, setErroImg] = useState(false);

  // Largura pedida ao back: 2 degraus conforme a altura (o navegador escala o resto).
  const w = altura > 220 ? 640 : 320;

  const placeholder = (texto: string) => (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-slate-50 dark:bg-slate-900 text-muted-foreground">
      <FileX2 className="h-8 w-8 text-slate-300 dark:text-slate-600" />
      <span className="text-xs">{texto}</span>
    </div>
  );

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onPreview(); }}
      title="Clique para ampliar"
      className="border-b border-slate-100 dark:border-slate-800 cursor-pointer overflow-hidden bg-white dark:bg-slate-950 p-2"
      style={{ aspectRatio: String(fator ?? 1.414), width: '100%' }}
    >
      {!temDoc
        ? placeholder('Sem documento')
        : erroImg
          ? placeholder('Falha ao carregar prévia')
          : (
            <img
              src={thumbnailUrl(produto.id, w)}
              alt={produto.codigo}
              loading="lazy"
              decoding="async"
              onError={() => setErroImg(true)}
              className="h-full w-full object-contain"
            />
          )}
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export function ProdutosPage({ tab }: ProdutosPageProps) {
  const formRef = useRef<ProdutoFormHandle>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

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

  // ─── Busca textual server-side (alimenta useGridQuery) ────────────────────────
  const [busca, setBusca] = useTabState<string>(tab.id + '-busca', '');

  // ─── Query server-side em modo scroll infinito ────────────────────────────────
  // colunasBuscaInicial precisa bater com defaultSearchCols do useListState abaixo,
  // ja que ambos compartilham a mesma key useTabState(tab.id + '-search-cols').
  const { itens, total, totalGeral, hasMore, isLoading, error, carregarMais, refetch } = useGridQuery<Produto>({
    endpoint: '/api/engenharia/Produtos/buscar',
    tabId: tab.id,
    colunasBuscaInicial: ['codigo', 'descricao'],
  });

  useEffect(() => { if (error) toast.error(error); }, [error]);

  // ─── Mutações via store (mantém abrirPasta/extensoes/abrirDocumento) ──────────
  const createProduto = useProdutosStore((s) => s.createProduto);
  const updateProduto = useProdutosStore((s) => s.updateProduto);
  const deleteProduto = useProdutosStore((s) => s.deleteProduto);

  // ─── Preferências do card (globais por usuário) ───────────────────────────────
  const comImagem = useCardViewStore((s) => s.comImagem);
  const cardWidth = useCardViewStore((s) => s.cardWidth);
  const cardHeightPref = useCardViewStore((s) => s.cardHeight);
  const proporcao = useCardViewStore((s) => s.proporcao);
  const ratioTravado = useCardViewStore((s) => s.ratioTravado);
  const proporcaoFator = fatorProporcao(proporcao, ratioTravado);
  const semImgWidth = useCardViewStore((s) => s.semImgWidth);
  const semImgHeight = useCardViewStore((s) => s.semImgHeight);

  // Proporção efetiva da área da imagem: travada/A4 usa o fator; sem trava usa a
  // relação largura/altura atual. Sempre aspect-ratio (nunca altura px fixa), pra
  // não dar "pulo" ao alternar entre os modos de proporção.
  const aspectImagem = proporcaoFator ?? (cardWidth / cardHeightPref);

  // ─── Lista (usa itens já paginados do back) ───────────────────────────────────

  const list = useListState<Produto>({
    tabId: tab.id,
    data: itens,
    searchColumns: SEARCH_COLUMNS,
    defaultSearchCols: ['codigo', 'descricao'],
  });

  // Em modo server-side: itens já vêm filtrados/ordenados/paginados
  const cardData = itens;

  // ─── Modal de prévia do documento (por aba) ───────────────────────────────────
  const [previewItem, setPreviewItem] = useTabState<Produto | null>(tab.id + '-doc-preview', null);

  // ─── Delete ───────────────────────────────────────────────────────────────────

  const del = useDeleteDialog<Produto>({
    onDelete: async (p) => {
      await deleteProduto(p.id);
      refetch();
    },
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
    refetch();
  }, [page.mode, page.editingItem, updateProduto, createProduto, refetch]);

  // ─── Extra actions (Varredura) ────────────────────────────────────────────────

  const extraActions = useMemo(() => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8"
          onClick={() => setPanelOpen(true)}>
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent><p>Filtros</p></TooltipContent>
    </Tooltip>
  ), []);

  // ─── Colunas ──────────────────────────────────────────────────────────────────

  const columns: GridColumn<Produto>[] = useMemo(() => [
    {
      key: 'codigo', header: 'CÓDIGO', width: 230, minWidth: 130, contentAlign: 'center',
      render: (p) => <span className="font-mono font-medium">{p.codigo}</span>,
    },
    {
      key: 'descricao', header: 'DESCRIÇÃO', width: 980, minWidth: 200,
      render: (p) => (<span className="font-medium">{p.descricao}</span>),
    },
    {
      key: 'tipo', header: 'TIPO', width: 120, minWidth: 110,
      filterType: 'checklist', filterOptions: TIPO_OPTIONS, contentAlign: 'center',
      render: (p) => TIPO_PRODUTO_LABELS[p.tipo] || p.tipo,
    },
    {
      key: 'unidade', header: 'UN', width: 90, minWidth: 65, contentAlign: 'center',
      filterType: 'checklist', filterOptions: UNIDADE_OPTIONS
    },
    {
      key: 'peso', header: 'PESO (KG)', width: 90, minWidth: 70,
      filterType: 'number', contentAlign: 'right',
      render: (p) => p.peso ? p.peso.toFixed(2) : '-',
    },
    {
      key: 'temDocumento', header: 'DOC.', width: 90, minWidth: 80,
      filterType: 'checklist', filterOptions: SIM_NAO_OPTIONS, contentAlign: 'center',
      sortable: false,
      render: (p) => (
        <DocButtons
          produtoId={p.id}
          temPasta={(p as any).temPasta ?? false}
          temDocumento={p.temDocumento ?? false}
          extensao="pdf"
        />
      ),
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
          searchTerm={busca}
          onSearchChange={setBusca}
          searchSelectedColumns={list.searchCols}
          onSearchColumnsChange={list.setSearchCols}
          gridRef={list.gridRef}
          viewMode={list.viewMode}
          onViewModeChange={list.handleViewMode}
          formRef={formRef}
          extraActions={page.mode === 'list' ? extraActions : undefined}
          newTooltip="Novo produto"
          noSelectionText="Selecione um produto"
          onConfig={() => setConfigOpen(true)}
        />
      }
    >

      {/* Grid e Cards sempre montados - alterna visibilidade */}
      <div style={{ display: !inForm && list.isListMode ? 'contents' : 'none' }}>
        <DataGrid
          ref={list.gridRef} tabId={tab.id} storageId="produtos"
          columns={columns} data={itens}
          serverSide total={total} totalGeral={totalGeral}
          hasMore={hasMore} onCarregarMais={carregarMais}
          loading={isLoading} loadingText="Carregando produtos..."
          onSelect={(item) => list.setSelectedItem(item as Produto | null)}
          onActivate={(item) => page.openView(item as Produto)}
        />
      </div>

      {/* Cards */}
      <div style={{ display: !inForm && !list.isListMode ? 'contents' : 'none' }}>
        <CardGrid
          ref={list.cardGridRef} data={cardData} selectedId={list.selectedCardId}
          minCardWidth={comImagem ? cardWidth : semImgWidth}
          cardHeight={comImagem ? cardHeightPref + 70 : semImgHeight}
          hasMore={hasMore} onCarregarMais={carregarMais}
          onSelect={(p) => list.setSelectedCardId(p?.id ?? null)}
          onActivate={(item) => page.openView(item as Produto)}
          loading={isLoading} loadingText="Carregando produtos..."
          emptyTitle="Nenhum produto encontrado"
          renderCard={(p) => (
            <ProdutoCard
              produto={p}
              comImagem={comImagem}
              altura={comImagem ? cardHeightPref : semImgHeight}
              fator={aspectImagem}
              onPreview={() => setPreviewItem(p)}
            />
          )}
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
        <PanelFilters
          filters={panelFilterColumns}
          values={panelFilterValues}
          onChange={handlePanelFilterChange}
          onClose={() => setPanelOpen(false)}
        />
      </PagePanel>

      <PagePanel open={configOpen} onClose={() => setConfigOpen(false)} title="Configurações">
        <ProdutoConfigPanel />
      </PagePanel>

      {previewItem && (
        <DocPreviewDialog
          open
          onOpenChange={(o) => { if (!o) setPreviewItem(null); }}
          produtoId={previewItem.id}
          codigo={previewItem.codigo}
          descricao={previewItem.descricao}
          temPasta={(previewItem as any).temPasta ?? false}
          temDocumento={previewItem.temDocumento ?? false}
          extensao="pdf"
        />
      )}

    </PageShell>
  );
}
