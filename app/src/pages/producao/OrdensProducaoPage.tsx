/**
 * OrdensProducaoPage.tsx — Página de Ordens de Produção (list + view + new + edit)
 *
 * Modelo: ProdutosPage / NumeroSeriePage (PageShell + PageActions + usePageMode).
 *
 * Particularidades:
 *   - Listagem mostra OPs Master e Filhas (back retorna todas).
 *   - View mode mostra detalhes da OP: itens (qtd planejada/produzida/%), filhas (se Master),
 *     histórico, painel de status.
 *   - Apontamento e ações de status entram via Fase 3 (componentes filhos).
 *   - Form (criar Master) entra via Fase 2.
 */

import { useEffect, useMemo, useCallback, useRef } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useOrdemProducaoStore } from '@/stores/producao/ordemProducaoStore';
import { PageShell, usePageMode, PageActions } from '@/components/shared/PageShell';
import { DataGrid } from '@/components/shared/DataGrid';
import type { GridColumn } from '@/components/shared/DataGrid';
import { CardGrid } from '@/components/shared/CardGrid';
import { ListFooter } from '@/components/shared/ListFooter';
import type { SearchColumn } from '@/components/shared/SearchBar';
import { Button } from '@/components/ui/button';
import { useListState } from '@/hooks/useListState';
import {
  STATUS_OP_COLORS,
  STATUS_OP_LABELS,
  type OrdemProducao,
} from '@/types/producao/ordemProducao.types';
import { OrdemProducaoForm } from '@/components/producao/OrdemProducaoForm';
import type {
  OrdemProducaoFormHandle,
  OrdemProducaoFormData,
} from '@/components/producao/OrdemProducaoForm';

interface OrdensProducaoPageProps {
  tab: { id: string; type: string; title: string };
}

const SEARCH_COLUMNS: SearchColumn[] = [
  { key: 'codigo', label: 'Código OP' },
  { key: 'pedidoVendaCodigo', label: 'Pedido' },
  { key: 'clienteCodigo', label: 'Cód. Cliente' },
  { key: 'clienteNome', label: 'Cliente' },
  { key: 'produtoCodigo', label: 'Produto (código)' },
  { key: 'produtoDescricao', label: 'Produto (descrição)' },
];

const STATUS_OPTIONS = [
  { label: 'Pendente', value: 'Pendente' },
  { label: 'Em Andamento', value: 'Andamento' },
  { label: 'Pausada', value: 'Pausada' },
  { label: 'Concluída', value: 'Concluida' },
  { label: 'Cancelada', value: 'Cancelada' },
];

const TIPO_OPTIONS = [
  { label: 'Master', value: 'master' },
  { label: 'Filha', value: 'filha' },
];

function formatDate(val?: string | null) {
  if (!val) return '-';
  try {
    return new Date(val).toLocaleDateString('pt-BR');
  } catch {
    return '-';
  }
}

function calcPercentualOp(op: OrdemProducao): number {
  if (!op.itens || op.itens.length === 0) return 0;
  const soma = op.itens.reduce((acc, i) => acc + (i.percentualConcluido ?? 0), 0);
  return Math.round(soma / op.itens.length);
}

