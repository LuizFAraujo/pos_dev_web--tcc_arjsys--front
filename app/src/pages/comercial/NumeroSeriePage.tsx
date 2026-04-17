/**
 * NumeroSeriePage.tsx — Página de consulta de números de série
 *
 * Usa template completo (PageShell + PageActions + useListState).
 * NS são gerados pela engenharia a partir de pedidos — sem criação/edição aqui.
 * Botões New/View/Edit/Delete escondidos via hideButtons.
 *
 * Colunas: Nº Série, Pedido, Cliente, Tipo, Projeto, Status, Data
 * Filtro checklist no status e tipo.
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
import { NS_STATUS_LABELS, NS_STATUS_COLORS, TIPO_NS_LABELS, TIPO_NS_COLORS } from '@/types/comercial/numeroserie.types';
import type { NumeroSerie } from '@/types/comercial/numeroserie.types';

interface NumeroSeriePageProps {
  tab: { id: string; type: string; title: string };
}

const SEARCH_COLUMNS: SearchColumn[] = [
  { key: 'codigo', label: 'Nº Série' },
  { key: 'pedidoVendaCodigo', label: 'Pedido' },
  { key: 'clienteNome', label: 'Cliente' },
  { key: 'codigoProjeto', label: 'Projeto' },
];

const STATUS_OPTIONS = [
  { label: 'Aguardando', value: 'Aguardando' },
  { label: 'Em Andamento', value: 'EmAndamento' },
  { label: 'A Entregar', value: 'AguardandoEntrega' },
  { label: 'Entregue', value: 'Entregue' },
  { label: 'Cancelado', value: 'Cancelado' },
];

const TIPO_OPTIONS = [
  { label: 'Normal', value: 'Normal' },
  { label: 'Venda Futura', value: 'VendaFutura' },
];

const formatDate = (val?: string) => !val ? '-' : new Date(val).toLocaleDateString('pt-BR');

function NumeroSerieCard({ serie }: { serie: NumeroSerie }) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <p className="font-mono font-semibold text-sm text-slate-800 dark:text-slate-200">
          {serie.codigo || '-'}
        </p>
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${TIPO_NS_COLORS[serie.tipo] || ''}`}>
          {TIPO_NS_LABELS[serie.tipo] || serie.tipo}
        </span>
      </div>
      {serie.pedidoVendaCodigo && (
        <p className="text-xs text-muted-foreground font-mono mt-1">{serie.pedidoVendaCodigo}</p>
      )}
      {serie.clienteNome && (
        <p className="text-xs text-muted-foreground mt-1 truncate">{serie.clienteNome}</p>
      )}
      <div className="flex items-center justify-between mt-1">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${NS_STATUS_COLORS[serie.status] || ''}`}>
          {NS_STATUS_LABELS[serie.status] || serie.status}
        </span>
        {serie.codigoProjeto && (
          <span className="text-[10px] font-mono text-muted-foreground">{serie.codigoProjeto}</span>
        )}
      </div>
    </div>
  );
}

export function NumeroSeriePage({ tab }: NumeroSeriePageProps) {

  // ─── Store ────────────────────────────────────────────────────────────────────

  const series = useNumeroSerieStore((s) => s.series);
  const isLoading = useNumeroSerieStore((s) => s.isLoading);
  const error = useNumeroSerieStore((s) => s.error);
  const fetchSeries = useNumeroSerieStore((s) => s.fetchSeries);

  useEffect(() => { fetchSeries(); }, [fetchSeries]);
  useEffect(() => { if (error) toast.error(error); }, [error]);

  // ─── Lista ────────────────────────────────────────────────────────────────────

  const list = useListState<NumeroSerie>({
    tabId: tab.id,
    data: series,
    searchColumns: SEARCH_COLUMNS,
    defaultSearchCols: ['codigo', 'pedidoVendaCodigo', 'clienteNome'],
  });

  // ─── Colunas ──────────────────────────────────────────────────────────────────

  const columns: GridColumn<NumeroSerie>[] = useMemo(() => [
    {
      key: 'codigo', header: 'Nº SÉRIE', width: 160, minWidth: 120, contentAlign: 'center',
      render: (s) => <span className="font-mono font-medium">{s.codigo || '-'}</span>,
    },
    {
      key: 'pedidoVendaCodigo', header: 'PEDIDO', width: 130, minWidth: 100,
      contentAlign: 'center', className: 'font-mono',
    },
    { key: 'clienteNome', header: 'CLIENTE', width: 250, minWidth: 150 },
    {
      key: 'tipo', header: 'TIPO', width: 120, minWidth: 100, contentAlign: 'center',
      filterType: 'checklist', filterOptions: TIPO_OPTIONS,
      render: (s) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${TIPO_NS_COLORS[s.tipo] || ''}`}>
          {TIPO_NS_LABELS[s.tipo] || s.tipo}
        </span>
      ),
    },
    {
      key: 'codigoProjeto', header: 'PROJETO', width: 140, minWidth: 100,
      contentAlign: 'center',
      render: (s) => s.codigoProjeto ? <span className="font-mono">{s.codigoProjeto}</span> : '-',
    },
    {
      key: 'status', header: 'STATUS', width: 160, minWidth: 120, contentAlign: 'center',
      filterType: 'checklist', filterOptions: STATUS_OPTIONS,
      render: (s) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${NS_STATUS_COLORS[s.status] || ''}`}>
          {NS_STATUS_LABELS[s.status] || s.status}
        </span>
      ),
    },
    {
      key: 'criadoEm', header: 'DATA', width: 110, minWidth: 90, contentAlign: 'center',
      render: (s) => formatDate(s.criadoEm),
    },
  ], []);

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <PageShell module="Comercial" title="Números de Série"
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
          ref={list.gridRef} tabId={tab.id} storageId="numeroserie"
          columns={columns} data={list.filtrados}
          loading={isLoading} loadingText="Carregando séries..."
          emptyTitle="Nenhum número de série encontrado"
          emptyDescription="Números de série são gerados pela engenharia a partir de pedidos"
          onSelect={(item) => list.setSelectedItem(item as NumeroSerie | null)}
        />
      </div>
      <div style={{ display: !list.isListMode ? 'contents' : 'none' }}>
        <CardGrid
          ref={list.cardGridRef} data={list.filtrados} selectedId={list.selectedCardId}
          onSelect={(s) => list.setSelectedCardId(s?.id ?? null)}
          loading={isLoading} loadingText="Carregando séries..."
          emptyTitle="Nenhum número de série encontrado"
          emptyDescription="Números de série são gerados pela engenharia a partir de pedidos"
          renderCard={(s) => <NumeroSerieCard serie={s} />}
        />
      </div>
    </PageShell>
  );
}
