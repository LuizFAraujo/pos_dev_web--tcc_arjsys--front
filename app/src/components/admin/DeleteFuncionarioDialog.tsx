import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Funcionario } from '@/types/admin/funcionario.types';

interface DeleteFuncionarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  funcionario: Funcionario | null;
  onConfirm: () => void;
}

export function DeleteFuncionarioDialog({ open, onOpenChange, funcionario, onConfirm }: DeleteFuncionarioDialogProps) {
  if (!funcionario) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>Você está prestes a excluir o funcionário:</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="rounded-lg border bg-muted/50 p-4 space-y-1">
          <p className="font-semibold">{funcionario.nome || '-'}</p>
          <p className="text-sm text-muted-foreground">Usuário: {funcionario.usuario || '-'}</p>
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
