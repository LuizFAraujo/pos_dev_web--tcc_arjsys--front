/**
 * DemandaProducaoPage.tsx - Visão flat dos itens de OPs ativas em modo server-side.
 *
 * Visualizar (olho): abre tela cheia em modo view (DemandaProducaoForm).
 *                    Lá dentro, botão padrão de Editar troca pra edit.
 * Editar (lápis): bypass - abre modal compacto sobre o grid
 *                 (DemandaQuickEditDialog), sem ir pra tela cheia.
 */

import { useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { PageShell, usePageMode, PageActions } from '@/components/shared/PageShell';
import { DataGrid } from '@/components/shared/DataGrid';
import type { GridColumn } from '@/components/shared/DataGrid';
import { CardGrid } from '@/components/shared/CardGrid';
import type { SearchColumn } from '@/components/shared/SearchBar';
import { useListState } from '@/hooks/useListState';
import { useTabState } from '@/hooks/useTabState';
import { useGridQuery } from '@/hooks/useGridQuery';
import type { DemandaItem } from '@/types/producao/demanda.types';
import { TIPO_PRODUTO_LABELS } from '@/types/engenharia/produto.types';
import {
  STATUS_OP_COLORS,
  STATUS_OP_LABELS,
} from '@/types/producao/ordemProducao.types';
import {
  DemandaProducaoForm,
  type DemandaProducaoFormHandle,
} from '@/components/producao/DemandaProducaoForm';
import { DemandaQuickEditDialog } from '@/components/producao/DemandaQuickEditDialog';

interface PageProps {
  tab: { id: string; type: string; title: string };
}

const SEARCH_COLUMNS: SearchColumn[] = [
  { key: 'ordemProducaoCodigo', label: 'Cód. OP' },
  { key: 'produtoCodigo', label: 'Cód. Produto' },
  { key: 'produtoDescricao', label: 'Descrição' },
];

const DEFAULT_SEARCH_COLS = ['ordemProducaoCodigo', 'produtoCodigo', 'produtoDescricao'];

const TIPO_OPTIONS = [
  { label: 'Fabricado', value: 'Fabricado' },
  { label: 'Comprado', value: 'Comprado' },
  { label: 'Matéria-Prima', value: 'MateriaPrima' },
  { label: 'Revenda', value: 'Revenda' },
  { label: 'Serviço', value: 'Servico' },
];

const TIPO_COLORS: Record<string, string> = {
  Fabricado: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  Comprado: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  MateriaPrima: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  Revenda: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
  Servico: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
};

function DemandaCard({ d }: { d: DemandaItem }) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono font-semibold text-sm truncate">
          {d.ordemProducaoCodigo}
        </p>
        <span
          className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
            STATUS_OP_COLORS[d.statusOp] || ''
          }`}
        >
          {STATUS_OP_LABELS[d.statusOp] || d.statusOp}
        </span>
      </div>
      <p className="font-mono text-xs mt-1 truncate">{d.produtoCodigo}</p>
      <p className="text-xs text-muted-foreground mt-0.5 truncate">
        {d.produtoDescricao}
      </p>
      <div className="flex items-center justify-between mt-2 gap-2">
        <span className="text-[11px] text-muted-foreground">
          Faltante:{' '}
          <span className="font-mono text-slate-700 dark:text-slate-300">
            {d.quantidadeFaltante} {d.produtoUnidade}
          </span>
        </span>
        <span className="text-[10px] font-mono text-muted-foreground">
          {Number(d.percentualConcluido ?? 0).toFixed(0)}%
        </span>
      </div>
      <div className="flex items-center justify-between mt-1 gap-2">
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
            TIPO_COLORS[d.tipoProduto] || ''
          }`}
        >
          {TIPO_PRODUTO_LABELS[d.tipoProduto] || d.tipoProduto}
        </span>
      </div>
    </div>
  );
}

