/**
 * LiberacaoProjetosPage.tsx — Engenharia libera Projetos (Produto BOM) para PVs.
 *
 * Padrão idêntico a NumeroSeriePage / ProdutosPage:
 *   - Grid é overview (sem botão de ação por linha)
 *   - Header tem os botões padrão (view, edit) — sem new/delete (PVs vêm do Comercial)
 *   - Editar abre form com picker de Projeto BOM
 */

import { useEffect, useMemo, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { usePedidosStore } from '@/stores/comercial/pedidosStore';
import { PageShell, usePageMode, PageActions } from '@/components/shared/PageShell';
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
  type PedidoVenda,
} from '@/types/comercial/pedido.types';
import {
  LiberacaoProjetoForm,
  type LiberacaoProjetoFormHandle,
} from '@/components/engenharia/LiberacaoProjetoForm';

interface PageProps {
  tab: { id: string; type: string; title: string };
}

const SEARCH_COLUMNS: SearchColumn[] = [
  { key: 'codigo', label: 'Código PV' },
  { key: 'clienteCodigo', label: 'Cód. Cliente' },
  { key: 'clienteNome', label: 'Cliente' },
  { key: 'produtoBomCodigo', label: 'Cód. Projeto' },
  { key: 'produtoBomDescricao', label: 'Projeto' },
];

const TIPO_OPTIONS = [
  { label: 'Normal', value: 'Normal' },
  { label: 'Pré-venda', value: 'PreVenda' },
];

const SITUACAO_OPTIONS = [
  { label: 'Liberado', value: 'liberado' },
  { label: 'Sem projeto', value: 'sem' },
];

function PedidoCard({ pv }: { pv: PedidoVenda }) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono font-semibold text-sm truncate">{pv.codigo}</p>
        <span
          className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
            TIPO_PV_COLORS[pv.tipo] || ''
          }`}
        >
          {TIPO_PV_LABELS[pv.tipo] || pv.tipo}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1 truncate">
        {pv.clienteCodigo} — {pv.clienteNome}
      </p>
      <div className="flex items-center justify-between mt-2 gap-2">
        {pv.produtoBomCodigo ? (
          <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 truncate">
            ✓ {pv.produtoBomCodigo}
          </span>
        ) : (
          <span className="text-[11px] italic text-amber-700 dark:text-amber-400">
            Sem projeto
          </span>
        )}
      </div>
    </div>
  );
}

export function LiberacaoProjetosPage({ tab }: PageProps) {
  const formRef = useRef<LiberacaoProjetoFormHandle>(null);
  const page = usePageMode<PedidoVenda>(tab.id, (p) => String(p.id), tab.type);

  const pedidos = usePedidosStore((s) => s.pedidos);
  const isLoading = usePedidosStore((s) => s.isLoading);
  const error = usePedidosStore((s) => s.error);
  const fetchPedidos = usePedidosStore((s) => s.fetchPedidos);
  const definirProjeto = usePedidosStore((s) => s.definirProjeto);

  useEffect(() => {
    void fetchPedidos();
  }, [fetchPedidos]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const list = useListState<PedidoVenda>({
    tabId: tab.id,
    data: pedidos,
    searchColumns: SEARCH_COLUMNS,
    defaultSearchCols: ['codigo', 'clienteNome', 'produtoBomCodigo'],
  });

  const handleSave = useCallback(
    async (produtoBomId: number | null) => {
      if (!page.editingItem) return;
      await definirProjeto(page.editingItem.id, produtoBomId);
      toast.success(
        produtoBomId
          ? 'Projeto liberado.'
          : 'Projeto removido.',
      );
    },
    [page.editingItem, definirProjeto],
  );

  const columns: GridColumn<PedidoVenda>[] = useMemo(
    () => [
      {
        key: 'codigo',
        header: 'CÓDIGO PV',
        width: 140,
        contentAlign: 'center',
        filterType: 'text',
        className: 'font-mono',
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
        render: (p) => <span className="truncate">{p.clienteNome || '-'}</span>,
      },
      {
        key: 'tipo',
        header: 'TIPO',
        width: 110,
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
        key: 'status',
        header: 'STATUS',
        width: 140,
        contentAlign: 'center',
        filterType: 'text',
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
        key: 'produtoBomCodigo',
        header: 'CÓD. PROJETO',
        width: 140,
        contentAlign: 'center',
        filterType: 'text',
        className: 'font-mono',
        render: (p) =>
          p.produtoBomCodigo ? (
            <span className="text-emerald-700 dark:text-emerald-400">
              {p.produtoBomCodigo}
            </span>
          ) : (
            <span className="text-xs italic text-amber-700 dark:text-amber-400">—</span>
          ),
      },
      {
        key: 'produtoBomDescricao',
        header: 'PROJETO',
        width: 280,
        filterType: 'text',
        render: (p) =>
          p.produtoBomDescricao ? (
            <span className="truncate">{p.produtoBomDescricao}</span>
          ) : (
            <span className="text-xs italic text-amber-700 dark:text-amber-400">
              Não liberado
            </span>
          ),
      },
      {
        key: 'situacao',
        header: 'SITUAÇÃO',
        width: 130,
        contentAlign: 'center',
        filterType: 'checklist',
        filterOptions: SITUACAO_OPTIONS,
        render: (p) => (
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
              p.produtoBomId
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
            }`}
          >
            {p.produtoBomId ? 'Liberado' : 'Sem projeto'}
          </span>
        ),
      },
    ],
    [],
  );

  const inForm = page.mode !== 'list';

  return (
    <PageShell
      module="Engenharia"
      title="Liberação de Projetos"
      mode={page.mode}
      footer={
        page.mode === 'list' ? (
          <ListFooter filtered={list.filtrados.length} total={pedidos.length} />
        ) : undefined
      }
      headerRight={
        <PageActions
          page={page}
          activeItem={list.activeItem}
          hideButtons={['new', 'delete']}
          searchColumns={SEARCH_COLUMNS}
          searchTerm={list.searchTerm}
          onSearchChange={list.setSearchTerm}
          searchSelectedColumns={list.searchCols}
          onSearchColumnsChange={list.setSearchCols}
          gridRef={list.gridRef}
          viewMode={list.viewMode}
          onViewModeChange={list.handleViewMode}
          formRef={formRef}
          editTooltip="Liberar / trocar projeto"
          noSelectionText="Selecione um pedido"
        />
      }
    >
      <div style={{ display: !inForm && list.isListMode ? 'contents' : 'none' }}>
        <DataGrid
          ref={list.gridRef}
          tabId={tab.id}
          storageId="liberacao-projetos"
          columns={columns}
          data={list.filtrados}
          loading={isLoading}
          loadingText="Carregando pedidos..."
          emptyTitle="Nenhum pedido encontrado"
          onSelect={(item) => list.setSelectedItem(item as PedidoVenda | null)}
          onActivate={(item) => page.openView(item as PedidoVenda)}
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
          renderCard={(p) => <PedidoCard pv={p} />}
        />
      </div>

      {inForm && (
        <LiberacaoProjetoForm
          key={page.resetKey}
          ref={formRef}
          mode={page.mode as 'view' | 'edit'}
          pedido={page.editingItem}
          onDirty={() => page.setDirty(true)}
          onSave={handleSave}
        />
      )}
    </PageShell>
  );
}
