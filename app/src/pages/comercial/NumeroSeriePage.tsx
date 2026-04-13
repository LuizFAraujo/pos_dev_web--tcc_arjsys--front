/**
 * NumeroSeriePage.tsx — Página de consulta de números de série
 *
 * Usa template completo (PageShell + PageActions + useListState).
 * NS são gerados a partir de pedidos — sem criação/edição por enquanto.
 * Botões New/View/Edit/Delete escondidos via hideButtons.
 * TODO: Tela de consulta/rastreabilidade (NS → pedido → cliente → produtos)
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
import { NS_STATUS_LABELS } from '@/types/comercial/numeroserie.types';
import type { NumeroSerie } from '@/types/comercial/numeroserie.types';

interface NumeroSeriePageProps {
  tab: { id: string; type: string; title: string };
}

const SEARCH_COLUMNS: SearchColumn[] = [
  { key: 'codigo', label: 'Nº Série' },
  { key: 'pedidoVendaCodigo', label: 'Pedido' },
  { key: 'clienteNome', label: 'Cliente' },
];

const STATUS_OPTIONS = [
  { label: 'Aberto', value: 'Aberto' },
  { label: 'Em Fabricação', value: 'EmFabricacao' },
  { label: 'Concluído', value: 'Concluido' },
  { label: 'Entregue', value: 'Entregue' },
];

const formatDate = (val?: string) => !val ? '-' : new Date(val).toLocaleDateString('pt-BR');

function NumeroSerieCard({ serie }: { serie: NumeroSerie }) {
  return (
    <div className="p-4">
      <p className="font-mono font-semibold text-sm text-slate-800 dark:text-slate-200">
        {serie.codigo || '-'}
      </p>
      {serie.pedidoVendaCodigo && (
        <p className="text-xs text-muted-foreground font-mono mt-1">{serie.pedidoVendaCodigo}</p>
      )}
      {serie.clienteNome && (
        <p className="text-xs text-muted-foreground mt-1 truncate">{serie.clienteNome}</p>
      )}
      <p className="text-xs text-muted-foreground mt-1">
        {NS_STATUS_LABELS[serie.status] || serie.status}
      </p>
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
      key: 'status', header: 'STATUS', width: 140, minWidth: 110, contentAlign: 'center',
      filterType: 'checklist', filterOptions: STATUS_OPTIONS,
      render: (s) => NS_STATUS_LABELS[s.status] || s.status,
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
      {/* Grid e Cards sempre montados — alterna visibilidade */}
      <div style={{ display: list.isListMode ? 'contents' : 'none' }}>
        <DataGrid
          ref={list.gridRef} tabId={tab.id} storageId="numeroserie"
          columns={columns} data={list.filtrados}
          loading={isLoading} loadingText="Carregando séries..."
          emptyTitle="Nenhum número de série encontrado"
          emptyDescription="Números de série são gerados a partir de pedidos"
          onSelect={(item) => list.setSelectedItem(item as NumeroSerie | null)}
        />
      </div>
      <div style={{ display: !list.isListMode ? 'contents' : 'none' }}>
        <CardGrid
          ref={list.cardGridRef} data={list.filtrados} selectedId={list.selectedCardId}
          onSelect={(s) => list.setSelectedCardId(s?.id ?? null)}
          loading={isLoading} loadingText="Carregando séries..."
          emptyTitle="Nenhum número de série encontrado"
          emptyDescription="Números de série são gerados a partir de pedidos"
          renderCard={(s) => <NumeroSerieCard serie={s} />}
        />
      </div>
    </PageShell>
  );
}




