/**
 * NumeroSeriePage.tsx - Página de Números de Série em modo server-side
 *
 * Particularidades de NS:
 *   - Sem DELETE (back não suporta) → hideButtons=['delete']
 *   - "Novo" gateado por ConfiguracaoEmpresa.configurado
 *   - Form unificado pra new/edit/view
 */

import { useEffect, useRef, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useNumeroSerieStore } from '@/stores/comercial/numeroSerieStore';
import { useConfiguracaoEmpresaStore } from '@/stores/admin/configuracaoEmpresaStore';
import { usePedidosStore } from '@/stores/comercial/pedidosStore';
import { PageShell, usePageMode, PageActions } from '@/components/shared/PageShell';
import { DataGrid } from '@/components/shared/DataGrid';
import type { GridColumn } from '@/components/shared/DataGrid';
import { CardGrid } from '@/components/shared/CardGrid';
import type { SearchColumn } from '@/components/shared/SearchBar';
import { useListState } from '@/hooks/useListState';
import { useTabState } from '@/hooks/useTabState';
import { useGridQuery } from '@/hooks/useGridQuery';
import {
  STATUS_COLORS,
  STATUS_LABELS,
  TIPO_PV_COLORS,
  TIPO_PV_LABELS,
} from '@/types/comercial/pedido.types';
import type { NumeroSerie } from '@/types/comercial/numeroSerie.types';
import { NumeroSerieForm } from '@/components/comercial/NumeroSerie/NumeroSerieForm';
import type { NumeroSerieFormHandle, NumeroSerieFormData } from '@/components/comercial/NumeroSerie/NumeroSerieForm';

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

