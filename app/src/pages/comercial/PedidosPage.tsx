/**
 * PedidosPage.tsx — Página de pedidos de venda com modos list/view/new/edit
 *
 * Template: PageShell + PageActions + usePageMode (header, botões, modos)
 * Hooks: useListState (search, filtro, seleção), useDeleteDialog (exclusão)
 * Página: colunas, form, card, callbacks de CRUD
 *
 * Diferenças em relação às páginas CRUD simples:
 *   - Edit/delete só permitido quando status === 'Orcamento'
 *   - Botões de transição de status no view mode via extraActions
 *   - Itens do pedido gerenciados dentro do PedidoForm (não no grid)
 *   - Filtro checklist no status
 */

import { useEffect, useRef, useMemo, useCallback } from 'react';
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
import type { PedidoFormHandle } from '@/components/comercial/PedidoForm';
import { STATUS_LABELS, STATUS_COLORS, TRANSICOES_STATUS } from '@/types/comercial/pedido.types';
import type { PedidoVenda, PedidoVendaFormData, StatusPedido } from '@/types/comercial/pedido.types';

// ─── Constantes ───────────────────────────────────────────────────────────────

interface PedidosPageProps {
  tab: { id: string; type: string; title: string };
}

const SEARCH_COLUMNS: SearchColumn[] = [
  { key: 'codigo', label: 'Código' },
  { key: 'clienteNome', label: 'Cliente' },
];

