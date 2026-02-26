import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Produto } from '@/types/engenharia/produto.types';

interface DeleteProdutoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto: Produto | null;
  onConfirm: () => void;
}

export function DeleteProdutoDialog({ open, onOpenChange, produto, onConfirm }: DeleteProdutoDialogProps) {
  if (!produto) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Você está prestes a excluir o produto:
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="font-mono text-sm font-semibold">{produto.codigo}</p>
          <p className="text-sm">{produto.descricao}</p>
        </div>

        <AlertDialogDescription className="text-destructive">
          ⚠️ Esta ação não pode ser desfeita. O produto será permanentemente removido do sistema.
        </AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
          >
            Excluir Produto
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
