/**
 * NumeroSeriePage.tsx — Página de consulta de Números de Série (v3.1)
 *
 * v3.1 (22/04): coluna Cliente mostra badge [CLI-NNNN] + nome (quando disponível)
 *
 * Versão mínima (list-only). Fase 3 adiciona form de edição.
 */

import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useNumeroSerieStore } from '@/stores/comercial/numeroSerieStore';
import { PageShell, PageActions } from '@/components/shared/PageShell';
import { DataGrid } from '@/components/shared/DataGrid';
import type { GridColumn } from '@/components/shared/DataGrid';
import { CardGrid } from '@/components/shared/CardGrid';
import { ListFooter } from '@/components/shared/ListFooter';
import type { SearchColumn } from '@/components/shared/SearchBar';
import { useListState } from '@/hooks/useListState';
import {
  STATUS_COLORS,
  STATUS_LABELS,
  TIPO_PV_COLORS,
  TIPO_PV_LABELS,
} from '@/types/comercial/pedido.types';
import type { NumeroSerie } from '@/types/comercial/numeroserie.types';

interface NumeroSeriePageProps {
  tab: { id: string; type: string; title: string };
}

const SEARCH_COLUMNS: SearchColumn[] = [
  { key: 'codigo', label: 'Nº Série' },
  { key: 'pedidoVendaCodigo', label: 'Pedido' },
  { key: 'clienteCodigo', label: 'Cód. Cliente' },
  { key: 'clienteNome', label: 'Cliente' },
  { key: 'produtoCodigo', label: 'Produto (código)' },
  { key: 'produtoDescricao', label: 'Produto (descrição)' },
];

const TIPO_OPTIONS = [
  { label: 'Normal', value: 'Normal' },
  { label: 'Pré-venda', value: 'PreVenda' },
];

const STATUS_OPTIONS = [
  { label: 'Aguardando NS', value: 'AguardandoNS' },
  { label: 'Recebido NS', value: 'RecebidoNS' },
  { label: 'Aguardando Retorno', value: 'AguardandoRetorno' },
  { label: 'Liberado', value: 'Liberado' },
  { label: 'Em Andamento', value: 'Andamento' },
  { label: 'Concluído', value: 'Concluido' },
  { label: 'A Entregar', value: 'AEntregar' },
  { label: 'Entregue', value: 'Entregue' },
  { label: 'Pausado', value: 'Pausado' },
  { label: 'Cancelado', value: 'Cancelado' },
  { label: 'Reaberto', value: 'Reaberto' },
  { label: 'Devolvido', value: 'Devolvido' },
];

function formatDate(val?: string | null) {
  if (!val) return '-';
  try {
    return new Date(val).toLocaleDateString('pt-BR');
  } catch {
    return '-';
  }
}

function NumeroSerieCard({ serie }: { serie: NumeroSerie }) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">
          {serie.codigo || '-'}
        </p>
        <span
          className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
            TIPO_PV_COLORS[serie.pvTipo] || ''
          }`}
        >
          {TIPO_PV_LABELS[serie.pvTipo] || serie.pvTipo}
        </span>
      </div>
      {serie.pedidoVendaCodigo && (
        <p className="text-xs text-muted-foreground font-mono mt-1 truncate">
          {serie.pedidoVendaCodigo}
        </p>
      )}
      {(serie.clienteCodigo || serie.clienteNome) && (
        <div className="flex items-center gap-1.5 mt-1 min-w-0">
          {serie.clienteCodigo && (
            <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
              {serie.clienteCodigo}
            </span>
          )}
          {serie.clienteNome && (
            <p className="text-xs text-muted-foreground truncate">
              {serie.clienteNome}
            </p>
          )}
        </div>
      )}
      <div className="flex items-center justify-between mt-2">
        <span
          className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${
            STATUS_COLORS[serie.pvStatus] || ''
          }`}
        >
          {STATUS_LABELS[serie.pvStatus] || serie.pvStatus}
        </span>
        {serie.produtoCodigo && (
          <span className="text-[10px] font-mono text-muted-foreground truncate">
            {serie.produtoCodigo}
          </span>
        )}
      </div>
    </div>
  );
}