const STATUS_OPTIONS = [
  { label: 'Orçamento', value: 'Orcamento' },
  { label: 'Aprovado', value: 'Aprovado' },
  { label: 'Em Produção', value: 'EmProducao' },
  { label: 'Concluído', value: 'Concluido' },
  { label: 'Entregue', value: 'Entregue' },
  { label: 'Cancelado', value: 'Cancelado' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(val?: number) {
  if (val == null) return '-';
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(val?: string) {
  if (!val) return '-';
  return new Date(val).toLocaleDateString('pt-BR');
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function PedidoCard({ pedido }: { pedido: PedidoVenda }) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <p className="font-mono font-semibold text-sm text-slate-800 dark:text-slate-200">
          {pedido.codigo || '-'}
        </p>
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLORS[pedido.status] || ''}`}>
          {STATUS_LABELS[pedido.status] || pedido.status}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1 truncate">{pedido.clienteNome || '-'}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-muted-foreground">{pedido.totalItens ?? 0} itens</span>
        <span className="text-xs font-mono font-medium text-green-700 dark:text-green-400">
          {formatCurrency((pedido as any).valorTotal ?? (pedido as any).total)}
        </span>
      </div>
    </div>
  );
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function PedidosPage({ tab }: PedidosPageProps) {
  const formRef = useRef<PedidoFormHandle>(null);

  const page = usePageMode<PedidoVenda>(tab.id, (p) => String(p.id), tab.type);

  // ─── Store ──────────────────────────────────────────────────────────────────

  const pedidos = usePedidosStore((s) => s.pedidos);
  const isLoading = usePedidosStore((s) => s.isLoading);
  const error = usePedidosStore((s) => s.error);
  const fetchPedidos = usePedidosStore((s) => s.fetchPedidos);
  const createPedido = usePedidosStore((s) => s.createPedido);
  const updatePedido = usePedidosStore((s) => s.updatePedido);
  const deletePedido = usePedidosStore((s) => s.deletePedido);
  const alterarStatus = usePedidosStore((s) => s.alterarStatus);

  useEffect(() => { fetchPedidos(); }, [fetchPedidos]);
  useEffect(() => { if (error) toast.error(error); }, [error]);

  // ─── Lista (search, filtro, seleção, viewMode) ─────────────────────────────

  const list = useListState<PedidoVenda>({
    tabId: tab.id,
    data: pedidos,
    searchColumns: SEARCH_COLUMNS,
    defaultSearchCols: ['codigo'],
  });

  // ─── Delete ─────────────────────────────────────────────────────────────────

  const del = useDeleteDialog<PedidoVenda>({
    onDelete: (p) => deletePedido(p.id),
    onAfterDelete: (p) => {
      if (p.id === list.selectedCardId) list.setSelectedCardId(null);
    },
    successMessage: 'Pedido excluído.',
  });

  // ─── Save (cabeçalho) ──────────────────────────────────────────────────────

  const handleSave = useCallback(async (data: PedidoVendaFormData) => {
    if (page.mode === 'edit' && page.editingItem) {
      await updatePedido(page.editingItem.id, data);
    } else {
      const novo = await createPedido(data);
      // Após criar, abre em edit pra poder adicionar itens
      if (novo) {
        await fetchPedidos();
        page.openEdit(novo);
      }
    }
  }, [page.mode, page.editingItem, updatePedido, createPedido, fetchPedidos, page]);

  // ─── Status actions (extraActions no view mode) ─────────────────────────────

  const statusActions = useMemo(() => {
    if (page.mode !== 'view' || !page.editingItem) return null;
    const pedido = page.editingItem;
    const transicoes = TRANSICOES_STATUS[pedido.status] || [];
    if (transicoes.length === 0) return null;

    const handleChange = async (novoStatus: StatusPedido) => {
      try {
        await alterarStatus(pedido.id, novoStatus);
        await fetchPedidos();
        // Atualiza o item no view com o novo status
        const atualizado = { ...pedido, status: novoStatus };
        page.openView(atualizado);
        toast.success(`Status alterado para ${STATUS_LABELS[novoStatus]}.`);
      } catch {
        toast.error('Erro ao alterar status.');
      }
    };

    return (
      <div className="flex items-center gap-1">
        {transicoes.map((novoStatus) => (
          <Button
            key={novoStatus}
            variant="outline"
            size="sm"
            className={`text-xs h-7 ${novoStatus === 'Cancelado' ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' : ''}`}
            onClick={() => handleChange(novoStatus)}
          >
            → {STATUS_LABELS[novoStatus]}
          </Button>
        ))}
      </div>
    );
  }, [page.mode, page.editingItem, alterarStatus, fetchPedidos, page]);

  // ─── Regras de negócio: edit/delete só em Orcamento ─────────────────────────

  /** Callback de delete que valida status antes de abrir dialog */
  const handleRequestDelete = useCallback((p: PedidoVenda) => {
    if (p.status !== 'Orcamento') {
      toast.error('Só é possível excluir pedidos com status Orçamento.');
      return;
    }
    del.requestDelete(p);
  }, [del]);

  // ─── Colunas ────────────────────────────────────────────────────────────────

  const columns: GridColumn<PedidoVenda>[] = useMemo(() => [
    {
      key: 'codigo', header: 'Código', width: 170, minWidth: 120,
      filterType: 'exact',
      render: (p) => <span className="font-mono font-medium">{p.codigo || '-'}</span>,
    },
    {
      key: 'clienteNome', header: 'Cliente', width: 250, minWidth: 150,
    },
    {
      key: 'status', header: 'Status', width: 140, minWidth: 100,
      filterType: 'checklist', filterOptions: STATUS_OPTIONS,
      render: (p) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[p.status] || ''}`}>
          {STATUS_LABELS[p.status] || p.status}
        </span>
      ),
    },
    {
      key: 'totalItens', header: 'Itens', width: 80, minWidth: 60,
      contentAlign: 'right',
      render: (p) => <span className="font-mono">{p.totalItens ?? 0}</span>,
    },
    {
      key: 'valorTotal', header: 'Valor Total', width: 140, minWidth: 100,
      contentAlign: 'right',
      render: (p) => (
        <span className="font-mono">
          {formatCurrency((p as any).valorTotal ?? (p as any).total)}
        </span>
      ),
    },
    {
      key: 'criadoEm', header: 'Data', width: 110, minWidth: 80,
      contentAlign: 'center',
      render: (p) => formatDate(p.criadoEm),
    },
  ], []);

  // ─── Render ─────────────────────────────────────────────────────────────────

  const inForm = page.mode !== 'list';

  return (
    <PageShell module="Comercial" title="Pedidos de Venda" mode={page.mode}
      footer={page.mode === 'list' ? (
        <ListFooter filtered={list.filtrados.length} total={pedidos.length} />
      ) : undefined}
      headerRight={
        <PageActions
          page={page}
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
          extraActions={statusActions}
          newTooltip="Novo pedido"
          noSelectionText="Selecione um pedido"
        />
      }
    >

      {/* Grid e Cards sempre montados — alterna visibilidade */}
      <div style={{ display: !inForm && list.isListMode ? 'contents' : 'none' }}>
          <DataGrid
            ref={list.gridRef} tabId={tab.id} storageId="pedidos-venda"
            columns={columns} data={list.filtrados}
            loading={isLoading} loadingText="Carregando pedidos..."
            emptyTitle="Nenhum pedido encontrado" emptyDescription="Crie o primeiro pedido"
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
            ref={list.cardGridRef} data={list.filtrados} selectedId={list.selectedCardId}
            onSelect={(p) => list.setSelectedCardId(p?.id ?? null)}
            onActivate={(item) => page.openView(item as PedidoVenda)}
            loading={isLoading} loadingText="Carregando pedidos..."
            emptyTitle="Nenhum pedido encontrado" emptyDescription="Crie o primeiro pedido"
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
        />
      )}

      <PedidoDeleteDialog
        open={del.open} onOpenChange={del.setOpen}
        pedido={del.item} onConfirm={del.confirmDelete}
      />

    </PageShell>
  );
}