const DEFAULT_SEARCH_COLS = ['codigo', 'pedidoVendaCodigo', 'clienteNome'];

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
  const formRef = useRef<NumeroSerieFormHandle>(null);
  const page = usePageMode<NumeroSerie>(tab.id, (s) => String(s.id), tab.type);

  const [busca, setBusca] = useTabState<string>(tab.id + '-busca', '');

  const { itens, total, totalGeral, hasMore, isLoading, error, carregarMais, refetch } = useGridQuery<NumeroSerie>({
    endpoint: '/api/comercial/NumeroSerie/buscar',
    tabId: tab.id,
    colunasBuscaInicial: DEFAULT_SEARCH_COLS,
  });

  useEffect(() => { if (error) toast.error(error); }, [error]);

  // Mutações via store
  const gerarSerie = useNumeroSerieStore((s) => s.gerarSerie);
  const updateSerie = useNumeroSerieStore((s) => s.updateSerie);
  const fetchSeries = useNumeroSerieStore((s) => s.fetchSeries);
  const storeError = useNumeroSerieStore((s) => s.error);
  const clearError = useNumeroSerieStore((s) => s.clearError);

  useEffect(() => {
    if (storeError) { toast.error(storeError); clearError(); }
  }, [storeError, clearError]);

  // Alimenta o cache local de séries pra o NumeroSerieForm.computeProximoCodigo
  // calcular o próximo sequencial. Sem isso, o array fica vazio e sugere sempre 00001.
  useEffect(() => { void fetchSeries(); }, [fetchSeries]);

  // Refresh do cache de séries ao entrar em "novo", pra pegar emissões concorrentes
  useEffect(() => {
    if (page.mode === 'new') void fetchSeries();
  }, [page.mode, fetchSeries]);

  // Gate Configuração da Empresa (não migra — config global)
  const config = useConfiguracaoEmpresaStore((s) => s.config);
  const fetchConfig = useConfiguracaoEmpresaStore((s) => s.fetchConfig);

  // Refresh de pedidos após gerar NS (back transiciona PV de AguardandoNS → RecebidoNS)
  const fetchPedidos = usePedidosStore((s) => s.fetchPedidos);

  useEffect(() => {
    void fetchConfig();
  }, [fetchConfig]);

  const list = useListState<NumeroSerie>({
    tabId: tab.id,
    data: itens,
    searchColumns: SEARCH_COLUMNS,
    defaultSearchCols: DEFAULT_SEARCH_COLS,
  });

  const wrappedPage = useMemo(
    () => ({
      ...page,
      openNew: () => {
        if (!config?.configurado) {
          toast.error(
            'Configure o ano de fundação da empresa antes de emitir Números de Série. Solicite ao administrador.',
          );
          return;
        }
        page.openNew();
      },
    }),
    [page, config],
  );

  const handleSave = useCallback(
    async (data: NumeroSerieFormData) => {
      if (page.mode === 'edit' && page.editingItem) {
        await updateSerie(page.editingItem.id, { produtoId: data.produtoId ?? null });
      } else {
        await gerarSerie({
          pedidoVendaId: data.pedidoVendaId,
          produtoId: data.produtoId ?? null,
          codigo: data.codigo ?? null,
        });
        // Recarrega pedidos pra refletir transição de status
        await fetchPedidos();
      }
      refetch();
    },
    [page.mode, page.editingItem, gerarSerie, updateSerie, fetchPedidos, refetch],
  );

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
        key: 'clienteCodigo',
        header: 'CÓD. CLIENTE',
        width: 120,
        minWidth: 100,
        contentAlign: 'center',
        filterType: 'text',
        className: 'font-mono',
      },
      {
        key: 'clienteNome',
        header: 'CLIENTE',
        width: 240,
        minWidth: 160,
        filterType: 'text',
        render: (s) => <span className="truncate">{s.clienteNome || '-'}</span>,
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
        header: 'CÓD. PRODUTO',
        width: 140,
        minWidth: 110,
        contentAlign: 'center',
        filterType: 'text',
        className: 'font-mono',
        render: (s) =>
          s.produtoCodigo ? (
            <span>{s.produtoCodigo}</span>
          ) : (
            <span className="text-xs text-muted-foreground italic">-</span>
          ),
      },
      {
        key: 'produtoDescricao',
        header: 'PRODUTO',
        width: 240,
        minWidth: 160,
        filterType: 'text',
        render: (s) =>
          s.produtoDescricao ? (
            <span className="truncate">{s.produtoDescricao}</span>
          ) : (
            <span className="text-xs text-muted-foreground italic">Não vinculado</span>
          ),
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

  const inForm = page.mode !== 'list';

  return (
    <PageShell
      module="Comercial"
      title="Números de Série"
      mode={page.mode}
      headerRight={
        <PageActions
          page={wrappedPage}
          activeItem={list.activeItem}
          hideButtons={['delete']}
          searchColumns={SEARCH_COLUMNS}
          searchTerm={busca}
          onSearchChange={setBusca}
          searchSelectedColumns={list.searchCols}
          onSearchColumnsChange={list.setSearchCols}
          gridRef={list.gridRef}
          viewMode={list.viewMode}
          onViewModeChange={list.handleViewMode}
          formRef={formRef}
          newTooltip="Novo número de série"
          noSelectionText="Selecione um número de série"
        />
      }
    >
      <div style={{ display: !inForm && list.isListMode ? 'contents' : 'none' }}>
        <DataGrid
          ref={list.gridRef}
          tabId={tab.id}
          storageId="numeroserie"
          columns={columns}
          data={itens}
          serverSide total={total} totalGeral={totalGeral}
          hasMore={hasMore} onCarregarMais={carregarMais}
          loading={isLoading}
          loadingText="Carregando séries..."
          onSelect={(item) => list.setSelectedItem(item as NumeroSerie | null)}
          onActivate={(item) => page.openView(item as NumeroSerie)}
        />
      </div>
      <div style={{ display: !inForm && !list.isListMode ? 'contents' : 'none' }}>
        <CardGrid
          ref={list.cardGridRef}
          data={itens}
          selectedId={list.selectedCardId}
          onSelect={(s) => list.setSelectedCardId(s?.id ?? null)}
          onActivate={(item) => page.openView(item as NumeroSerie)}
          loading={isLoading}
          loadingText="Carregando séries..."
          emptyTitle="Nenhum número de série encontrado"
          renderCard={(s) => <NumeroSerieCard serie={s} />}
        />
      </div>

      {inForm && (
        <NumeroSerieForm
          key={page.resetKey}
          ref={formRef}
          mode={page.mode as 'view' | 'new' | 'edit'}
          serie={page.editingItem}
          onDirty={() => page.setDirty(true)}
          onSave={handleSave}
        />
      )}
    </PageShell>
  );
}