export function NumeroSeriePage({ tab }: NumeroSeriePageProps) {
  // ─── Store ────────────────────────────────────────────────────────────
  const series = useNumeroSerieStore((s) => s.series);
  const isLoading = useNumeroSerieStore((s) => s.isLoading);
  const error = useNumeroSerieStore((s) => s.error);
  const fetchSeries = useNumeroSerieStore((s) => s.fetchSeries);

  useEffect(() => {
    void fetchSeries();
  }, [fetchSeries]);
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // ─── Lista ────────────────────────────────────────────────────────────
  const list = useListState<NumeroSerie>({
    tabId: tab.id,
    data: series,
    searchColumns: SEARCH_COLUMNS,
    defaultSearchCols: ['codigo', 'pedidoVendaCodigo', 'clienteNome'],
  });

  // ─── Colunas ──────────────────────────────────────────────────────────
  const columns: GridColumn<NumeroSerie>[] = useMemo(
    () => [
      {
        key: 'codigo',
        header: 'Nº SÉRIE',
        width: 160,
        minWidth: 120,
        contentAlign: 'center',
        render: (s) => (
          <span className="font-mono font-medium">{s.codigo || '-'}</span>
        ),
      },
      {
        key: 'pedidoVendaCodigo',
        header: 'PEDIDO',
        width: 130,
        minWidth: 100,
        contentAlign: 'center',
        className: 'font-mono',
      },
      {
        key: 'clienteNome',
        header: 'CLIENTE',
        width: 280,
        minWidth: 160,
        render: (s) => (
          <div className="flex items-center gap-2 min-w-0">
            {s.clienteCodigo && (
              <span className="font-mono text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-muted rounded px-1.5 py-0.5 shrink-0">
                {s.clienteCodigo}
              </span>
            )}
            <span className="truncate">{s.clienteNome || '-'}</span>
          </div>
        ),
      },
      {
        key: 'pvTipo',
        header: 'TIPO',
        width: 110,
        minWidth: 100,
        contentAlign: 'center',
        filterType: 'checklist',
        filterOptions: TIPO_OPTIONS,
        render: (s) => (
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
              TIPO_PV_COLORS[s.pvTipo] || ''
            }`}
          >
            {TIPO_PV_LABELS[s.pvTipo] || s.pvTipo}
          </span>
        ),
      },
      {
        key: 'produtoCodigo',
        header: 'PRODUTO',
        width: 260,
        minWidth: 180,
        render: (s) => {
          if (!s.produtoId) {
            return (
              <span className="text-xs text-muted-foreground italic">
                Não vinculado
              </span>
            );
          }
          return (
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-xs text-slate-700 dark:text-slate-300 shrink-0">
                {s.produtoCodigo}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {s.produtoDescricao}
              </span>
            </div>
          );
        },
      },
      {
        key: 'pvStatus',
        header: 'STATUS (PV)',
        width: 170,
        minWidth: 120,
        contentAlign: 'center',
        filterType: 'checklist',
        filterOptions: STATUS_OPTIONS,
        render: (s) => (
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
              STATUS_COLORS[s.pvStatus] || ''
            }`}
          >
            {STATUS_LABELS[s.pvStatus] || s.pvStatus}
          </span>
        ),
      },
      {
        key: 'pvDataEntrega',
        header: 'ENTREGA',
        width: 110,
        minWidth: 90,
        contentAlign: 'center',
        render: (s) => formatDate(s.pvDataEntrega),
      },
    ],
    [],
  );

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <PageShell
      module="Comercial"
      title="Números de Série"
      footer={<ListFooter filtered={list.filtrados.length} total={series.length} />}
      headerRight={
        <PageActions
          page={{ mode: 'list' } as any}
          activeItem={list.activeItem}
          hideButtons={['new', 'view', 'edit', 'delete']}
          searchColumns={SEARCH_COLUMNS}
          searchTerm={list.searchTerm}
          onSearchChange={list.setSearchTerm}
          searchSelectedColumns={list.searchCols}
          onSearchColumnsChange={list.setSearchCols}
          gridRef={list.gridRef}
          viewMode={list.viewMode}
          onViewModeChange={list.handleViewMode}
          noSelectionText="Selecione um número de série"
        />
      }
    >
      <div style={{ display: list.isListMode ? 'contents' : 'none' }}>
        <DataGrid
          ref={list.gridRef}
          tabId={tab.id}
          storageId="numeroserie"
          columns={columns}
          data={list.filtrados}
          loading={isLoading}
          loadingText="Carregando séries..."
          emptyTitle="Nenhum número de série encontrado"
          emptyDescription="Números de série são gerados a partir de pedidos de pré-venda"
          onSelect={(item) => list.setSelectedItem(item as NumeroSerie | null)}
        />
      </div>
      <div style={{ display: !list.isListMode ? 'contents' : 'none' }}>
        <CardGrid
          ref={list.cardGridRef}
          data={list.filtrados}
          selectedId={list.selectedCardId}
          onSelect={(s) => list.setSelectedCardId(s?.id ?? null)}
          loading={isLoading}
          loadingText="Carregando séries..."
          emptyTitle="Nenhum número de série encontrado"
          emptyDescription="Números de série são gerados a partir de pedidos de pré-venda"
          renderCard={(s) => <NumeroSerieCard serie={s} />}
        />
      </div>
    </PageShell>
  );
}
