import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { usePedidosStore } from '@/stores/comercial/pedidosStore';
import { STATUS_LABELS, STATUS_COLORS } from '@/types/comercial/pedido.types';

interface PedidoDetalheModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pedidoId: number | null;
}

export function PedidoDetalheModal({ open, onOpenChange, pedidoId }: PedidoDetalheModalProps) {
  const pedidoDetalhe = usePedidosStore((s) => s.pedidoDetalhe);
  const fetchPedido = usePedidosStore((s) => s.fetchPedido);

  useEffect(() => {
    if (open && pedidoId) {
      fetchPedido(pedidoId);
    }
  }, [open, pedidoId]);

  if (!open || !pedidoId) return null;

  const pedido = pedidoDetalhe;

  const formatCurrency = (val?: number) => {
    if (val == null) return '-';
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Pedido</DialogTitle>
        </DialogHeader>

        {!pedido ? (
          <div className="flex h-32 items-center justify-center">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cabeçalho do pedido */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Código</p>
                <p className="font-mono font-semibold">{pedido.codigo || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[pedido.status] || ''}`}>
                  {STATUS_LABELS[pedido.status] || pedido.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium">{pedido.clienteNome || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="font-mono font-semibold text-green-700 dark:text-green-400">{formatCurrency(pedido.valorTotal)}</p>
              </div>
            </div>

            {pedido.observacao && (
              <div>
                <p className="text-sm text-muted-foreground">Observação</p>
                <p className="text-sm mt-1">{pedido.observacao}</p>
              </div>
            )}

            {/* Itens */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Itens ({(pedido.itens || []).length})</h3>
              {(pedido.itens || []).length > 0 ? (
                <div className="rounded-lg border">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-2 text-left text-xs font-medium">Código</th>
                        <th className="p-2 text-left text-xs font-medium">Descrição</th>
                        <th className="p-2 text-right text-xs font-medium">Qtde</th>
                        <th className="p-2 text-right text-xs font-medium">Preço Unit.</th>
                        <th className="p-2 text-right text-xs font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(pedido.itens || []).map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="p-2 text-xs font-mono">{item.produtoCodigo || '-'}</td>
                          <td className="p-2 text-xs">{item.produtoDescricao || '-'}</td>
                          <td className="p-2 text-xs text-right">{item.quantidade}</td>
                          <td className="p-2 text-xs text-right font-mono">{formatCurrency(item.precoUnitario)}</td>
                          <td className="p-2 text-xs text-right font-mono font-medium">{formatCurrency(item.total ?? item.quantidade * item.precoUnitario)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum item neste pedido</p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
