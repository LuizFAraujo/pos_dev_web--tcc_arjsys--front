import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Eye, ChevronRight } from 'lucide-react';
import { usePedidosStore } from '@/stores/comercial/pedidosStore';
import { PageWrapper } from '@/components/shared/PageWrapper';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PedidoFormModal } from '@/components/comercial/PedidoFormModal';
import { PedidoDetalheModal } from '@/components/comercial/PedidoDetalheModal';
import { DeletePedidoDialog } from '@/components/comercial/DeletePedidoDialog';
import { StatusPedidoActions } from '@/components/comercial/StatusPedidoActions';
import { STATUS_LABELS, STATUS_COLORS } from '@/types/comercial/pedido.types';
import type { PedidoVenda } from '@/types/comercial/pedido.types';

interface PedidosPageProps {
  tab: { id: string; type: string; title: string };
}

export function PedidosPage({ tab }: PedidosPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
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

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  const filtrados = (pedidos || []).filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (p.codigo || '').toLowerCase().includes(term) ||
      (p.clienteNome || '').toLowerCase().includes(term) ||
      (p.status || '').toLowerCase().includes(term) ||
      (p.observacao || '').toLowerCase().includes(term)
    );
  });

  const formatCurrency = (val?: number) => {
    if (val == null) return '-';
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (val?: string) => {
    if (!val) return '-';
    return new Date(val).toLocaleDateString('pt-BR');
  };

  return (
    <PageWrapper>
      <PageHeader
        breadcrumbs={[{ label: 'Comercial' }, { label: 'Pedidos de Venda' }]}
        title="Pedidos de Venda"
        description="Gerencie pedidos de venda"
        actions={
          <Button onClick={() => { setPedidoEdit(null); setModalOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Pedido
          </Button>
        }
      />

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mt-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por código, cliente, status ou observação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Carregando pedidos...</p>
          </div>
        </div>
      )}

      {!isLoading && filtrados.length > 0 && (
        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-3 text-left text-sm font-medium">Código</th>
                  <th className="p-3 text-left text-sm font-medium">Cliente</th>
                  <th className="p-3 text-left text-sm font-medium">Status</th>
                  <th className="p-3 text-right text-sm font-medium">Itens</th>
                  <th className="p-3 text-right text-sm font-medium">Valor Total</th>
                  <th className="p-3 text-left text-sm font-medium">Data</th>
                  <th className="p-3 text-left text-sm font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((pedido) => (
                  <tr key={pedido.id} className="border-t transition-colors hover:bg-muted/30">
                    <td className="p-3 text-sm font-mono font-medium">{pedido.codigo || '-'}</td>
                    <td className="p-3 text-sm">{pedido.clienteNome || '-'}</td>
                    <td className="p-3 text-sm">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[pedido.status] || ''}`}>
                        {STATUS_LABELS[pedido.status] || pedido.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-right">{pedido.totalItens ?? '-'}</td>
                    <td className="p-3 text-sm text-right font-mono">{formatCurrency(pedido.valorTotal)}</td>
                    <td className="p-3 text-sm">{formatDate(pedido.criadoEm)}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => { setPedidoDetalheId(pedido.id); setDetalheOpen(true); }}
                          title="Ver detalhes"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {pedido.status === 'Orcamento' && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => { setPedidoEdit(pedido); setModalOpen(true); }} title="Editar">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600" onClick={() => { setPedidoDelete(pedido); setDeleteDialogOpen(true); }} title="Excluir">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        <StatusPedidoActions pedido={pedido} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t bg-muted/30 p-3">
            <p className="text-sm text-muted-foreground">{filtrados.length} de {pedidos.length} pedidos</p>
          </div>
        </div>
      )}

      {!isLoading && filtrados.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
          <p className="mb-2 text-lg font-medium">Nenhum pedido encontrado</p>
          <p className="mb-4 text-sm text-muted-foreground">
            {pedidos.length === 0 ? 'Crie o primeiro pedido de venda' : 'Tente ajustar a busca'}
          </p>
          {pedidos.length === 0 && (
            <Button onClick={() => { setPedidoEdit(null); setModalOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Pedido
            </Button>
          )}
        </div>
      )}

      <PedidoFormModal open={modalOpen} onOpenChange={setModalOpen} pedido={pedidoEdit} />
      <PedidoDetalheModal open={detalheOpen} onOpenChange={setDetalheOpen} pedidoId={pedidoDetalheId} />
      <DeletePedidoDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        pedido={pedidoDelete}
        onConfirm={async () => {
          if (pedidoDelete) {
            await deletePedido(pedidoDelete.id);
            setDeleteDialogOpen(false);
            setPedidoDelete(null);
          }
        }}
      />
    </PageWrapper>
  );
}
