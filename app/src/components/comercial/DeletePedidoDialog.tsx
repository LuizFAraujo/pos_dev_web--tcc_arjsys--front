import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { PedidoVenda } from '@/types/comercial/pedido.types';

interface DeletePedidoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pedido: PedidoVenda | null;
  onConfirm: () => void;
}

export function DeletePedidoDialog({ open, onOpenChange, pedido, onConfirm }: DeletePedidoDialogProps) {
  if (!pedido) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>Você está prestes a excluir o pedido:</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="rounded-lg border bg-muted/50 p-4 space-y-1">
          <p className="font-mono font-semibold">{pedido.codigo || '-'}</p>
          <p className="text-sm text-muted-foreground">Cliente: {pedido.clienteNome || '-'}</p>
        </div>
        <AlertDialogDescription>Só é possível excluir pedidos em status Orçamento e sem números de série vinculados.</AlertDialogDescription>
        <AlertDialogDescription className="text-destructive">⚠️ Esta ação não pode ser desfeita.</AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 text-white hover:bg-red-700">Excluir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
