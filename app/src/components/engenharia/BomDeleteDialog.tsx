import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { BomItem } from '@/types/engenharia/bom.types';

interface BomDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: BomItem | null;
  /** Quantos filhos diretos a estrutura tem */
  quantidadeFilhos: number;
  onConfirm: () => void;
}

export function BomDeleteDialog({ open, onOpenChange, item, quantidadeFilhos, onConfirm }: BomDeleteDialogProps) {
  if (!item) return null;

  const codigo = item.produtoPaiCodigo || '-';
  const descricao = item.produtoPaiDescricao || '';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Estrutura Completa</AlertDialogTitle>
          <AlertDialogDescription>
            Você está prestes a excluir toda a estrutura do produto:
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="rounded-lg border bg-muted/50 p-4 space-y-1">
          <p className="font-mono font-semibold text-base">{codigo}</p>
          <p className="text-sm text-muted-foreground">{descricao}</p>
          <p className="text-sm mt-2">
            <span className="font-semibold text-red-600">{quantidadeFilhos}</span>
            {' '}{quantidadeFilhos === 1 ? 'filho direto será removido' : 'filhos diretos serão removidos'}
          </p>
        </div>
        <AlertDialogDescription className="text-destructive font-medium">
          ⚠️ Esta ação não pode ser desfeita. As estruturas internas dos filhos não serão afetadas.
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 text-white hover:bg-red-700">
            Excluir Estrutura
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
