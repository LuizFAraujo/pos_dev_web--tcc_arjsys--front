import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { BomItem } from '@/types/engenharia/bom.types';

interface BomDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: BomItem | null;
  onConfirm: () => void;
}

export function BomDeleteDialog({ open, onOpenChange, item, onConfirm }: BomDeleteDialogProps) {
  if (!item) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>Você está prestes a excluir a relação:</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="rounded-lg border bg-muted/50 p-4 space-y-1">
          <p className="text-sm">
            <span className="font-mono font-semibold">{item.produtoPaiCodigo || '-'}</span>
            <span className="mx-2 text-muted-foreground">→</span>
            <span className="font-mono font-semibold">{item.produtoFilhoCodigo || '-'}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {item.produtoPaiDescricao} → {item.produtoFilhoDescricao}
          </p>
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
