import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { STATUS_LABELS, TIPO_PV_LABELS } from '@/types/comercial/pedido.types';
import type { PedidoVenda } from '@/types/comercial/pedido.types';

interface PedidoDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pedido: PedidoVenda | null;
  onConfirm: () => void;
}

export function PedidoDeleteDialog({
  open,
  onOpenChange,
  pedido,
  onConfirm,
}: PedidoDeleteDialogProps) {
  if (!pedido) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Você está prestes a excluir o pedido:
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-lg border bg-muted/50 p-4 space-y-1">
          <p className="font-semibold font-mono">{pedido.codigo || '-'}</p>
          <p className="text-sm text-muted-foreground">
            Cliente:{' '}
            {pedido.clienteCodigo && (
              <span className="font-mono text-xs mr-1">[{pedido.clienteCodigo}]</span>
            )}
            {pedido.clienteNome || '-'}
          </p>
          <p className="text-sm text-muted-foreground">
            Tipo: {TIPO_PV_LABELS[pedido.tipo] || pedido.tipo}
          </p>
          <p className="text-sm text-muted-foreground">
            Status: {STATUS_LABELS[pedido.status] || pedido.status}
          </p>
        </div>

        <AlertDialogDescription className="text-destructive">
          ⚠️ Esta ação não pode ser desfeita. Os itens do pedido também serão excluídos.
        </AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
