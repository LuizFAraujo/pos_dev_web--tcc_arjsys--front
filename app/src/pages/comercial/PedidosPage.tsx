/**
 * PedidosPage.tsx — Página de Pedidos de Venda (v3.1)
 *
 * Mudanças v3.1 em relação a v3:
 *   - Form agora devolve PedidoFormPayload (discriminado: create | update)
 *   - Edição bloqueada quando status em STATUS_BLOQUEADO (botão Editar escondido)
 *   - Coluna Cliente mostra badge [CLI-NNNN] + nome (quando disponível)
 *   - Footer contextual: help do form fica à esquerda; atalhos à direita
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { usePedidosStore } from '@/stores/comercial/pedidosStore';
import { PageShell, usePageMode, PageActions } from '@/components/shared/PageShell';
import { DataGrid } from '@/components/shared/DataGrid';
import type { GridColumn } from '@/components/shared/DataGrid';
import { CardGrid } from '@/components/shared/CardGrid';
import { ListFooter } from '@/components/shared/ListFooter';
import type { SearchColumn } from '@/components/shared/SearchBar';
import { Button } from '@/components/ui/button';
import { useListState } from '@/hooks/useListState';
import { useDeleteDialog } from '@/hooks/useDeleteDialog';
import { PedidoDeleteDialog } from '@/components/comercial/PedidoDeleteDialog';
import { PedidoForm } from '@/components/comercial/PedidoForm';
import type {
  PedidoFormHandle,
  PedidoFormPayload,
} from '@/components/comercial/PedidoForm';
import {
  STATUS_COLORS,
  STATUS_LABELS,
  STATUS_PERMITE_DELETE,
  TIPO_PV_COLORS,
  TIPO_PV_LABELS,
  bloqueiaEdicao,
} from '@/types/comercial/pedido.types';
import type { PedidoVenda } from '@/types/comercial/pedido.types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface PedidosPageProps {
  tab: { id: string; type: string; title: string };
}

const SEARCH_COLUMNS: SearchColumn[] = [
  { key: 'codigo', label: 'Código' },
  { key: 'clienteCodigo', label: 'Cód. Cliente' },
  { key: 'clienteNome', label: 'Cliente' },
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(val?: string | null) {
  if (!val) return '-';
  try {
    return new Date(val).toLocaleDateString('pt-BR');
  } catch {
    return '-';
  }
}

// ─── Card (modo Cards) ────────────────────────────────────────────────────────

function PedidoCard({ pedido }: { pedido: PedidoVenda }) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">
          {pedido.codigo || '-'}
        </p>
        <span
          className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
            STATUS_COLORS[pedido.status] || ''
          }`}
        >
          {STATUS_LABELS[pedido.status] || pedido.status}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mt-1 min-w-0">
        {pedido.clienteCodigo && (
          <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
            {pedido.clienteCodigo}
          </span>
        )}
        <p className="text-xs text-muted-foreground truncate">
          {pedido.clienteNome || '-'}
        </p>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span
          className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${
            TIPO_PV_COLORS[pedido.tipo] || ''
          }`}
        >
          {TIPO_PV_LABELS[pedido.tipo] || pedido.tipo}
        </span>
        <span className="text-xs text-muted-foreground">
          {pedido.totalItens ?? 0} {pedido.totalItens === 1 ? 'item' : 'itens'}
        </span>
      </div>
    </div>
  );
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function PedidosPage({ tab }: PedidosPageProps) {
  const formRef = useRef<PedidoFormHandle>(null);

  const page = usePageMode<PedidoVenda>(tab.id, (p) => String(p.id), tab.type);

  // ── Store ────────────────────────────────────────────────────────────────
  const pedidos = usePedidosStore((s) => s.pedidos);
  const isLoading = usePedidosStore((s) => s.isLoading);
  const error = usePedidosStore((s) => s.error);
  const fetchPedidos = usePedidosStore((s) => s.fetchPedidos);
  const createPedido = usePedidosStore((s) => s.createPedido);
  const updatePedido = usePedidosStore((s) => s.updatePedido);
  const deletePedido = usePedidosStore((s) => s.deletePedido);

  useEffect(() => {
    void fetchPedidos();
  }, [fetchPedidos]);
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // ── Lista ────────────────────────────────────────────────────────────────
  const list = useListState<PedidoVenda>({
    tabId: tab.id,
    data: pedidos,
    searchColumns: SEARCH_COLUMNS,
    defaultSearchCols: ['codigo'],
  });

  // ── Footer contextual (help do form) ────────────────────────────────────
  const [formHelp, setFormHelp] = useState<string | null>(null);

  // ── Delete ─────────────────────────────────────────────────────────────
  const del = useDeleteDialog<PedidoVenda>({
    onDelete: (p) => deletePedido(p.id),
    onAfterDelete: (p) => {
      if (p.id === list.selectedCardId) list.setSelectedCardId(null);
    },
    successMessage: 'Pedido excluído.',
  });

  // ── Save (v3.1: recebe payload discriminado) ───────────────────────────
  const handleSave = useCallback(
    async (payload: PedidoFormPayload) => {
      if (payload.kind === 'update' && page.editingItem) {
        await updatePedido(page.editingItem.id, payload.data);
      } else if (payload.kind === 'create') {
        const novo = await createPedido(payload.data);
        if (novo) {
          await fetchPedidos();
          page.openEdit(novo);
        }
      }
    },
    [page, updatePedido, createPedido, fetchPedidos],
  );

  // ── Regras: delete só em status iniciais ────────────────────────────────
  const handleRequestDelete = useCallback(
    (p: PedidoVenda) => {
      if (!STATUS_PERMITE_DELETE.includes(p.status)) {
        toast.error(
          `Só é possível excluir pedidos em "${STATUS_LABELS['AguardandoNS']}" ou "${STATUS_LABELS['Liberado']}".`,
        );
        return;
      }
      del.requestDelete(p);
    },
    [del],
  );

  // ── Colunas ────────────────────────────────────────────────────────────
  const columns: GridColumn<PedidoVenda>[] = useMemo(
    () => [
      {
        key: 'codigo',
        header: 'Código',
        width: 170,
        minWidth: 120,
        filterType: 'exact',
        contentAlign: 'center',
        render: (p) => (
          <span className="font-mono font-medium">{p.codigo || '-'}</span>
        ),
      },
      {
        key: 'tipo',
        header: 'Tipo',
        width: 110,
        minWidth: 90,
        contentAlign: 'center',
        filterType: 'checklist',
        filterOptions: TIPO_OPTIONS,
        render: (p) => (
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
              TIPO_PV_COLORS[p.tipo] || ''
            }`}
          >
            {TIPO_PV_LABELS[p.tipo] || p.tipo}
          </span>
        ),
      },
      {
        key: 'clienteNome',
        header: 'Cliente',
        width: 280,
        minWidth: 160,
        render: (p) => (
          <div className="flex items-center gap-2 min-w-0">
            {p.clienteCodigo && (
              <span className="font-mono text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-muted rounded px-1.5 py-0.5 shrink-0">
                {p.clienteCodigo}
              </span>
            )}
            <span className="truncate">{p.clienteNome || '-'}</span>
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        width: 170,
        minWidth: 120,
        contentAlign: 'center',
        filterType: 'checklist',
        filterOptions: STATUS_OPTIONS,
        render: (p) => (
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
              STATUS_COLORS[p.status] || ''
            }`}
          >
            {STATUS_LABELS[p.status] || p.status}
          </span>
        ),
      },
      {
        key: 'totalItens',
        header: 'Itens',
        width: 80,
        minWidth: 60,
        contentAlign: 'center',
        render: (p) => <span className="font-mono">{p.totalItens ?? 0}</span>,
      },
      {
        key: 'data',
        header: 'Data',
        width: 110,
        minWidth: 90,
        contentAlign: 'center',
        render: (p) => formatDate(p.data),
      },
      {
        key: 'dataEntrega',
        header: 'Entrega',
        width: 110,
        minWidth: 90,
        contentAlign: 'center',
        render: (p) => formatDate(p.dataEntrega),
      },
    ],
    [],
  );

  // Wrap no openEdit pra bloquear abertura em edit de PVs em status terminal
  const pageWithGuardedEdit = useMemo(() => {
    const originalOpenEdit = page.openEdit;
    return {
      ...page,
      openEdit: (item: PedidoVenda) => {
        if (bloqueiaEdicao(item.status)) {
          toast.error(
            `Pedidos em "${STATUS_LABELS[item.status]}" não permitem edição.`,
          );
          page.openView(item);
          return;
        }
        originalOpenEdit(item);
      },
    };
  }, [page]);

  // ── Render ─────────────────────────────────────────────────────────────
  const inForm = page.mode !== 'list';

  return (
    <PageShell
      module="Comercial"
      title="Pedidos de Venda"
      mode={page.mode}
      footerLeft={inForm ? formHelp : undefined}
      headerRight={
        <PageActions
          page={pageWithGuardedEdit}
          activeItem={list.activeItem}
          onDelete={handleRequestDelete}
          lockMessage="Este pedido já está sendo editado em outra aba."
          searchColumns={SEARCH_COLUMNS}
          searchTerm={list.searchTerm}
          onSearchChange={list.setSearchTerm}
          searchSelectedColumns={list.searchCols}
          onSearchColumnsChange={list.setSearchCols}
          gridRef={list.gridRef}
          viewMode={list.viewMode}
          onViewModeChange={list.handleViewMode}
          formRef={formRef}
          newTooltip="Novo pedido"
          noSelectionText="Selecione um pedido"
        />
      }
      footer={
        page.mode === 'list' ? (
          <ListFooter filtered={list.filtrados.length} total={pedidos.length} />
        ) : undefined
      }
    >
      <div style={{ display: !inForm && list.isListMode ? 'contents' : 'none' }}>
        <DataGrid
          ref={list.gridRef}
          tabId={tab.id}
          storageId="pedidos-venda"
          columns={columns}
          data={list.filtrados}
          loading={isLoading}
          loadingText="Carregando pedidos..."
          emptyTitle="Nenhum pedido encontrado"
          emptyDescription="Crie o primeiro pedido"
          onSelect={(item) => list.setSelectedItem(item as PedidoVenda | null)}
          onActivate={(item) => page.openView(item as PedidoVenda)}
          emptyAction={
            <Button onClick={() => page.openNew()}>
              <Plus className="mr-2 h-4 w-4" /> Criar Primeiro
            </Button>
          }
        />
      </div>
      <div style={{ display: !inForm && !list.isListMode ? 'contents' : 'none' }}>
        <CardGrid
          ref={list.cardGridRef}
          data={list.filtrados}
          selectedId={list.selectedCardId}
          onSelect={(p) => list.setSelectedCardId(p?.id ?? null)}
          onActivate={(item) => page.openView(item as PedidoVenda)}
          loading={isLoading}
          loadingText="Carregando pedidos..."
          emptyTitle="Nenhum pedido encontrado"
          emptyDescription="Crie o primeiro pedido"
          renderCard={(p) => <PedidoCard pedido={p} />}
          emptyAction={
            <Button onClick={() => page.openNew()}>
              <Plus className="mr-2 h-4 w-4" /> Criar Primeiro
            </Button>
          }
        />
      </div>

      {inForm && (
        <PedidoForm
          key={page.resetKey}
          ref={formRef}
          mode={page.mode as 'view' | 'new' | 'edit'}
          pedido={page.editingItem}
          onDirty={() => page.setDirty(true)}
          onSave={handleSave}
          onHelpChange={setFormHelp}
        />
      )}

      <PedidoDeleteDialog
        open={del.open}
        onOpenChange={del.setOpen}
        pedido={del.item}
        onConfirm={del.confirmDelete}
      />
    </PageShell>
  );
}
