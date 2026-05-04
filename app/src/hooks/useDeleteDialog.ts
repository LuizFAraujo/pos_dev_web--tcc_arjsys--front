/**
 * useDeleteDialog.ts - Hook para estado do dialog de confirmação de exclusão
 *
 * Encapsula:
 *   - Estado de abertura do dialog
 *   - Item selecionado para exclusão
 *   - Handler de abertura (setando o item)
 *   - Handler de confirmação (chama onDelete, limpa estado, toast)
 *
 * Uso:
 *   const del = useDeleteDialog<Cliente>({
 *     onDelete: (item) => deleteCliente(item.id),
 *   });
 *
 *   // del.open, del.item, del.handleOpen(item), del.handleConfirm()
 *   // <DeleteDialog open={del.open} onOpenChange={del.setOpen}
 *   //   item={del.item} onConfirm={del.handleConfirm} />
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseDeleteDialogOptions<T> {
  /** Callback de exclusão - recebe o item e faz a operação no store */
  onDelete: (item: T) => Promise<void>;
  /** Callback extra após exclusão (ex: limpar seleção) */
  onAfterDelete?: (item: T) => void;
  /** Mensagem de sucesso (default: 'Registro excluído.') */
  successMessage?: string;
}

interface UseDeleteDialogReturn<T> {
  /** Se o dialog está aberto */
  open: boolean;
  /** Setter do estado de abertura */
  setOpen: (open: boolean) => void;
  /** Item selecionado para exclusão */
  item: T | null;
  /** Abre o dialog com o item selecionado */
  requestDelete: (item: T) => void;
  /** Confirma a exclusão - chama onDelete, fecha dialog, mostra toast */
  confirmDelete: () => Promise<void>;
}

export function useDeleteDialog<T>({
  onDelete,
  onAfterDelete,
  successMessage = 'Registro excluído.',
}: UseDeleteDialogOptions<T>): UseDeleteDialogReturn<T> {
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<T | null>(null);

  const requestDelete = useCallback((target: T) => {
    setItem(target);
    setOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!item) return;
    await onDelete(item);
    onAfterDelete?.(item);
    setOpen(false);
    setItem(null);
    toast.success(successMessage);
  }, [item, onDelete, onAfterDelete, successMessage]);

  return {
    open,
    setOpen,
    item,
    requestDelete,
    confirmDelete,
  };
}
