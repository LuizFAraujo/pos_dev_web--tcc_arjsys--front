import { useEffect, useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Eye, Search } from 'lucide-react';
import { usePedidosStore } from '@/stores/comercial/pedidosStore';
import { useTabState } from '@/hooks/useTabState';
import { PageShell } from '@/components/shared/PageShell';
import { DataGrid } from '@/components/shared/DataGrid/DataGrid';
import type { DataGridColumn } from '@/components/shared/DataGrid/DataGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PedidoFormModal } from '@/components/comercial/PedidoFormModal';
import { PedidoDetalheModal } from '@/components/comercial/PedidoDetalheModal';
import { DeletePedidoDialog } from '@/components/comercial/DeletePedidoDialog';
import { StatusPedidoActions } from '@/components/comercial/StatusPedidoActions';
import { STATUS_LABELS, STATUS_COLORS } from '@/types/comercial/pedido.types';
import type { PedidoVenda } from '@/types/comercial/pedido.types';

const STATUS_OPTIONS = [
  { label: 'Orcamento', value: 'Orcamento' },
  { label: 'Aprovado', value: 'Aprovado' },
  { label: 'Em Producao', value: 'EmProducao' },
  { label: 'Concluido', value: 'Concluido' },
  { label: 'Entregue', value: 'Entregue' },
  { label: 'Cancelado', value: 'Cancelado' },
];

interface PedidosPageProps { tab: { id: string; type: string; title: string }; }

export function PedidosPage({ tab }: PedidosPageProps) {
  const [searchTerm, setSearchTerm] = useTabState(tab.id, '');
  const [modalOpen, setModalOpen] = useState(false);
  const [detalheOpen, setDetalheOpen] = useState(false);
  const [pedidoEdit, setPedidoEdit] = useState<PedidoVenda | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pedidoDelete, setPedidoDelete] = useState<PedidoVenda | null>(null);
  const [pedidoDetalheId, setPedidoDetalheId] = useState<number | null>(null);

  const pedidos = usePedidosStore((s) => s.pedidos);
  const isLoading = usePedidosStore((s) => s.isLoading);
  const error = usePedidosStore((s) => s.error);
  const fetchPedidos = usePedidosStore((s) => s.fetchPedidos);
  const deletePedido = usePedidosStore((s) => s.deletePedido);

  useEffect(() => { fetchPedidos(); }, [fetchPedidos]);

  const filtrados = useMemo(() => {
    if (!searchTerm) return pedidos || [];
    const term = searchTerm.toLowerCase();
    return (pedidos || []).filter((p) => (p.codigo || '').toLowerCase().includes(term) || (p.clienteNome || '').toLowerCase().includes(term) || (p.status || '').toLowerCase().includes(term));
  }, [pedidos, searchTerm]);

  const formatCurrency = (val?: number) => val == null ? '-' : val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatDate = (val?: string) => !val ? '-' : new Date(val).toLocaleDateString('pt-BR');

  const columns: DataGridColumn<PedidoVenda>[] = [
    { key: 'codigo', header: 'Codigo', filterType: 'exact', render: (p) => <span className="font-mono font-medium">{p.codigo || '-'}</span> },
    { key: 'clienteNome', header: 'Cliente' },
    { key: 'status', header: 'Status', filterType: 'select', filterOptions: STATUS_OPTIONS, render: (p) => <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[p.status] || ''}`}>{STATUS_LABELS[p.status] || p.status}</span> },
    { key: 'totalItens', header: 'Itens', align: 'right', filterType: 'number' },
    { key: 'valorTotal', header: 'Valor Total', align: 'right', filterType: 'number', render: (p) => <span className="font-mono">{formatCurrency(p.valorTotal)}</span> },
    { key: 'criadoEm', header: 'Data', render: (p) => formatDate(p.criadoEm) },
    { key: 'acoes', header: 'Acoes', sortable: false, filterable: false, resizable: false, render: (p) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => { setPedidoDetalheId(p.id); setDetalheOpen(true); }} title="Ver"><Eye className="h-3.5 w-3.5" /></Button>
          {p.status === 'Orcamento' && (<><Button variant="ghost" size="sm" onClick={() => { setPedidoEdit(p); setModalOpen(true); }} title="Editar"><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" className="hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600" onClick={() => { setPedidoDelete(p); setDeleteDialogOpen(true); }} title="Excluir"><Trash2 className="h-3.5 w-3.5" /></Button></>)}
          <StatusPedidoActions pedido={p} />
        </div>
      ),
    },
  ];

  return (
    <PageShell breadcrumbs={[{ label: 'Comercial' }, { label: 'Pedidos de Venda' }]} title="Pedidos de Venda" tooltip="Gerencie pedidos de venda"
      headerRight={<Button onClick={() => { setPedidoEdit(null); setModalOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Novo Pedido</Button>}
      headerExtra={<div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Buscar por codigo, cliente ou status..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" /></div>}
      footer={<p className="text-sm text-muted-foreground">{filtrados.length} de {pedidos?.length || 0} pedidos</p>}
    >
      {error && <div className="mb-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">{error}</div>}
      <DataGrid columns={columns} data={filtrados} loading={isLoading} loadingText="Carregando pedidos..." emptyTitle="Nenhum pedido encontrado" emptyDescription={pedidos?.length === 0 ? 'Crie o primeiro pedido' : 'Tente ajustar a busca'} emptyAction={pedidos?.length === 0 ? <Button onClick={() => { setPedidoEdit(null); setModalOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Criar Primeiro</Button> : undefined} />
      <PedidoFormModal open={modalOpen} onOpenChange={setModalOpen} pedido={pedidoEdit} />
      <PedidoDetalheModal open={detalheOpen} onOpenChange={setDetalheOpen} pedidoId={pedidoDetalheId} />
      <DeletePedidoDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} pedido={pedidoDelete} onConfirm={async () => { if (pedidoDelete) { await deletePedido(pedidoDelete.id); setDeleteDialogOpen(false); setPedidoDelete(null); } }} />
    </PageShell>
  );
}
