import { Button } from '@/components/ui/button';
import { usePedidosStore } from '@/stores/comercial/pedidosStore';
import { TRANSICOES_STATUS, STATUS_LABELS } from '@/types/comercial/pedido.types';
import type { PedidoVenda, StatusPedido } from '@/types/comercial/pedido.types';

interface StatusPedidoActionsProps {
  pedido: PedidoVenda;
}

export function StatusPedidoActions({ pedido }: StatusPedidoActionsProps) {
  const alterarStatus = usePedidosStore((s) => s.alterarStatus);
  const transicoes = TRANSICOES_STATUS[pedido.status] || [];

  if (transicoes.length === 0) return null;

  const handleChange = async (novoStatus: StatusPedido) => {
    try {
      await alterarStatus(pedido.id, novoStatus);
    } catch {
      // erro tratado no store
    }
  };

  return (
    <>
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
    </>
  );
}
