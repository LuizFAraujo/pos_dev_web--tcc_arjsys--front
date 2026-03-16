import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { NIVEL_LABELS } from '@/types/engenharia/grupo.types';
import type { GrupoProduto } from '@/types/engenharia/grupo.types';

interface GrupoDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grupo: GrupoProduto | null;
  onConfirm: () => void;
}

export function GrupoDeleteDialog({ open, onOpenChange, grupo, onConfirm }: GrupoDeleteDialogProps) {
  if (!grupo) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>Você está prestes a excluir o grupo:</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="rounded-lg border bg-muted/50 p-4 space-y-1">
          <p className="font-mono font-semibold">{grupo.codigo || '-'}</p>
          <p className="text-sm">{grupo.descricao || '-'}</p>
          <p className="text-xs text-muted-foreground">{NIVEL_LABELS[grupo.nivel] || grupo.nivel}</p>
        </div>
        <AlertDialogDescription>Só é possível excluir grupos sem vínculos.</AlertDialogDescription>
        <AlertDialogDescription className="text-destructive">⚠️ Esta ação não pode ser desfeita.</AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 text-white hover:bg-red-700">Excluir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
