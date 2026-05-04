/**
 * PedidosPage.tsx - Página de Pedidos de Venda
 *
 * Mudanças:
 *   - Sem toast.success extra no handleSave (usePageMode já mostra "Registro atualizado")
 *   - Usa onDirtyChange (form reporta dirty derivado, não set-once)
 *   - Mensagem de erro vem só do store (sem genérico do PageActions)
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { usePedidosStore } from '@/stores/comercial/pedidosStore';
import { useClientesStore } from '@/stores/admin/clientesStore';
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

interface PedidosPageProps {
  tab: { id: string; type: string; title: string };
}

const SEARCH_COLUMNS: SearchColumn[] = [
  { key: 'codigo', label: 'Código PV' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'status', label: 'Status' },
  { key: 'clienteCodigo', label: 'Código Cliente' },
  { key: 'clienteNome', label: 'Cliente' },
  { key: 'clienteCpfCnpj', label: 'CPF/CNPJ' },
  { key: 'clienteEstado', label: 'Estado' },
  { key: 'clienteCidade', label: 'Cidade' },
  { key: 'data', label: 'Data' },
  { key: 'dataEntrega', label: 'Entrega' },
];

const DEFAULT_SEARCH_COLS = ['codigo', 'clienteCodigo', 'clienteNome'];

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

/**
 * Pedido enriquecido com dados do Cliente (CPF/CNPJ, Estado, Cidade) que
 * não vêm no PedidoVenda do back. Esses campos são populados via lookup
 * no array `clientes` (já carregado em memória pelo store de clientes).
 *
 * Ficam como campos opcionais; se o cliente não estiver no cache local
 * (caso raro), aparecem como '-'.
 */
type PedidoVendaEnriched = PedidoVenda & {
  clienteCpfCnpj?: string | null;
  clienteEstado?: string | null;
  clienteCidade?: string | null;
};

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