export function DemandaProducaoPage({ tab }: PageProps) {
  const formRef = useRef<DemandaProducaoFormHandle>(null);
  const page = usePageMode<DemandaItem>(
    tab.id,
    (d) => `${d.ordemProducaoItemId}`,
    tab.type,
  );

  const [busca, setBusca] = useTabState<string>(tab.id + '-busca', '');

  const { itens, total, totalGeral, hasMore, isLoading, error, carregarMais, refetch } = useGridQuery<DemandaItem>({
    endpoint: '/api/producao/Demanda/buscar',
    tabId: tab.id,
    colunasBuscaInicial: DEFAULT_SEARCH_COLS,
  });

  useEffect(() => { if (error) toast.error(error); }, [error]);

  // Refetch ao voltar de edit→list (DemandaProducaoForm patch local sem callback)
  const modoAnteriorRef = useRef(page.mode);
  useEffect(() => {
    if (modoAnteriorRef.current === 'edit' && page.mode === 'list') refetch();
    modoAnteriorRef.current = page.mode;
  }, [page.mode, refetch]);

  const [quickEditOpen, setQuickEditOpen] = useTabState<boolean>(
    tab.id + '-quick-edit',
    false,
  );

  const list = useListState<DemandaItem>({
    tabId: tab.id,
    data: itens,
    searchColumns: SEARCH_COLUMNS,
    defaultSearchCols: DEFAULT_SEARCH_COLS,
  });

  const ativoRef = list.activeItem as DemandaItem | null;
  const itemAtivo = useMemo(() => {
    if (!ativoRef) return null;
    return (
      itens.find(
        (i) => i.ordemProducaoItemId === ativoRef.ordemProducaoItemId,
      ) ?? ativoRef
    );
  }, [itens, ativoRef]);

  const columns: GridColumn<DemandaItem>[] = useMemo(
    () => [
      {
        key: 'ordemProducaoCodigo',
        header: 'OP',
        width: 160,
        contentAlign: 'center',
        filterType: 'text',
        className: 'font-mono',
      },
      {
        key: 'produtoCodigo',
        header: 'PRODUTO',
        width: 180,
        contentAlign: 'center',
        filterType: 'text',
        className: 'font-mono',
      },
      {
        key: 'quantidadePlanejada',
        header: 'PLANEJADO',
        width: 110,
        contentAlign: 'right',
        filterType: 'number',
        className: 'font-mono',
      },
      {
        key: 'quantidadeProduzida',
        header: 'PRODUZIDO',
        width: 110,
        contentAlign: 'right',
        filterType: 'number',
        className: 'font-mono',
      },
      {
        key: 'quantidadeFaltante',
        header: 'FALTANTE',
        width: 100,
        contentAlign: 'right',
        filterType: 'number',
        className: 'font-mono',
      },
      {
        key: 'percentualConcluido',
        header: '%',
        width: 80,
        contentAlign: 'center',
        filterType: 'number',
        className: 'font-mono',
        render: (d) => `${Number(d.percentualConcluido ?? 0).toFixed(0)}%`,
      },
      {
        key: 'produtoUnidade',
        header: 'UN.',
        width: 90,
        contentAlign: 'center',
        filterType: 'checklist',
        filterOptions: [
          { label: 'PC', value: 'PC' },
          { label: 'UN', value: 'UN' },
          { label: 'KG', value: 'KG' },
          { label: 'M', value: 'M' },
          { label: 'M2', value: 'M2' },
          { label: 'M3', value: 'M3' },
          { label: 'L', value: 'L' },
          { label: 'CX', value: 'CX' },
        ],
      },
      {
        key: 'produtoDescricao',
        header: 'DESCRIÇÃO',
        width: 320,
        filterType: 'text',
        render: (d) => <span className="truncate">{d.produtoDescricao}</span>,
      },
      {
        key: 'tipoProduto',
        header: 'TIPO',
        width: 130,
        contentAlign: 'center',
        filterType: 'checklist',
        filterOptions: TIPO_OPTIONS,
        render: (d) => (
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
              TIPO_COLORS[d.tipoProduto] || ''
            }`}
          >
            {TIPO_PRODUTO_LABELS[d.tipoProduto] || d.tipoProduto}
          </span>
        ),
      },
    ],
    [],
  );

  const inForm = page.mode !== 'list';

  return (
    <PageShell
      module="Produção"
      title="Demanda de Produção"
      mode={page.mode}
      headerRight={
        <PageActions
          page={page}
          activeItem={itemAtivo}
          hideButtons={['new', 'delete']}
          onEditClick={() => setQuickEditOpen(true)}
          searchColumns={SEARCH_COLUMNS}
          searchTerm={busca}
          onSearchChange={setBusca}
          searchSelectedColumns={list.searchCols}
          onSearchColumnsChange={list.setSearchCols}
          gridRef={list.gridRef}
          viewMode={list.viewMode}
          onViewModeChange={list.handleViewMode}
          formRef={formRef}
          viewTooltip="Visualizar detalhes"
          editTooltip="Edição rápida (modal)"
          noSelectionText="Selecione um item"
        />
      }
    >
      <div style={{ display: !inForm && list.isListMode ? 'contents' : 'none' }}>
        <DataGrid
          ref={list.gridRef}
          tabId={tab.id}
          storageId="demanda-producao"
          columns={columns}
          data={itens}
          serverSide total={total} totalGeral={totalGeral}
          hasMore={hasMore} onCarregarMais={carregarMais}
          loading={isLoading}
          loadingText="Carregando demanda..."
          onSelect={(item) => list.setSelectedItem(item as DemandaItem | null)}
          onActivate={(item) => page.openView(item as DemandaItem)}
        />
      </div>
      <div style={{ display: !inForm && !list.isListMode ? 'contents' : 'none' }}>
        <CardGrid
          ref={list.cardGridRef}
          data={itens}
          selectedId={list.selectedCardId}
          onSelect={(d) =>
            list.setSelectedCardId(d?.ordemProducaoItemId ?? null)
          }
          onActivate={(item) => page.openView(item as DemandaItem)}
          loading={isLoading}
          loadingText="Carregando demanda..."
          emptyTitle="Nenhuma demanda encontrada"
          emptyDescription="Não há OPs ativas com itens pendentes."
          renderCard={(d) => <DemandaCard d={d} />}
        />
      </div>

      {inForm && (
        <DemandaProducaoForm
          key={page.resetKey}
          ref={formRef}
          mode={page.mode as 'view' | 'edit'}
          item={
            page.editingItem
              ? (itens.find(
                  (i) =>
                    i.ordemProducaoItemId ===
                    (page.editingItem as DemandaItem).ordemProducaoItemId,
                ) ?? page.editingItem)
              : null
          }
          tabId={tab.id}
          onDirtyChange={(d) => page.setDirty(d)}
        />
      )}

      <DemandaQuickEditDialog
        open={quickEditOpen}
        onOpenChange={setQuickEditOpen}
        item={itemAtivo}
        onAfterSave={refetch}
      />
    </PageShell>
  );
}