function OrdemProducaoCard({ op }: { op: OrdemProducao }) {
  const pct = calcPercentualOp(op);
  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">
          {op.codigo}
        </p>
        <span
          className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
            STATUS_OP_COLORS[op.status] || ''
          }`}
        >
          {STATUS_OP_LABELS[op.status] || op.status}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1 truncate">
        {op.produtoCodigo} — {op.produtoDescricao}
      </p>
      {op.pedidoVendaCodigo && (
        <p className="text-[11px] text-muted-foreground font-mono mt-1 truncate">
          PV: {op.pedidoVendaCodigo}
        </p>
      )}
      <div className="flex items-center justify-between mt-2 gap-2">
        <span className="text-[10px] text-muted-foreground">
          {op.ehMaster ? 'Master' : 'Filha'}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground">{pct}%</span>
      </div>
    </div>
  );
}

export function OrdensProducaoPage({ tab }: OrdensProducaoPageProps) {
  const formRef = useRef<OrdemProducaoFormHandle>(null);
  const page = usePageMode<OrdemProducao>(tab.id, (o) => String(o.id), tab.type);

  // ─── Store OPs ────────────────────────────────────────────────────────
  const ordens = useOrdemProducaoStore((s) => s.ordens);
  const isLoading = useOrdemProducaoStore((s) => s.isLoading);
  const error = useOrdemProducaoStore((s) => s.error);
  const fetchOrdens = useOrdemProducaoStore((s) => s.fetchOrdens);
  const criarMaster = useOrdemProducaoStore((s) => s.criarMaster);
  const updateOrdem = useOrdemProducaoStore((s) => s.updateOrdem);

  useEffect(() => {
    void fetchOrdens();
  }, [fetchOrdens]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // ─── Lista ────────────────────────────────────────────────────────────
  const list = useListState<OrdemProducao>({
    tabId: tab.id,
    data: ordens,
    searchColumns: SEARCH_COLUMNS,
    defaultSearchCols: ['codigo', 'pedidoVendaCodigo', 'produtoDescricao'],
  });

  // ─── Save ─────────────────────────────────────────────────────────────
  const handleSave = useCallback(
    async (data: OrdemProducaoFormData) => {
      if (page.mode === 'edit' && page.editingItem) {
        await updateOrdem(page.editingItem.id, { observacoes: data.observacoes ?? '' });
      } else {
        await criarMaster({
          pedidoVendaId: data.pedidoVendaId ?? null,
          produtoId: data.produtoId,
          observacoes: data.observacoes,
        });
      }
    },
    [page.mode, page.editingItem, criarMaster, updateOrdem],
  );

  // ─── Colunas ──────────────────────────────────────────────────────────
  const columns: GridColumn<OrdemProducao>[] = useMemo(
    () => [
      {
        key: 'codigo',
        header: 'CÓDIGO',
        width: 180,
        minWidth: 140,
        contentAlign: 'center',
        filterType: 'text',
        className: 'font-mono',
      },
      {
        key: 'tipo',
        header: 'TIPO',
        width: 90,
        contentAlign: 'center',
        filterType: 'checklist',
        filterOptions: TIPO_OPTIONS,
        render: (o) => (
          <span className="text-xs text-muted-foreground">
            {o.ehMaster ? 'Master' : 'Filha'}
          </span>
        ),
      },
      {
        key: 'pedidoVendaCodigo',
        header: 'PEDIDO',
        width: 130,
        contentAlign: 'center',
        filterType: 'text',
        className: 'font-mono',
        render: (o) =>
          o.pedidoVendaCodigo ? (
            <span>{o.pedidoVendaCodigo}</span>
          ) : (
            <span className="text-xs text-muted-foreground italic">Estoque</span>
          ),
      },
      {
        key: 'clienteCodigo',
        header: 'CÓD. CLIENTE',
        width: 120,
        contentAlign: 'center',
        filterType: 'text',
        className: 'font-mono',
      },
      {
        key: 'clienteNome',
        header: 'CLIENTE',
        width: 220,
        filterType: 'text',
        render: (o) => <span className="truncate">{o.clienteNome || '-'}</span>,
      },
      {
        key: 'produtoCodigo',
        header: 'CÓD. PRODUTO',
        width: 130,
        contentAlign: 'center',
        filterType: 'text',
        className: 'font-mono',
      },
      {
        key: 'produtoDescricao',
        header: 'PRODUTO',
        width: 240,
        filterType: 'text',
        render: (o) => <span className="truncate">{o.produtoDescricao || '-'}</span>,
      },
      {
        key: 'status',
        header: 'STATUS',
        width: 140,
        contentAlign: 'center',
        filterType: 'checklist',
        filterOptions: STATUS_OPTIONS,
        render: (o) => (
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
              STATUS_OP_COLORS[o.status] || ''
            }`}
          >
            {STATUS_OP_LABELS[o.status] || o.status}
          </span>
        ),
      },
      {
        key: 'percentual',
        header: '%',
        width: 80,
        contentAlign: 'center',
        render: (o) => (
          <span className="font-mono text-xs">{calcPercentualOp(o)}%</span>
        ),
      },
      {
        key: 'dataInicio',
        header: 'INÍCIO',
        width: 110,
        contentAlign: 'center',
        render: (o) => formatDate(o.dataInicio),
      },
      {
        key: 'dataFim',
        header: 'FIM',
        width: 110,
        contentAlign: 'center',
        render: (o) => formatDate(o.dataFim),
      },
    ],
    [],
  );

  // ─── Render ───────────────────────────────────────────────────────────
  const inForm = page.mode !== 'list';

  return (
    <PageShell
      module="Produção"
      title="Ordens de Produção"
      mode={page.mode}
      footer={
        page.mode === 'list' ? (
          <ListFooter filtered={list.filtrados.length} total={ordens.length} />
        ) : undefined
      }
      headerRight={
        <PageActions
          page={page}
          activeItem={list.activeItem}
          hideButtons={['delete']}
          searchColumns={SEARCH_COLUMNS}
          searchTerm={list.searchTerm}
          onSearchChange={list.setSearchTerm}
          searchSelectedColumns={list.searchCols}
          onSearchColumnsChange={list.setSearchCols}
          gridRef={list.gridRef}
          viewMode={list.viewMode}
          onViewModeChange={list.handleViewMode}
          formRef={formRef}
          newTooltip="Nova ordem de produção (Master)"
          noSelectionText="Selecione uma ordem"
        />
      }
    >
      <div style={{ display: !inForm && list.isListMode ? 'contents' : 'none' }}>
        <DataGrid
          ref={list.gridRef}
          tabId={tab.id}
          storageId="ordens-producao"
          columns={columns}
          data={list.filtrados}
          loading={isLoading}
          loadingText="Carregando ordens..."
          emptyTitle="Nenhuma ordem de produção encontrada"
          emptyDescription="Crie a primeira ordem"
          onSelect={(item) => list.setSelectedItem(item as OrdemProducao | null)}
          onActivate={(item) => page.openView(item as OrdemProducao)}
          emptyAction={
            <Button onClick={() => page.openNew()}>
              <Plus className="mr-2 h-4 w-4" /> Criar Primeira
            </Button>
          }
        />
      </div>

      <div style={{ display: !inForm && !list.isListMode ? 'contents' : 'none' }}>
        <CardGrid
          ref={list.cardGridRef}
          data={list.filtrados}
          selectedId={list.selectedCardId}
          onSelect={(o) => list.setSelectedCardId(o?.id ?? null)}
          onActivate={(item) => page.openView(item as OrdemProducao)}
          loading={isLoading}
          loadingText="Carregando ordens..."
          emptyTitle="Nenhuma ordem de produção encontrada"
          emptyDescription="Crie a primeira ordem"
          renderCard={(o) => <OrdemProducaoCard op={o} />}
          emptyAction={
            <Button onClick={() => page.openNew()}>
              <Plus className="mr-2 h-4 w-4" /> Criar Primeira
            </Button>
          }
        />
      </div>

      {inForm && (
        <OrdemProducaoForm
          key={page.resetKey}
          ref={formRef}
          mode={page.mode as 'view' | 'new' | 'edit'}
          ordem={page.editingItem}
          tabId={tab.id}
          onDirty={() => page.setDirty(true)}
          onSave={handleSave}
        />
      )}
    </PageShell>
  );
}