export function PedidosPage({ tab }: PedidosPageProps) {
  const formRef = useRef<PedidoFormHandle>(null);

  const page = usePageMode<PedidoVenda>(tab.id, (p) => String(p.id), tab.type);

  const pedidos = usePedidosStore((s) => s.pedidos);
  const pedidoDetalhe = usePedidosStore((s) => s.pedidoDetalhe);
  const isLoading = usePedidosStore((s) => s.isLoading);
  const error = usePedidosStore((s) => s.error);
  const fetchPedidos = usePedidosStore((s) => s.fetchPedidos);
  const fetchPedido = usePedidosStore((s) => s.fetchPedido);
  const createPedido = usePedidosStore((s) => s.createPedido);
  const updatePedido = usePedidosStore((s) => s.updatePedido);
  const deletePedido = usePedidosStore((s) => s.deletePedido);
  const alterarStatus = usePedidosStore((s) => s.alterarStatus);
  const clearError = usePedidosStore((s) => s.clearError);

  // Clientes - usados para enriquecer pedidos com CPF/CNPJ, Estado, Cidade
  const clientes = useClientesStore((s) => s.clientes);
  const fetchClientes = useClientesStore((s) => s.fetchClientes);

  useEffect(() => {
    void fetchPedidos();
    if (clientes.length === 0) void fetchClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPedidos]);

  // Toast de erro vindo do store - única fonte
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Index de clientes por id para lookup O(1) no enriquecimento dos pedidos
  const clientesById = useMemo(() => {
    const map = new Map<number, (typeof clientes)[number]>();
    for (const c of clientes) map.set(c.id, c);
    return map;
  }, [clientes]);

  // Pedidos enriquecidos com CPF/CNPJ, Estado e Cidade vindos da tabela de clientes
  const pedidosEnriched = useMemo<PedidoVendaEnriched[]>(() => {
    return pedidos.map((p) => {
      const c = clientesById.get(p.clienteId);
      return {
        ...p,
        clienteCpfCnpj: c?.cpfCnpj ?? null,
        clienteEstado: c?.estado ?? null,
        clienteCidade: c?.cidade ?? null,
      };
    });
  }, [pedidos, clientesById]);

  const pedidoVivo = useMemo<PedidoVenda | null>(() => {
    if (!page.editingItem) return null;
    const id = page.editingItem.id;
    if (pedidoDetalhe && pedidoDetalhe.id === id) return pedidoDetalhe;
    return pedidos.find((p) => p.id === id) ?? page.editingItem;
  }, [page.editingItem, pedidoDetalhe, pedidos]);

  useEffect(() => {
    if (page.mode === 'view' || page.mode === 'edit') {
      if (page.editingItem?.id) {
        void fetchPedido(page.editingItem.id);
      }
    }
  }, [page.mode, page.editingItem?.id, fetchPedido]);

  const list = useListState<PedidoVendaEnriched>({
    tabId: tab.id,
    data: pedidosEnriched,
    searchColumns: SEARCH_COLUMNS,
    defaultSearchCols: DEFAULT_SEARCH_COLS,
  });

  const [formHelp, setFormHelp] = useState<string | null>(null);

  const del = useDeleteDialog<PedidoVenda>({
    onDelete: (p) => deletePedido(p.id),
    onAfterDelete: (p) => {
      if (p.id === list.selectedCardId) list.setSelectedCardId(null);
    },
    successMessage: 'Pedido excluído.',
  });

  /**
   * Save orquestrado:
   *   - create:      POST
   *   - update:      PUT + opcional PATCH /status
   *   - status-only: SÓ PATCH /status (sem PUT)
   *
   * Sem toasts de sucesso aqui - usePageMode já mostra "Registro atualizado".
   * Erros vêm via store.error (toast unificado no useEffect acima).
   */
  const handleSave = useCallback(
    async (payload: PedidoFormPayload) => {
      if (payload.kind === 'create') {
        const novo = await createPedido(payload.data);
        if (novo) {
          await fetchPedidos();
          page.openEdit(novo);
        }
        return;
      }

      if (!page.editingItem) return;
      const id = page.editingItem.id;

      if (payload.kind === 'status-only') {
        await alterarStatus(
          id,
          payload.statusPendente,
          payload.justificativaPendente,
        );
        await fetchPedidos();
        await fetchPedido(id);
        return;
      }

      // update
      await updatePedido(id, payload.data);

      if (payload.statusPendente) {
        await alterarStatus(
          id,
          payload.statusPendente,
          payload.justificativaPendente,
        );
      }

      await fetchPedidos();
      await fetchPedido(id);
    },
    [
      page,
      updatePedido,
      createPedido,
      fetchPedidos,
      fetchPedido,
      alterarStatus,
    ],
  );

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

  const columns: GridColumn<PedidoVendaEnriched>[] = useMemo(
    () => [
      // 1. Código PV
      {
        key: 'codigo',
        header: 'Código PV',
        width: 170,
        minWidth: 120,
        filterType: 'exact',
        contentAlign: 'center',
        render: (p) => (
          <span className="font-mono font-medium">{p.codigo || '-'}</span>
        ),
      },
      // 2. Tipo
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
      // 3. Status
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
      // 4. Código Cliente
      {
        key: 'clienteCodigo',
        header: 'Código Cliente',
        width: 120,
        minWidth: 100,
        filterType: 'text',
        contentAlign: 'center',
        render: (p) =>
          p.clienteCodigo ? (
            <span className="font-mono text-xs">{p.clienteCodigo}</span>
          ) : (
            <span className="text-muted-foreground">-</span>
          ),
      },
      // 5. Cliente
      {
        key: 'clienteNome',
        header: 'Cliente',
        width: 240,
        minWidth: 160,
        filterType: 'text',
        render: (p) => (
          <span className="truncate">{p.clienteNome || '-'}</span>
        ),
      },
      // 6. CPF/CNPJ
      {
        key: 'clienteCpfCnpj',
        header: 'CPF/CNPJ',
        width: 150,
        minWidth: 120,
        filterType: 'text',
        render: (p) =>
          p.clienteCpfCnpj ? (
            <span className="font-mono text-xs">{p.clienteCpfCnpj}</span>
          ) : (
            <span className="text-muted-foreground">-</span>
          ),
      },
      // 7. Estado
      {
        key: 'clienteEstado',
        header: 'Estado',
        width: 80,
        minWidth: 70,
        contentAlign: 'center',
        filterType: 'text',
        render: (p) => p.clienteEstado || <span className="text-muted-foreground">-</span>,
      },
      // 8. Cidade
      {
        key: 'clienteCidade',
        header: 'Cidade',
        width: 160,
        minWidth: 120,
        filterType: 'text',
        render: (p) => (
          <span className="truncate">
            {p.clienteCidade || <span className="text-muted-foreground">-</span>}
          </span>
        ),
      },
      // 9. Data
      {
        key: 'data',
        header: 'Data',
        width: 110,
        minWidth: 90,
        contentAlign: 'center',
        render: (p) => formatDate(p.data),
      },
      // 10. Entrega
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
          pedido={pedidoVivo}
          onDirtyChange={page.setDirty}
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
