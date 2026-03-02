import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Cliente } from '@/types/admin/cliente.types';

interface DeleteClienteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: Cliente | null;
  onConfirm: () => void;
}

export function DeleteClienteDialog({ open, onOpenChange, cliente, onConfirm }: DeleteClienteDialogProps) {
  if (!cliente) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>Você está prestes a excluir o cliente:</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="rounded-lg border bg-muted/50 p-4 space-y-1">
          <p className="font-semibold">{cliente.nome || '-'}</p>
          {cliente.cpfCnpj && <p className="text-sm text-muted-foreground">CPF/CNPJ: {cliente.cpfCnpj}</p>}
          {cliente.razaoSocial && <p className="text-sm text-muted-foreground">Razão Social: {cliente.razaoSocial}</p>}
        </div>
        <AlertDialogDescription className="text-destructive">⚠️ Esta ação não pode ser desfeita.</AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 text-white hover:bg-red-700">Excluir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
